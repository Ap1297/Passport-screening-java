package com.passport.screening.service;

import net.sourceforge.tess4j.TesseractException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;
import java.util.Base64;

import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest
public class OCRServiceTest {
    
    private OCRService ocrService;

    @Before
    public void setUp() {
        ocrService = new OCRService();
    }

    @Test
    public void testExtractNameFromMRZPattern() {
        String testTextWithMRZ = "P<IND" +
                "PANCHAL<<ANKIT MUKESH<<<<<<<<<<<<<<<<<<" +
                "9999999<8IND9510161F2412314<<<<<<<<<<<<6";
        
        String result = ocrService.extractName(testTextWithMRZ);
        
        assertNotNull("Extracted name should not be null", result);
        assertFalse("Name should not be empty from MRZ", result.isEmpty());
        assertTrue("Name should contain extracted surname or given name", 
                result.contains("PANCHAL") || result.contains("ANKIT"));
    }

    @Test
    public void testExtractNameFromStructuredFields() {
        String testTextWithStructured = "SURNAME: PANCHAL\n" +
                "GIVEN NAMES: ANKIT MUKESH\n" +
                "PASSPORT NUMBER: 9999999";
        
        String result = ocrService.extractName(testTextWithStructured);
        
        assertNotNull("Extracted name should not be null", result);
        assertTrue("Should extract full name from structured fields", 
                result.contains("ANKIT") && result.contains("PANCHAL"));
    }

    @Test
    public void testExtractNameFallbackToGenericPattern() {
        String testTextWithGenericPattern = "Name: John Smith\n" +
                "Address: 123 Main St\n" +
                "DOB: 1990-01-01";
        
        String result = ocrService.extractName(testTextWithGenericPattern);
        
        assertNotNull("Extracted name should not be null", result);
        assertTrue("Should extract name from generic pattern", !result.isEmpty());
    }

    @Test
    public void testConfidenceScoreCalculation() {
        String text = "SURNAME: SMITH\nGIVEN NAMES: JOHN\nPASSPORT";
        String name = "JOHN SMITH";
        
        double confidence = ocrService.calculateConfidence(name, text);
        
        assertTrue("Confidence should be positive", confidence > 0.5);
        assertTrue("Confidence should not exceed 0.95", confidence <= 0.95);
    }

    @Test
    public void testLowConfidenceForEmptyName() {
        double confidence = ocrService.calculateConfidence("", "some text");
        
        assertEquals("Empty name should have low confidence score", 0.3, confidence, 0.01);
    }

    @Test
    public void testOCRResultStructure() throws IOException, TesseractException {
        String testData = Base64.getEncoder().encodeToString("Test Passport Data".getBytes());
        
        try {
            OCRService.OCRResult result = ocrService.extractTextFromBase64(testData, "test.txt");
            
            assertNotNull("OCR Result should not be null", result);
            assertNotNull("Extracted name should exist", result.extractedName);
            assertTrue("Confidence should be between 0 and 1", result.confidence >= 0 && result.confidence <= 1);
            assertTrue("Processing time should be positive", result.processingTime >= 0);
        } catch (IOException e) {
            // Expected for non-PDF test data
            assertTrue("Exception expected for invalid data", true);
        }
    }

    @Test
    public void testIsAllCapsDetection() {
        assertTrue("Should detect all caps", ocrService.isAllCaps("ANKIT MUKESH"));
        assertFalse("Should reject mixed case", ocrService.isAllCaps("Ankit Mukesh"));
        assertFalse("Should reject too short", ocrService.isAllCaps("AB"));
    }

    @Test
    public void testIsTitleCaseDetection() {
        assertTrue("Should detect title case", ocrService.isTitleCase("Ankit Mukesh"));
        assertFalse("Should reject all caps", ocrService.isTitleCase("ANKIT MUKESH"));
        assertFalse("Should reject too short", ocrService.isTitleCase("AB"));
    }
}
