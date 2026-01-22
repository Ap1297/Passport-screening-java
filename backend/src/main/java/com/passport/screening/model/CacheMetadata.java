package com.passport.screening.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "cache_metadata")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CacheMetadata {
    private String id = "sanctions_cache";
    private LocalDateTime lastUpdated;
    private long totalRecords;
    private String sourceVersion;
}
