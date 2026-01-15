package com.passport.screening.service;

import com.passport.screening.model.SanctionedIndividual;
import com.passport.screening.repository.SanctionedIndividualRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.when;

@RunWith(SpringRunner.class)
@SpringBootTest
public class SanctionsServiceTest {
    
    @Autowired
    private SanctionsService sanctionsService;
    
    @MockBean
    private SanctionedIndividualRepository repository;
    
    @MockBean
    private SanctionsListCacheService cacheService;

    

    @Test
    public void testEmptyNameCheckReturnsNotSanctioned() {
        SanctionsService.ScreeningCheckResult result = sanctionsService.checkSanctions("");
        assertFalse("Empty name should return not sanctioned", result.isSanctioned);
    }

    @Test
    public void testNullNameCheckReturnsNotSanctioned() {
        SanctionsService.ScreeningCheckResult result = sanctionsService.checkSanctions(null);
        assertFalse("Null name should return not sanctioned", result.isSanctioned);
    }

    
}
