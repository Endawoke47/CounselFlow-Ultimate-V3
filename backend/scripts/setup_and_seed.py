#!/usr/bin/env python3
"""
CounselFlow Ultimate V3 - Database Setup and Seeding Script
================================================================

This script sets up the database schema and seeds it with comprehensive demo data.
It can be run independently without Docker or as part of the development setup.

Usage:
    python setup_and_seed.py [--reset] [--count=N]
    
Options:
    --reset     Drop all data before seeding
    --count=N   Number of records to create for each entity (default: 50)
"""

import asyncio
import argparse
import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from prisma import Prisma
from app.core.config import settings
import structlog

logger = structlog.get_logger()


async def setup_database():
    """Initialize database schema"""
    logger.info("Setting up database schema...")
    
    try:
        # Initialize Prisma client
        db = Prisma()
        await db.connect()
        
        # Generate the Prisma schema (equivalent to prisma db push in development)
        logger.info("Pushing database schema...")
        import subprocess
        import os
        
        # Change to the project root directory where schema.prisma is located
        project_root = Path(__file__).parent.parent.parent
        
        result = subprocess.run(
            ["npx", "prisma", "db", "push"],
            cwd=project_root,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            logger.info("Database schema updated successfully")
        else:
            logger.error("Failed to update database schema", 
                        stdout=result.stdout, 
                        stderr=result.stderr)
            raise RuntimeError(f"Schema update failed: {result.stderr}")
        
        # Test connection
        await db.user.count()
        logger.info("Database connection test successful")
        
        await db.disconnect()
        
    except Exception as e:
        logger.error("Database setup failed", error=str(e))
        raise


async def run_seeding(count: int = 50, reset: bool = False):
    """Run the comprehensive data seeding"""
    logger.info("Starting data seeding process", count=count, reset=reset)
    
    try:
        # Import and run the seeding script
        from seed_comprehensive_data import CounselFlowSeeder
        
        seeder = CounselFlowSeeder(count=count)
        await seeder.connect()
        
        if reset:
            logger.info("Resetting database data...")
            await seeder.reset_database()
        
        logger.info("Seeding database with comprehensive data...")
        await seeder.seed_all()
        
        await seeder.disconnect()
        
        logger.info("Data seeding completed successfully")
        
    except Exception as e:
        logger.error("Data seeding failed", error=str(e))
        raise


async def main():
    """Main setup and seeding process"""
    parser = argparse.ArgumentParser(description="CounselFlow Database Setup and Seeding")
    parser.add_argument("--reset", action="store_true", help="Reset database before seeding")
    parser.add_argument("--count", type=int, default=50, help="Number of records to create")
    parser.add_argument("--setup-only", action="store_true", help="Only setup schema, don't seed")
    parser.add_argument("--seed-only", action="store_true", help="Only seed data, don't setup schema")
    
    args = parser.parse_args()
    
    try:
        # Configure logging
        structlog.configure(
            processors=[
                structlog.dev.ConsoleRenderer(colors=True)
            ],
            wrapper_class=structlog.stdlib.BoundLogger,
            logger_factory=structlog.stdlib.LoggerFactory(),
            cache_logger_on_first_use=True,
        )
        
        logger.info("Starting CounselFlow database setup and seeding")
        logger.info("Configuration", 
                   database_url=settings.DATABASE_URL,
                   environment=settings.ENVIRONMENT)
        
        if not args.seed_only:
            # Setup database schema
            await setup_database()
        
        if not args.setup_only:
            # Seed with comprehensive data
            await run_seeding(count=args.count, reset=args.reset)
        
        logger.info("Database setup and seeding completed successfully! 🎉")
        logger.info("You can now start the FastAPI server and explore the seeded data")
        
    except Exception as e:
        logger.error("Setup and seeding failed", error=str(e))
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())