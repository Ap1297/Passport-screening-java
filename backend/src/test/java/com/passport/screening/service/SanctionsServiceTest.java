package com.passport.screening.service;

import com.passport.screening.model.SanctionedIndividual;
import com.passport.screening.repository.SanctionedIndividualRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Sanctions Service Tests")
public class SanctionsServiceTest {

    @Mock
    private SanctionedIndividualRepository repository;

    @Mock
    private SanctionsListCacheService cacheService;

    private SanctionsService sanctionsService;

    @BeforeEach
    void setUp() {
        sanctionsService = new SanctionsService(repository, cacheService);
    }

    @Test
    @DisplayName("Should detect sanctioned individual")
    void testDetectSanctionedIndividual() {
        // Setup
        SanctionedIndividual individual = new SanctionedIndividual();
        individual.setId("1");
        individual.setName("AHMED HASSAN");
        individual.setListType("UN_CONSOLIDATED");
        individual.setDesignation("Terrorist");
        individual.setIsActive(true);

        when(repository.searchActiveSanctionedIndividuals("ahmed hassan"))
            .thenReturn(Arrays.asList(individual));

        // Execute
        SanctionsService.ScreeningCheckResult result = sanctionsService.checkSanctions("AHMED HASSAN");

        // Assert
        assertTrue(result.isSanctioned);
        assertEquals(1, result.entries.size());
        assertEquals("AHMED HASSAN", result.entries.get(0).name);

        verify(repository, times(1)).searchActiveSanctionedIndividuals("ahmed hassan");
    }

    @Test
    @DisplayName("Should return no match for clean individual")
    void testCleanIndividual() {
        when(repository.searchActiveSanctionedIndividuals("john doe"))
            .thenReturn(Collections.emptyList());

        SanctionsService.ScreeningCheckResult result = sanctionsService.checkSanctions("JOHN DOE");

        assertFalse(result.isSanctioned);
        assertEquals(0, result.entries.size());
    }

    @Test
    @DisplayName("Should handle null input safely")
    void testHandleNullInput() {
        SanctionsService.ScreeningCheckResult result = sanctionsService.checkSanctions(null);

        assertFalse(result.isSanctioned);
        assertEquals(0, result.entries.size());
    }

    @Test
    @DisplayName("Should normalize names correctly")
    void testNameNormalization() {
        SanctionedIndividual individual = new SanctionedIndividual();
        individual.setName("José García-López");
        individual.setIsActive(true);

        when(repository.searchActiveSanctionedIndividuals("jose garcia lopez"))
            .thenReturn(Arrays.asList(individual));

        SanctionsService.ScreeningCheckResult result = sanctionsService.checkSanctions("José García-López");

        assertTrue(result.isSanctioned);
    }
}
