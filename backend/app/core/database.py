"""
CounselFlow Ultimate V3 - Database Connection and Management
"""

import asyncio
from typing import AsyncGenerator, Optional
from contextlib import asynccontextmanager
import structlog
from sqlalchemy.ext.asyncio import AsyncSession, AsyncEngine, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text, event
from sqlalchemy.pool import NullPool
import asyncpg
from prisma import Prisma
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings

logger = structlog.get_logger()

# Database engine and session
engine: Optional[AsyncEngine] = None
async_session_maker: Optional[async_sessionmaker] = None
prisma_client: Optional[Prisma] = None


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models"""
    pass


@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    reraise=True
)
async def create_database_connection() -> None:
    """Create database connection with retry logic"""
    global engine, async_session_maker, prisma_client
    
    try:
        logger.info("Creating database connection", database_url=settings.DATABASE_URL)
        
        # Create async SQLAlchemy engine
        engine = create_async_engine(
            settings.database_url_async,
            echo=settings.DB_ECHO,
            pool_pre_ping=True,
            pool_recycle=3600,  # 1 hour
            pool_size=20,
            max_overflow=30,
            poolclass=NullPool if settings.ENVIRONMENT == "testing" else None,
        )
        
        # Create session maker
        async_session_maker = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=True,
            autocommit=False,
        )
        
        # Initialize Prisma client
        prisma_client = Prisma()
        await prisma_client.connect()
        
        # Test database connection
        await test_database_connection()
        
        logger.info("Database connection established successfully")
        
    except Exception as e:
        logger.error("Failed to create database connection", error=str(e))
        raise


async def close_database_connection() -> None:
    """Close database connections"""
    global engine, async_session_maker, prisma_client
    
    try:
        logger.info("Closing database connections")
        
        if prisma_client:
            await prisma_client.disconnect()
            
        if engine:
            await engine.dispose()
            
        engine = None
        async_session_maker = None
        prisma_client = None
        
        logger.info("Database connections closed successfully")
        
    except Exception as e:
        logger.error("Error closing database connections", error=str(e))


@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session context manager"""
    if not async_session_maker:
        raise RuntimeError("Database not initialized. Call create_database_connection() first.")
    
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_prisma_client() -> Prisma:
    """Get Prisma client instance"""
    if not prisma_client:
        raise RuntimeError("Prisma client not initialized. Call create_database_connection() first.")
    return prisma_client


async def test_database_connection() -> bool:
    """Test database connectivity"""
    try:
        if not engine:
            return False
            
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            return result.scalar() == 1
            
    except Exception as e:
        logger.error("Database connectivity test failed", error=str(e))
        return False


async def check_database_health() -> bool:
    """Health check for database"""
    try:
        # Test SQLAlchemy connection
        sqlalchemy_healthy = await test_database_connection()
        
        # Test Prisma connection
        prisma_healthy = False
        if prisma_client:
            try:
                await prisma_client.user.count()
                prisma_healthy = True
            except Exception as e:
                logger.warning("Prisma health check failed", error=str(e))
        
        return sqlalchemy_healthy and prisma_healthy
        
    except Exception as e:
        logger.error("Database health check failed", error=str(e))
        return False


async def run_migrations() -> None:
    """Run database migrations"""
    try:
        logger.info("Running database migrations")
        
        # Run Prisma migrations
        if prisma_client:
            # In production, use prisma migrate deploy
            # In development, use prisma db push for schema sync
            import subprocess
            import os
            
            # Change to the directory containing prisma schema
            schema_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "..")
            
            if settings.ENVIRONMENT == "production":
                # Deploy migrations in production
                result = subprocess.run(
                    ["npx", "prisma", "migrate", "deploy"],
                    cwd=schema_dir,
                    capture_output=True,
                    text=True
                )
            else:
                # Push schema changes in development
                result = subprocess.run(
                    ["npx", "prisma", "db", "push"],
                    cwd=schema_dir,
                    capture_output=True,
                    text=True
                )
            
            if result.returncode == 0:
                logger.info("Database migrations completed successfully")
            else:
                logger.error("Database migration failed", 
                           stdout=result.stdout, 
                           stderr=result.stderr)
                raise RuntimeError(f"Migration failed: {result.stderr}")
        
    except Exception as e:
        logger.error("Error running migrations", error=str(e))
        raise


async def create_database_indexes() -> None:
    """Create additional database indexes for performance"""
    try:
        logger.info("Creating database indexes")
        
        if not engine:
            raise RuntimeError("Database engine not initialized")
        
        # Define custom indexes for performance optimization
        indexes = [
            # User indexes
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active ON \"User\" (email) WHERE active = true;",
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_tenant_role ON \"User\" (tenant_id, role);",
            
            # Contract indexes
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_status_expiry ON \"Contract\" (status, expiry_date);",
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_client_type ON \"Contract\" (client_id, type);",
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_ai_risk ON \"Contract\" (ai_risk_score) WHERE ai_risk_score IS NOT NULL;",
            
            # Matter indexes
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matters_status_priority ON \"Matter\" (status, priority);",
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matters_client_responsible ON \"Matter\" (client_id, responsible_attorney_id);",
            
            # Document indexes
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_type_status ON \"Document\" (type, status);",
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_created_at ON \"Document\" (created_at DESC);",
            
            # Task indexes
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_assignee_status ON \"Task\" (assignee_id, status);",
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_due_date ON \"Task\" (due_date) WHERE due_date IS NOT NULL;",
            
            # Audit log indexes
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp ON \"AuditLog\" (timestamp DESC);",
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_action ON \"AuditLog\" (user_id, action);",
            
            # Notification indexes
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read ON \"Notification\" (user_id, is_read);",
            
            # IP Asset indexes
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ip_assets_type_status ON \"IPAsset\" (type, status);",
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ip_assets_expiry ON \"IPAsset\" (expiry_date) WHERE expiry_date IS NOT NULL;",
        ]
        
        async with engine.begin() as conn:
            for index_sql in indexes:
                try:
                    await conn.execute(text(index_sql))
                    logger.debug("Created index", sql=index_sql)
                except Exception as e:
                    # Index might already exist, which is fine
                    logger.debug("Index creation skipped", sql=index_sql, error=str(e))
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error("Error creating database indexes", error=str(e))
        raise


# Database event listeners for logging
@event.listens_for(AsyncEngine, "connect")
def receive_connect(dbapi_connection, connection_record):
    """Log database connections"""
    logger.debug("Database connection established")


@event.listens_for(AsyncEngine, "checkout")
def receive_checkout(dbapi_connection, connection_record, connection_proxy):
    """Log connection checkouts from pool"""
    logger.debug("Database connection checked out from pool")


@event.listens_for(AsyncEngine, "checkin")
def receive_checkin(dbapi_connection, connection_record):
    """Log connection checkins to pool"""
    logger.debug("Database connection checked in to pool")


# Database connection dependencies for FastAPI
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for database sessions"""
    async with get_db_session() as session:
        yield session


async def get_prisma() -> Prisma:
    """FastAPI dependency for Prisma client"""
    return await get_prisma_client()


# Transaction context manager
@asynccontextmanager
async def db_transaction():
    """Database transaction context manager"""
    async with get_db_session() as session:
        async with session.begin():
            yield session


# Connection pool monitoring
async def get_connection_pool_status() -> dict:
    """Get database connection pool status"""
    if not engine:
        return {"status": "not_initialized"}
    
    pool = engine.pool
    return {
        "size": pool.size(),
        "checked_in": pool.checkedin(),
        "checked_out": pool.checkedout(),
        "overflow": pool.overflow(),
        "invalid": pool.invalid(),
    }