# Health Check Module

This module provides health checks for the 1PD backend application using NestJS
Terminus.

## Endpoints

### GET /health

Returns the health status of various system components.

#### Response Format

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "disk": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    },
    "disk": {
      "status": "up",
      "message": "Used disk storage: 74.5% (threshold: 90%)"
    },
    "memory_heap": {
      "status": "up",
      "message": "Heap usage: 67MB (threshold: 300MB)"
    },
    "memory_rss": {
      "status": "up",
      "message": "RSS usage: 128MB (threshold: 300MB)"
    }
  }
}
```

## Health Checks Implemented

1. **Database Connection**: Verifies that the application can connect to the
   PostgreSQL database.
2. **Disk Storage**: Monitors disk usage to ensure it stays below 90%.
3. **Memory Heap**: Checks the heap memory usage stays below 300MB.
4. **Memory RSS (Resident Set Size)**: Ensures the RSS usage stays below 300MB.

## Docker Health Check Integration

This health check endpoint is used by the Docker container's health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1
```

This enables AWS Fargate to monitor the health of the container and take
appropriate action if the application becomes unhealthy.

## Customizing Health Checks

To add or modify health checks, edit the `HealthController.check()` method in
`health.controller.ts`.
