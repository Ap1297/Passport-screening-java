# OCR Providers Configuration Guide

This application supports multiple OCR providers for maximum flexibility and no hard dependencies on native Tesseract.

## Quick Start (Default)

By default, the application uses **Apache Tika** as the OCR provider, which requires:
- ✅ No native dependencies
- ✅ Pure Java implementation
- ✅ Works out of the box with `mvn clean install`
- ✅ Supports PDFs and images (JPG, PNG, TIFF, etc.)

**No additional setup needed!** Just run:
```bash
mvn clean install
java -jar target/passport-screening-1.0.0.jar
```

---

## Available OCR Providers

### 1. Apache Tika (Default - Recommended for Most Cases)

**Advantages:**
- Pure Java - no native binaries required
- Zero configuration needed
- Works immediately after Maven build
- Good accuracy for most documents
- Supports multiple file formats (PDF, JPG, PNG, TIFF, etc.)

**Configuration:**
```yaml
app:
  ocr:
    provider: tika  # Already default
```

**When to use:** Development, testing, or production when you want zero dependencies.

---

### 2. Google Cloud Vision (Optional - Best Accuracy)

**Advantages:**
- Highest accuracy for scanned documents
- Handles complex layouts, multiple languages
- Cloud-based (no local resources needed)
- Excellent confidence scores

**Requirements:**
- Google Cloud account with Vision API enabled
- Service account JSON credentials file

**Setup Steps:**

#### Step 1: Create Google Cloud Project
```bash
# Go to https://console.cloud.google.com/
# Create a new project or select existing one
# Enable the Vision API: APIs & Services > Enable APIs > Vision API > Enable
```

#### Step 2: Create Service Account
```bash
# APIs & Services > Credentials > Create Credentials > Service Account
# Create a JSON key and download it
# Keep the file safe (don't commit to git!)
```

#### Step 3: Configure Environment
```bash
# Set the credentials path
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Set the project ID
export GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

#### Step 4: Enable in application.yml
```yaml
app:
  ocr:
    provider: googleVision
    google-vision:
      enabled: true
      project-id: ${GOOGLE_CLOUD_PROJECT_ID}
```

#### Step 5: Run the application
```bash
java -jar target/passport-screening-1.0.0.jar
```

**Cost:** Pay-as-you-go. First 1000 requests/month are free. (~$1.50 per 1000 requests after that)

---

### 3. AWS Textract (Optional - Good for Scanned Documents)

**Advantages:**
- Excellent accuracy for scanned documents
- Handles forms and tables
- AWS ecosystem integration
- Moderate pricing

**Requirements:**
- AWS account with Textract service access
- AWS credentials configured

**Setup Steps:**

#### Step 1: Create AWS IAM User
```bash
# Go to https://console.aws.amazon.com/iam/
# Create new user with programmatic access
# Attach policy: TextractFullAccess (or create custom policy)
```

#### Step 2: Get Access Keys
```bash
# Download CSV with Access Key ID and Secret Access Key
# Keep it secure!
```

#### Step 3: Configure Environment
```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_REGION=us-east-1
```

#### Step 4: Enable in application.yml
```yaml
app:
  ocr:
    provider: awsTextract
    aws-textract:
      enabled: true
      region: ${AWS_REGION:us-east-1}
```

#### Step 5: Run the application
```bash
java -jar target/passport-screening-1.0.0.jar
```

**Cost:** Pay-as-you-go. ~$1.00 per page processed

---

### 4. Tesseract (Optional - Legacy, Requires Native Installation)

**Advantages:**
- Free and open-source
- No cloud costs
- Works offline
- Customizable for specific languages

**Requirements:**
- Tesseract OCR engine installed on system
- Tessdata language files

**Setup:**

**Windows:**
```bash
# Download installer: https://github.com/UB-Mannheim/tesseract/wiki
# Run installer (default path: C:\Program Files\Tesseract-OCR)
# Set environment variable:
set TESSDATA_PREFIX=C:\Program Files\Tesseract-OCR\tessdata
```

**macOS:**
```bash
brew install tesseract
export TESSDATA_PREFIX=/opt/homebrew/share/tessdata
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install tesseract-ocr
export TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata
```

**Configuration:**
```yaml
app:
  ocr:
    provider: tika  # Still use Tika as primary
    tessdata-path: ${TESSDATA_PREFIX:/usr/share/tesseract-ocr/4.00/tessdata}
```

---

## Provider Selection Guide

| Provider | Setup Effort | Accuracy | Cost | Offline | Best For |
|----------|-------------|----------|------|---------|----------|
| **Tika** | 0 min | ⭐⭐⭐ | Free | ✅ | Default choice, quick start, development |
| **Google Vision** | 15 min | ⭐⭐⭐⭐⭐ | $1.50/1K | ❌ | Production, high accuracy required |
| **AWS Textract** | 15 min | ⭐⭐⭐⭐ | $1.00/page | ❌ | Scanned documents, complex layouts |
| **Tesseract** | 5 min | ⭐⭐⭐ | Free | ✅ | Offline deployments, low cost |

---

## Fallback Behavior

If your preferred provider isn't available, the system automatically falls back to the next available provider:

**Priority Order:**
1. Configured preferred provider (if enabled)
2. First available provider in registration order
3. Error if no providers available

**Example:**
```yaml
app:
  ocr:
    provider: googleVision  # Will try this first
    # If Google Vision fails or not enabled, falls back to Tika
```

---

## Testing Your OCR Setup

### Via cURL:

```bash
# Encode PDF to base64
base64 -i /path/to/passport.pdf > encoded.txt

# Send to screening endpoint
curl -X POST http://localhost:8080/api/screening/check \
  -H "Content-Type: application/json" \
  -d '{
    "documentBase64": "'$(cat encoded.txt)'",
    "fileName": "passport.pdf"
  }'
```

### Via Frontend:
1. Open http://localhost:3000 (or your frontend URL)
2. Click "Browse" or drag-drop a passport image/PDF
3. Check the results and OCR confidence score

---

## Troubleshooting

### "No available OCR providers found"
- Tika is disabled in configuration
- Check `app.ocr.provider` in application.yml
- Ensure Tika dependency is in pom.xml

### "Google Vision: Invalid credentials"
- GOOGLE_APPLICATION_CREDENTIALS path is wrong
- Service account key has expired
- Vision API not enabled in Google Cloud project

### "AWS Textract: Access Denied"
- AWS credentials not set in environment
- IAM user doesn't have Textract permissions
- Region mismatch

### Low OCR Confidence Scores
- Try Google Vision for better accuracy
- Ensure document is clear and well-lit
- Try AWS Textract for scanned documents

---

## Adding Custom OCR Providers

To add your own OCR provider:

1. **Create a class implementing OCRProvider interface:**
```java
@Component
public class MyCustomOCRProvider implements OCRProvider {
    @Override
    public OCRService.OCRResult extractText(byte[] fileBytes, String fileName) {
        // Your implementation
    }
    
    @Override
    public String getName() {
        return "MyCustomOCR";
    }
    
    @Override
    public boolean isAvailable() {
        return true; // Your availability check
    }
}
```

2. **Register in application.yml:**
```yaml
app:
  ocr:
    provider: myCustomOCR
```

The system will automatically detect and use your provider!

---

## Environment Setup Cheat Sheet

### Development (Tika - No Setup)
```bash
# Just build and run
mvn clean install
java -jar target/passport-screening-1.0.0.jar
```

### Production (Google Vision)
```bash
export GOOGLE_APPLICATION_CREDENTIALS=/secure/path/to/service-key.json
export GOOGLE_CLOUD_PROJECT_ID=your-project-id
java -jar target/passport-screening-1.0.0.jar
```

### Production (AWS Textract)
```bash
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx
export AWS_REGION=us-east-1
java -jar target/passport-screening-1.0.0.jar
```

### Offline (Tesseract)
```bash
export TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata
java -jar target/passport-screening-1.0.0.jar
