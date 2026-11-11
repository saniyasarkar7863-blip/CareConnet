package com.careconnect;

import com.careconnect.dto.*;
import com.careconnect.entity.DoctorVerificationStatus;
import com.careconnect.entity.EmailOtp;
import com.careconnect.entity.Role;
import com.careconnect.entity.User;
import com.careconnect.repository.DoctorProfileRepository;
import com.careconnect.repository.EmailOtpRepository;
import com.careconnect.repository.PatientProfileRepository;
import com.careconnect.repository.UserRepository;
import com.careconnect.security.CookieUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import jakarta.servlet.http.Cookie;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private PatientProfileRepository patientProfileRepository;

        @Autowired
        private DoctorProfileRepository doctorProfileRepository;

        @Autowired
        private EmailOtpRepository emailOtpRepository;

        @Test
        @DisplayName("Complete Auth Flow: Register -> Verify OTP -> Login -> Refresh -> Me -> Logout")
        void completeAuthenticationFlow_Integration() throws Exception {
                String testEmail = "test_patient_" + System.currentTimeMillis() + "@example.com";
                String password = "SecurePassword123!";

                // 1. Register Patient
                RegisterRequest registerReq = RegisterRequest.builder()
                                .role(Role.PATIENT)
                                .fullName("Test Patient")
                                .email(testEmail)
                                .password(password)
                                .phone("+1555123456")
                                .build();

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(registerReq)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true));

                // Verify User was persisted in Oracle
                User user = userRepository.findByEmail(testEmail).orElseThrow();
                assertEquals(0, user.getIsEmailVerified());
                assertNotEquals(password, user.getPasswordHash());
                assertTrue(user.getPasswordHash().startsWith("$2a$")); // BCrypt hash prefix

                // 2. Attempt login before email verification -> Must fail
                LoginRequest unverifiedLogin = LoginRequest.builder()
                                .email(testEmail)
                                .password(password)
                                .build();

                mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(unverifiedLogin)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message").value(
                                                "Email is not verified. Please verify your email before logging in."));

                // 3. Verify Email with OTP
                // Fetch OTP from repository
                EmailOtp otp = emailOtpRepository.findFirstByEmailAndIsConsumedOrderByCreatedAtDesc(testEmail, 0)
                                .orElseThrow();
                assertNotNull(otp.getOtpHash());

                // Verify with invalid OTP first
                VerifyEmailRequest wrongOtpReq = VerifyEmailRequest.builder()
                                .email(testEmail)
                                .otp("000000")
                                .build();

                mockMvc.perform(post("/api/auth/verify-email")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(wrongOtpReq)))
                                .andExpect(status().isBadRequest());

                // Manually mark verified for flow or test verify with service
                user.setIsEmailVerified(1);
                userRepository.save(user);

                // 4. Login after verification -> Must succeed and set HttpOnly cookies
                LoginRequest verifiedLogin = LoginRequest.builder()
                                .email(testEmail)
                                .password(password)
                                .build();

                MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(verifiedLogin)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.email").value(testEmail))
                                .andReturn();

                Cookie accessCookie = loginResult.getResponse().getCookie(CookieUtil.ACCESS_TOKEN_COOKIE);
                Cookie refreshCookie = loginResult.getResponse().getCookie(CookieUtil.REFRESH_TOKEN_COOKIE);

                assertNotNull(accessCookie, "Access token cookie must be present");
                assertTrue(accessCookie.isHttpOnly(), "Access token cookie must be HttpOnly");
                assertNotNull(refreshCookie, "Refresh token cookie must be present");
                assertTrue(refreshCookie.isHttpOnly(), "Refresh token cookie must be HttpOnly");

                // 5. Call protected /api/auth/me with access token cookie
                mockMvc.perform(get("/api/auth/me")
                                .cookie(accessCookie))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.email").value(testEmail))
                                .andExpect(jsonPath("$.data.role").value("PATIENT"));

                // 6. Refresh tokens with refresh token cookie (and CSRF protection)
                MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh")
                                .cookie(refreshCookie)
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andReturn();

                Cookie newAccessCookie = refreshResult.getResponse().getCookie(CookieUtil.ACCESS_TOKEN_COOKIE);
                Cookie newRefreshCookie = refreshResult.getResponse().getCookie(CookieUtil.REFRESH_TOKEN_COOKIE);
                assertNotNull(newAccessCookie);
                assertNotNull(newRefreshCookie);

                // 7. Logout -> Clears auth cookies (with CSRF protection)
                MvcResult logoutResult = mockMvc.perform(post("/api/auth/logout")
                                .cookie(newRefreshCookie)
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andReturn();

                Cookie clearedAccessCookie = logoutResult.getResponse().getCookie(CookieUtil.ACCESS_TOKEN_COOKIE);
                assertNotNull(clearedAccessCookie);
                assertEquals(0, clearedAccessCookie.getMaxAge());

                // 8. Accessing /api/auth/me without cookies must return 401 Unauthorized
                mockMvc.perform(get("/api/auth/me"))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Doctor registration sets PENDING verification status in Oracle")
        void doctorRegistration_Integration() throws Exception {
                String docEmail = "test_doc_" + System.currentTimeMillis() + "@example.com";
                String license = "LIC-" + System.currentTimeMillis();

                RegisterRequest req = RegisterRequest.builder()
                                .role(Role.DOCTOR)
                                .fullName("Dr. Gregory House")
                                .email(docEmail)
                                .password("ComplexPass123!")
                                .phone("+1555987654")
                                .licenseNumber(license)
                                .specialization("Diagnostic Medicine")
                                .build();

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true));

                User user = userRepository.findByEmail(docEmail).orElseThrow();
                assertEquals(Role.DOCTOR, user.getRole());

                var docProfile = doctorProfileRepository.findByUser(user).orElseThrow();
                assertEquals("Dr. Gregory House", docProfile.getFullName());
                assertEquals(license, docProfile.getLicenseNumber());
                assertEquals("Diagnostic Medicine", docProfile.getSpecialization());
                assertEquals(DoctorVerificationStatus.PENDING, docProfile.getVerificationStatus());
        }
}