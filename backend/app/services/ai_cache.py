"""
CounselFlow Ultimate V3 - AI Result Caching Service
Intelligent caching for expensive AI operations with content-based deduplication
"""

import asyncio
import hashlib
import json
import pickle
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
import structlog
import gzip
from enum import Enum

from app.core.redis import get_redis_client
from app.core.config import settings

logger = structlog.get_logger()


class AIOperationType(str, Enum):
    """Types of AI operations that can be cached"""
    CONTRACT_ANALYSIS = "contract_analysis"
    DOCUMENT_GENERATION = "document_generation"
    LEGAL_RESEARCH = "legal_research"
    RISK_ASSESSMENT = "risk_assessment"
    CLAUSE_EXTRACTION = "clause_extraction"
    COMPLIANCE_CHECK = "compliance_check"
    TEXT_GENERATION = "text_generation"
    LITIGATION_STRATEGY = "litigation_strategy"
    LEGAL_MEMO = "legal_memo"


@dataclass
class AICacheConfig:
    """Configuration for AI result caching"""
    ttl: int = 3600  # 1 hour default (AI results are expensive)
    max_content_length: int = 100000  # 100KB max content to cache
    compress: bool = True
    use_content_hash: bool = True  # Use content hash for deduplication
    cache_by_user: bool = True  # Cache per user to avoid data leakage
    similarity_threshold: float = 0.95  # Threshold for content similarity
    max_cache_size: int = 10 * 1024 * 1024  # 10MB max per cached result


class AICacheService:
    """Service for caching AI operation results"""
    
    def __init__(self):
        self.redis_client = None
        self._cache_configs: Dict[AIOperationType, AICacheConfig] = {}
        self._setup_default_configs()
        self._similarity_cache: Dict[str, List[Tuple[str, str]]] = {}  # operation -> [(hash, key)]
    
    async def _get_redis(self):
        """Get Redis client instance"""
        if self.redis_client is None:
            self.redis_client = await get_redis_client()
        return self.redis_client
    
    def _setup_default_configs(self):
        """Setup default cache configurations for AI operations"""
        self._cache_configs.update({
            AIOperationType.CONTRACT_ANALYSIS: AICacheConfig(
                ttl=7200,  # 2 hours - analysis results are valuable
                max_content_length=500000,  # Large contracts
                use_content_hash=True,
                cache_by_user=False,  # Analysis results can be shared
                similarity_threshold=0.98  # Very high similarity for contracts
            ),
            
            AIOperationType.DOCUMENT_GENERATION: AICacheConfig(
                ttl=3600,  # 1 hour - generated docs might need updates
                max_content_length=200000,
                use_content_hash=True,
                cache_by_user=True,  # Generated docs are user-specific
                similarity_threshold=0.95
            ),
            
            AIOperationType.LEGAL_RESEARCH: AICacheConfig(
                ttl=86400,  # 24 hours - research results are stable
                max_content_length=100000,
                use_content_hash=True,
                cache_by_user=False,  # Research can be shared
                similarity_threshold=0.90  # Lower threshold for research queries
            ),
            
            AIOperationType.RISK_ASSESSMENT: AICacheConfig(
                ttl=7200,  # 2 hours - risk assessments are valuable
                max_content_length=300000,
                use_content_hash=True,
                cache_by_user=False,  # Risk assessments can be shared
                similarity_threshold=0.98
            ),
            
            AIOperationType.CLAUSE_EXTRACTION: AICacheConfig(
                ttl=14400,  # 4 hours - extracted clauses are stable
                max_content_length=500000,
                use_content_hash=True,
                cache_by_user=False,  # Clause extraction can be shared
                similarity_threshold=0.99  # Very high similarity for extraction
            ),
            
            AIOperationType.COMPLIANCE_CHECK: AICacheConfig(
                ttl=3600,  # 1 hour - compliance might change
                max_content_length=300000,
                use_content_hash=True,
                cache_by_user=False,  # Compliance checks can be shared
                similarity_threshold=0.98
            ),
            
            AIOperationType.TEXT_GENERATION: AICacheConfig(
                ttl=1800,  # 30 minutes - text generation is dynamic
                max_content_length=50000,
                use_content_hash=True,
                cache_by_user=True,  # Generated text is user-specific
                similarity_threshold=0.90
            ),
            
            AIOperationType.LITIGATION_STRATEGY: AICacheConfig(
                ttl=7200,  # 2 hours - strategy analysis is valuable
                max_content_length=200000,
                use_content_hash=True,
                cache_by_user=True,  # Strategy is case-specific
                similarity_threshold=0.95
            ),
            
            AIOperationType.LEGAL_MEMO: AICacheConfig(
                ttl=3600,  # 1 hour - memos might need updates
                max_content_length=100000,
                use_content_hash=True,
                cache_by_user=True,  # Memos are user-specific
                similarity_threshold=0.95
            )
        })
    
    def _generate_content_hash(self, content: str, operation_type: AIOperationType) -> str:
        """Generate content hash for deduplication"""
        # Normalize content for better deduplication
        normalized_content = self._normalize_content(content, operation_type)
        
        # Create hash
        content_hash = hashlib.sha256(normalized_content.encode('utf-8')).hexdigest()
        
        return content_hash[:32]  # Use first 32 characters
    
    def _normalize_content(self, content: str, operation_type: AIOperationType) -> str:
        """Normalize content for better cache hit rates"""
        # Remove extra whitespace
        normalized = ' '.join(content.split())
        
        # Convert to lowercase for better matching
        normalized = normalized.lower()
        
        # Remove common variations that don't affect AI analysis
        if operation_type in [AIOperationType.CONTRACT_ANALYSIS, AIOperationType.RISK_ASSESSMENT]:
            # Remove dates that might vary between similar contracts
            import re
            normalized = re.sub(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', '[DATE]', normalized)
            normalized = re.sub(r'\$[\d,]+\.?\d*', '[AMOUNT]', normalized)
        
        return normalized
    
    def _generate_cache_key(
        self,
        operation_type: AIOperationType,
        content_hash: str,
        user_id: Optional[str] = None,
        additional_params: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate cache key for AI result"""
        config = self._cache_configs.get(operation_type, AICacheConfig())
        
        key_parts = [
            "ai_cache",
            operation_type.value,
            content_hash
        ]
        
        # Add user ID if caching by user
        if config.cache_by_user and user_id:
            key_parts.append(f"user:{user_id}")
        
        # Add additional parameters hash
        if additional_params:
            params_str = json.dumps(additional_params, sort_keys=True)
            params_hash = hashlib.sha256(params_str.encode()).hexdigest()[:16]
            key_parts.append(f"params:{params_hash}")
        
        return ":".join(key_parts)
    
    async def get_cached_result(
        self,
        operation_type: AIOperationType,
        content: str,
        user_id: Optional[str] = None,
        additional_params: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """Get cached AI result if available"""
        config = self._cache_configs.get(operation_type)
        if not config:
            return None
        
        # Check content length
        if len(content) > config.max_content_length:
            logger.warning(
                "Content too long for caching",
                operation_type=operation_type,
                content_length=len(content),
                max_length=config.max_content_length
            )
            return None
        
        try:
            # Generate content hash
            content_hash = self._generate_content_hash(content, operation_type)
            
            # Check for exact match first
            exact_key = self._generate_cache_key(operation_type, content_hash, user_id, additional_params)
            redis = await self._get_redis()
            
            cached_data = await redis.get(exact_key)
            if cached_data:
                result = await self._deserialize_result(cached_data)
                if result:
                    logger.info(
                        "AI cache hit (exact)",
                        operation_type=operation_type,
                        content_hash=content_hash[:8],
                        cache_key=exact_key[:32] + "..."
                    )
                    result['cache_info'] = {
                        'hit_type': 'exact',
                        'cached_at': result.get('cached_at'),
                        'content_hash': content_hash
                    }
                    return result
            
            # Check for similar content if enabled
            if config.use_content_hash and config.similarity_threshold < 1.0:
                similar_result = await self._find_similar_cached_result(
                    operation_type, content, content_hash, user_id, additional_params
                )
                if similar_result:
                    return similar_result
            
            return None
            
        except Exception as e:
            logger.error(
                "Failed to retrieve cached AI result",
                operation_type=operation_type,
                error=str(e)
            )
            return None
    
    async def cache_result(
        self,
        operation_type: AIOperationType,
        content: str,
        result: Dict[str, Any],
        user_id: Optional[str] = None,
        additional_params: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Cache AI operation result"""
        config = self._cache_configs.get(operation_type)
        if not config:
            return False
        
        # Check content length
        if len(content) > config.max_content_length:
            return False
        
        try:
            # Generate content hash and cache key
            content_hash = self._generate_content_hash(content, operation_type)
            cache_key = self._generate_cache_key(operation_type, content_hash, user_id, additional_params)
            
            # Prepare cache data
            cache_data = {
                'result': result,
                'operation_type': operation_type.value,
                'content_hash': content_hash,
                'content_length': len(content),
                'user_id': user_id,
                'additional_params': additional_params,
                'metadata': metadata or {},
                'cached_at': datetime.utcnow().isoformat(),
                'ttl': config.ttl
            }
            
            # Serialize and potentially compress
            serialized_data = pickle.dumps(cache_data)
            
            # Check size
            if len(serialized_data) > config.max_cache_size:
                logger.warning(
                    "AI result too large to cache",
                    operation_type=operation_type,
                    size=len(serialized_data),
                    max_size=config.max_cache_size
                )
                return False
            
            # Compress if beneficial
            if config.compress and len(serialized_data) > 1024:
                compressed_data = gzip.compress(serialized_data)
                if len(compressed_data) < len(serialized_data):
                    serialized_data = compressed_data
            
            # Store in Redis
            redis = await self._get_redis()
            await redis.setex(cache_key, config.ttl, serialized_data)
            
            # Update similarity index
            await self._update_similarity_index(operation_type, content_hash, cache_key)
            
            # Store content statistics
            stats_key = f"ai_cache_stats:{operation_type.value}"
            await redis.hincrby(stats_key, "total_cached", 1)
            await redis.hincrby(stats_key, "total_size", len(serialized_data))
            await redis.expire(stats_key, 86400)  # Keep stats for 24 hours
            
            logger.info(
                "AI result cached",
                operation_type=operation_type,
                content_hash=content_hash[:8],
                cache_key=cache_key[:32] + "...",
                size=len(serialized_data),
                ttl=config.ttl
            )
            
            return True
            
        except Exception as e:
            logger.error(
                "Failed to cache AI result",
                operation_type=operation_type,
                error=str(e)
            )
            return False
    
    async def _deserialize_result(self, cached_data: bytes) -> Optional[Dict[str, Any]]:
        """Deserialize cached result data"""
        try:
            # Decompress if needed
            if cached_data.startswith(b'\x1f\x8b'):  # gzip magic number
                cached_data = gzip.decompress(cached_data)
            
            # Deserialize
            result_data = pickle.loads(cached_data)
            return result_data
            
        except Exception as e:
            logger.warning("Failed to deserialize cached AI result", error=str(e))
            return None
    
    async def _find_similar_cached_result(
        self,
        operation_type: AIOperationType,
        content: str,
        content_hash: str,
        user_id: Optional[str],
        additional_params: Optional[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Find similar cached results using content similarity"""
        config = self._cache_configs.get(operation_type, AICacheConfig())
        
        try:
            redis = await self._get_redis()
            
            # Get similarity index for this operation type
            similarity_key = f"ai_similarity:{operation_type.value}"
            similar_hashes = await redis.zrangebyscore(
                similarity_key, 
                config.similarity_threshold, 
                1.0, 
                withscores=True
            )
            
            # Check each similar hash
            for similar_hash_bytes, similarity_score in similar_hashes:
                similar_hash = similar_hash_bytes.decode() if isinstance(similar_hash_bytes, bytes) else similar_hash_bytes
                
                if similar_hash == content_hash:
                    continue
                
                # Generate cache key for similar content
                similar_key = self._generate_cache_key(
                    operation_type, similar_hash, user_id, additional_params
                )
                
                # Try to get cached result
                cached_data = await redis.get(similar_key)
                if cached_data:
                    result = await self._deserialize_result(cached_data)
                    if result:
                        logger.info(
                            "AI cache hit (similar)",
                            operation_type=operation_type,
                            original_hash=content_hash[:8],
                            similar_hash=similar_hash[:8],
                            similarity_score=similarity_score
                        )
                        
                        result['cache_info'] = {
                            'hit_type': 'similar',
                            'similarity_score': similarity_score,
                            'original_hash': content_hash,
                            'similar_hash': similar_hash,
                            'cached_at': result.get('cached_at')
                        }
                        return result
            
            return None
            
        except Exception as e:
            logger.warning(
                "Failed to find similar cached AI result",
                operation_type=operation_type,
                error=str(e)
            )
            return None
    
    async def _update_similarity_index(
        self, 
        operation_type: AIOperationType, 
        content_hash: str, 
        cache_key: str
    ):
        """Update similarity index for content-based lookup"""
        try:
            redis = await self._get_redis()
            
            # Store hash in similarity index
            similarity_key = f"ai_similarity:{operation_type.value}"
            
            # For now, use a simple approach - store all hashes with score 1.0
            # In a more sophisticated implementation, you could calculate actual similarity scores
            await redis.zadd(similarity_key, {content_hash: 1.0})
            
            # Set expiration for similarity index
            config = self._cache_configs.get(operation_type, AICacheConfig())
            await redis.expire(similarity_key, config.ttl + 3600)  # Keep index longer than cache
            
        except Exception as e:
            logger.warning(
                "Failed to update similarity index",
                operation_type=operation_type,
                error=str(e)
            )
    
    async def invalidate_by_operation_type(self, operation_type: AIOperationType) -> int:
        """Invalidate all cached results for an operation type"""
        redis = await self._get_redis()
        
        try:
            pattern = f"ai_cache:{operation_type.value}:*"
            keys = await redis.keys(pattern)
            
            if keys:
                deleted = await redis.delete(*keys)
                
                # Also clean up similarity index
                similarity_key = f"ai_similarity:{operation_type.value}"
                await redis.delete(similarity_key)
                
                logger.info(
                    "AI cache invalidated by operation type",
                    operation_type=operation_type,
                    deleted_count=deleted
                )
                
                return deleted
            
            return 0
            
        except Exception as e:
            logger.error(
                "Failed to invalidate AI cache",
                operation_type=operation_type,
                error=str(e)
            )
            return 0
    
    async def invalidate_user_cache(self, user_id: str) -> int:
        """Invalidate all AI cache entries for a specific user"""
        redis = await self._get_redis()
        
        try:
            pattern = f"ai_cache:*:user:{user_id}"
            keys = await redis.keys(pattern)
            
            if keys:
                deleted = await redis.delete(*keys)
                logger.info(
                    "User AI cache invalidated",
                    user_id=user_id,
                    deleted_count=deleted
                )
                return deleted
            
            return 0
            
        except Exception as e:
            logger.error(
                "Failed to invalidate user AI cache",
                user_id=user_id,
                error=str(e)
            )
            return 0
    
    async def get_cache_statistics(self) -> Dict[str, Any]:
        """Get comprehensive cache statistics"""
        redis = await self._get_redis()
        
        stats = {
            "operation_types": len(self._cache_configs),
            "configurations": {},
            "usage_stats": {},
            "total_cache_size": 0,
            "cache_hit_rates": {}
        }
        
        try:
            for op_type in AIOperationType:
                config = self._cache_configs.get(op_type, AICacheConfig())
                
                # Get operation stats
                stats_key = f"ai_cache_stats:{op_type.value}"
                op_stats = await redis.hgetall(stats_key)
                
                stats["configurations"][op_type.value] = {
                    "ttl": config.ttl,
                    "max_content_length": config.max_content_length,
                    "use_content_hash": config.use_content_hash,
                    "cache_by_user": config.cache_by_user,
                    "similarity_threshold": config.similarity_threshold
                }
                
                stats["usage_stats"][op_type.value] = {
                    "total_cached": int(op_stats.get(b"total_cached", 0)),
                    "total_size": int(op_stats.get(b"total_size", 0)),
                }
                
                # Count current cache entries
                pattern = f"ai_cache:{op_type.value}:*"
                current_keys = await redis.keys(pattern)
                stats["usage_stats"][op_type.value]["current_entries"] = len(current_keys)
                
                # Estimate cache size
                if current_keys:
                    sample_key = current_keys[0]
                    sample_size = await redis.memory_usage(sample_key)
                    if sample_size:
                        estimated_size = sample_size * len(current_keys)
                        stats["usage_stats"][op_type.value]["estimated_size"] = estimated_size
                        stats["total_cache_size"] += estimated_size
        
        except Exception as e:
            logger.error("Failed to get AI cache statistics", error=str(e))
        
        return stats


# Decorator for automatic AI result caching
def cache_ai_result(
    operation_type: AIOperationType,
    content_extractor: Optional[callable] = None,
    user_id_extractor: Optional[callable] = None,
    params_extractor: Optional[callable] = None
):
    """Decorator to automatically cache AI operation results"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            cache_service = ai_cache_service
            
            # Extract content, user_id, and additional params
            if content_extractor:
                content = content_extractor(*args, **kwargs)
            else:
                # Default: assume first argument is content
                content = args[0] if args else kwargs.get('content', '')
            
            if user_id_extractor:
                user_id = user_id_extractor(*args, **kwargs)
            else:
                user_id = kwargs.get('user_id')
            
            if params_extractor:
                additional_params = params_extractor(*args, **kwargs)
            else:
                # Extract relevant kwargs as additional params
                additional_params = {
                    k: v for k, v in kwargs.items() 
                    if k not in ['content', 'user_id'] and isinstance(v, (str, int, float, bool))
                }
            
            # Try to get cached result
            cached_result = await cache_service.get_cached_result(
                operation_type=operation_type,
                content=content,
                user_id=user_id,
                additional_params=additional_params
            )
            
            if cached_result:
                return cached_result['result']
            
            # Execute function
            start_time = asyncio.get_event_loop().time()
            result = await func(*args, **kwargs)
            execution_time = asyncio.get_event_loop().time() - start_time
            
            # Cache result with metadata
            metadata = {
                "function": func.__name__,
                "execution_time": execution_time,
                "args_count": len(args),
                "kwargs_keys": list(kwargs.keys())
            }
            
            await cache_service.cache_result(
                operation_type=operation_type,
                content=content,
                result=result,
                user_id=user_id,
                additional_params=additional_params,
                metadata=metadata
            )
            
            return result
        
        return wrapper
    return decorator


# Global AI cache service instance
ai_cache_service = AICacheService()


# Helper functions
async def warm_ai_cache(operation_type: AIOperationType, common_contents: List[str]):
    """Pre-warm AI cache with common operations"""
    logger.info(
        "Warming AI cache",
        operation_type=operation_type,
        content_count=len(common_contents)
    )
    
    # This would trigger AI operations for common content
    # Implementation depends on specific AI service integration
    for content in common_contents:
        try:
            # Trigger AI operation (implementation specific)
            # The actual AI service would be called here
            pass
        except Exception as e:
            logger.error(
                "Failed to warm AI cache for content",
                operation_type=operation_type,
                error=str(e)
            )


async def cleanup_expired_ai_cache():
    """Clean up expired AI cache entries and statistics"""
    redis = await get_redis_client()
    
    try:
        # Clean up expired similarity indexes
        for op_type in AIOperationType:
            similarity_key = f"ai_similarity:{op_type.value}"
            
            # Remove expired entries from similarity index
            # This is a simplified cleanup - in production you might want more sophisticated logic
            await redis.expire(similarity_key, 3600)  # Reset expiration
        
        logger.info("AI cache cleanup completed")
        
    except Exception as e:
        logger.error("Failed to cleanup AI cache", error=str(e))