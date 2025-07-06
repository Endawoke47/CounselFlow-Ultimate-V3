"""
CounselFlow Ultimate V3 - Main FastAPI Application
AI-Powered Enterprise Legal Management Platform
"""

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import structlog
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
import uvicorn
import sys
import os
from datetime import datetime
import time
import asyncio
from contextlib import asynccontextmanager

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import create_database_connection
from app.core.logging_config import configure_logging
from app.core.error_handlers import (
    CounselFlowError, RequestValidationError, HTTPException as CounselFlowHTTPException,
    counselflow_exception_handler, validation_exception_handler, 
    http_exception_handler, general_exception_handler
)
from app.middleware.security import SecurityMiddleware
from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limiting import RateLimitMiddleware
from app.middleware.response_cache import ResponseCacheMiddleware, CACHE_CONFIGS

# Import all API routers
from app.api.v1 import (
    auth,
    users,
    clients,
    contracts,
    matters,
    ip,
    privacy,
    risk,
    litigation,
    documents,
    tasks,
    ai,
    notifications,
    admin,
    dashboard
)

# Configure enhanced logging system
configure_logging()
logger = structlog.get_logger()

# Initialize Sentry for error tracking
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[
            FastApiIntegration(auto_enabling=True),
            SqlalchemyIntegration(),
        ],
        traces_sample_rate=0.1,
        environment=settings.ENVIRONMENT,
    )

# Application lifecycle management with improved error handling
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Enhanced application lifecycle management"""
    startup_time = time.time()
    logger.info("Starting CounselFlow Ultimate V3", version="3.0.0")
    
    try:
        # Initialize database connection with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                await create_database_connection()
                logger.info("Database connection established")
                break
            except Exception as e:
                if attempt == max_retries - 1:
                    logger.error("Failed to establish database connection", error=str(e))
                    raise
                logger.warning(f"Database connection attempt {attempt + 1} failed, retrying...", error=str(e))
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
        
        # Initialize AI services with error handling
        try:
            from app.services.ai_orchestrator import AIOrchestrator
            ai_orchestrator = AIOrchestrator()
            await ai_orchestrator.initialize()
            app.state.ai_orchestrator = ai_orchestrator
            logger.info("AI services initialized")
        except Exception as e:
            logger.warning("AI services initialization failed, continuing without AI", error=str(e))
            app.state.ai_orchestrator = None
        
        # Run any pending database migrations
        if getattr(settings, 'AUTO_MIGRATE', False):
            try:
                from app.core.database import run_migrations
                await run_migrations()
                logger.info("Database migrations completed")
            except Exception as e:
                logger.error("Database migration failed", error=str(e))
                # Don't fail startup for migration errors in production
                if settings.ENVIRONMENT != "production":
                    raise
        
        # Initialize Redis connection
        try:
            from app.core.redis import initialize_redis
            await initialize_redis()
            logger.info("Redis connection established")
        except Exception as e:
            logger.warning("Redis initialization failed, some features may be unavailable", error=str(e))
        
        startup_duration = time.time() - startup_time
        logger.info(
            "CounselFlow Ultimate V3 startup completed",
            startup_duration=f"{startup_duration:.2f}s",
            timestamp=datetime.utcnow().isoformat()
        )
        
        # Store startup info in app state
        app.state.startup_time = datetime.utcnow()
        app.state.startup_duration = startup_duration
        
        yield
        
    except Exception as e:
        logger.error("Failed to start CounselFlow Ultimate V3", error=str(e))
        raise
    finally:
        # Cleanup on shutdown
        logger.info("Shutting down CounselFlow Ultimate V3")
        
        try:
            # Close AI services
            if hasattr(app.state, 'ai_orchestrator') and app.state.ai_orchestrator:
                await app.state.ai_orchestrator.shutdown()
                logger.info("AI services shut down")
        except Exception as e:
            logger.error("Error shutting down AI services", error=str(e))
        
        try:
            # Close database connections
            from app.core.database import close_database_connection
            await close_database_connection()
            logger.info("Database connections closed")
        except Exception as e:
            logger.error("Error closing database connections", error=str(e))
        
        try:
            # Close Redis connections
            from app.core.redis import close_redis_connection
            await close_redis_connection()
            logger.info("Redis connections closed")
        except Exception as e:
            logger.error("Error closing Redis connections", error=str(e))
        
        logger.info("CounselFlow Ultimate V3 shutdown completed")

# Create FastAPI application with enhanced lifespan management
app = FastAPI(
    title="CounselFlow Ultimate V3",
    description="AI-Powered Enterprise Legal Management Platform",
    version="3.0.0",
    docs_url="/docs" if settings.ENABLE_SWAGGER_DOCS else None,
    redoc_url="/redoc" if settings.ENABLE_SWAGGER_DOCS else None,
    openapi_url="/openapi.json" if settings.ENABLE_SWAGGER_DOCS else None,
    lifespan=lifespan,
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(",") if settings.ENABLE_CORS else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.ENVIRONMENT == "development" else ["counselflow.com", "*.counselflow.com"]
)

# Enhanced caching middleware
response_cache_middleware = ResponseCacheMiddleware(app)
# Configure cache rules for different endpoints
response_cache_middleware.add_cache_rule("/api/v1/dashboard", CACHE_CONFIGS["dashboard"])
response_cache_middleware.add_cache_rule("/api/v1/clients", CACHE_CONFIGS["clients"])
response_cache_middleware.add_cache_rule("/api/v1/contracts", CACHE_CONFIGS["contracts"])
response_cache_middleware.add_cache_rule("/api/v1/matters", CACHE_CONFIGS["matters"])
response_cache_middleware.add_cache_rule("/api/v1/analytics", CACHE_CONFIGS["analytics"])

app.add_middleware(ResponseCacheMiddleware)
app.add_middleware(SecurityMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Global exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with structured logging"""
    logger.warning(
        "HTTP exception occurred",
        status_code=exc.status_code,
        detail=exc.detail,
        path=request.url.path,
        method=request.method,
        client_ip=request.client.host if request.client else None,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code,
            "timestamp": structlog.processors.TimeStamper(fmt="iso")(),
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error(
        "Unexpected exception occurred",
        exception=str(exc),
        path=request.url.path,
        method=request.method,
        client_ip=request.client.host if request.client else None,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "Internal server error" if settings.ENVIRONMENT == "production" else str(exc),
            "status_code": 500,
            "timestamp": structlog.processors.TimeStamper(fmt="iso")(),
        }
    )

# Enhanced health check endpoint with detailed metrics
@app.get("/health")
async def health_check():
    """Comprehensive health check endpoint for monitoring"""
    start_time = time.time()
    health_status = {
        "status": "healthy",
        "version": "3.0.0",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat(),
        "uptime_seconds": (datetime.utcnow() - app.state.startup_time).total_seconds() if hasattr(app.state, 'startup_time') else None,
        "startup_duration": app.state.startup_duration if hasattr(app.state, 'startup_duration') else None,
        "services": {},
        "metrics": {}
    }
    
    # Check database connectivity
    try:
        from app.core.database import check_database_health
        db_start = time.time()
        db_healthy = await asyncio.wait_for(check_database_health(), timeout=5.0)
        db_response_time = (time.time() - db_start) * 1000  # Convert to ms
        
        health_status["services"]["database"] = {
            "status": "healthy" if db_healthy else "unhealthy",
            "response_time_ms": round(db_response_time, 2)
        }
    except asyncio.TimeoutError:
        health_status["services"]["database"] = {"status": "timeout", "response_time_ms": 5000}
        health_status["status"] = "degraded"
    except Exception as e:
        health_status["services"]["database"] = {"status": "error", "error": str(e)}
        health_status["status"] = "degraded"
    
    # Check Redis connectivity
    try:
        from app.core.redis import check_redis_health
        redis_start = time.time()
        redis_healthy = await asyncio.wait_for(check_redis_health(), timeout=3.0)
        redis_response_time = (time.time() - redis_start) * 1000
        
        health_status["services"]["redis"] = {
            "status": "healthy" if redis_healthy else "unhealthy",
            "response_time_ms": round(redis_response_time, 2)
        }
    except asyncio.TimeoutError:
        health_status["services"]["redis"] = {"status": "timeout", "response_time_ms": 3000}
        health_status["status"] = "degraded"
    except Exception as e:
        health_status["services"]["redis"] = {"status": "error", "error": str(e)}
        health_status["status"] = "degraded"
    
    # Check AI services
    try:
        if hasattr(app.state, 'ai_orchestrator') and app.state.ai_orchestrator:
            ai_start = time.time()
            ai_healthy = await asyncio.wait_for(app.state.ai_orchestrator.health_check(), timeout=10.0)
            ai_response_time = (time.time() - ai_start) * 1000
            
            health_status["services"]["ai_services"] = {
                "status": "healthy" if ai_healthy else "unhealthy",
                "response_time_ms": round(ai_response_time, 2)
            }
        else:
            health_status["services"]["ai_services"] = {"status": "not_initialized"}
    except asyncio.TimeoutError:
        health_status["services"]["ai_services"] = {"status": "timeout", "response_time_ms": 10000}
        health_status["status"] = "degraded"
    except Exception as e:
        health_status["services"]["ai_services"] = {"status": "error", "error": str(e)}
        health_status["status"] = "degraded"
    
    # Calculate overall health
    unhealthy_services = [
        service for service, info in health_status["services"].items()
        if info.get("status") not in ["healthy", "not_initialized"]
    ]
    
    if unhealthy_services:
        if len(unhealthy_services) == len(health_status["services"]):
            health_status["status"] = "unhealthy"
        else:
            health_status["status"] = "degraded"
    
    # Add performance metrics
    total_response_time = (time.time() - start_time) * 1000
    health_status["metrics"] = {
        "total_response_time_ms": round(total_response_time, 2),
        "unhealthy_services": unhealthy_services
    }
    
    # Return appropriate status code
    if health_status["status"] == "unhealthy":
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=health_status
        )
    elif health_status["status"] == "degraded":
        return JSONResponse(
            status_code=status.HTTP_206_PARTIAL_CONTENT,
            content=health_status
        )
    else:
        return health_status

# Liveness probe for Kubernetes
@app.get("/health/live")
async def liveness_check():
    """Simple liveness check for container orchestration"""
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}

# Readiness probe for Kubernetes
@app.get("/health/ready")
async def readiness_check():
    """Readiness check to ensure application is ready to serve traffic"""
    try:
        # Quick database check
        from app.core.database import check_database_health
        db_healthy = await asyncio.wait_for(check_database_health(), timeout=2.0)
        
        if db_healthy:
            return {"status": "ready", "timestamp": datetime.utcnow().isoformat()}
        else:
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={"status": "not_ready", "reason": "database_unavailable"}
            )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "not_ready", "reason": str(e)}
        )

# API router registration
API_V1_PREFIX = "/api/v1"

# Authentication and user management
app.include_router(auth.router, prefix=f"{API_V1_PREFIX}/auth", tags=["Authentication"])
app.include_router(users.router, prefix=f"{API_V1_PREFIX}/users", tags=["Users"])

# Core legal modules
app.include_router(clients.router, prefix=f"{API_V1_PREFIX}/clients", tags=["Clients"])
app.include_router(contracts.router, prefix=f"{API_V1_PREFIX}/contracts", tags=["Contracts"])
app.include_router(matters.router, prefix=f"{API_V1_PREFIX}/matters", tags=["Matters"])

# Specialized legal modules
app.include_router(ip.router, prefix=f"{API_V1_PREFIX}/ip", tags=["Intellectual Property"])
app.include_router(privacy.router, prefix=f"{API_V1_PREFIX}/privacy", tags=["Data Privacy"])
app.include_router(risk.router, prefix=f"{API_V1_PREFIX}/risk", tags=["Risk & Compliance"])
app.include_router(litigation.router, prefix=f"{API_V1_PREFIX}/litigation", tags=["Litigation & Disputes"])

# Document and task management
app.include_router(documents.router, prefix=f"{API_V1_PREFIX}/documents", tags=["Documents"])
app.include_router(tasks.router, prefix=f"{API_V1_PREFIX}/tasks", tags=["Tasks"])

# AI services
app.include_router(ai.router, prefix=f"{API_V1_PREFIX}/ai", tags=["AI Services"])

# Import and include AI orchestrator
from app.api.v1 import ai_orchestrator
app.include_router(ai_orchestrator.router, prefix=f"{API_V1_PREFIX}/ai/orchestrator", tags=["AI Orchestrator"])

# System services
app.include_router(notifications.router, prefix=f"{API_V1_PREFIX}/notifications", tags=["Notifications"])
app.include_router(admin.router, prefix=f"{API_V1_PREFIX}/admin", tags=["Administration"])

# Dashboard analytics
app.include_router(dashboard.router, prefix=f"{API_V1_PREFIX}/dashboard", tags=["Dashboard Analytics"])

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to CounselFlow Ultimate V3",
        "description": "AI-Powered Enterprise Legal Management Platform",
        "version": "3.0.0",
        "docs_url": "/docs" if settings.ENABLE_SWAGGER_DOCS else None,
        "health_check": "/health",
        "api_prefix": API_V1_PREFIX,
        "environment": settings.ENVIRONMENT,
    }

# API information endpoint
@app.get("/api")
async def api_info():
    """API information and available endpoints"""
    return {
        "title": "CounselFlow Ultimate V3 API",
        "version": "3.0.0",
        "description": "Comprehensive API for AI-powered legal management",
        "base_url": API_V1_PREFIX,
        "modules": {
            "auth": "Authentication and authorization",
            "users": "User management",
            "clients": "Client relationship management",
            "contracts": "Contract lifecycle management",
            "matters": "Legal matter management",
            "ip": "Intellectual property management",
            "privacy": "Data privacy and PIA",
            "risk": "Risk and compliance management",
            "litigation": "Litigation and dispute resolution",
            "documents": "Document management",
            "tasks": "Task and workflow management",
            "ai": "AI-powered legal services",
            "notifications": "Notification system",
            "admin": "System administration",
            "dashboard": "Analytics and reporting dashboard",
        },
        "features": [
            "Multi-LLM AI integration (GPT-4, Claude, Gemini)",
            "Contract analysis and risk assessment",
            "Document generation and templates",
            "Legal research and insights",
            "Compliance monitoring",
            "E-signature integration",
            "Real-time notifications",
            "Comprehensive audit trails",
            "Role-based access control",
            "Enterprise security",
        ],
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True,
    )