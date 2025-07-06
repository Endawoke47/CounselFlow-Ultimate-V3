#!/bin/bash
# =============================================================================
# CounselFlow Ultimate V3 - Enhanced Database Backup Script
# =============================================================================

set -euo pipefail

# Configuration
BACKUP_DIR="/backups"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
POSTGRES_HOST=${POSTGRES_HOST:-db}
POSTGRES_PORT=${POSTGRES_PORT:-5432}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Logging functions
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

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Wait for database to be ready
log "Waiting for database to be ready..."
until pg_isready -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}"; do
    sleep 2
done
log "Database is ready"

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/counselflow_backup_${TIMESTAMP}.sql"

# Create database backup
log "Creating database backup: ${BACKUP_FILE}"

pg_dump \
    --host="${POSTGRES_HOST}" \
    --port="${POSTGRES_PORT}" \
    --username="${POSTGRES_USER}" \
    --dbname="${POSTGRES_DB}" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --verbose \
    --file="${BACKUP_FILE}"

# Check if backup was successful
if [[ $? -eq 0 && -f "${BACKUP_FILE}" ]]; then
    log "Database backup created successfully"
    
    # Compress backup
    log "Compressing backup..."
    gzip "${BACKUP_FILE}"
    
    if [[ -f "${BACKUP_FILE}.gz" ]]; then
        log "Backup compressed: ${BACKUP_FILE}.gz"
        
        # Get file size
        BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
        log "Backup size: ${BACKUP_SIZE}"
    else
        error "Failed to compress backup"
    fi
else
    error "Database backup failed"
fi

# Cleanup old backups
log "Cleaning up old backups (retention: ${RETENTION_DAYS} days)..."

# Find and remove backups older than retention period
find "${BACKUP_DIR}" -name "counselflow_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

# Count remaining backups
BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "counselflow_backup_*.sql.gz" -type f | wc -l)
log "Backup cleanup completed. ${BACKUP_COUNT} backups retained."

# List recent backups
log "Recent backups:"
ls -lah "${BACKUP_DIR}"/counselflow_backup_*.sql.gz | tail -5

log "Backup process completed successfully"