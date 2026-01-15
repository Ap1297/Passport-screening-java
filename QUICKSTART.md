# Quick Start Guide - Passport Screening Application

## Prerequisites

Before starting, ensure you have:

- **Java 8** installed: `java -version` (should show `1.8.x`)
- **Maven 3.6+** installed: `mvn --version`
- **Docker & Docker Compose** (optional, for containerized deployment)
- **Git** for version control

### System Requirements

- **CPU**: 2+ cores recommended
- **Memory**: 4GB RAM minimum (8GB recommended)
- **Storage**: 2GB free space
- **Network**: Internet connection for MongoDB Atlas and dependencies

---

## Option 1: Run Locally (Recommended for Development)

### Step 1: Install Dependencies

#### Tesseract OCR

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y tesseract-ocr libtesseract-dev
```

**macOS:**
```bash
brew install tesseract
```

**Windows:**
- Download installer from: https://github.com/UB-Mannheim/tesseract/wiki
- Install to default location
- Add to PATH (restart terminal after installation)

#### MongoDB (Local - Optional)

Skip this if using MongoDB Atlas

**Ubuntu/Debian:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
- Download: https://www.mongodb.com/try/download/community
- Run installer
- MongoDB runs as service by default

### Step 2: Configure Environment

Create `.env` file in project root:

```env
# MongoDB Configuration
# Option A: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/passport_screening

# Option B: MongoDB Atlas (recommended for production)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/passport_screening

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8080/api

# CORS Origins
APP_SECURITY_CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Step 3: Build Backend

```bash
cd backend

# Clean and build
mvn clean package

# Or skip tests for faster build
mvn clean package -DskipTests
```

Expected output:
```
[INFO] BUILD SUCCESS
[INFO] Total time: XX.XXX s
[INFO] Finished at: 2024-XX-XXT:XX:XX+XX:00
```

### Step 4: Start Backend

```bash
# Using Maven
mvn spring-boot:run

# Or using JAR
java -Xms512m -Xmx2048m -jar target/passport-screening-1.0.0.jar
```

Backend will be available at: `http://localhost:8080/api`

### Step 5: Test Backend Health

```bash
curl http://localhost:8080/api/screening/health

# Expected response:
# {"status":"healthy","timestamp":"2024-01-12T...","cache_size":0}
```

### Step 6: Start Frontend

In a new terminal:

```bash
cd frontend

# Install dependencies (if not done)
npm install

# Start development server
npm start
```

Frontend will be available at: `http://localhost:3000`

---

## Option 2: Run with Docker Compose

### Step 1: Prepare Environment

Create `.env` file:

```env
MONGODB_URI=mongodb://mongo:27017/passport_screening
REACT_APP_API_URL=http://localhost:8080/api
```

### Step 2: Build and Start

```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### Step 3: Verify Services

```bash
# Check all services are running
docker-compose ps

# Expected output:
# NAME              STATUS
# backend           Up (healthy)
# frontend          Up (healthy)
# mongo             Up (healthy)
```

### Step 4: Access Applications

- Backend API: http://localhost:8080/api
- Frontend UI: http://localhost:3000
- MongoDB: mongodb://localhost:27017

### Stop Services

```bash
docker-compose down

# Also remove data volumes
docker-compose down -v
```

---

## Testing the Application

### 1. Test Health Endpoint

```bash
curl http://localhost:8080/api/screening/health
```

### 2. Upload Passport for Screening

Create a test file and encode to Base64:

```bash
# Create a base64 encoded file
base64 -i path/to/passport.pdf -o passport.base64

# Read the base64 content
BASE64_CONTENT=$(cat passport.base64)

# Send screening request
curl -X POST http://localhost:8080/api/screening/check \
  -H "Content-Type: application/json" \
  -d "{
    \"file\": \"$BASE64_CONTENT\",
    \"fileName\": \"passport.pdf\",
    \"fileType\": \"application/pdf\"
  }" | jq '.'
```

### 3. Expected Response

```json
{
  "extractedName": "JOHN DOE",
  "confidence": 0.85,
  "sanctions": {
    "isSanctioned": false,
    "entries": []
  },
  "processingTime": 2.341,
  "timestamp": "2024-01-12T10:30:45"
}
```

---

## Troubleshooting

### Java 8 Not Found

```bash
# Install Java 8
# Ubuntu/Debian
sudo apt-get install -y openjdk-8-jdk

# macOS
brew install adoptopenjdk/openjdk/adoptopenjdk8

# Verify
java -version
```

### Tesseract Not Found

```bash
# Linux: Verify installation
which tesseract
tesseract --version

# Set environment variable
export TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata

# Or update application.yml
app:
  ocr:
    tessdata-path: /usr/share/tesseract-ocr/4.00/tessdata
```

### MongoDB Connection Failed

```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017"

# For MongoDB Atlas, verify:
# 1. Connection string is correct
# 2. Network access is allowed (IP whitelist)
# 3. Database user has correct permissions
```

### Port Already in Use

```bash
# Find process using port
lsof -i :8080  # Backend
lsof -i :3000  # Frontend
lsof -i :27017 # MongoDB

# Kill process
kill -9 <PID>

# Or use different ports in .env
SERVER_PORT=8081
REACT_PORT=3001
```

### Out of Memory

Increase JVM heap:

```bash
java -Xms1024m -Xmx4096m -jar target/passport-screening-1.0.0.jar
```

### Tests Failing

```bash
# Run tests with debug output
mvn test -Dorg.slf4j.simpleLogger.defaultLogLevel=debug

# Run specific test
mvn test -Dtest=OCRServiceTest

# Run tests with MongoDB container
docker-compose up -d mongo
mvn test
```

---

## Production Deployment

### Using JAR

```bash
# Build
mvn clean package

# Deploy
java -Xms2048m -Xmx4096m \
  -DMONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/passport_screening" \
  -DAPP_SECURITY_CORS_ORIGINS="https://yourdomain.com" \
  -jar passport-screening-1.0.0.jar
```

### Using Docker

```bash
# Build
docker build -f backend/Dockerfile.backend -t passport-screening:1.0.0 .

# Push to registry
docker tag passport-screening:1.0.0 yourusername/passport-screening:1.0.0
docker push yourusername/passport-screening:1.0.0

# Deploy
docker run -d \
  -e MONGODB_URI="mongodb+srv://..." \
  -e APP_SECURITY_CORS_ORIGINS="https://yourdomain.com" \
  -p 8080:8080 \
  yourusername/passport-screening:1.0.0
```

---

## Key Resources

- **Java 8 Setup Guide**: See `JAVA8_SETUP_GUIDE.md`
- **API Documentation**: See `API.md`
- **Development Guide**: See `DEVELOPMENT.md`
- **Spring Boot Docs**: https://spring.io/projects/spring-boot/docs/2.7.18/reference/html/
- **MongoDB Docs**: https://docs.mongodb.com/
- **React Docs**: https://react.dev/

---

## Next Steps

1. **Setup Database**: Configure MongoDB Atlas or local MongoDB
2. **Customize Screening**: Add additional name matching logic
3. **Integrate Workflows**: Connect to your existing systems
4. **Deploy**: Push to production infrastructure
5. **Monitor**: Setup logging and monitoring

---

## Support

For issues, check:
1. Logs: `docker-compose logs backend`
2. Health endpoint: `http://localhost:8080/api/screening/health`
3. Documentation files in project root
4. GitHub Issues (if using GitHub)
