# Docker Setup for Pricing Calculator MVP

This document describes how to run the Pricing Calculator MVP using Docker and Docker Compose.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git

## Quick Start

### Development Environment

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd pricing-calculator-mvp
   ```

2. **Start all services:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **View logs:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f
   ```

4. **Access the application:**
   - **Frontend**: http://localhost:3000
   - **API**: http://localhost:3001
   - **API Health**: http://localhost:3001/health
   - **PostgreSQL**: localhost:5432
   - **Redis**: localhost:6379

### Production Environment

1. **Create environment file:**
   ```bash
   cp .env.example .env.prod
   # Edit .env.prod with production values
   ```

2. **Start production services:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Services

### PostgreSQL Database
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Database**: pricing_calculator
- **User**: postgres
- **Password**: password (development)
- **Health Check**: Built-in pg_isready

### Redis Cache
- **Image**: redis:7-alpine
- **Port**: 6379
- **Health Check**: Built-in redis-cli ping

### API Server
- **Port**: 3001
- **Health Check**: GET /health
- **Dependencies**: PostgreSQL, Redis
- **Environment**: Development/Production

### Web Application
- **Port**: 3000
- **Dependencies**: API Server
- **Environment**: Development/Production

## Development Workflow

### Hot Reloading
Both API and webapp support hot reloading in development mode:
- Code changes are automatically reflected
- No need to restart containers

### Database Migrations
Migrations are automatically run when the API starts:
- Located in `packages/calculator-api/src/migrations/`
- Run on container startup
- Safe to run multiple times

### Debugging
1. **View container logs:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f api
   ```

2. **Access container shell:**
   ```bash
   docker-compose -f docker-compose.dev.yml exec api sh
   ```

3. **Check service health:**
   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```

## Environment Variables

### Development (.env)
```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=pricing_calculator
DB_USER=postgres
DB_PASSWORD=password
DB_SSL=false

# API
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Redis
REDIS_URL=redis://redis:6379

# Frontend
REACT_APP_API_URL=http://localhost:3001
```

### Production (.env.prod)
```env
# Database
DB_NAME=pricing_calculator_prod
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_SSL=true

# API
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# Security
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com
```

## Common Commands

### Start Services
```bash
# Development
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### Stop Services
```bash
# Development
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose -f docker-compose.prod.yml down
```

### Rebuild Services
```bash
# Development
docker-compose -f docker-compose.dev.yml up --build -d

# Production
docker-compose -f docker-compose.prod.yml up --build -d
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f api
```

### Database Operations
```bash
# Access PostgreSQL
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d pricing_calculator

# Backup database
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U postgres pricing_calculator > backup.sql

# Restore database
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d pricing_calculator < backup.sql
```

### Clean Up
```bash
# Stop and remove containers
docker-compose -f docker-compose.dev.yml down

# Remove volumes (WARNING: This deletes all data)
docker-compose -f docker-compose.dev.yml down -v

# Remove images
docker-compose -f docker-compose.dev.yml down --rmi all
```

## Troubleshooting

### Port Conflicts
If ports 3000, 3001, 5432, or 6379 are already in use:
1. Stop conflicting services
2. Or modify port mappings in docker-compose files

### Database Connection Issues
1. Check if PostgreSQL container is healthy:
   ```bash
   docker-compose -f docker-compose.dev.yml ps postgres
   ```

2. Check PostgreSQL logs:
   ```bash
   docker-compose -f docker-compose.dev.yml logs postgres
   ```

### API Health Check Fails
1. Check API logs:
   ```bash
   docker-compose -f docker-compose.dev.yml logs api
   ```

2. Verify database connection:
   ```bash
   docker-compose -f docker-compose.dev.yml exec api curl http://localhost:3001/health
   ```

### Memory Issues
If containers are running out of memory:
1. Increase Docker Desktop memory allocation
2. Or add memory limits to services in docker-compose files

## Security Notes

### Development
- Default passwords are used for convenience
- CORS is configured for localhost
- SSL is disabled

### Production
- Use strong, unique passwords
- Configure proper CORS origins
- Enable SSL/TLS
- Use secrets management for sensitive data
- Regular security updates

## Monitoring

### Health Checks
All services include health checks:
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`
- API: `GET /health`
- Webapp: Container status

### Logs
- Structured logging in API
- Centralized logging with Docker Compose
- Log rotation configured

## Next Steps

1. **Set up monitoring**: Add Prometheus/Grafana
2. **Add load balancing**: Use nginx or traefik
3. **Implement CI/CD**: GitHub Actions or GitLab CI
4. **Add backup strategy**: Automated database backups
5. **Security scanning**: Add vulnerability scanning
