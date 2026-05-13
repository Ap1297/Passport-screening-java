package com.passport.screening.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import javax.annotation.PostConstruct;
import java.io.File;

@Configuration
public class OCRConfig {

    @Value("${app.ocr.tessdata-path}")
    private String tessdataPath;

    @PostConstruct
    public void initTesseract() {
        String tessdataDir = tessdataPath;
        
        // If tessdata-path is set and exists, use it
        if (tessdataDir != null && !tessdataDir.isEmpty()) {
            File tessdataFile = new File(tessdataDir);
            if (tessdataFile.exists()) {
                System.setProperty("jna.library.path", tessdataDir.replace("tessdata", ""));
                System.setenv("TESSDATA_PREFIX", tessdataDir);
                System.out.println("[OCR] Tesseract initialized with TESSDATA_PREFIX: " + tessdataDir);
                return;
            }
        }

        // Fallback: Try common installation paths
        String[] commonPaths = {
            "C:\\Program Files\\Tesseract-OCR\\tessdata",           // Windows
            "C:\\Program Files (x86)\\Tesseract-OCR\\tessdata",     // Windows 32-bit
            "/usr/share/tesseract-ocr/4.00/tessdata",              // Linux (Ubuntu/Debian)
            "/usr/local/share/tessdata",                            // macOS/Linux
            "/opt/homebrew/share/tessdata"                          // macOS ARM64
        };

        for (String path : commonPaths) {
            File file = new File(path);
            if (file.exists()) {
                System.setProperty("jna.library.path", path.replace("tessdata", ""));
                System.setenv("TESSDATA_PREFIX", path);
                System.out.println("[OCR] Tesseract found at: " + path);
                return;
            }
        }

        System.out.println("[OCR WARNING] Could not find Tesseract tessdata directory. OCR will fail.");
        System.out.println("[OCR] Please install Tesseract or set app.ocr.tessdata-path in application.yml");
    }
}
