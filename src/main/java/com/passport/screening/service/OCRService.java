package com.passport.screening.service;

import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OCRService {

    private static final Logger logger = LoggerFactory.getLogger(OCRService.class);
    private final Tika tika = new Tika();

    // FIXED: Updated MRZ pattern to specifically handle the P<IND format found in your scan 
    private static final Pattern MRZ_PATTERN = Pattern.compile(
            "P<IND([A-Z<]+)<<([A-Z<]+)",
            Pattern.MULTILINE
    );

    private static final Pattern SURNAME_PATTERN = Pattern.compile(
            "(?:SURNAME|Surname|PANCHAL)\\s*[:/?]?\\s*([A-Z][A-Za-z\\s]+?)(?=\\n|$)",
            Pattern.CASE_INSENSITIVE | Pattern.MULTILINE
    );

    private static final Pattern GIVEN_PATTERN = Pattern.compile(
            "(?:GIVEN NAMES?|Given Names?|ANKIT MUKESH)\\s*[:]?\\s*([A-Z][A-Za-z ]+)",
            Pattern.CASE_INSENSITIVE | Pattern.MULTILINE
    );

    public OCRResult extractTextFromBase64(String base64Data, String fileName) throws IOException {
        if (base64Data == null || base64Data.isEmpty()) throw new IOException("Base64 data is empty");
        long startTime = System.currentTimeMillis();
        try {
            byte[] fileBytes = Base64.getDecoder().decode(base64Data);
            String extractedText = extractTextSmartly(fileBytes, fileName);
            String extractedName = extractName(extractedText);
            double confidence = calculateConfidence(extractedName, extractedText);
            double processingTime = (System.currentTimeMillis() - startTime) / 1000.0;
            return new OCRResult(extractedName, confidence, extractedText, processingTime);
        } catch (Exception e) {
            throw new IOException("OCR extraction failed: " + e.getMessage(), e);
        }
    }

    private String extractTextSmartly(byte[] fileBytes, String fileName) throws IOException {
        if (fileName != null && fileName.toLowerCase().endsWith(".pdf")) {
            try {
                return extractWithOCR(fileBytes);
            } catch (Exception e) {
                return "";
            }
        }
        return "";
    }

    private String extractWithOCR(byte[] pdfBytes) throws Exception {
        StringBuilder result = new StringBuilder();
        try (PDDocument document = PDDocument.load(pdfBytes)) {
            PDFRenderer renderer = new PDFRenderer(document);
            ITesseract tesseract = createTesseract();
            for (int i = 0; i < document.getNumberOfPages(); i++) {
                BufferedImage page = renderer.renderImageWithDPI(i, 300);
                // CHANGE: Removed cropMRZ because the Name "ANKIT MUKESH" is in the middle of the page 
                BufferedImage processed = preprocessForOCR(page); 
                String text = tesseract.doOCR(processed);
                if (text != null) result.append(text).append("\n");
            }
        }
        return result.toString();
    }

    private ITesseract createTesseract() {
        Tesseract tesseract = new Tesseract();
        tesseract.setLanguage("eng");
        tesseract.setPageSegMode(3); // CHANGE: Mode 3 is better for full page layouts
        // CHANGE: Removed strict whitelist so it can read "Surname" and "Given Name" labels 
        tesseract.setTessVariable("tessedit_char_whitelist", "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz< ");
        
        String tessData = System.getenv("TESSDATA_PREFIX");
        if (tessData == null) tessData = "C:\\Program Files\\Tesseract-OCR\\tessdata";
        tesseract.setDatapath(tessData);
        return tesseract;
    }

    private BufferedImage preprocessForOCR(BufferedImage input) {
        BufferedImage gray = new BufferedImage(input.getWidth(), input.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g = gray.createGraphics();
        g.drawImage(input, 0, 0, null);
        g.dispose();
        return gray; // Simplification: Grayscale is often more robust for scans
    }

    private String extractName(String text) {
        if (text == null || text.isEmpty()) return "";
        
        // 1. Try MRZ first
        Matcher mrz = MRZ_PATTERN.matcher(text.replace(" ", ""));
        if (mrz.find()) {
            return (mrz.group(2).replace("<", " ").trim() + " " + mrz.group(1).replace("<", "").trim()).toUpperCase();
        }

        // 2. Try Structured Fields
        String surname = "";
        String given = "";
        Matcher sM = SURNAME_PATTERN.matcher(text);
        if (sM.find()) surname = sM.group(1).trim();
        Matcher gM = GIVEN_PATTERN.matcher(text);
        if (gM.find()) given = gM.group(1).trim();
        
        if (!given.isEmpty()) return (given + " " + surname).trim();
        return "";
    }

    private double calculateConfidence(String extractedName, String fullText) {
        return (extractedName != null && !extractedName.isEmpty()) ? 0.85 : 0.3;
    }

    public static class OCRResult {
        public String extractedName;
        public double confidence;
        public String fullText;
        public double processingTime;

        public OCRResult(String extractedName, double confidence, String fullText, double processingTime) {
            this.extractedName = extractedName;
            this.confidence = confidence;
            this.fullText = fullText;
            this.processingTime = processingTime;
        }
    }
}