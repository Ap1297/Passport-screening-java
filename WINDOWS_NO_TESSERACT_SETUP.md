# Passport Screening App - Windows Setup (NO Tesseract Required!)

## Quick Start - 5 Minutes

You **DO NOT** need to install Tesseract! Our application uses pure Java OCR with Apache Tika by default.

### Prerequisites
- Java 8 (check with: `java -version`)
- Maven (check with: `mvn --version`)
- MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)

### Step 1: Clone/Download the Project
```bash
# Navigate to your project directory
cd passport-screening-backend
```

### Step 2: Update MongoDB Connection
Edit `src/main/resources/application.yml`:
```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/passport_screening
```

Get your MongoDB URI from MongoDB Atlas -> Connect -> Connect your application

### Step 3: Build & Run
```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

---

## Troubleshooting

### "No OCR providers available!"
This means no OCR providers are configured. By default, Tika should be available.

**Solution:**
```bash
# Verify Tika is in pom.xml
# Look for: org.apache.tika:tika-core
# Then rebuild: mvn clean install
```

### Want Better OCR Quality?
Use Google Cloud Vision (free tier available):

1. Create a Google Cloud project
2. Enable Vision API
3. Create a service account and download JSON key
4. Set environment variable:
   ```bash
   set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account-key.json
   ```
5. Update `application.yml`:
   ```yaml
   app:
     ocr:
       provider: google-vision
       google-vision:
         enabled: true
         project-id: your-project-id
   ```
6. Rebuild and run: `mvn clean install && mvn spring-boot:run`

---

## Available OCR Providers

| Provider | Setup | Quality | Cost |
|----------|-------|---------|------|
| **Tika** (Default) | None - Pure Java | Good | Free |
| **Google Cloud Vision** | Requires API key | Excellent | Free tier (1000/month) |
| **AWS Textract** | Requires AWS credentials | Excellent | Pay per use |

---

## Verify Everything is Working

1. Open `http://localhost:8080/api/health`
2. Should see: `{"status":"UP"}`

If you see errors, check:
- MongoDB connection string is correct
- Port 8080 is not in use
- Java 8 is installed

---

## Clean Chocolatey Lock File (Optional)

If Tesseract installation failed and locked Chocolatey:

```bash
# Run as Administrator
rmdir /s "C:\ProgramData\chocolatey\lib\cc90e8a2a7849537173aca94b54173a516df4a34"
```

But **you don't need this** - you don't need Tesseract!
