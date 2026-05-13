package com.passport.screening.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class ImageExtractorService {
    private static final Logger logger = LoggerFactory.getLogger(ImageExtractorService.class);

    public List<byte[]> extractImagesFromPDF(byte[] pdfBytes) throws IOException {
        List<byte[]> images = new ArrayList<>();
        
        try {
            PDDocument document = PDDocument.load(pdfBytes);
            PDFRenderer pdfRenderer = new PDFRenderer(document);
            
            int pageCount = document.getNumberOfPages();
            logger.info("PDF has {} pages", pageCount);
            
            for (int i = 0; i < pageCount; i++) {
                try {
                    BufferedImage image = pdfRenderer.renderImageWithDPI(i, 150);
                    byte[] imageBytes = convertBufferedImageToBytes(image);
                    images.add(imageBytes);
                    logger.debug("Extracted page {} as image ({} bytes)", i + 1, imageBytes.length);
                } catch (Exception e) {
                    logger.warn("Failed to extract image from page {}: {}", i + 1, e.getMessage());
                }
            }
            
            document.close();
            logger.info("Successfully extracted {} images from PDF", images.size());
        } catch (IOException e) {
            logger.error("Error loading PDF document", e);
            throw e;
        }
        
        return images;
    }

    private byte[] convertBufferedImageToBytes(BufferedImage image) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", baos);
        return baos.toByteArray();
    }
}
