package com.passport.screening.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScreeningResult {
    @JsonProperty("extracted_name")
    private String extractedName;
    
    private double confidence;
    
    private SanctionsCheck sanctions;
    
    @JsonProperty("processing_time")
    private double processingTime;
    
    private String timestamp;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SanctionsCheck {
        @JsonProperty("is_sanctioned")
        private boolean isSanctioned;
        private List<SanctionEntry> entries;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SanctionEntry {
        private String name;
    }
}
