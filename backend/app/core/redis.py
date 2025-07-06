"""
CounselFlow Ultimate V3 - Redis Cache and Session Management
"""

import asyncio
import json
import pickle
from typing import Any, Optional, Union, Dict, List
from contextlib import asynccontextmanager
import structlog
import redis.asyncio as aioredis
from redis.asyncio import Redis, ConnectionPool
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings

logger = structlog.get_logger()

# Redis connection pool and client
redis_pool: Optional[ConnectionPool] = None
redis_client: Optional[Redis] = None


@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=2, max=5),
    reraise=True
)
async def initialize_redis() -> None:
    """Create Redis connection with retry logic"""
    global redis_pool, redis_client
    
    try:
        logger.info("Creating Redis connection", redis_url=settings.REDIS_URL)
        
        # Parse Redis configuration
        redis_config = settings.redis_url_parsed
        
        # Create connection pool
        redis_pool = ConnectionPool(
            host=redis_config["host"],
            port=redis_config["port"],
            password=redis_config["password"],
            db=redis_config["db"],
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
            retry_on_timeout=True,
            socket_keepalive=True,
            socket_keepalive_options={},
            health_check_interval=30,
        )
        
        # Create Redis client
        redis_client = Redis(connection_pool=redis_pool)
        
        # Test Redis connection
        await test_redis_connection()
        
        logger.info("Redis connection established successfully")
        
    except Exception as e:
        logger.error("Failed to create Redis connection", error=str(e))
        raise


async def close_redis_connection() -> None:
    """Close Redis connections"""
    global redis_pool, redis_client
    
    try:
        logger.info("Closing Redis connections")
        
        if redis_client:
            await redis_client.close()
            
        if redis_pool:
            await redis_pool.disconnect()
            
        redis_client = None
        redis_pool = None
        
        logger.info("Redis connections closed successfully")
        
    except Exception as e:
        logger.error("Error closing Redis connections", error=str(e))


async def get_redis_client() -> Redis:
    """Get Redis client instance"""
    if not redis_client:
        raise RuntimeError("Redis client not initialized. Call create_redis_connection() first.")
    return redis_client


async def test_redis_connection() -> bool:
    """Test Redis connectivity"""
    try:
        if not redis_client:
            return False
            
        await redis_client.ping()
        return True
        
    except Exception as e:
        logger.error("Redis connectivity test failed", error=str(e))
        return False


async def check_redis_health() -> bool:
    """Health check for Redis"""
    try:
        if not redis_client:
            return False
            
        # Test basic operations
        test_key = "health_check_test"
        await redis_client.set(test_key, "test_value", ex=1)
        result = await redis_client.get(test_key)
        await redis_client.delete(test_key)
        
        return result == "test_value"
        
    except Exception as e:
        logger.error("Redis health check failed", error=str(e))
        return False


# Cache management functions
class CacheManager:
    """Redis cache management utility"""
    
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
    
    async def get(self, key: str, default: Any = None) -> Any:
        """Get value from cache"""
        try:
            value = await self.redis.get(key)
            if value is None:
                return default
            
            # Try to deserialize JSON first, then pickle
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                try:
                    return pickle.loads(value.encode() if isinstance(value, str) else value)
                except (pickle.PickleError, AttributeError):
                    return value
                    
        except Exception as e:
            logger.warning("Cache get failed", key=key, error=str(e))
            return default
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        expire: Optional[int] = None,
        serialize_method: str = "json"
    ) -> bool:
        """Set value in cache"""
        try:
            # Serialize the value
            if serialize_method == "json":
                try:
                    serialized_value = json.dumps(value)
                except (TypeError, ValueError):
                    serialized_value = pickle.dumps(value)
            else:
                serialized_value = pickle.dumps(value)
            
            await self.redis.set(key, serialized_value, ex=expire)
            return True
            
        except Exception as e:
            logger.error("Cache set failed", key=key, error=str(e))
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            result = await self.redis.delete(key)
            return bool(result)
        except Exception as e:
            logger.error("Cache delete failed", key=key, error=str(e))
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        try:
            result = await self.redis.exists(key)
            return bool(result)
        except Exception as e:
            logger.error("Cache exists check failed", key=key, error=str(e))
            return False
    
    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration for key"""
        try:
            result = await self.redis.expire(key, seconds)
            return bool(result)
        except Exception as e:
            logger.error("Cache expire failed", key=key, error=str(e))
            return False
    
    async def ttl(self, key: str) -> int:
        """Get time to live for key"""
        try:
            return await self.redis.ttl(key)
        except Exception as e:
            logger.error("Cache TTL check failed", key=key, error=str(e))
            return -1
    
    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Increment value in cache"""
        try:
            return await self.redis.incr(key, amount)
        except Exception as e:
            logger.error("Cache increment failed", key=key, error=str(e))
            return None
    
    async def decrement(self, key: str, amount: int = 1) -> Optional[int]:
        """Decrement value in cache"""
        try:
            return await self.redis.decr(key, amount)
        except Exception as e:
            logger.error("Cache decrement failed", key=key, error=str(e))
            return None
    
    async def get_many(self, keys: List[str]) -> Dict[str, Any]:
        """Get multiple values from cache"""
        try:
            values = await self.redis.mget(keys)
            result = {}
            
            for key, value in zip(keys, values):
                if value is not None:
                    try:
                        result[key] = json.loads(value)
                    except (json.JSONDecodeError, TypeError):
                        try:
                            result[key] = pickle.loads(value.encode() if isinstance(value, str) else value)
                        except (pickle.PickleError, AttributeError):
                            result[key] = value
            
            return result
            
        except Exception as e:
            logger.error("Cache get_many failed", keys=keys, error=str(e))
            return {}
    
    async def set_many(self, mapping: Dict[str, Any], expire: Optional[int] = None) -> bool:
        """Set multiple values in cache"""
        try:
            pipe = self.redis.pipeline()
            
            for key, value in mapping.items():
                try:
                    serialized_value = json.dumps(value)
                except (TypeError, ValueError):
                    serialized_value = pickle.dumps(value)
                
                pipe.set(key, serialized_value, ex=expire)
            
            await pipe.execute()
            return True
            
        except Exception as e:
            logger.error("Cache set_many failed", error=str(e))
            return False
    
    async def delete_pattern(self, pattern: str) -> int:
        """Delete keys matching pattern"""
        try:
            keys = await self.redis.keys(pattern)
            if keys:
                return await self.redis.delete(*keys)
            return 0
        except Exception as e:
            logger.error("Cache delete_pattern failed", pattern=pattern, error=str(e))
            return 0
    
    async def clear_all(self) -> bool:
        """Clear all keys from current database"""
        try:
            await self.redis.flushdb()
            return True
        except Exception as e:
            logger.error("Cache clear_all failed", error=str(e))
            return False


# Session management
class SessionManager:
    """Redis-based session management"""
    
    def __init__(self, redis_client: Redis, prefix: str = "session:"):
        self.redis = redis_client
        self.prefix = prefix
    
    def _make_key(self, session_id: str) -> str:
        """Make session key with prefix"""
        return f"{self.prefix}{session_id}"
    
    async def create_session(self, session_id: str, data: Dict[str, Any], expire: int = 3600) -> bool:
        """Create a new session"""
        try:
            key = self._make_key(session_id)
            serialized_data = json.dumps(data)
            await self.redis.set(key, serialized_data, ex=expire)
            return True
        except Exception as e:
            logger.error("Session creation failed", session_id=session_id, error=str(e))
            return False
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data"""
        try:
            key = self._make_key(session_id)
            data = await self.redis.get(key)
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.error("Session get failed", session_id=session_id, error=str(e))
            return None
    
    async def update_session(self, session_id: str, data: Dict[str, Any], expire: Optional[int] = None) -> bool:
        """Update session data"""
        try:
            key = self._make_key(session_id)
            serialized_data = json.dumps(data)
            
            if expire:
                await self.redis.set(key, serialized_data, ex=expire)
            else:
                await self.redis.set(key, serialized_data, keepttl=True)
            
            return True
        except Exception as e:
            logger.error("Session update failed", session_id=session_id, error=str(e))
            return False
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete session"""
        try:
            key = self._make_key(session_id)
            result = await self.redis.delete(key)
            return bool(result)
        except Exception as e:
            logger.error("Session delete failed", session_id=session_id, error=str(e))
            return False
    
    async def refresh_session(self, session_id: str, expire: int = 3600) -> bool:
        """Refresh session expiration"""
        try:
            key = self._make_key(session_id)
            result = await self.redis.expire(key, expire)
            return bool(result)
        except Exception as e:
            logger.error("Session refresh failed", session_id=session_id, error=str(e))
            return False


# Rate limiting
class RateLimiter:
    """Redis-based rate limiting"""
    
    def __init__(self, redis_client: Redis, prefix: str = "rate_limit:"):
        self.redis = redis_client
        self.prefix = prefix
    
    def _make_key(self, identifier: str, window: str) -> str:
        """Make rate limit key with prefix"""
        return f"{self.prefix}{identifier}:{window}"
    
    async def is_allowed(
        self,
        identifier: str,
        limit: int,
        window_seconds: int,
        window_type: str = "sliding"
    ) -> tuple[bool, int, int]:
        """
        Check if request is allowed within rate limit
        Returns: (is_allowed, current_count, remaining_count)
        """
        try:
            import time
            current_time = int(time.time())
            
            if window_type == "sliding":
                # Sliding window rate limiting
                window_start = current_time - window_seconds
                key = self._make_key(identifier, f"sliding_{window_seconds}")
                
                pipe = self.redis.pipeline()
                # Remove expired entries
                pipe.zremrangebyscore(key, 0, window_start)
                # Count current requests
                pipe.zcard(key)
                # Add current request
                pipe.zadd(key, {str(current_time): current_time})
                # Set expiration
                pipe.expire(key, window_seconds + 1)
                
                results = await pipe.execute()
                current_count = results[1] + 1  # +1 for the request we just added
                
            else:
                # Fixed window rate limiting
                window_key = current_time // window_seconds
                key = self._make_key(identifier, f"fixed_{window_key}")
                
                current_count = await self.redis.incr(key)
                if current_count == 1:
                    await self.redis.expire(key, window_seconds)
            
            is_allowed = current_count <= limit
            remaining = max(0, limit - current_count)
            
            return is_allowed, current_count, remaining
            
        except Exception as e:
            logger.error("Rate limit check failed", identifier=identifier, error=str(e))
            # Allow request if rate limiting fails
            return True, 0, limit


# Task queue support (for Celery)
class TaskQueue:
    """Redis-based task queue utilities"""
    
    def __init__(self, redis_client: Redis, prefix: str = "task:"):
        self.redis = redis_client
        self.prefix = prefix
    
    async def enqueue_task(self, queue_name: str, task_data: Dict[str, Any]) -> bool:
        """Enqueue a task"""
        try:
            key = f"{self.prefix}queue:{queue_name}"
            serialized_task = json.dumps(task_data)
            await self.redis.lpush(key, serialized_task)
            return True
        except Exception as e:
            logger.error("Task enqueue failed", queue=queue_name, error=str(e))
            return False
    
    async def dequeue_task(self, queue_name: str, timeout: int = 0) -> Optional[Dict[str, Any]]:
        """Dequeue a task"""
        try:
            key = f"{self.prefix}queue:{queue_name}"
            result = await self.redis.brpop(key, timeout=timeout)
            if result:
                _, task_data = result
                return json.loads(task_data)
            return None
        except Exception as e:
            logger.error("Task dequeue failed", queue=queue_name, error=str(e))
            return None
    
    async def get_queue_length(self, queue_name: str) -> int:
        """Get queue length"""
        try:
            key = f"{self.prefix}queue:{queue_name}"
            return await self.redis.llen(key)
        except Exception as e:
            logger.error("Queue length check failed", queue=queue_name, error=str(e))
            return 0


# Factory functions for convenience
async def get_cache_manager() -> CacheManager:
    """Get cache manager instance"""
    client = await get_redis_client()
    return CacheManager(client)


async def get_session_manager() -> SessionManager:
    """Get session manager instance"""
    client = await get_redis_client()
    return SessionManager(client)


async def get_rate_limiter() -> RateLimiter:
    """Get rate limiter instance"""
    client = await get_redis_client()
    return RateLimiter(client)


async def get_task_queue() -> TaskQueue:
    """Get task queue instance"""
    client = await get_redis_client()
    return TaskQueue(client)


# Redis connection status
async def get_redis_status() -> Dict[str, Any]:
    """Get Redis connection status and info"""
    try:
        if not redis_client:
            return {"status": "not_initialized"}
        
        info = await redis_client.info()
        
        return {
            "status": "connected",
            "version": info.get("redis_version"),
            "used_memory": info.get("used_memory_human"),
            "connected_clients": info.get("connected_clients"),
            "total_commands_processed": info.get("total_commands_processed"),
            "uptime_in_seconds": info.get("uptime_in_seconds"),
        }
        
    except Exception as e:
        logger.error("Redis status check failed", error=str(e))
        return {"status": "error", "error": str(e)}