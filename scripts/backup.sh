#!/bin/bash

# =============================================================================
# CounselFlow Ultimate V3 - Database Backup Script
# =============================================================================

# Configuration
DB_NAME=${POSTGRES_DB:-counselflow_db}
DB_USER=${POSTGRES_USER:-counselflow_user}
DB_HOST=${POSTGRES_HOST:-db}
DB_PORT=${POSTGRES_PORT:-5432}
BACKUP_DIR="/backups"
RETENTION_DAYS=7

# Create backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/counselflow_backup_${TIMESTAMP}.sql"

echo "Starting database backup at $(date)"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Perform the backup
pg_dump \
    --host=${DB_HOST} \
    --port=${DB_PORT} \
    --username=${DB_USER} \
    --dbname=${DB_NAME} \
    --verbose \
    --clean \
    --no-owner \
    --no-privileges \
    --format=plain \
    --file=${BACKUP_FILE}

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: ${BACKUP_FILE}"
    
    # Compress the backup
    gzip ${BACKUP_FILE}
    echo "Backup compressed: ${BACKUP_FILE}.gz"
    
    # Remove old backups (keep only last RETENTION_DAYS days)
    find ${BACKUP_DIR} -name "counselflow_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
    echo "Old backups cleaned up (retention: ${RETENTION_DAYS} days)"
    
    # Log backup size
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo "Backup size: ${BACKUP_SIZE}"
    
else
    echo "Backup failed!" >&2
    exit 1
fi

echo "Backup process completed at $(date)"