#!/bin/bash
# =============================================================================
# CounselFlow Ultimate V3 - Production Deployment Script
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_BEFORE_DEPLOY=${BACKUP_BEFORE_DEPLOY:-true}
SKIP_MIGRATIONS=${SKIP_MIGRATIONS:-false}

# Logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        error "Docker is not running. Please start Docker first."
    fi
    
    # Check if docker-compose is available
    if ! command -v docker-compose >/dev/null 2>&1; then
        error "docker-compose is not installed. Please install it first."
    fi
    
    # Check if environment file exists
    if [[ ! -f ".env.${ENVIRONMENT}" ]]; then
        error "Environment file .env.${ENVIRONMENT} not found."
    fi
    
    log "Prerequisites check passed ✓"
}

# Backup database
backup_database() {
    if [[ "${BACKUP_BEFORE_DEPLOY}" == "true" ]]; then
        log "Creating database backup..."
        
        # Create backup directory if it doesn't exist
        mkdir -p ./backups
        
        # Generate backup filename with timestamp
        BACKUP_FILE="./backups/counselflow_backup_$(date +%Y%m%d_%H%M%S).sql"
        
        # Run backup using docker-compose
        docker-compose -f docker-compose.prod.yml exec -T db pg_dump \
            -U "${POSTGRES_USER}" \
            -d "${POSTGRES_DB}" \
            --clean --if-exists --no-owner --no-privileges > "${BACKUP_FILE}"
        
        # Compress backup
        gzip "${BACKUP_FILE}"
        
        log "Database backup created: ${BACKUP_FILE}.gz ✓"
    else
        warn "Database backup skipped (BACKUP_BEFORE_DEPLOY=false)"
    fi
}

# Pull latest images
pull_images() {
    log "Pulling latest Docker images..."
    
    docker-compose -f docker-compose.prod.yml pull
    
    log "Docker images pulled ✓"
}

# Run database migrations
run_migrations() {
    if [[ "${SKIP_MIGRATIONS}" == "false" ]]; then
        log "Running database migrations..."
        
        # Ensure backend container is running
        docker-compose -f docker-compose.prod.yml up -d backend
        
        # Wait for backend to be ready
        sleep 10
        
        # Run migrations
        docker-compose -f docker-compose.prod.yml exec backend python -m prisma migrate deploy
        
        log "Database migrations completed ✓"
    else
        warn "Database migrations skipped (SKIP_MIGRATIONS=true)"
    fi
}

# Deploy services
deploy_services() {
    log "Deploying services..."
    
    # Load environment variables
    export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
    
    # Deploy with docker-compose
    docker-compose -f docker-compose.prod.yml up -d --remove-orphans
    
    log "Services deployed ✓"
}

# Health checks
run_health_checks() {
    log "Running health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check database
    if docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"; then
        log "Database health check passed ✓"
    else
        error "Database health check failed"
    fi
    
    # Check Redis
    if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping | grep -q PONG; then
        log "Redis health check passed ✓"
    else
        error "Redis health check failed"
    fi
    
    # Check backend
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        log "Backend health check passed ✓"
    else
        error "Backend health check failed"
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        log "Frontend health check passed ✓"
    else
        error "Frontend health check failed"
    fi
    
    # Check nginx (if running)
    if docker-compose -f docker-compose.prod.yml ps nginx | grep -q "Up"; then
        if curl -f http://localhost/health >/dev/null 2>&1; then
            log "Nginx health check passed ✓"
        else
            error "Nginx health check failed"
        fi
    fi
    
    log "All health checks passed ✓"
}

# Cleanup old images
cleanup_images() {
    log "Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove old images (keep last 3 versions)
    docker images --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | \
        grep counselflow | \
        sort -k2 -r | \
        tail -n +4 | \
        awk '{print $1}' | \
        xargs -r docker rmi -f
    
    log "Image cleanup completed ✓"
}

# Show deployment status
show_status() {
    log "Deployment Status:"
    echo ""
    
    # Show running containers
    echo -e "${BLUE}Running Containers:${NC}"
    docker-compose -f docker-compose.prod.yml ps
    echo ""
    
    # Show service URLs
    echo -e "${BLUE}Service URLs:${NC}"
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:8000"
    echo "API Docs: http://localhost:8000/docs"
    echo "Database: localhost:5432"
    echo "Redis: localhost:6379"
    
    if docker-compose -f docker-compose.prod.yml ps nginx | grep -q "Up"; then
        echo "Nginx: http://localhost"
    fi
    
    if docker-compose -f docker-compose.prod.yml ps prometheus | grep -q "Up"; then
        echo "Prometheus: http://localhost:9090"
    fi
    
    if docker-compose -f docker-compose.prod.yml ps grafana | grep -q "Up"; then
        echo "Grafana: http://localhost:3001"
    fi
    
    echo ""
}

# Main deployment function
main() {
    log "Starting CounselFlow Ultimate V3 deployment to ${ENVIRONMENT}..."
    
    check_prerequisites
    backup_database
    pull_images
    run_migrations
    deploy_services
    run_health_checks
    cleanup_images
    show_status
    
    log "🚀 Deployment completed successfully!"
    log "CounselFlow Ultimate V3 is now running in ${ENVIRONMENT} mode."
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    # Stop current services
    docker-compose -f docker-compose.prod.yml down
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t ./backups/counselflow_backup_*.sql.gz 2>/dev/null | head -n1)
    
    if [[ -n "${LATEST_BACKUP}" ]]; then
        log "Restoring database from ${LATEST_BACKUP}..."
        
        # Extract backup
        gunzip -c "${LATEST_BACKUP}" | \
        docker-compose -f docker-compose.prod.yml exec -T db psql \
            -U "${POSTGRES_USER}" \
            -d "${POSTGRES_DB}"
        
        log "Database restored ✓"
    else
        warn "No backup found for rollback"
    fi
    
    # Start services with previous images
    docker-compose -f docker-compose.prod.yml up -d
    
    log "Rollback completed"
}

# Handle script arguments
case "${2:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "status")
        show_status
        ;;
    *)
        echo "Usage: $0 [environment] [deploy|rollback|status]"
        echo "Environment: production (default), staging"
        echo "Commands:"
        echo "  deploy   - Deploy the application (default)"
        echo "  rollback - Rollback to previous version"
        echo "  status   - Show current deployment status"
        exit 1
        ;;
esac