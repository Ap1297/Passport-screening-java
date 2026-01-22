package com.passport.screening.service;

import com.passport.screening.model.SanctionedIndividual;
import com.passport.screening.model.CacheMetadata;
import com.passport.screening.repository.SanctionedIndividualRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SanctionsListCacheService {
    private static final Logger logger = LoggerFactory.getLogger(SanctionsListCacheService.class);
    
    // This pattern handles whitespace and "na" values correctly
    private static final Pattern NAME_PATTERN = Pattern.compile(
        "Name:\\s*1:\\s*([^2]+?)\\s+2:\\s*([^3]+?)(?:\\s+3:\\s*([^4]+?))?(?:\\s+4:\\s*(.+?))?(?=Name:|$)",
        Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );
    
    @Value("${app.sanctions.source-url}")
    private String sanctionsSourceUrl;
    
    @Value("${app.sanctions.cache-valid-hours:24}")
    private int cacheValidHours;
    
    private final SanctionedIndividualRepository repository;
    private final MongoTemplate mongoTemplate;

    public SanctionsListCacheService(SanctionedIndividualRepository repository, MongoTemplate mongoTemplate) {
        this.repository = repository;
        this.mongoTemplate = mongoTemplate;
    }

    public void initializeSanctionsList() {
        logger.info("Initializing sanctions list on application startup");
        
        if (isCacheValid()) {
            logger.info("Cache is valid - skipping download");
            return;
        }
        
        logger.info("Cache is invalid or empty - downloading sanctions list");
        refreshSanctionsList();
    }

    private boolean isCacheValid() {
        CacheMetadata metadata = mongoTemplate.findOne(
            Query.query(Criteria.where("id").is("sanctions_cache")),
            CacheMetadata.class
        );
        
        if (metadata == null) {
            logger.info("No cache metadata found");
            return false;
        }
        
        long sanctionedIndividualCount = repository.count();
        if (sanctionedIndividualCount == 0) {
            logger.info("Cache collection is empty");
            return false;
        }
        
        LocalDateTime expirationTime = metadata.getLastUpdated().plusHours(cacheValidHours);
        boolean isValid = LocalDateTime.now().isBefore(expirationTime);
        
        logger.info("Cache validity check - Last updated: {}, Valid until: {}, Current: {}, Is Valid: {}",
            metadata.getLastUpdated(), expirationTime, LocalDateTime.now(), isValid);
        
        return isValid;
    }

    @Scheduled(cron = "${app.sanctions.cache-refresh-cron}")
    public void refreshSanctionsList() {
        logger.info("Starting scheduled sanctions list cache refresh at {}", LocalDateTime.now());
        
        try {
            List<SanctionedIndividual> individuals = downloadAndParseHtml();
            
            if (!individuals.isEmpty()) {
                updateCache(individuals);
                logger.info("Successfully updated cache with {} records", individuals.size());
            } else {
                logger.warn("No records found in downloaded sanctions list");
            }
        } catch (IOException e) {
            logger.error("Failed to refresh sanctions list", e);
        }
    }

    private List<SanctionedIndividual> downloadAndParseHtml() throws IOException {
        logger.info("Downloading sanctions list from {}", sanctionsSourceUrl);
        
        String htmlContent = downloadHtmlContent(sanctionsSourceUrl);
        logger.info("HTML content length: {}", htmlContent.length());
        
        Document doc = Jsoup.parse(htmlContent);
        String textContent = doc.body().text();
        logger.info("Parsed text content length: {}", textContent.length());
        
        List<SanctionedIndividual> individuals = new ArrayList<>();
        Set<String> processedNames = new HashSet<>();

        Matcher matcher = NAME_PATTERN.matcher(textContent);
        int matchCount = 0;

        while (matcher.find()) {
            try {
                String part1 = matcher.group(1).trim().replaceAll("\\s+", " ");
                String part2 = matcher.group(2).trim().replaceAll("\\s+", " ");
                String part3 = matcher.group(3) != null ? matcher.group(3).trim().replaceAll("\\s+", " ") : "";
                String part4 = matcher.group(4) != null ? matcher.group(4).trim().replaceAll("\\s+", " ").split("Name:")[0] : "";

                StringBuilder fullName = new StringBuilder();
                if (!part1.isEmpty() && !part1.equalsIgnoreCase("na")) fullName.append(part1).append(" ");
                if (!part2.isEmpty() && !part2.equalsIgnoreCase("na")) fullName.append(part2).append(" ");
                if (!part3.isEmpty() && !part3.equalsIgnoreCase("na")) fullName.append(part3).append(" ");
                if (!part4.isEmpty() && !part4.equalsIgnoreCase("na")) fullName.append(part4);

                String name = fullName.toString().trim();

                // Skip empty names and duplicates
                if (name.isEmpty() || name.length() < 2 || processedNames.contains(name)) {
                    continue;
                }

                processedNames.add(name);
                
                SanctionedIndividual individual = new SanctionedIndividual();
                individual.setName(name);
                individual.setCreatedDate(LocalDateTime.now());

                individuals.add(individual);
                matchCount++;
                
                logger.debug("Parsed individual name: {}", name);
                
                if (matchCount % 100 == 0) {
                    logger.info("Progress: {} names parsed so far", matchCount);
                }
            } catch (Exception e) {
                logger.warn("Error parsing match at position {}: {}", matcher.start(), e.getMessage());
            }
        }

        logger.info("Total individuals parsed: {} (from {} regex matches)", individuals.size(), matchCount);
        return individuals;
    }

    private String downloadHtmlContent(String urlString) throws IOException {
        URL url = new URL(urlString);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        
        try {
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(30000);
            connection.setReadTimeout(30000);
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            connection.setRequestProperty("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
            connection.setRequestProperty("Accept-Language", "en-US,en;q=0.5");
            
            int responseCode = connection.getResponseCode();
            logger.info("HTTP Response Code: {}", responseCode);
            
            if (responseCode != HttpURLConnection.HTTP_OK) {
                throw new IOException("Failed to download sanctions list. HTTP Response Code: " + responseCode);
            }
            
            InputStream inputStream = connection.getInputStream();
            StringBuilder htmlContent = new StringBuilder();
            byte[] buffer = new byte[8192];
            int bytesRead;
            
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                htmlContent.append(new String(buffer, 0, bytesRead, StandardCharsets.UTF_8));
            }
            
            inputStream.close();
            logger.info("Successfully downloaded {} characters from sanctions source", htmlContent.length());
            
            return htmlContent.toString();
        } finally {
            connection.disconnect();
        }
    }

    private void updateCache(List<SanctionedIndividual> individuals) {
        try {
            // Clear old records
            List<SanctionedIndividual> existingRecords = repository.findAll();
            if (!existingRecords.isEmpty()) {
                repository.deleteAll(existingRecords);
                logger.info("Cleared {} old records", existingRecords.size());
            }

            // Save new records
            repository.saveAll(individuals);
            logger.info("Saved {} new sanctioned individuals to MongoDB", individuals.size());

            // Update metadata
            CacheMetadata metadata = new CacheMetadata(
                "sanctions_cache",
                LocalDateTime.now(),
                (long) individuals.size(),
                "UN_CONSOLIDATED_" + System.currentTimeMillis()
            );
            mongoTemplate.save(metadata);
            
            logger.info("Cache metadata updated - Total records in collection: {}", repository.count());
        } catch (Exception e) {
            logger.error("Error updating cache in MongoDB", e);
            throw new RuntimeException("Failed to update sanctions list cache", e);
        }
    }

    public void manualRefresh() {
        logger.info("Manual refresh triggered");
        refreshSanctionsList();
    }
}
