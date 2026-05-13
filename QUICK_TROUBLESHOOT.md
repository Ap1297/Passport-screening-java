# Quick Troubleshooting Guide

## OCR Not Working After Upload?

### Step 1: Check if Backend is Running
```bash
# Windows
netstat -ano | findstr :8080

# Linux/macOS
lsof -i :8080
```

### Step 2: Verify Tesseract Installation
```bash
tesseract --version
```

If not found, run the appropriate installation script:
- Windows: `scripts/install-tesseract-windows.bat`
- Linux: `bash scripts/install-tesseract-linux.sh`
- macOS: `bash scripts/install-tesseract-macos.sh`

### Step 3: Check Tesseract Configuration
Look at your `src/main/resources/application.yml`:
```yaml
app:
  ocr:
    tessdata-path: /path/to/tessdata  # Must be correct!
```

### Step 4: Verify tessdata Files
Check that your tessdata directory contains `eng.traineddata`:
```bash
# Windows
dir "C:\Program Files\Tesseract-OCR\tessdata" | findstr eng.traineddata

# Linux/macOS
ls -la /usr/share/tesseract-ocr/4.00/tessdata/eng.traineddata
```

### Step 5: Check Backend Logs
```bash
# Look for OCR initialization errors
grep "\[OCR\]" backend-logs.txt
```

### Step 6: Test OCR Directly
Upload a simple image and check the backend console for detailed error messages.

## Still Not Working?

Check these common issues:

| Error | Solution |
|-------|----------|
| "Failed loading language 'eng'" | Verify `eng.traineddata` exists in tessdata directory |
| "Invalid memory access" | Update Tesseract to latest version, or increase JVM memory |
| "tesseract: command not found" | Add Tesseract bin directory to system PATH |
| "Connection refused" | Ensure backend is running on port 8080 |
| "413 Payload Too Large" | File exceeds 50MB limit, reduce file size |
