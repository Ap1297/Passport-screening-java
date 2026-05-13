package com.passport.screening.controller;

import com.passport.screening.repository.SanctionedIndividualRepository;
import com.passport.screening.service.SanctionsListCacheService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/debug")
@CrossOrigin
public class DebugController {
    private static final Logger logger = LoggerFactory.getLogger(DebugController.class);
    
    private final SanctionedIndividualRepository repository;
    private final SanctionsListCacheService sanctionsListCacheService;

    public DebugController(SanctionedIndividualRepository repository, SanctionsListCacheService sanctionsListCacheService) {
        this.repository = repository;
        this.sanctionsListCacheService = sanctionsListCacheService;
    }

    @GetMapping("/cache-status")
    public Map<String, Object> getCacheStatus() {
        Map<String, Object> status = new HashMap<>();
        long count = repository.count();
        
        status.put("sanctioned_individuals_count", count);
        status.put("message", count > 0 ? "Cache has data" : "Cache is empty - no data found");
        status.put("timestamp", System.currentTimeMillis());
        
        logger.info("Cache status check - Total records: {}", count);
        return status;
    }

    @PostMapping("/refresh-cache")
    public Map<String, Object> manualRefreshCache() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("Manual cache refresh initiated via debug endpoint");
            sanctionsListCacheService.manualRefresh();
            
            response.put("status", "success");
            response.put("message", "Cache refresh initiated");
            response.put("total_records", repository.count());
            response.put("timestamp", System.currentTimeMillis());
        } catch (Exception e) {
            logger.error("Manual cache refresh failed", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            response.put("error_type", e.getClass().getSimpleName());
        }
        
        return response;
    }

    @GetMapping("/sample-records")
    public Map<String, Object> getSampleRecords() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            long count = repository.count();
            response.put("total_count", count);
            response.put("sample_records", repository.findAll().stream().limit(5).toList());
            response.put("status", "success");
        } catch (Exception e) {
            logger.error("Error fetching sample records", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        
        return response;
    }
}
