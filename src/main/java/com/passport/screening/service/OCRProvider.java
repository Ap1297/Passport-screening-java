package com.passport.screening.service;

import java.io.IOException;

/**
 * New interface for pluggable OCR providers
 * Allows multiple OCR implementations (Tika, Google Vision, AWS Textract, etc.)
 */
public interface OCRProvider {
    /**
     * Extract text from a file (PDF or image)
     * @param fileBytes The file bytes to process
     * @param fileName The name of the file (used to determine type)
     * @return OCRResult containing extracted name and confidence
     */
    OCRService.OCRResult extractText(byte[] fileBytes, String fileName) throws IOException;

    /**
     * Get the provider name for logging
     */
    String getName();

    /**
     * Check if this provider is available/configured
     */
    boolean isAvailable();
}
