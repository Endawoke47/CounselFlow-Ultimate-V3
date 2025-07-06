# =============================================================================
# CounselFlow Ultimate V3 - Optimized Frontend Docker Image
# Enhanced multi-stage build with performance and security optimizations
# =============================================================================

# Base image with dependencies
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies stage - optimized for caching
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production --no-audit --prefer-offline --progress=false && \
    npm cache clean --force

# Development dependencies stage
FROM base AS deps-dev
COPY package.json package-lock.json* ./
RUN npm ci --include=dev --no-audit --prefer-offline --progress=false

# Builder stage with enhanced optimizations
FROM base AS builder
WORKDIR /app

# Copy dev dependencies for build
COPY --from=deps-dev /app/node_modules ./node_modules
COPY . .

# Build-time optimizations
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application with optimizations
RUN npm run build

# Production runtime stage
FROM base AS runner
WORKDIR /app

# Production environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Create .next directory with correct permissions
RUN mkdir .next && chown nextjs:nodejs .next

# Copy Next.js standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Security: Remove unnecessary packages and clean up
RUN apk del libc6-compat && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/* && \
    find /app -name "*.test.*" -delete && \
    find /app -name "*.spec.*" -delete

# Create healthcheck script
RUN echo '#!/bin/sh\nwget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1' > /app/healthcheck.sh && \
    chmod +x /app/healthcheck.sh && \
    chown nextjs:nodejs /app/healthcheck.sh

# Health check with proper timing
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD /app/healthcheck.sh

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Performance tuning for Node.js
ENV UV_THREADPOOL_SIZE=16

# Start the application
CMD ["node", "server.js"]