"""
CounselFlow Ultimate V3 - Database Query Result Caching Service
Intelligent caching for database queries with automatic invalidation
"""

import asyncio
import hashlib
import json
import pickle
from typing import Dict, Any, Optional, List, Callable, Union, Tuple
from datetime import datetime, timedelta
from functools import wraps
from dataclasses import dataclass, field
import structlog
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
import gzip

from app.core.redis import get_redis_client
from app.core.database import get_prisma
from app.core.config import settings

logger = structlog.get_logger()


@dataclass
class QueryCacheConfig:
    """Configuration for query caching behavior"""
    ttl: int = 300  # 5 minutes default
    key_prefix: str = "query_cache:"
    compress: bool = True
    invalidate_on: List[str] = field(default_factory=list)  # Events that invalidate this cache
    cache_empty_results: bool = True
    max_cache_size: int = 1024 * 1024  # 1MB max per cached result
    tags: List[str] = field(default_factory=list)  # Cache tags for bulk invalidation


class QueryCacheService:
    """Service for caching database query results"""
    
    def __init__(self):
        self.redis_client = None
        self._cache_configs: Dict[str, QueryCacheConfig] = {}
        self._invalidation_patterns: Dict[str, List[str]] = {}
        self._setup_default_configs()
    
    async def _get_redis(self):
        """Get Redis client instance"""
        if self.redis_client is None:
            self.redis_client = await get_redis_client()
        return self.redis_client
    
    def _setup_default_configs(self):
        """Setup default cache configurations for common operations"""
        self._cache_configs.update({
            # Client operations
            "clients:list": QueryCacheConfig(
                ttl=600,  # 10 minutes
                key_prefix="cache:clients:list:",
                invalidate_on=["client_created", "client_updated", "client_deleted"],
                tags=["clients"]
            ),
            "clients:detail": QueryCacheConfig(
                ttl=300,  # 5 minutes
                key_prefix="cache:clients:detail:",
                invalidate_on=["client_updated", "client_deleted"],
                tags=["clients"]
            ),
            
            # Contract operations
            "contracts:list": QueryCacheConfig(
                ttl=300,  # 5 minutes
                key_prefix="cache:contracts:list:",
                invalidate_on=["contract_created", "contract_updated", "contract_deleted"],
                tags=["contracts"]
            ),
            "contracts:detail": QueryCacheConfig(
                ttl=600,  # 10 minutes
                key_prefix="cache:contracts:detail:",
                invalidate_on=["contract_updated", "contract_deleted"],
                tags=["contracts"]
            ),
            "contracts:analytics": QueryCacheConfig(
                ttl=1800,  # 30 minutes
                key_prefix="cache:contracts:analytics:",
                invalidate_on=["contract_created", "contract_updated", "contract_deleted"],
                tags=["contracts", "analytics"]
            ),
            
            # Matter operations
            "matters:list": QueryCacheConfig(
                ttl=300,  # 5 minutes
                key_prefix="cache:matters:list:",
                invalidate_on=["matter_created", "matter_updated", "matter_deleted"],
                tags=["matters"]
            ),
            "matters:detail": QueryCacheConfig(
                ttl=600,  # 10 minutes
                key_prefix="cache:matters:detail:",
                invalidate_on=["matter_updated", "matter_deleted"],
                tags=["matters"]
            ),
            
            # Dashboard operations
            "dashboard:overview": QueryCacheConfig(
                ttl=300,  # 5 minutes
                key_prefix="cache:dashboard:overview:",
                invalidate_on=[
                    "client_created", "client_updated", "client_deleted",
                    "contract_created", "contract_updated", "contract_deleted",
                    "matter_created", "matter_updated", "matter_deleted"
                ],
                tags=["dashboard", "analytics"]
            ),
            "dashboard:metrics": QueryCacheConfig(
                ttl=600,  # 10 minutes
                key_prefix="cache:dashboard:metrics:",
                invalidate_on=[
                    "contract_created", "contract_updated", "contract_deleted",
                    "matter_created", "matter_updated", "matter_deleted"
                ],
                tags=["dashboard", "analytics"]
            ),
            
            # User operations
            "users:profile": QueryCacheConfig(
                ttl=900,  # 15 minutes
                key_prefix="cache:users:profile:",
                invalidate_on=["user_updated", "user_deleted"],
                tags=["users"]
            ),
            
            # Reports and analytics
            "reports:monthly": QueryCacheConfig(
                ttl=3600,  # 1 hour
                key_prefix="cache:reports:monthly:",
                invalidate_on=["contract_created", "contract_updated", "matter_closed"],
                tags=["reports", "analytics"]
            ),
            "reports:performance": QueryCacheConfig(
                ttl=1800,  # 30 minutes
                key_prefix="cache:reports:performance:",
                invalidate_on=["matter_updated", "task_completed"],
                tags=["reports", "analytics"]
            )
        })
    
    def register_cache_config(self, operation: str, config: QueryCacheConfig):
        """Register a cache configuration for an operation"""
        self._cache_configs[operation] = config
        
        # Setup invalidation patterns
        for event in config.invalidate_on:
            if event not in self._invalidation_patterns:
                self._invalidation_patterns[event] = []
            self._invalidation_patterns[event].append(operation)
    
    async def get_cached_result(
        self, 
        operation: str, 
        query_hash: str, 
        user_id: Optional[str] = None
    ) -> Optional[Any]:
        """Get cached query result"""
        config = self._cache_configs.get(operation)
        if not config:
            return None
        
        cache_key = self._generate_cache_key(operation, query_hash, user_id)
        
        try:
            redis = await self._get_redis()
            cached_data = await redis.get(cache_key)
            
            if not cached_data:
                return None
            
            # Decompress if needed
            if cached_data.startswith(b'\x1f\x8b'):  # gzip magic number
                cached_data = gzip.decompress(cached_data)
            
            # Deserialize result
            result_data = pickle.loads(cached_data)
            
            logger.info(
                "Query cache hit",
                operation=operation,
                cache_key=cache_key[:16] + "...",
                cached_at=result_data.get('cached_at')
            )
            
            return result_data['result']
            
        except Exception as e:
            logger.warning(
                "Failed to retrieve cached query result",
                operation=operation,
                error=str(e)
            )
            return None
    
    async def cache_result(
        self,
        operation: str,
        query_hash: str,
        result: Any,
        user_id: Optional[str] = None,
        query_info: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Cache query result"""
        config = self._cache_configs.get(operation)
        if not config:
            return False
        
        # Don't cache empty results if configured not to
        if not config.cache_empty_results and not result:
            return False
        
        cache_key = self._generate_cache_key(operation, query_hash, user_id)
        
        try:
            # Prepare cache data
            cache_data = {
                'result': result,
                'cached_at': datetime.utcnow().isoformat(),
                'operation': operation,
                'query_hash': query_hash,
                'user_id': user_id,
                'query_info': query_info,
                'tags': config.tags
            }
            
            # Serialize data
            serialized_data = pickle.dumps(cache_data)
            
            # Check size limit
            if len(serialized_data) > config.max_cache_size:
                logger.warning(
                    "Query result too large to cache",
                    operation=operation,
                    size=len(serialized_data),
                    max_size=config.max_cache_size
                )
                return False
            
            # Compress if configured and beneficial
            if config.compress and len(serialized_data) > 1024:
                compressed_data = gzip.compress(serialized_data)
                if len(compressed_data) < len(serialized_data):
                    serialized_data = compressed_data
            
            # Store in Redis
            redis = await self._get_redis()
            await redis.setex(cache_key, config.ttl, serialized_data)
            
            # Add to tag indexes for bulk invalidation
            for tag in config.tags:
                tag_key = f"cache_tags:{tag}"
                await redis.sadd(tag_key, cache_key)
                await redis.expire(tag_key, config.ttl + 300)  # Keep tags a bit longer
            
            logger.info(
                "Query result cached",
                operation=operation,
                cache_key=cache_key[:16] + "...",
                ttl=config.ttl,
                size=len(serialized_data),
                tags=config.tags
            )
            
            return True
            
        except Exception as e:
            logger.error(
                "Failed to cache query result",
                operation=operation,
                error=str(e)
            )
            return False
    
    def _generate_cache_key(
        self, 
        operation: str, 
        query_hash: str, 
        user_id: Optional[str]
    ) -> str:
        """Generate cache key for query result"""
        config = self._cache_configs.get(operation, QueryCacheConfig())
        
        key_parts = [config.key_prefix, operation, query_hash]
        
        if user_id:
            key_parts.append(f"user:{user_id}")
        
        return ":".join(key_parts)
    
    async def invalidate_by_event(self, event: str, **context) -> int:
        """Invalidate caches based on domain event"""
        operations_to_invalidate = self._invalidation_patterns.get(event, [])
        
        if not operations_to_invalidate:
            return 0
        
        total_invalidated = 0
        
        for operation in operations_to_invalidate:
            config = self._cache_configs.get(operation)
            if config:
                # Invalidate by pattern
                pattern = f"{config.key_prefix}{operation}:*"
                invalidated = await self._invalidate_pattern(pattern)
                total_invalidated += invalidated
        
        if total_invalidated > 0:
            logger.info(
                "Cache invalidated by event",
                event=event,
                operations=operations_to_invalidate,
                total_invalidated=total_invalidated,
                context=context
            )
        
        return total_invalidated
    
    async def invalidate_by_tags(self, tags: List[str]) -> int:
        """Invalidate caches by tags"""
        redis = await self._get_redis()
        total_invalidated = 0
        
        for tag in tags:
            try:
                tag_key = f"cache_tags:{tag}"
                cache_keys = await redis.smembers(tag_key)
                
                if cache_keys:
                    # Delete cache entries
                    deleted = await redis.delete(*cache_keys)
                    total_invalidated += deleted
                    
                    # Clean up tag index
                    await redis.delete(tag_key)
                    
                    logger.info(
                        "Cache invalidated by tag",
                        tag=tag,
                        invalidated_count=deleted
                    )
                    
            except Exception as e:
                logger.error(
                    "Failed to invalidate cache by tag",
                    tag=tag,
                    error=str(e)
                )
        
        return total_invalidated
    
    async def _invalidate_pattern(self, pattern: str) -> int:
        """Invalidate cache keys matching pattern"""
        redis = await self._get_redis()
        
        try:
            keys = await redis.keys(pattern)
            if keys:
                return await redis.delete(*keys)
            return 0
        except Exception as e:
            logger.error("Failed to invalidate cache pattern", pattern=pattern, error=str(e))
            return 0
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        redis = await self._get_redis()
        
        stats = {
            "total_operations": len(self._cache_configs),
            "configurations": {},
            "redis_info": {},
            "cache_sizes": {}
        }
        
        try:
            # Get Redis info
            redis_info = await redis.info()
            stats["redis_info"] = {
                "used_memory": redis_info.get("used_memory_human", "Unknown"),
                "connected_clients": redis_info.get("connected_clients", 0),
                "keyspace_hits": redis_info.get("keyspace_hits", 0),
                "keyspace_misses": redis_info.get("keyspace_misses", 0),
            }
            
            # Get cache sizes by operation
            for operation, config in self._cache_configs.items():
                pattern = f"{config.key_prefix}{operation}:*"
                keys = await redis.keys(pattern)
                stats["cache_sizes"][operation] = len(keys)
                stats["configurations"][operation] = {
                    "ttl": config.ttl,
                    "tags": config.tags,
                    "invalidate_on": config.invalidate_on
                }
            
        except Exception as e:
            logger.error("Failed to get cache stats", error=str(e))
        
        return stats


# Decorator for automatic query caching
def cache_query(
    operation: str,
    ttl: Optional[int] = None,
    invalidate_on: Optional[List[str]] = None,
    tags: Optional[List[str]] = None,
    key_generator: Optional[Callable] = None
):
    """Decorator to automatically cache query results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get or create cache service
            cache_service = query_cache_service
            
            # Generate query hash
            if key_generator:
                query_hash = key_generator(*args, **kwargs)
            else:
                # Default hash generation
                func_args = f"{func.__name__}:{args}:{sorted(kwargs.items())}"
                query_hash = hashlib.sha256(func_args.encode()).hexdigest()[:16]
            
            # Extract user ID if available
            user_id = kwargs.get('user_id') or getattr(args[0] if args else None, 'user_id', None)
            
            # Try to get cached result
            cached_result = await cache_service.get_cached_result(
                operation=operation,
                query_hash=query_hash,
                user_id=user_id
            )
            
            if cached_result is not None:
                return cached_result
            
            # Execute function
            start_time = asyncio.get_event_loop().time()
            result = await func(*args, **kwargs)
            execution_time = asyncio.get_event_loop().time() - start_time
            
            # Cache result
            query_info = {
                "function": func.__name__,
                "execution_time": execution_time,
                "args_count": len(args),
                "kwargs_count": len(kwargs)
            }
            
            await cache_service.cache_result(
                operation=operation,
                query_hash=query_hash,
                result=result,
                user_id=user_id,
                query_info=query_info
            )
            
            return result
        
        return wrapper
    return decorator


# Global cache service instance
query_cache_service = QueryCacheService()


# Helper functions for common operations
async def warm_cache_for_user(user_id: str, operations: List[str]):
    """Pre-warm cache for specific user operations"""
    logger.info("Warming cache for user", user_id=user_id, operations=operations)
    
    # This would trigger common queries for the user
    # Implementation depends on specific business logic
    for operation in operations:
        try:
            if operation == "dashboard:overview":
                # Trigger dashboard data loading
                pass
            elif operation == "clients:list":
                # Trigger client list loading
                pass
            # Add more operations as needed
        except Exception as e:
            logger.error(
                "Failed to warm cache for operation",
                user_id=user_id,
                operation=operation,
                error=str(e)
            )


async def invalidate_user_cache(user_id: str):
    """Invalidate all cache entries for a user"""
    redis = await get_redis_client()
    pattern = f"*:user:{user_id}"
    
    try:
        keys = await redis.keys(pattern)
        if keys:
            deleted = await redis.delete(*keys)
            logger.info("User cache invalidated", user_id=user_id, deleted_count=deleted)
            return deleted
    except Exception as e:
        logger.error("Failed to invalidate user cache", user_id=user_id, error=str(e))
    
    return 0


# Event-driven cache invalidation
class CacheEventHandler:
    """Handle domain events for cache invalidation"""
    
    def __init__(self, cache_service: QueryCacheService):
        self.cache_service = cache_service
    
    async def handle_client_created(self, client_id: str, **context):
        """Handle client created event"""
        await self.cache_service.invalidate_by_event("client_created", client_id=client_id, **context)
    
    async def handle_client_updated(self, client_id: str, **context):
        """Handle client updated event"""
        await self.cache_service.invalidate_by_event("client_updated", client_id=client_id, **context)
    
    async def handle_client_deleted(self, client_id: str, **context):
        """Handle client deleted event"""
        await self.cache_service.invalidate_by_event("client_deleted", client_id=client_id, **context)
    
    async def handle_contract_created(self, contract_id: str, **context):
        """Handle contract created event"""
        await self.cache_service.invalidate_by_event("contract_created", contract_id=contract_id, **context)
    
    async def handle_contract_updated(self, contract_id: str, **context):
        """Handle contract updated event"""
        await self.cache_service.invalidate_by_event("contract_updated", contract_id=contract_id, **context)
    
    async def handle_contract_deleted(self, contract_id: str, **context):
        """Handle contract deleted event"""
        await self.cache_service.invalidate_by_event("contract_deleted", contract_id=contract_id, **context)
    
    async def handle_matter_created(self, matter_id: str, **context):
        """Handle matter created event"""
        await self.cache_service.invalidate_by_event("matter_created", matter_id=matter_id, **context)
    
    async def handle_matter_updated(self, matter_id: str, **context):
        """Handle matter updated event"""
        await self.cache_service.invalidate_by_event("matter_updated", matter_id=matter_id, **context)
    
    async def handle_matter_deleted(self, matter_id: str, **context):
        """Handle matter deleted event"""
        await self.cache_service.invalidate_by_event("matter_deleted", matter_id=matter_id, **context)


# Global event handler
cache_event_handler = CacheEventHandler(query_cache_service)