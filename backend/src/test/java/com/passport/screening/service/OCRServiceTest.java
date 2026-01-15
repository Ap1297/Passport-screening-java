package com.passport.screening.service;

import net.sourceforge.tess4j.TesseractException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("OCR Service Tests")
public class OCRServiceTest {

    private OCRService ocrService;

    @BeforeEach
    void setUp() {
        ocrService = new OCRService();
    }

    @Test
    @DisplayName("Should extract name from valid text")
    void testExtractNameFromValidText() throws IOException, TesseractException {
        // Sample base64 encoded image (you would use actual test image in production)
        String testBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        
        OCRService.OCRResult result = ocrService.extractTextFromBase64(testBase64, "test.png");
        
        assertNotNull(result);
        assertNotNull(result.extractedName);
        assertTrue(result.confidence >= 0.3);
        assertTrue(result.processingTime > 0);
    }

    @Test
    @DisplayName("Should handle empty input gracefully")
    void testHandleEmptyInput() throws IOException, TesseractException {
        String emptyBase64 = Base64.getEncoder().encodeToString("".getBytes());
        
        assertThrows(Exception.class, () -> {
            ocrService.extractTextFromBase64(emptyBase64, "empty.png");
        });
    }

    @Test
    @DisplayName("Should calculate confidence score correctly")
    void testConfidenceCalculation() {
        // Test with valid extracted name
        double confidence1 = ocrService.calculateConfidence("JOHN DOE", "SURNAME: JOHN DOE");
        assertTrue(confidence1 > 0.8);

        // Test with short name
        double confidence2 = ocrService.calculateConfidence("JOE", "Some text");
        assertTrue(confidence2 > 0.3);

        // Test with empty name
        double confidence3 = ocrService.calculateConfidence("", "Text");
        assertTrue(confidence3 < 0.5);
    }
}
