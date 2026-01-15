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

    @Test
    public void testNameFoundInSanctionsList() {
        List<SanctionedIndividual> mockList = new ArrayList<>();
        SanctionedIndividual sanctionedIndividual = new SanctionedIndividual();
        sanctionedIndividual.setId("12345");
        sanctionedIndividual.setName("ABD AL-KHALIQ AL-HOUTHI na Name (original script): عبدالخالق الحوثي Title: na Designation: Huthi military commander");
        sanctionedIndividual.setCreatedDate(LocalDateTime.now());
        mockList.add(sanctionedIndividual);
        
        when(repository.findAll()).thenReturn(mockList);
        
        SanctionsService.ScreeningCheckResult result = sanctionsService.checkSanctions("ABD AL-KHALIQ AL-HOUTHI");
        assertTrue("Should find sanctioned individual in database", result.isSanctioned);
        assertFalse("Entries list should not be empty", result.entries.isEmpty());
    }

    @Test
    public void testAbdulRosyidNameMatching() {
        List<SanctionedIndividual> mockList = new ArrayList<>();
        SanctionedIndividual sanctionedIndividual = new SanctionedIndividual();
        sanctionedIndividual.setId("69692017c5d9cd2ab0257766");
        sanctionedIndividual.setName("ABDUL ROSYID RIDHO BA'ASYIR Title: na Designation: na DOB: 31 Jan. 1974 POB: Sukoharjo, Indonesia Good quality a.k.a.: a) Abdul Rosyid Ridho Bashir");
        sanctionedIndividual.setCreatedDate(LocalDateTime.now());
        mockList.add(sanctionedIndividual);
        
        when(repository.findAll()).thenReturn(mockList);
        
        SanctionsService.ScreeningCheckResult result = sanctionsService.checkSanctions("ABDUL ROSYID RIDHO BA'ASYIR");
        assertTrue("Should find ABDUL ROSYID RIDHO BA'ASYIR in sanctions list", result.isSanctioned);
        assertTrue("Should have at least one matching entry", result.entries.size() > 0);
    }

    @Test
    public void testPanchalAnkitMukeshNameMatching() {
        List<SanctionedIndividual> mockList = new ArrayList<>();
        SanctionedIndividual sanctionedIndividual = new SanctionedIndividual();
        sanctionedIndividual.setId("67890");
        sanctionedIndividual.setName("ANKIT MUKESH PANCHAL na Name (original): पंचाल अंकित");
        sanctionedIndividual.setCreatedDate(LocalDateTime.now());
        mockList.add(sanctionedIndividual);
        
        when(repository.findAll()).thenReturn(mockList);
        
        SanctionsService.ScreeningCheckResult result = sanctionsService.checkSanctions("ANKITMUKESHPANCHAL");
        assertTrue("Should find PANCHAL ANKIT MUKESH in sanctions list", result.isSanctioned);
        assertTrue("Should have at least one matching entry", result.entries.size() > 0);
    }

    @Test
    public void testPartialNameMatching() {
        List<SanctionedIndividual> mockList = new ArrayList<>();
        SanctionedIndividual sanctionedIndividual = new SanctionedIndividual();
        sanctionedIndividual.setId("54321");
        sanctionedIndividual.setName("ABDUL KHALIQ");
        sanctionedIndividual.setCreatedDate(LocalDateTime.now());
        mockList.add(sanctionedIndividual);
        
        when(repository.findAll()).thenReturn(mockList);
        
        SanctionsService.ScreeningCheckResult result = sanctionsService.checkSanctions("ABDUL KHALIQ");
        assertTrue("Should match partial name pattern", result.isSanctioned);
    }

    @Test
    public void testNoMatchReturnsFalse() {
        when(repository.findAll()).thenReturn(new ArrayList<>());
        
        SanctionsService.ScreeningCheckResult result = sanctionsService.checkSanctions("JOHNDOE");
        assertFalse("Name not in list should return not sanctioned", result.isSanctioned);
        assertTrue("Entries should be empty", result.entries.isEmpty());
    }

    @Test
    public void testNormalizedNameComparison() {
        List<SanctionedIndividual> mockList = new ArrayList<>();
        SanctionedIndividual sanctionedIndividual = new SanctionedIndividual();
        sanctionedIndividual.setId("99999");
        sanctionedIndividual.setName("MUHAMMAD HASSAN AL-ZAIDI");
        sanctionedIndividual.setCreatedDate(LocalDateTime.now());
        mockList.add(sanctionedIndividual);
        
        when(repository.findAll()).thenReturn(mockList);
        
        SanctionsService.ScreeningCheckResult result = sanctionsService.checkSanctions("MUHAMMADHASSAN");
        assertTrue("Should match normalized name without spaces", result.isSanctioned);
    }
}
