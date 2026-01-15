package com.passport.screening.service;

import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Apache Tika-based OCR provider (pure Java, no native dependencies)
 * Works with both PDFs and images for text extraction
 */
@Component
public class TikaOCRProvider implements OCRProvider {
    private static final Logger logger = LoggerFactory.getLogger(TikaOCRProvider.class);
    private final Tika tika = new Tika();
    private final Pattern namePattern = Pattern.compile(
        "(?:NAME|SURNAME|GIVEN NAMES)[:\\s]*([A-Za-z\\s]+)",
        Pattern.CASE_INSENSITIVE | Pattern.MULTILINE
    );

    @Override
    public OCRService.OCRResult extractText(byte[] fileBytes, String fileName) throws IOException {
        long startTime = System.currentTimeMillis();

        try {
            ByteArrayInputStream inputStream = new ByteArrayInputStream(fileBytes);
            String extractedText = tika.parseToString(inputStream);

            String extractedName = extractNameFromText(extractedText);
            double confidence = calculateConfidence(extractedName, extractedText);

            long processingTime = System.currentTimeMillis() - startTime;

            logger.info("Tika OCR extracted name: {} with confidence: {}", extractedName, confidence);

            return new OCRService.OCRResult(extractedName, confidence, extractedText, processingTime / 1000.0);
        } catch (Exception e) {
            logger.error("Tika OCR processing failed", e);
            throw new IOException("Tika OCR processing failed", e);
        }
    }

    @Override
    public String getName() {
        return "Tika";
    }

    @Override
    public boolean isAvailable() {
        return true; // Tika is always available as pure Java library
    }

    private String extractNameFromText(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }

        Matcher matcher = namePattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        String[] lines = text.split("\n");
        for (String line : lines) {
            line = line.trim();
            if (!line.isEmpty() && (isAllCaps(line) || isTitleCase(line)) && line.length() > 3) {
                return line;
            }
        }

        return "";
    }

    private double calculateConfidence(String extractedName, String fullText) {
        if (extractedName == null || extractedName.isEmpty()) {
            return 0.3;
        }

        double baseConfidence = 0.7;

        if (extractedName.length() > 5) {
            baseConfidence += 0.15;
        }

        if (fullText.contains("PASSPORT") || fullText.contains("SURNAME") || fullText.contains("GIVEN NAMES")) {
            baseConfidence += 0.1;
        }

        return Math.min(baseConfidence, 0.95);
    }

    private boolean isAllCaps(String str) {
        return str.equals(str.toUpperCase()) && str.matches("[A-Z\\s]+");
    }

    private boolean isTitleCase(String str) {
        return str.matches("^([A-Z][a-z]+ )+[A-Z][a-z]+$");
    }
}
