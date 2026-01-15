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

        String normalizedName = normalizeName(name);
        List<SanctionedIndividual> matches = repository.findByNameContaining(normalizedName);

        boolean isSanctioned = !matches.isEmpty();

        List<SanctionEntry> entries = new ArrayList<>();
        for (SanctionedIndividual individual : matches) {
            entries.add(new SanctionEntry(individual.getName()));
        }

        return new ScreeningCheckResult(isSanctioned, entries);
    }

    private String normalizeName(String name) {
        return name
            .toLowerCase()
            .replaceAll("[^a-z0-9\\s]", "")
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
