# Tesseract OCR Setup Guide

## Overview
Tesseract is an open-source OCR engine required for extracting text from passport images and PDFs. This guide provides platform-specific installation instructions.

## Windows Installation

### Option 1: Using Installer (Recommended)
1. Download the Windows installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. Run the installer (e.g., `tesseract-ocr-w64-setup-v5.x.exe`)
3. Choose installation directory (default: `C:\Program Files\Tesseract-OCR`)
4. During installation, select **English language data**
5. Complete the installation

### Option 2: Using Chocolatey
```bash
choco install tesseract
```

### Option 3: Using Scoop
```bash
scoop install tesseract
```

### Verify Installation
```bash
tesseract --version
```

### Update application.yml
```yaml
app:
  ocr:
    tessdata-path: C:\Program Files\Tesseract-OCR\tessdata
```

---

## Linux Installation (Ubuntu/Debian)

### Install via apt
```bash
sudo apt-get update
sudo apt-get install -y tesseract-ocr tesseract-ocr-eng
```

### Verify Installation
```bash
tesseract --version
which tesseract
```

### Find tessdata directory
```bash
find /usr -name tessdata -type d
```

### Typical paths:
- `/usr/share/tesseract-ocr/4.00/tessdata`
- `/usr/share/tessdata`

### Update application.yml
```yaml
app:
  ocr:
    tessdata-path: /usr/share/tesseract-ocr/4.00/tessdata
```

---

## macOS Installation

### Using Homebrew
```bash
brew install tesseract
```

### Using MacPorts
```bash
sudo port install tesseract
```

### Verify Installation
```bash
tesseract --version
which tesseract
```

### Find tessdata directory
```bash
find /usr/local -name tessdata -type d
find /opt/homebrew -name tessdata -type d  # For Apple Silicon (M1/M2/M3)
```

### Typical paths:
- `/usr/local/share/tessdata` (Intel)
- `/opt/homebrew/share/tessdata` (Apple Silicon)

### Update application.yml
```yaml
app:
  ocr:
    tessdata-path: /usr/local/share/tessdata
```

---

## Docker Installation

If running in Docker, use this Dockerfile:

```dockerfile
FROM openjdk:8-jdk-slim

# Install Tesseract and dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    libpoppler-cpp-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy JAR file
COPY target/passport-screening-0.0.1-SNAPSHOT.jar app.jar

# Set Tesseract path
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## Troubleshooting

### Error: "Failed loading language 'eng'"
- **Cause**: Tesseract data files not found
- **Solution**: 
  1. Verify tessdata directory exists and contains `eng.traineddata`
  2. Update `app.ocr.tessdata-path` in application.yml
  3. Restart the application

### Error: "Invalid memory access"
- **Cause**: Native library path not set correctly
- **Solution**:
  1. Ensure Tesseract is properly installed
  2. Check JNA library path settings
  3. Try updating to latest Tesseract version

### Error: "tesseract: command not found"
- **Cause**: Tesseract not in system PATH
- **Solution**:
  1. Add Tesseract bin directory to PATH environment variable
  2. Windows: Add `C:\Program Files\Tesseract-OCR` to PATH
  3. Linux/macOS: Verify installation location with `which tesseract`

### Slow OCR Processing
- **Solution**: 
  1. Reduce image DPI in OCRService (currently set to 300)
  2. Increase JVM memory: `-Xmx2g` in Java options
  3. Process only first page of multi-page PDFs

---

## Environment Variables

Set these environment variables if automatic detection fails:

```bash
# Windows
set TESSDATA_PREFIX=C:\Program Files\Tesseract-OCR\tessdata
set PATH=%PATH%;C:\Program Files\Tesseract-OCR\bin

# Linux/macOS
export TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata
export LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH
```

---

## Testing Tesseract

### Command Line Test
```bash
tesseract test-image.png output.txt
cat output.txt
```

### Java Test
Create a test file to verify Tesseract works with Java:

```java
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import java.io.File;

public class TesseractTest {
    public static void main(String[] args) throws TesseractException {
        Tesseract tesseract = new Tesseract();
        tesseract.setLanguage("eng");
        tesseract.setDatapath("/usr/share/tesseract-ocr/4.00");
        
        String result = tesseract.doOCR(new File("test-image.png"));
        System.out.println("OCR Result: " + result);
    }
}
```

---

## Performance Tips

1. **Image Preprocessing**: Pre-process images before OCR for better accuracy
2. **Language Optimization**: Only load required languages
3. **Batch Processing**: Process multiple files efficiently
4. **Caching**: Cache OCR results for identical files

---

## Additional Resources

- Tesseract GitHub: https://github.com/UB-Mannheim/tesseract/wiki
- Tess4j Documentation: http://tess4j.sourceforge.net/
- OCR Best Practices: https://github.com/tesseract-ocr/tesseract/wiki/ImproveQuality
