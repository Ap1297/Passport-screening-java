package com.passport.screening.controller;

import com.passport.screening.model.ScreeningResult;
import com.passport.screening.service.OCRService;
import com.passport.screening.service.SanctionsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/screening")
@CrossOrigin(origins = "${app.security.cors-origins}")
public class ScreeningController {
    private static final Logger logger = LoggerFactory.getLogger(ScreeningController.class);
    
    private final OCRService ocrService;
    private final SanctionsService sanctionsService;

    public ScreeningController(OCRService ocrService, SanctionsService sanctionsService) {
        this.ocrService = ocrService;
        this.sanctionsService = sanctionsService;
    }

    @PostMapping("/check")
    public ResponseEntity<ScreeningResult> screenPassport(@RequestBody PassportRequest request) {
        long startTime = System.currentTimeMillis();
        
        logger.info("Received screening request for file: {}", request.fileName);

        try {
            // Extract text using OCR
            OCRService.OCRResult ocrResult = ocrService.extractTextFromBase64(
                request.file,
                request.fileName
            );

            // Check sanctions list
            SanctionsService.ScreeningCheckResult sanctionsResult = sanctionsService.checkSanctions(
                ocrResult.extractedName
            );

            ArrayList<ScreeningResult.SanctionEntry> entries = new ArrayList<>();
            for (SanctionsService.SanctionEntry entry : sanctionsResult.entries) {
                entries.add(new ScreeningResult.SanctionEntry(entry.name));
            }

            // Build response
            ScreeningResult result = new ScreeningResult(
                ocrResult.extractedName,
                ocrResult.confidence,
                new ScreeningResult.SanctionsCheck(
                    sanctionsResult.isSanctioned,
                    entries
                ),
                ocrResult.processingTime,
                LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
            );

            logger.info("Screening completed successfully - Name: {}, Sanctioned: {}",
                result.getExtractedName(), result.getSanctions().isSanctioned());

            return ResponseEntity.ok(result);

        } catch (IOException e) {
            logger.error("Error processing passport", e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> healthMap = new HashMap<>();
        healthMap.put("status", "healthy");
        healthMap.put("timestamp", LocalDateTime.now().toString());
        healthMap.put("cache_size", String.valueOf(sanctionsService.getCacheSize()));
        return ResponseEntity.ok(healthMap);
    }

    public static class PassportRequest {
        public String file;
        public String fileName;
        public String fileType;
    }
}
