"""
CounselFlow Ultimate V3 - HTTP Response Caching Middleware
Intelligent caching for API responses with TTL and invalidation strategies
"""

import asyncio
import hashlib
import json
from typing import Dict, Any, Optional, List, Callable, Union
from datetime import datetime, timedelta
from functools import wraps
import structlog
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import pickle
import gzip

from app.core.redis import get_redis_client
from app.core.config import settings

logger = structlog.get_logger()


class CacheConfig:
    """Configuration for cache behavior"""
    
    def __init__(
        self,
        ttl: int = 300,  # 5 minutes default
        key_prefix: str = "api_cache:",
        compress: bool = True,
        invalidate_patterns: Optional[List[str]] = None,
        cache_private: bool = False,
        vary_by_user: bool = True,
        vary_by_headers: Optional[List[str]] = None,
        skip_cache_codes: Optional[List[int]] = None
    ):
        self.ttl = ttl
        self.key_prefix = key_prefix
        self.compress = compress
        self.invalidate_patterns = invalidate_patterns or []
        self.cache_private = cache_private
        self.vary_by_user = vary_by_user
        self.vary_by_headers = vary_by_headers or []
        self.skip_cache_codes = skip_cache_codes or [400, 401, 403, 404, 500, 502, 503]


class ResponseCacheMiddleware(BaseHTTPMiddleware):
    """HTTP Response Caching Middleware"""
    
    def __init__(self, app, default_config: Optional[CacheConfig] = None):
        super().__init__(app)
        self.default_config = default_config or CacheConfig()
        self.redis_client = None
        self._cache_rules: Dict[str, CacheConfig] = {}
        self._skip_patterns: List[str] = [
            "/docs", "/redoc", "/openapi.json", "/health", "/metrics"
        ]
    
    async def dispatch(self, request: Request, call_next):
        """Process request and cache response if applicable"""
        
        # Initialize Redis client if not already done
        if self.redis_client is None:
            self.redis_client = await get_redis_client()
        
        # Skip caching for certain patterns
        if self._should_skip_caching(request):
            return await call_next(request)
        
        # Get cache configuration for this endpoint
        cache_config = self._get_cache_config(request)
        if not cache_config:
            return await call_next(request)
        
        # Generate cache key
        cache_key = await self._generate_cache_key(request, cache_config)
        
        # Try to get cached response
        if request.method == "GET":
            cached_response = await self._get_cached_response(cache_key)
            if cached_response:
                logger.info(
                    "Cache hit",
                    cache_key=cache_key[:16] + "...",
                    path=request.url.path,
                    method=request.method
                )
                return cached_response
        
        # Process request
        start_time = asyncio.get_event_loop().time()
        response = await call_next(request)
        processing_time = asyncio.get_event_loop().time() - start_time
        
        # Cache response if conditions are met
        if self._should_cache_response(request, response, cache_config):
            await self._cache_response(
                cache_key, 
                response, 
                cache_config, 
                processing_time
            )
        
        return response
    
    def add_cache_rule(self, pattern: str, config: CacheConfig):
        """Add caching rule for specific URL pattern"""
        self._cache_rules[pattern] = config
    
    def _should_skip_caching(self, request: Request) -> bool:
        """Determine if request should skip caching entirely"""
        path = request.url.path
        
        # Skip non-GET requests by default
        if request.method != "GET":
            return True
        
        # Skip configured patterns
        for pattern in self._skip_patterns:
            if pattern in path:
                return True
        
        # Skip if cache is disabled
        if not settings.ENABLE_RESPONSE_CACHE:
            return True
        
        return False
    
    def _get_cache_config(self, request: Request) -> Optional[CacheConfig]:
        """Get cache configuration for request"""
        path = request.url.path
        
        # Check for specific rules
        for pattern, config in self._cache_rules.items():
            if pattern in path:
                return config
        
        # Use default for API endpoints
        if path.startswith("/api/"):
            return self.default_config
        
        return None
    
    async def _generate_cache_key(self, request: Request, config: CacheConfig) -> str:
        """Generate cache key for request"""
        key_parts = [
            config.key_prefix,
            request.method,
            request.url.path
        ]
        
        # Add query parameters
        if request.query_params:
            sorted_params = sorted(request.query_params.items())
            params_str = "&".join(f"{k}={v}" for k, v in sorted_params)
            key_parts.append(params_str)
        
        # Vary by user if configured
        if config.vary_by_user:
            user_id = getattr(request.state, 'user_id', 'anonymous')
            key_parts.append(f"user:{user_id}")
        
        # Vary by specific headers
        for header in config.vary_by_headers:
            header_value = request.headers.get(header, '')
            if header_value:
                key_parts.append(f"{header}:{header_value}")
        
        # Create hash of key parts
        key_string = "|".join(key_parts)
        key_hash = hashlib.sha256(key_string.encode()).hexdigest()
        
        return f"{config.key_prefix}{key_hash}"
    
    async def _get_cached_response(self, cache_key: str) -> Optional[Response]:
        """Retrieve cached response"""
        try:
            cached_data = await self.redis_client.get(cache_key)
            if not cached_data:
                return None
            
            # Decompress if needed
            if cached_data.startswith(b'\x1f\x8b'):  # gzip magic number
                cached_data = gzip.decompress(cached_data)
            
            # Deserialize response data
            response_data = pickle.loads(cached_data)
            
            # Create response
            response = JSONResponse(
                content=response_data['content'],
                status_code=response_data['status_code'],
                headers=response_data['headers']
            )
            
            # Add cache headers
            response.headers["X-Cache"] = "HIT"
            response.headers["X-Cache-Key"] = cache_key[:16] + "..."
            response.headers["X-Cached-At"] = response_data['cached_at']
            
            return response
            
        except Exception as e:
            logger.warning("Failed to retrieve cached response", error=str(e), cache_key=cache_key[:16])
            return None
    
    def _should_cache_response(
        self, 
        request: Request, 
        response: Response, 
        config: CacheConfig
    ) -> bool:
        """Determine if response should be cached"""
        
        # Only cache successful responses
        if response.status_code in config.skip_cache_codes:
            return False
        
        # Don't cache private responses unless explicitly allowed
        if not config.cache_private:
            cache_control = response.headers.get('cache-control', '')
            if 'private' in cache_control.lower():
                return False
        
        # Check response size (don't cache very large responses)
        content_length = response.headers.get('content-length')
        if content_length and int(content_length) > 1024 * 1024:  # 1MB limit
            return False
        
        return True
    
    async def _cache_response(
        self, 
        cache_key: str, 
        response: Response, 
        config: CacheConfig,
        processing_time: float
    ):
        """Cache response data"""
        try:
            # Read response content
            if hasattr(response, 'body'):
                content = response.body
                if isinstance(content, bytes):
                    content = content.decode('utf-8')
            else:
                content = None
            
            # Prepare response data
            response_data = {
                'content': content,
                'status_code': response.status_code,
                'headers': dict(response.headers),
                'cached_at': datetime.utcnow().isoformat(),
                'processing_time': processing_time
            }
            
            # Serialize data
            serialized_data = pickle.dumps(response_data)
            
            # Compress if configured
            if config.compress and len(serialized_data) > 1024:  # Compress if > 1KB
                serialized_data = gzip.compress(serialized_data)
            
            # Store in Redis
            await self.redis_client.setex(
                cache_key, 
                config.ttl, 
                serialized_data
            )
            
            # Add cache headers to response
            response.headers["X-Cache"] = "MISS"
            response.headers["X-Cache-TTL"] = str(config.ttl)
            response.headers["X-Processing-Time"] = f"{processing_time:.3f}s"
            
            logger.info(
                "Response cached",
                cache_key=cache_key[:16] + "...",
                ttl=config.ttl,
                size=len(serialized_data),
                compressed=config.compress and len(serialized_data) > 1024
            )
            
        except Exception as e:
            logger.error("Failed to cache response", error=str(e), cache_key=cache_key[:16])


# Cache invalidation utilities
class CacheInvalidator:
    """Utilities for cache invalidation"""
    
    def __init__(self):
        self.redis_client = None
    
    async def _get_redis(self):
        if self.redis_client is None:
            self.redis_client = await get_redis_client()
        return self.redis_client
    
    async def invalidate_pattern(self, pattern: str) -> int:
        """Invalidate all cache keys matching pattern"""
        redis = await self._get_redis()
        try:
            # Find matching keys
            keys = await redis.keys(f"*{pattern}*")
            if keys:
                # Delete in batches to avoid blocking
                batch_size = 100
                deleted_count = 0
                for i in range(0, len(keys), batch_size):
                    batch = keys[i:i + batch_size]
                    deleted_count += await redis.delete(*batch)
                
                logger.info(
                    "Cache invalidated by pattern",
                    pattern=pattern,
                    deleted_count=deleted_count
                )
                return deleted_count
            return 0
        except Exception as e:
            logger.error("Failed to invalidate cache pattern", pattern=pattern, error=str(e))
            return 0
    
    async def invalidate_tags(self, tags: List[str]) -> int:
        """Invalidate cache entries by tags"""
        total_deleted = 0
        for tag in tags:
            deleted = await self.invalidate_pattern(f"tag:{tag}")
            total_deleted += deleted
        return total_deleted
    
    async def clear_user_cache(self, user_id: str) -> int:
        """Clear all cache entries for a specific user"""
        return await self.invalidate_pattern(f"user:{user_id}")


# Decorators for easy cache configuration
def cache_response(
    ttl: int = 300,
    key_prefix: str = "api_cache:",
    compress: bool = True,
    invalidate_patterns: Optional[List[str]] = None,
    vary_by_user: bool = True
):
    """Decorator to cache API endpoint responses"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # This decorator sets metadata for the middleware to use
            # The actual caching is handled by ResponseCacheMiddleware
            return await func(*args, **kwargs)
        
        # Store cache config on function
        wrapper._cache_config = CacheConfig(
            ttl=ttl,
            key_prefix=key_prefix,
            compress=compress,
            invalidate_patterns=invalidate_patterns,
            vary_by_user=vary_by_user
        )
        
        return wrapper
    return decorator


# Global cache invalidator instance
cache_invalidator = CacheInvalidator()


# Predefined cache configurations for different endpoint types
CACHE_CONFIGS = {
    "dashboard": CacheConfig(ttl=300, key_prefix="dash:", vary_by_user=True),
    "clients": CacheConfig(ttl=600, key_prefix="clients:", vary_by_user=True),
    "contracts": CacheConfig(ttl=600, key_prefix="contracts:", vary_by_user=True),
    "matters": CacheConfig(ttl=600, key_prefix="matters:", vary_by_user=True),
    "analytics": CacheConfig(ttl=900, key_prefix="analytics:", vary_by_user=True),
    "public": CacheConfig(ttl=3600, key_prefix="public:", vary_by_user=False)
}