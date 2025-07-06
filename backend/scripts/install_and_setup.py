#!/usr/bin/env python3
"""
CounselFlow Ultimate V3 - Installation and Setup Script
=======================================================

This script installs all dependencies and sets up the database for CounselFlow.
It works without Docker and can be run in development environments.

Usage:
    python install_and_setup.py [--reset] [--count=N]
"""

import subprocess
import sys
import os
import asyncio
import argparse
from pathlib import Path

def run_command(cmd, cwd=None, description=None):
    """Run a shell command and handle errors"""
    if description:
        print(f"📦 {description}...")
    
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            cwd=cwd
        )
        
        if result.returncode == 0:
            if description:
                print(f"✅ {description} completed successfully")
            return True
        else:
            print(f"❌ Command failed: {cmd}")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Command execution failed: {e}")
        return False

def install_dependencies():
    """Install Python and Node.js dependencies"""
    print("🔧 Installing Dependencies...")
    print("=" * 50)
    
    # Get project root
    project_root = Path(__file__).parent.parent.parent
    backend_dir = project_root / "backend"
    
    # Install Python dependencies
    print("🐍 Installing Python dependencies...")
    if not run_command("pip install -r requirements.txt", cwd=backend_dir):
        print("❌ Failed to install Python dependencies")
        return False
    
    # Install Prisma Client for Python
    print("🔗 Installing Prisma Client Python...")
    if not run_command("pip install prisma", cwd=backend_dir):
        print("❌ Failed to install Prisma client")
        return False
    
    # Generate Prisma client
    print("🔧 Generating Prisma client...")
    if not run_command("python -m prisma generate", cwd=project_root):
        print("❌ Failed to generate Prisma client")
        return False
    
    print("✅ All dependencies installed successfully!")
    return True

def setup_environment():
    """Set up environment variables"""
    print("🌍 Setting up environment...")
    
    project_root = Path(__file__).parent.parent.parent
    env_file = project_root / ".env"
    env_example = project_root / ".env.example"
    
    if not env_file.exists() and env_example.exists():
        print("📄 Creating .env file from template...")
        import shutil
        shutil.copy(env_example, env_file)
        print("✅ Environment file created")
    
    return True

def setup_database():
    """Set up database schema"""
    print("🗃️  Setting up database schema...")
    
    project_root = Path(__file__).parent.parent.parent
    
    # Push database schema
    print("📊 Pushing database schema...")
    if not run_command("python -m prisma db push", cwd=project_root):
        print("⚠️  Database schema push failed - this is expected if database is not running")
        print("💡 You can run the seeding later when the database is available")
        return False
    
    print("✅ Database schema setup completed!")
    return True

async def run_seeding(count=50, reset=False):
    """Run the data seeding"""
    print("🌱 Running data seeding...")
    
    try:
        # Import the seeding script
        sys.path.insert(0, str(Path(__file__).parent))
        from seed_comprehensive_data import CounselFlowSeeder
        
        seeder = CounselFlowSeeder(count=count)
        await seeder.connect()
        
        if reset:
            await seeder.reset_database()
        
        await seeder.seed_all()
        await seeder.disconnect()
        
        print("✅ Database seeding completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Database seeding failed: {e}")
        print("💡 Make sure PostgreSQL is running and accessible")
        return False

def main():
    """Main setup function"""
    parser = argparse.ArgumentParser(description="CounselFlow Complete Setup")
    parser.add_argument("--skip-deps", action="store_true", help="Skip dependency installation")
    parser.add_argument("--skip-db", action="store_true", help="Skip database setup")
    parser.add_argument("--skip-seed", action="store_true", help="Skip data seeding")
    parser.add_argument("--reset", action="store_true", help="Reset database before seeding")
    parser.add_argument("--count", type=int, default=50, help="Number of records to create")
    
    args = parser.parse_args()
    
    print("🚀 CounselFlow Ultimate V3 - Complete Setup")
    print("=" * 60)
    print()
    
    success = True
    
    # Step 1: Install dependencies
    if not args.skip_deps:
        if not install_dependencies():
            success = False
    
    # Step 2: Setup environment
    if success:
        if not setup_environment():
            success = False
    
    # Step 3: Setup database
    if success and not args.skip_db:
        if not setup_database():
            print("⚠️  Database setup failed, but continuing...")
    
    # Step 4: Seed data
    if success and not args.skip_seed:
        try:
            asyncio.run(run_seeding(count=args.count, reset=args.reset))
        except Exception as e:
            print(f"⚠️  Data seeding failed: {e}")
            print("💡 You can run seeding later with: python scripts/seed_comprehensive_data.py")
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 CounselFlow Ultimate V3 setup completed!")
        print()
        print("🚀 Next steps:")
        print("   1. Start PostgreSQL database (if not running)")
        print("   2. Run: cd backend && uvicorn app.main:app --reload")
        print("   3. In another terminal: cd frontend && npm run dev")
        print("   4. Open http://localhost:3000 in your browser")
        print()
        print("📚 Documentation:")
        print("   - API docs: http://localhost:8000/docs")
        print("   - Database: Use PgAdmin or connect directly")
        print()
    else:
        print("❌ Setup completed with some errors")
        print("💡 Check the output above for specific issues")
        sys.exit(1)

if __name__ == "__main__":
    main()