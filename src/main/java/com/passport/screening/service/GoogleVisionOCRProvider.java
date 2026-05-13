package com.passport.screening.service;

import com.google.cloud.vision.v1.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Google Cloud Vision API OCR provider (optional, requires credentials)
 * Best for scanned documents and high-accuracy OCR
 */
@Component
public class GoogleVisionOCRProvider implements OCRProvider {
    private static final Logger logger = LoggerFactory.getLogger(GoogleVisionOCRProvider.class);

    @Value("${app.ocr.google-vision.enabled:false}")
    private boolean enabled;

    @Value("${app.ocr.google-vision.project-id:}")
    private String projectId;

    private final Pattern namePattern = Pattern.compile(
        "(?:NAME|SURNAME|GIVEN NAMES)[:\\s]*([A-Za-z\\s]+)",
        Pattern.CASE_INSENSITIVE | Pattern.MULTILINE
    );

    @Override
    public OCRService.OCRResult extractText(byte[] fileBytes, String fileName) throws IOException {
        if (!isAvailable()) {
            throw new IOException("Google Vision OCR is not enabled");
        }

        long startTime = System.currentTimeMillis();

        try (ImageAnnotatorClient client = ImageAnnotatorClient.create()) {
            // Build image from bytes
            Image image = Image.newBuilder().setContent(com.google.protobuf.ByteString.copyFrom(fileBytes)).build();

            // Request text detection
            AnnotateImageRequest request = AnnotateImageRequest.newBuilder()
                .addFeatures(Feature.newBuilder().setType(Feature.Type.TEXT_DETECTION).build())
                .setImage(image)
                .build();

            List<AnnotateImageRequest> requests = new ArrayList<>();
            requests.add(request);

            BatchAnnotateImagesResponse response = client.batchAnnotateImages(requests);
            List<AnnotateImageResponse> responses = response.getResponsesList();

            StringBuilder extractedText = new StringBuilder();
            double confidence = 0.0;

            for (AnnotateImageResponse res : responses) {
                if (res.hasError()) {
                    logger.error("Google Vision error: {}", res.getError().getMessage());
                    throw new IOException(res.getError().getMessage());
                }

                for (TextAnnotation annotation : res.getTextAnnotationsList()) {
                    extractedText.append(annotation.getDescription()).append("\n");
                }

                confidence = 0.95; // Google Vision is highly accurate
            }

            String extractedName = extractNameFromText(extractedText.toString());
            long processingTime = System.currentTimeMillis() - startTime;

            logger.info("Google Vision OCR extracted name: {} with confidence: {}", extractedName, confidence);

            return new OCRService.OCRResult(extractedName, confidence, extractedText.toString(), processingTime / 1000.0);
        } catch (Exception e) {
            logger.error("Google Vision OCR processing failed", e);
            throw new IOException("Google Vision OCR processing failed", e);
        }
    }

    @Override
    public String getName() {
        return "GoogleVision";
    }

    @Override
    public boolean isAvailable() {
        return enabled && projectId != null && !projectId.isEmpty();
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

    private boolean isAllCaps(String str) {
        return str.equals(str.toUpperCase()) && str.matches("[A-Z\\s]+");
    }

    private boolean isTitleCase(String str) {
        return str.matches("^([A-Z][a-z]+ )+[A-Z][a-z]+$");
    }
}
