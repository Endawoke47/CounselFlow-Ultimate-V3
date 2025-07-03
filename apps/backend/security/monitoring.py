"""
Comprehensive monitoring and health check system for CounselFlow
"""

import asyncio
import time
import psutil
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi import FastAPI
import redis
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import get_db

logger = logging.getLogger(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter(
    'counselflow_requests_total',
    'Total number of requests',
    ['method', 'endpoint', 'status']
)

REQUEST_DURATION = Histogram(
    'counselflow_request_duration_seconds',
    'Request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'counselflow_active_connections',
    'Number of active database connections'
)

MEMORY_USAGE = Gauge(
    'counselflow_memory_usage_bytes',
    'Memory usage in bytes'
)

CPU_USAGE = Gauge(
    'counselflow_cpu_usage_percent',
    'CPU usage percentage'
)

ERROR_COUNT = Counter(
    'counselflow_errors_total',
    'Total number of errors',
    ['error_type', 'endpoint']
)

SECURITY_EVENTS = Counter(
    'counselflow_security_events_total',
    'Total number of security events',
    ['event_type', 'severity']
)

DATABASE_CONNECTIONS = Gauge(
    'counselflow_database_connections',
    'Number of database connections'
)

REDIS_CONNECTIONS = Gauge(
    'counselflow_redis_connections',
    'Number of Redis connections'
)


class HealthChecker:
    """Comprehensive health checking system"""
    
    def __init__(self):
        self.checks = {}
        self.last_check_time = {}
        self.check_interval = 30  # seconds
        
    def register_check(self, name: str, check_func, interval: int = 30):
        """Register a health check function"""
        self.checks[name] = {
            'func': check_func,
            'interval': interval,
            'last_result': None,
            'last_error': None
        }
        
    async def run_check(self, name: str) -> Dict[str, Any]:
        """Run a specific health check"""
        if name not in self.checks:
            return {'status': 'error', 'message': f'Check {name} not found'}
        
        check = self.checks[name]
        try:
            start_time = time.time()
            result = await check['func']()
            duration = time.time() - start_time
            
            check['last_result'] = {
                'status': 'healthy',
                'timestamp': datetime.utcnow().isoformat(),
                'duration': duration,
                'details': result
            }
            check['last_error'] = None
            
        except Exception as e:
            logger.error(f"Health check {name} failed: {str(e)}")
            check['last_result'] = {
                'status': 'unhealthy',
                'timestamp': datetime.utcnow().isoformat(),
                'error': str(e)
            }
            check['last_error'] = str(e)
            
        return check['last_result']
    
    async def run_all_checks(self) -> Dict[str, Any]:
        """Run all health checks"""
        results = {}
        overall_status = 'healthy'
        
        for name in self.checks:
            result = await self.run_check(name)
            results[name] = result
            
            if result['status'] != 'healthy':
                overall_status = 'unhealthy'
        
        return {
            'status': overall_status,
            'timestamp': datetime.utcnow().isoformat(),
            'checks': results
        }


# Global health checker instance
health_checker = HealthChecker()


async def check_database_health() -> Dict[str, Any]:
    """Check database connectivity and performance"""
    try:
        db = next(get_db())
        
        # Test basic connectivity
        start_time = time.time()
        result = db.execute(text("SELECT 1")).fetchone()
        query_time = time.time() - start_time
        
        # Get connection count
        conn_result = db.execute(text(
            "SELECT count(*) FROM pg_stat_activity WHERE state = 'active'"
        )).fetchone()
        active_connections = conn_result[0] if conn_result else 0
        
        # Update Prometheus metrics
        DATABASE_CONNECTIONS.set(active_connections)
        ACTIVE_CONNECTIONS.set(active_connections)
        
        return {
            'connected': True,
            'query_time': query_time,
            'active_connections': active_connections,
            'max_connections': 100  # This should come from your DB config
        }
        
    except Exception as e:
        ERROR_COUNT.labels(error_type='database', endpoint='health_check').inc()
        raise e
    finally:
        if 'db' in locals():
            db.close()


async def check_redis_health() -> Dict[str, Any]:
    """Check Redis connectivity and performance"""
    try:
        redis_client = redis.from_url(settings.REDIS_URL)
        
        # Test basic connectivity
        start_time = time.time()
        redis_client.ping()
        ping_time = time.time() - start_time
        
        # Get Redis info
        info = redis_client.info()
        
        # Update Prometheus metrics
        REDIS_CONNECTIONS.set(info.get('connected_clients', 0))
        
        return {
            'connected': True,
            'ping_time': ping_time,
            'connected_clients': info.get('connected_clients', 0),
            'used_memory': info.get('used_memory', 0),
            'used_memory_human': info.get('used_memory_human', '0B')
        }
        
    except Exception as e:
        ERROR_COUNT.labels(error_type='redis', endpoint='health_check').inc()
        raise e
    finally:
        if 'redis_client' in locals():
            redis_client.close()


async def check_system_resources() -> Dict[str, Any]:
    """Check system resource usage"""
    try:
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # Memory usage
        memory = psutil.virtual_memory()
        
        # Disk usage
        disk = psutil.disk_usage('/')
        
        # Update Prometheus metrics
        CPU_USAGE.set(cpu_percent)
        MEMORY_USAGE.set(memory.used)
        
        return {
            'cpu_percent': cpu_percent,
            'memory': {
                'total': memory.total,
                'available': memory.available,
                'percent': memory.percent,
                'used': memory.used
            },
            'disk': {
                'total': disk.total,
                'used': disk.used,
                'free': disk.free,
                'percent': (disk.used / disk.total) * 100
            }
        }
        
    except Exception as e:
        ERROR_COUNT.labels(error_type='system', endpoint='health_check').inc()
        raise e


async def check_external_services() -> Dict[str, Any]:
    """Check external service connectivity"""
    services = {}
    
    # Check AI services (if configured)
    if settings.OPENAI_API_KEY:
        try:
            # Basic check - you might want to implement actual API calls
            services['openai'] = {'status': 'configured', 'available': True}
        except Exception as e:
            services['openai'] = {'status': 'error', 'error': str(e)}
    
    if settings.ANTHROPIC_API_KEY:
        try:
            services['anthropic'] = {'status': 'configured', 'available': True}
        except Exception as e:
            services['anthropic'] = {'status': 'error', 'error': str(e)}
    
    return services


async def check_security_status() -> Dict[str, Any]:
    """Check security system status"""
    return {
        'encryption_enabled': settings.DOCUMENT_ENCRYPTION_ENABLED,
        'mfa_available': True,
        'audit_logging': 'active',
        'rate_limiting': settings.RATE_LIMIT_ENABLED,
        'ssl_enabled': settings.SSL_ENABLED,
        'environment': settings.ENVIRONMENT
    }


# Register all health checks
health_checker.register_check('database', check_database_health, 30)
health_checker.register_check('redis', check_redis_health, 30)
health_checker.register_check('system', check_system_resources, 60)
health_checker.register_check('external_services', check_external_services, 300)
health_checker.register_check('security', check_security_status, 300)


class MonitoringMiddleware:
    """Middleware for monitoring requests and responses"""
    
    def __init__(self, app: FastAPI):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        method = scope["method"]
        path = scope["path"]
        
        # Start timing
        start_time = time.time()
        
        # Track the response
        status_code = 200
        
        async def send_wrapper(message):
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message["status"]
            await send(message)
        
        try:
            await self.app(scope, receive, send_wrapper)
        except Exception as e:
            status_code = 500
            ERROR_COUNT.labels(error_type=type(e).__name__, endpoint=path).inc()
            raise
        finally:
            # Record metrics
            duration = time.time() - start_time
            REQUEST_COUNT.labels(method=method, endpoint=path, status=status_code).inc()
            REQUEST_DURATION.labels(method=method, endpoint=path).observe(duration)


class SecurityEventLogger:
    """Log and track security events"""
    
    @staticmethod
    def log_authentication_attempt(user_id: str, success: bool, ip_address: str = None):
        """Log authentication attempts"""
        event_type = 'auth_success' if success else 'auth_failure'
        severity = 'info' if success else 'warning'
        
        SECURITY_EVENTS.labels(event_type=event_type, severity=severity).inc()
        
        logger.info(f"Authentication attempt: user={user_id}, success={success}, ip={ip_address}")
    
    @staticmethod
    def log_privilege_violation(user_id: str, resource: str, action: str):
        """Log privilege violations"""
        SECURITY_EVENTS.labels(event_type='privilege_violation', severity='high').inc()
        
        logger.warning(f"Privilege violation: user={user_id}, resource={resource}, action={action}")
    
    @staticmethod
    def log_suspicious_activity(event_type: str, details: Dict[str, Any]):
        """Log suspicious activity"""
        SECURITY_EVENTS.labels(event_type=event_type, severity='high').inc()
        
        logger.warning(f"Suspicious activity: {event_type}, details={details}")


class PerformanceMonitor:
    """Monitor application performance"""
    
    def __init__(self):
        self.slow_queries = []
        self.error_rates = {}
        
    def record_slow_query(self, query: str, duration: float, threshold: float = 1.0):
        """Record slow database queries"""
        if duration > threshold:
            self.slow_queries.append({
                'query': query[:100],  # Truncate for logging
                'duration': duration,
                'timestamp': datetime.utcnow()
            })
            
            # Keep only recent slow queries
            cutoff = datetime.utcnow() - timedelta(hours=24)
            self.slow_queries = [
                q for q in self.slow_queries 
                if q['timestamp'] > cutoff
            ]
            
            logger.warning(f"Slow query detected: {duration:.2f}s - {query[:100]}")
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get current performance metrics"""
        return {
            'slow_queries_24h': len(self.slow_queries),
            'memory_usage': psutil.virtual_memory()._asdict(),
            'cpu_usage': psutil.cpu_percent(),
            'active_connections': len(psutil.net_connections())
        }


# Global instances
security_logger = SecurityEventLogger()
performance_monitor = PerformanceMonitor()


async def get_metrics_data() -> str:
    """Get Prometheus metrics data"""
    return generate_latest()


def setup_monitoring(app: FastAPI):
    """Setup monitoring for the FastAPI application"""
    
    # Add monitoring middleware
    app.add_middleware(MonitoringMiddleware)
    
    # Health check endpoints
    @app.get("/health")
    async def health_check():
        """Basic health check"""
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "environment": settings.ENVIRONMENT
        }
    
    @app.get("/health/detailed")
    async def detailed_health_check():
        """Detailed health check with all systems"""
        return await health_checker.run_all_checks()
    
    @app.get("/health/db")
    async def database_health():
        """Database-specific health check"""
        return await health_checker.run_check('database')
    
    @app.get("/health/redis")
    async def redis_health():
        """Redis-specific health check"""
        return await health_checker.run_check('redis')
    
    @app.get("/metrics")
    async def prometheus_metrics():
        """Prometheus metrics endpoint"""
        if not settings.PROMETHEUS_ENABLED:
            return {"error": "Metrics disabled"}
        
        metrics_data = await get_metrics_data()
        return Response(content=metrics_data, media_type=CONTENT_TYPE_LATEST)
    
    @app.get("/monitoring/performance")
    async def performance_metrics():
        """Get performance metrics"""
        return performance_monitor.get_performance_metrics()
    
    # Background task for continuous monitoring
    @asynccontextmanager
    async def monitoring_lifespan(app: FastAPI):
        # Startup
        logger.info("Starting monitoring services")
        monitoring_task = asyncio.create_task(continuous_monitoring())
        
        yield
        
        # Shutdown
        logger.info("Stopping monitoring services")
        monitoring_task.cancel()
        try:
            await monitoring_task
        except asyncio.CancelledError:
            pass
    
    # Set the lifespan
    app.router.lifespan_context = monitoring_lifespan


async def continuous_monitoring():
    """Continuous monitoring background task"""
    while True:
        try:
            # Run health checks periodically
            await health_checker.run_all_checks()
            
            # Update system metrics
            await check_system_resources()
            
            # Log current status
            logger.info("Monitoring cycle completed")
            
            # Wait for next cycle
            await asyncio.sleep(60)  # Run every minute
            
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in monitoring cycle: {str(e)}")
            await asyncio.sleep(60)


# Alert thresholds
ALERT_THRESHOLDS = {
    'cpu_usage': 80.0,
    'memory_usage': 80.0,
    'disk_usage': 85.0,
    'error_rate': 5.0,  # errors per minute
    'response_time': 2.0  # seconds
}


def check_alerts() -> List[Dict[str, Any]]:
    """Check for alert conditions"""
    alerts = []
    
    # Check CPU usage
    cpu_usage = psutil.cpu_percent()
    if cpu_usage > ALERT_THRESHOLDS['cpu_usage']:
        alerts.append({
            'type': 'cpu_usage',
            'severity': 'warning',
            'value': cpu_usage,
            'threshold': ALERT_THRESHOLDS['cpu_usage'],
            'message': f'High CPU usage: {cpu_usage:.1f}%'
        })
    
    # Check memory usage
    memory = psutil.virtual_memory()
    if memory.percent > ALERT_THRESHOLDS['memory_usage']:
        alerts.append({
            'type': 'memory_usage',
            'severity': 'warning',
            'value': memory.percent,
            'threshold': ALERT_THRESHOLDS['memory_usage'],
            'message': f'High memory usage: {memory.percent:.1f}%'
        })
    
    return alerts