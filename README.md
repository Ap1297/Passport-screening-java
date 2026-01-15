# Passport Screening System

Advanced identity verification application combining OCR technology with international sanctions list screening.

## Project Overview

This full-stack application processes passport PDFs and images using Tesseract OCR to extract names, then screens them against the UN consolidated sanctions list stored in MongoDB with nightly automatic updates.

### Architecture
- **Frontend**: Next.js 16 with React 19.2, Tailwind CSS
- **Backend**: Spring Boot 3.2 with MongoDB
- **OCR**: Tesseract + PDFBox
- **Scheduling**: Quartz Scheduler for nightly cache refreshes

## Prerequisites

### Backend Requirements
- Java 17+
- MongoDB Atlas account (or local MongoDB instance)
- Maven 3.8+
- Tesseract OCR installed

### Frontend Requirements
- Node.js 18+
- npm or yarn

## Installation

### 1. Backend Setup

#### Install Tesseract OCR (Required for OCR Processing)

**macOS:**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
```

**Windows:**
Download from [GitHub Tesseract Releases](https://github.com/UB-Mannheim/tesseract/wiki)

#### Configure MongoDB

1. Create a MongoDB Atlas cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `src/main/resources/application.yml`:

```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://username:password@cluster.mongodb.net/passport_screening
```

#### Build and Run Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend will be available at `http://localhost:8080`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:3000`

## API Endpoints

### POST /api/screening/check
Screens a passport document against sanctions list.

**Request:**
```json
{
  "file": "base64_encoded_file",
  "fileName": "passport.pdf",
  "fileType": "application/pdf"
}
```

**Response:**
```json
{
  "extracted_name": "JOHN DOE",
  "confidence": 0.92,
  "sanctions": {
    "is_sanctioned": false,
    "entries": []
  },
  "processing_time": 2.456,
  "timestamp": "2024-01-12T10:30:00"
}
```

### GET /api/screening/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-12T10:30:00",
  "cache_size": "1500"
}
```

## Configuration

### Environment Variables

**Frontend (.env.local):**
```
SPRING_BOOT_API_URL=http://localhost:8080/api
```

**Backend (application.yml):**
```yaml
app:
  ocr:
    tessdata-path: /usr/share/tesseract-ocr/4.00/tessdata
  sanctions:
    cache-refresh-cron: "0 0 0 * * ?"  # Every night at midnight
    source-url: https://scsanctions.un.org/consolidated
  security:
    cors-origins: http://localhost:3000,http://localhost:8000
```

## Sanctions List Cache

The system automatically downloads and caches the UN consolidated sanctions list every night at midnight. The cache:

- Stores sanctioned individuals in MongoDB
- Normalizes names for accurate matching
- Indexes records for fast lookup
- Tracks metadata (update timestamps, version)
- Supports manual refresh via dedicated endpoint

### Manual Cache Refresh

```bash
curl -X POST http://localhost:8080/api/screening/refresh
```

## Testing the System

### 1. Test OCR Processing

Upload a test passport image:
```bash
curl -X POST http://localhost:8080/api/screening/check \
  -H "Content-Type: application/json" \
  -d '{
    "file": "base64_encoded_image",
    "fileName": "test.jpg",
    "fileType": "image/jpeg"
  }'
```

### 2. Test Sanctions Screening

The system automatically screens extracted names. Check results in the UI for matches.

### 3. Verify Cache Health

```bash
curl http://localhost:8080/api/screening/health
```

## Docker Deployment

### Build Docker Image

```bash
cd backend
mvn clean package
docker build -t passport-screening:latest .
```

### Run with Docker Compose

```yaml
version: '3.8'
services:
  backend:
    image: passport-screening:latest
    ports:
      - "8080:8080"
    environment:
      MONGODB_URI: mongodb+srv://user:pass@cluster.mongodb.net/passport_screening
    depends_on:
      - mongo

  frontend:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./frontend:/app
    ports:
      - "3000:3000"
    command: npm run dev

  mongo:
    image: mongo:latest
    environment:
      MONGO_INITDB_DATABASE: passport_screening
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## Performance Considerations

- **OCR Processing**: 2-5 seconds per document (depends on image quality)
- **Database Queries**: <100ms for name matching
- **Cache Size**: ~5000 sanctioned individuals (minimal storage)
- **Memory**: ~1GB for Tesseract OCR + Spring Boot runtime

## Troubleshooting

### Tesseract Not Found
```bash
# Ensure Tesseract is installed and in PATH
which tesseract
tesseract --version
```

### MongoDB Connection Failed
- Verify connection string in `application.yml`
- Check MongoDB Atlas IP whitelist
- Ensure network connectivity

### OCR Returns Empty Names
- Verify passport image quality
- Check image resolution (300+ DPI recommended)
- Try different image formats

### Cache Not Updating
- Check logs for scheduling errors
- Verify cron expression in `application.yml`
- Manually trigger refresh endpoint

## Security Considerations

- Sensitive document processing (store securely)
- CORS configured for specific origins only
- MongoDB requires authentication
- API rate limiting recommended for production
- Implement request logging and monitoring

## Development

### Project Structure

```
├── frontend/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   └── public/          # Static assets
├── backend/
│   ├── src/
│   │   ├── main/java/com/passport/screening/
│   │   │   ├── config/      # Spring configurations
│   │   │   ├── controller/  # REST endpoints
│   │   │   ├── model/       # Data models
│   │   │   ├── repository/  # MongoDB repositories
│   │   │   └── service/     # Business logic
│   │   └── resources/
│   │       └── application.yml
│   └── pom.xml
└── README.md
```

## License

MIT License - See LICENSE file for details
