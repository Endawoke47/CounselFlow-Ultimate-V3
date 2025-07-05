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

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import create_database_connection
from app.middleware.security import SecurityMiddleware
from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limiting import RateLimitMiddleware

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
    admin
)

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

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

# Create FastAPI application
app = FastAPI(
    title="CounselFlow Ultimate V3",
    description="AI-Powered Enterprise Legal Management Platform",
    version="3.0.0",
    docs_url="/docs" if settings.ENABLE_SWAGGER_DOCS else None,
    redoc_url="/redoc" if settings.ENABLE_SWAGGER_DOCS else None,
    openapi_url="/openapi.json" if settings.ENABLE_SWAGGER_DOCS else None,
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

# Application lifecycle events
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("Starting CounselFlow Ultimate V3")
    
    # Initialize database connection
    await create_database_connection()
    logger.info("Database connection established")
    
    # Initialize AI services
    from app.services.ai_orchestrator import AIOrchestrator
    ai_orchestrator = AIOrchestrator()
    await ai_orchestrator.initialize()
    logger.info("AI services initialized")
    
    # Run any pending database migrations
    if settings.AUTO_MIGRATE:
        from app.core.database import run_migrations
        await run_migrations()
        logger.info("Database migrations completed")
    
    logger.info("CounselFlow Ultimate V3 startup completed")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up on application shutdown"""
    logger.info("Shutting down CounselFlow Ultimate V3")
    
    # Close database connections
    from app.core.database import close_database_connection
    await close_database_connection()
    logger.info("Database connections closed")
    
    logger.info("CounselFlow Ultimate V3 shutdown completed")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Check database connectivity
        from app.core.database import check_database_health
        db_healthy = await check_database_health()
        
        # Check Redis connectivity
        from app.core.redis import check_redis_health
        redis_healthy = await check_redis_health()
        
        # Check AI services
        from app.services.ai_orchestrator import check_ai_health
        ai_healthy = await check_ai_health()
        
        return {
            "status": "healthy" if all([db_healthy, redis_healthy, ai_healthy]) else "degraded",
            "database": "healthy" if db_healthy else "unhealthy",
            "redis": "healthy" if redis_healthy else "unhealthy",
            "ai_services": "healthy" if ai_healthy else "unhealthy",
            "version": "3.0.0",
            "environment": settings.ENVIRONMENT,
            "timestamp": structlog.processors.TimeStamper(fmt="iso")(),
        }
    except Exception as e:
        logger.error("Health check failed", exception=str(e))
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": structlog.processors.TimeStamper(fmt="iso")(),
            }
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