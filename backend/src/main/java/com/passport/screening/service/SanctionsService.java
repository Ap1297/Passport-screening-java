package com.passport.screening.service;

import com.passport.screening.model.SanctionedIndividual;
import com.passport.screening.repository.SanctionedIndividualRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SanctionsService {
    private static final Logger logger = LoggerFactory.getLogger(SanctionsService.class);
    private final SanctionedIndividualRepository repository;
    private final SanctionsListCacheService cacheService;

    public SanctionsService(SanctionedIndividualRepository repository, SanctionsListCacheService cacheService) {
        this.repository = repository;
        this.cacheService = cacheService;
    }

    public ScreeningCheckResult checkSanctions(String name) {
        if (name == null || name.trim().isEmpty()) {
            return new ScreeningCheckResult(false, new ArrayList<SanctionEntry>());
        }

        String normalizedInput = normalizeName(name);
        List<SanctionedIndividual> allIndividuals = repository.findAll();
        
        List<SanctionEntry> entries = new ArrayList<>();
        for (SanctionedIndividual individual : allIndividuals) {
            String coreName = extractCoreNameFromSanctionsEntry(individual.getName());
            String normalizedDbName = normalizeName(coreName);
            
            if (matchesName(normalizedInput, normalizedDbName)) {
                entries.add(new SanctionEntry(coreName.trim()));
            }
        }

        boolean isSanctioned = !entries.isEmpty();
        return new ScreeningCheckResult(isSanctioned, entries);
    }

    private String extractCoreNameFromSanctionsEntry(String fullEntry) {
        // Extract only the main name before metadata markers like "na Name", "Title:", "Designation:", "DOB", etc.
        if (fullEntry == null || fullEntry.isEmpty()) {
            return fullEntry;
        }
        
        // Split by common metadata markers
        String[] markers = {" na Name", " Title:", " Designation:", " DOB:", " POB:", " a.k.a.:", " Nationality:", " Passport"};
        String result = fullEntry;
        
        for (String marker : markers) {
            int index = result.indexOf(marker);
            if (index > 0) {
                result = result.substring(0, index);
            }
        }
        
        return result.trim();
    }

    private boolean matchesName(String extractedName, String dbName) {
        if (extractedName.equals(dbName)) {
            return true;
        }
        
        // Check if db name contains extracted name or vice versa (for partial matches)
        if (dbName.contains(extractedName) || extractedName.contains(dbName)) {
            return true;
        }
        
        // For space-less names like "MUHAMMADHASSAN", check word-by-word matching
        // Split db name into parts and check if most parts appear in extracted name
        String[] dbParts = dbName.split("\\s+");
        int matchedParts = 0;
        
        for (String part : dbParts) {
            if (!part.isEmpty() && extractedName.contains(part)) {
                matchedParts++;
            }
        }
        
        // If 50% or more of the db name parts match, consider it a match
        if (dbParts.length > 0 && (double) matchedParts / dbParts.length >= 0.5) {
            return true;
        }
        
        // Check for substring match with minimum length threshold (at least 4 characters)
        String[] extractedParts = extractedName.split("\\s+");
        for (String part : extractedParts) {
            if (part.length() >= 4 && dbName.contains(part)) {
                return true;
            }
        }
        
        return false;
    }

    private String normalizeName(String name) {
        return name
            .toUpperCase()
            .replaceAll("[^A-Z0-9]", "")
            .trim();
    }

    public long getCacheSize() {
        return repository.count();
    }

    public void validateCacheIntegrity() {
        long count = repository.count();
        logger.info("Sanctions cache contains {} records", count);
    }

    public static class ScreeningCheckResult {
        public boolean isSanctioned;
        public List<SanctionEntry> entries;

        public ScreeningCheckResult(boolean isSanctioned, List<SanctionEntry> entries) {
            this.isSanctioned = isSanctioned;
            this.entries = entries;
        }
    }

    public static class SanctionEntry {
        public String name;

        public SanctionEntry(String name) {
            this.name = name;
        }
    }
}
