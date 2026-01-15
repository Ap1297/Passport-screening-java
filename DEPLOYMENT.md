# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- MongoDB Atlas cluster created and accessible
- Node.js 18+ and Java 17+ installed
- Vercel account for frontend deployment (optional)

## Local Development Deployment

### 1. Start MongoDB

```bash
# Using Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:6.0

# Or using Docker Compose
docker-compose up -d mongo
```

### 2. Configure Environment

Copy environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Update with your MongoDB URI and API URLs.

### 3. Start Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend available at: `http://localhost:8080/api`

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at: `http://localhost:3000`

## Docker Deployment

### Build and Run with Docker Compose

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# Check health
curl http://localhost:8080/api/screening/health
curl http://localhost:3000
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Production Deployment on Vercel

### Frontend Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard:
   ```
   SPRING_BOOT_API_URL=https://your-api-domain.com/api
   ```
4. Deploy (automatic on push to main)

### Backend Deployment Options

#### Option A: Railway
1. Create Railway account and project
2. Connect GitHub repository
3. Configure environment variables
4. Deploy

#### Option B: AWS ECS
```bash
# Build and push Docker image
docker build -t passport-screening:latest .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-ecr-url>
docker tag passport-screening:latest <your-ecr-url>/passport-screening:latest
docker push <your-ecr-url>/passport-screening:latest
```

#### Option C: Google Cloud Run
```bash
gcloud builds submit --tag gcr.io/<project-id>/passport-screening
gcloud run deploy passport-screening \
  --image gcr.io/<project-id>/passport-screening \
  --platform managed \
  --region us-central1 \
  --set-env-vars MONGODB_URI=<your-mongodb-uri>
```

## Production Checklist

### Security
- [ ] Update MongoDB credentials
- [ ] Enable MongoDB IP whitelisting
- [ ] Configure CORS for production domains
- [ ] Set up HTTPS/SSL certificates
- [ ] Enable API rate limiting
- [ ] Implement request logging and monitoring

### Performance
- [ ] Enable database indexing
- [ ] Configure caching headers
- [ ] Set up CDN for static assets
- [ ] Monitor API response times
- [ ] Set up alerting for errors

### Monitoring
- [ ] Setup error tracking (Sentry, Rollbar)
- [ ] Configure performance monitoring
- [ ] Set up health check endpoints
- [ ] Enable request logging
- [ ] Create dashboards for key metrics

## Rollback Procedure

### Docker Deployment
```bash
# Rollback to previous image
docker-compose down
git checkout previous-tag
docker-compose up -d
```

### Vercel Deployment
```bash
# Automatic rollback available in Vercel dashboard
# Or use CLI:
vercel rollback
```

## Maintenance

### Update Sanctions List
```bash
# Manually refresh cache if needed
curl -X POST http://your-api-domain.com/api/screening/refresh
```

### Database Backups
```bash
# Backup MongoDB
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/passport_screening" \
  --out ./backups

# Restore from backup
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/passport_screening" \
  ./backups
```

### Logs and Monitoring
- Check Docker logs regularly
- Monitor MongoDB performance metrics
- Review API error rates
- Analyze OCR performance trends

## Troubleshooting

### Connection Issues
```bash
# Test MongoDB connection
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/passport_screening"

# Test API health
curl http://localhost:8080/api/screening/health
```

### Performance Issues
- Check MongoDB indexes
- Review slow query logs
- Monitor Tesseract memory usage
- Scale horizontally if needed

### Deployment Issues
- Check Docker logs
- Verify environment variables
- Ensure all services are healthy
- Check network connectivity
