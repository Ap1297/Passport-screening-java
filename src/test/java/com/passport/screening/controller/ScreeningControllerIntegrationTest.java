package com.passport.screening.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.passport.screening.model.ScreeningResult;
import com.passport.screening.service.OCRService;
import com.passport.screening.service.SanctionsService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class ScreeningControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OCRService ocrService;

    @MockBean
    private SanctionsService sanctionsService;

    @Test
    public void testScreeningWithSanctionedNameFound() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "passport.pdf",
            "application/pdf",
            "fake pdf content".getBytes()
        );

        when(ocrService.extractTextFromFile(any())).thenReturn("PANCHAL ANKIT MUKESH");

        SanctionsService.ScreeningCheckResult sanctionResult = new SanctionsService.ScreeningCheckResult();
        sanctionResult.setSanctioned(true);
        SanctionsService.SanctionEntry entry = new SanctionsService.SanctionEntry();
        entry.setName("PANCHAL ANKIT MUKESH");
        sanctionResult.setEntries(List.of(entry));

        when(sanctionsService.checkSanctions("PANCHAL ANKIT MUKESH")).thenReturn(sanctionResult);

        MvcResult result = mockMvc.perform(multipart("/api/screening/check")
                .file(file)
                .contentType(MediaType.MULTIPART_FORM_DATA))
            .andExpect(status().isOk())
            .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        ScreeningResult response = objectMapper.readValue(responseBody, ScreeningResult.class);

        assertTrue("Response should show sanctioned=true", response.getSanctions().isSanctioned());
        assertFalse("Entries should not be empty", response.getSanctions().getEntries().isEmpty());
    }

    @Test
    public void testScreeningWithNoSanctionedNameFound() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "passport.pdf",
            "application/pdf",
            "fake pdf content".getBytes()
        );

        when(ocrService.extractTextFromFile(any())).thenReturn("JOHN DOE SMITH");

        SanctionsService.ScreeningCheckResult sanctionResult = new SanctionsService.ScreeningCheckResult();
        sanctionResult.setSanctioned(false);
        sanctionResult.setEntries(new ArrayList<>());

        when(sanctionsService.checkSanctions("JOHN DOE SMITH")).thenReturn(sanctionResult);

        MvcResult result = mockMvc.perform(multipart("/api/screening/check")
                .file(file)
                .contentType(MediaType.MULTIPART_FORM_DATA))
            .andExpect(status().isOk())
            .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        ScreeningResult response = objectMapper.readValue(responseBody, ScreeningResult.class);

        assertFalse("Response should show sanctioned=false", response.getSanctions().isSanctioned());
        assertTrue("Entries should be empty", response.getSanctions().getEntries().isEmpty());
    }

    @Test
    public void testScreeningResponseStructure() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "passport.pdf",
            "application/pdf",
            "fake pdf content".getBytes()
        );

        when(ocrService.extractTextFromFile(any())).thenReturn("TEST NAME");

        SanctionsService.ScreeningCheckResult sanctionResult = new SanctionsService.ScreeningCheckResult();
        sanctionResult.setSanctioned(false);
        sanctionResult.setEntries(new ArrayList<>());

        when(sanctionsService.checkSanctions("TEST NAME")).thenReturn(sanctionResult);

        MvcResult result = mockMvc.perform(multipart("/api/screening/check")
                .file(file)
                .contentType(MediaType.MULTIPART_FORM_DATA))
            .andExpect(status().isOk())
            .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        ScreeningResult response = objectMapper.readValue(responseBody, ScreeningResult.class);

        assertTrue("Should have confidence score", response.getConfidence() >= 0);
        assertTrue("Should have extracted_name", response.getExtractedName() != null);
        assertTrue("Should have processing_time", response.getProcessingTime() > 0);
        assertTrue("Should have sanctions object", response.getSanctions() != null);
    }
}
