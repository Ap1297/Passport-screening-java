# Java 8 Setup Guide - Passport Screening Application

## Overview
This application has been configured to run on **Java 8** with Spring Boot 2.7.18, which is the last Spring Boot version that officially supports Java 8.

## Prerequisites

### 1. Java 8 Installation
```bash
# Verify Java 8 is installed
java -version

# Expected output:
# java version "1.8.0_xxx"
# Java(TM) SE Runtime Environment (build 1.8.0_xxx-xxx)
```

### 2. Maven Installation
```bash
mvn --version
# Expected: Maven 3.6.0 or higher
```

### 3. Tesseract OCR Installation

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y tesseract-ocr
sudo apt-get install -y libtesseract-dev

# Verify installation
tesseract --version
```

#### macOS
```bash
brew install tesseract

# Verify installation
tesseract --version
```

#### Windows
Download from: https://github.com/UB-Mannheim/tesseract/wiki
- Choose the latest installer (e.g., `tesseract-ocr-w64-v5.x.exe`)
- Install to default location: `C:\Program Files\Tesseract-OCR`
- Add to PATH environment variable

## Dependency Resolution

### Issue: org.im4java Not Found
The `im4java` dependency has been **removed** because:
1. It's an optional wrapper around ImageMagick
2. Not consistently available in Maven Central
3. Not required for this application - we use Java's built-in `javax.imageio` for image processing

### Replacement Dependencies
- **commons-io**: For reliable file operations (Java 8 compatible)
- **javax.imageio**: Built-in Java image processing

## Building the Application

### Clean Build
```bash
mvn clean compile
```

### Full Build with Tests
```bash
mvn clean package
```

### Build Skipping Tests (Faster)
```bash
mvn clean package -DskipTests
```

### Troubleshooting Build Issues

**Issue: `[ERROR] ERROR in opening zip file`**
```bash
# Clear Maven cache and retry
rm -rf ~/.m2/repository
mvn clean install
```

**Issue: `Tesseract not found`**
```bash
# Set Tesseract path in environment
export TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata

# Or update application.yml
app:
  ocr:
    tessdata-path: /usr/share/tesseract-ocr/4.00/tessdata
```

**Issue: MongoDB connection failed**
```bash
# Ensure MongoDB Atlas connection string is set
export MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/passport_screening

# Or update application.yml with your connection details
```

## Running the Application

### Local Execution
```bash
# Set environment variables
export MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/passport_screening
export APP_SECURITY_CORS_ORIGINS=http://localhost:3000

# Run the application
mvn spring-boot:run
```

### As JAR File
```bash
# Build
mvn clean package

# Run
java -jar target/passport-screening-1.0.0.jar
```

### With Docker
```bash
# Build Docker image
docker build -f backend/Dockerfile.backend -t passport-screening:java8 .

# Run container
docker run -e MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/passport_screening \
           -e APP_SECURITY_CORS_ORIGINS=http://localhost:3000 \
           -p 8080:8080 \
           passport-screening:java8
```

## Java 8 Compatibility Features Used

✅ **Supported Features**
- Lambda expressions
- Streams API (used in OCRService and SanctionsService)
- Default methods in interfaces
- Method references
- Functional interfaces
- CompletableFuture (not used, but available)

❌ **NOT Used (Java 9+ Features)**
- Local variable type inference (`var` keyword - Java 10+)
- Modules (Java 9+)
- Records (Java 14+)
- Text blocks (Java 13+)
- Sealed classes (Java 15+)
- Pattern matching (Java 16+)
- Virtual threads (Java 21+)

## Verifying Java 8 Compatibility

### Check Compiled Class Files
```bash
# Verify class files are Java 8 compatible
file target/classes/com/passport/screening/controller/ScreeningController.class

# Should show: Java class data, version 52.0 (Java 8)
# Version mapping: 50 = Java 6, 51 = Java 7, 52 = Java 8
```

### Run Tests
```bash
mvn test -Dorg.slf4j.simpleLogger.defaultLogLevel=debug
```

## Performance Tips for Java 8

1. **JVM Heap Configuration**
```bash
java -Xms512m -Xmx2048m -jar target/passport-screening-1.0.0.jar
```

2. **GC Optimization**
```bash
java -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -jar target/passport-screening-1.0.0.jar
```

3. **Disable TieredCompilation (if facing startup delay)**
```bash
java -XX:-TieredCompilation -jar target/passport-screening-1.0.0.jar
```

## CI/CD with Java 8

### GitHub Actions
```yaml
- name: Set up JDK 8
  uses: actions/setup-java@v3
  with:
    java-version: '8'
    distribution: 'adopt'
```

### Docker Base Image
```dockerfile
FROM adoptopenjdk:8-jdk-hotspot
```

## Migration Path (Optional)

If you want to upgrade to Java 11+ in the future:
1. Update parent Spring Boot version to 3.x
2. Add Jakarta imports instead of javax
3. Update dependencies (PDFBox 3.0+, Tess4J 5.8+)
4. Remove ArrayList usage and use .toList()
5. No code logic changes needed

## Support

For issues or questions:
1. Check Maven repository for dependency versions: https://mvnrepository.com
2. Verify Tesseract installation: `tesseract --version`
3. Test MongoDB connection: Check connection string in application.yml
4. Enable debug logging: Set `logging.level.com.passport=DEBUG` in application.yml
