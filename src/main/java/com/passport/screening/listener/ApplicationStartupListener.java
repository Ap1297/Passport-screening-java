package com.passport.screening.listener;

import com.passport.screening.service.SanctionsListCacheService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class ApplicationStartupListener {
    private static final Logger logger = LoggerFactory.getLogger(ApplicationStartupListener.class);
    
    private final SanctionsListCacheService sanctionsListCacheService;

    public ApplicationStartupListener(SanctionsListCacheService sanctionsListCacheService) {
        this.sanctionsListCacheService = sanctionsListCacheService;
    }

    @EventListener(ContextRefreshedEvent.class)
    public void onApplicationStartup() {
        logger.info("Application started - initializing sanctions list cache");
        sanctionsListCacheService.initializeSanctionsList();
    }
}
