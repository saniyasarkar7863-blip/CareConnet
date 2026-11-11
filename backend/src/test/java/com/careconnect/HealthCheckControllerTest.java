package com.careconnect;

import com.careconnect.controller.HealthCheckController;
import com.careconnect.dto.HealthCheckResponse;
import com.careconnect.security.CookieUtil;
import com.careconnect.security.JwtAuthenticationFilter;
import com.careconnect.security.JwtService;
import com.careconnect.service.HealthCheckService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * HealthCheck Controller Test
 */
@WebMvcTest(HealthCheckController.class)
@AutoConfigureMockMvc(addFilters = false)
class HealthCheckControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HealthCheckService healthCheckService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private CookieUtil cookieUtil;

    @Test
    @DisplayName("GET /api/health should return HTTP 200 with status UP")
    void healthCheck_ShouldReturnStatusUp() throws Exception {
        HealthCheckResponse mockResponse = new HealthCheckResponse(
                "UP",
                "CareConnect backend is running successfully",
                "CareConnect — Unified Digital Healthcare Platform",
                "1.0.0",
                "Oracle FREEPDB1 — connected");
        when(healthCheckService.getHealth()).thenReturn(mockResponse);

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.message").value("CareConnect backend is running successfully"))
                .andExpect(jsonPath("$.version").value("1.0.0"));
    }
}
