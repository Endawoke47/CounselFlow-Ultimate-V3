# CounselFlow Ultimate V3 - Deployment Guide

## 🚀 Production Deployment

### Prerequisites

- Docker & Docker Compose
- AWS CLI (for cloud deployment)
- SSL certificates
- Domain name configured

### Quick Start

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd CounselFlow-Ultimate
   cp .env.production.example .env.production
   ```

2. **Configure Environment**
   Edit `.env.production` with your actual values:
   ```bash
   # Database
   POSTGRES_PASSWORD=your_secure_password
   
   # Security
   SECRET_KEY=your_32_character_secret_key
   
   # AI Services
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key
   GOOGLE_API_KEY=your_google_key
   ```

3. **Deploy**
   ```bash
   ./scripts/deploy.sh production
   ```

### Manual Deployment

1. **Build Images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Start Services**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Run Migrations**
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend python -m prisma migrate deploy
   ```

4. **Seed Data (Optional)**
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend python scripts/seed_comprehensive_data.py
   ```

### SSL Configuration

1. **Place SSL certificates**
   ```bash
   mkdir -p nginx/ssl
   cp your_certificate.crt nginx/ssl/counselflow.crt
   cp your_private_key.key nginx/ssl/counselflow.key
   ```

2. **Update nginx configuration**
   Edit `nginx/conf.d/counselflow.conf` with your domain name.

### Monitoring (Optional)

Start monitoring stack:
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

Access monitoring:
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090

### CI/CD with GitHub Actions

1. **Configure Secrets**
   Add these secrets to your GitHub repository:
   ```
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   AWS_REGION
   PRODUCTION_DATABASE_URL
   SLACK_WEBHOOK_URL (optional)
   ```

2. **Automatic Deployment**
   - Push to `main` branch → Deploy to staging
   - Create release tag → Deploy to production

### Database Backup

Automatic backups run daily. Manual backup:
```bash
docker-compose -f docker-compose.prod.yml exec backup sh /backup.sh
```

### Health Checks

Check service health:
```bash
curl http://localhost/health       # Nginx
curl http://localhost:8000/health  # Backend
curl http://localhost:3000         # Frontend
```

### Scaling

Scale services:
```bash
docker-compose -f docker-compose.prod.yml up -d --scale backend=3 --scale frontend=2
```

### Troubleshooting

1. **View logs**
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f [service_name]
   ```

2. **Check container status**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

3. **Restart services**
   ```bash
   docker-compose -f docker-compose.prod.yml restart [service_name]
   ```

### Security Checklist

- [ ] SSL certificates installed
- [ ] Environment variables secured
- [ ] Database passwords changed
- [ ] Firewall configured
- [ ] Regular backups scheduled
- [ ] Monitoring alerts configured
- [ ] Security headers enabled (nginx)
- [ ] Rate limiting configured

### Performance Optimization

1. **Database**
   - Enable connection pooling
   - Configure shared_buffers
   - Set up read replicas if needed

2. **Caching**
   - Redis for session storage
   - CDN for static assets
   - Application-level caching

3. **Container Resources**
   - Set appropriate CPU/memory limits
   - Use multi-stage builds
   - Optimize image sizes

### Rollback Procedure

If deployment fails:
```bash
./scripts/deploy.sh production rollback
```

Or manually:
1. Stop current services
2. Restore from backup
3. Deploy previous version
4. Verify functionality

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Verify configuration: `docker-compose config`
3. Test connectivity: Health check endpoints
4. Review monitoring dashboards