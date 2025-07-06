#!/usr/bin/env python3
"""
CounselFlow Ultimate V3 - Test Runner
====================================

Comprehensive test runner with different test categories and reporting.

Usage:
    python run_tests.py [options]
"""

import sys
import subprocess
import argparse
from pathlib import Path
import os

def run_command(cmd, description=None):
    """Run a command and return the result"""
    if description:
        print(f"🧪 {description}...")
    
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent
        )
        
        if result.returncode == 0:
            if description:
                print(f"✅ {description} passed")
            return True, result.stdout
        else:
            if description:
                print(f"❌ {description} failed")
            print(f"Error output:\n{result.stderr}")
            return False, result.stderr
    except Exception as e:
        print(f"❌ Failed to run command: {e}")
        return False, str(e)

def run_tests(args):
    """Run tests based on provided arguments"""
    base_cmd = "python -m pytest"
    
    # Build pytest command based on arguments
    cmd_parts = [base_cmd]
    
    # Add coverage if requested
    if args.coverage:
        cmd_parts.extend(["--cov=app", "--cov-report=html", "--cov-report=term"])
    
    # Add verbosity
    if args.verbose:
        cmd_parts.append("-v")
    elif args.quiet:
        cmd_parts.append("-q")
    
    # Add specific test categories
    if args.unit:
        cmd_parts.extend(["-m", "unit"])
    elif args.integration:
        cmd_parts.extend(["-m", "integration"])
    elif args.api:
        cmd_parts.extend(["-m", "api"])
    elif args.auth:
        cmd_parts.extend(["-m", "auth"])
    elif args.ai:
        cmd_parts.extend(["-m", "ai"])
    elif args.slow:
        cmd_parts.extend(["-m", "slow"])
    
    # Add parallel execution if requested
    if args.parallel:
        cmd_parts.extend(["-n", str(args.parallel)])
    
    # Add specific test files or patterns
    if args.test_pattern:
        cmd_parts.append(args.test_pattern)
    
    # Add additional pytest arguments
    if args.pytest_args:
        cmd_parts.extend(args.pytest_args.split())
    
    # Join command parts
    cmd = " ".join(cmd_parts)
    
    print("🚀 CounselFlow Ultimate V3 - Test Suite")
    print("=" * 60)
    print(f"Running: {cmd}")
    print("=" * 60)
    
    # Run the tests
    success, output = run_command(cmd, "Running test suite")
    
    if success:
        print("\n" + "=" * 60)
        print("🎉 All tests passed!")
        
        # Show coverage summary if coverage was enabled
        if args.coverage:
            print("\n📊 Coverage report generated in htmlcov/")
        
    else:
        print("\n" + "=" * 60)
        print("❌ Some tests failed!")
        print("Check the output above for details.")
        return False
    
    return True

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking test dependencies...")
    
    required_packages = [
        "pytest",
        "pytest-asyncio",
        "pytest-cov",
        "httpx",
        "factory-boy"
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        print("💡 Install them with: pip install " + " ".join(missing_packages))
        return False
    
    print("✅ All test dependencies are installed")
    return True

def setup_test_environment():
    """Set up test environment variables"""
    print("🌍 Setting up test environment...")
    
    # Set test environment variables
    os.environ["ENVIRONMENT"] = "testing"
    os.environ["DEBUG"] = "true"
    os.environ["DATABASE_URL"] = "postgresql://counselflow_user:strongpassword123!@localhost:5432/counselflow_test_db"
    
    print("✅ Test environment configured")

def main():
    """Main test runner function"""
    parser = argparse.ArgumentParser(description="CounselFlow Test Runner")
    
    # Test selection options
    parser.add_argument("--unit", action="store_true", help="Run only unit tests")
    parser.add_argument("--integration", action="store_true", help="Run only integration tests")
    parser.add_argument("--api", action="store_true", help="Run only API tests")
    parser.add_argument("--auth", action="store_true", help="Run only authentication tests")
    parser.add_argument("--ai", action="store_true", help="Run only AI service tests")
    parser.add_argument("--slow", action="store_true", help="Run slow tests")
    
    # Output options
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--quiet", "-q", action="store_true", help="Quiet output")
    parser.add_argument("--coverage", "-c", action="store_true", help="Generate coverage report")
    
    # Performance options
    parser.add_argument("--parallel", "-n", type=int, help="Run tests in parallel (number of workers)")
    
    # Test selection
    parser.add_argument("--test-pattern", "-k", help="Run tests matching pattern")
    parser.add_argument("--pytest-args", help="Additional pytest arguments")
    
    # Utility options
    parser.add_argument("--check-deps", action="store_true", help="Check dependencies only")
    parser.add_argument("--setup-only", action="store_true", help="Setup environment only")
    
    args = parser.parse_args()
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    if args.check_deps:
        print("✅ Dependency check complete")
        return
    
    # Setup test environment
    setup_test_environment()
    
    if args.setup_only:
        print("✅ Test environment setup complete")
        return
    
    # Run tests
    success = run_tests(args)
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()