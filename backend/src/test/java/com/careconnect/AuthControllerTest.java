package com.careconnect;

import com.careconnect.controller.AuthController;
import com.careconnect.dto.*;
import com.careconnect.entity.DoctorVerificationStatus;
import com.careconnect.entity.Role;
import com.careconnect.exception.BadRequestException;
import com.careconnect.exception.ConflictException;
import com.careconnect.exception.GlobalExceptionHandler;
import com.careconnect.exception.UnauthorizedException;
import com.careconnect.security.CookieUtil;
import com.careconnect.security.JwtAuthenticationFilter;
import com.careconnect.security.JwtService;
import com.careconnect.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private CookieUtil cookieUtil;

    @Test
    @DisplayName("POST /api/auth/register should return 201 Created for valid patient registration")
    void registerPatient_ShouldReturnCreated() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .role(Role.PATIENT)
                .fullName("John Doe")
                .email("john.doe@example.com")
                .password("StrongPassword123!")
                .phone("+1234567890")
                .build();

        when(authService.register(any(RegisterRequest.class)))
                .thenReturn(ApiResponse.ok("Registration successful. Please verify your email.", "john.doe@example.com"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Registration successful. Please verify your email."));
    }

    @Test
    @DisplayName("POST /api/auth/register should return 409 Conflict when email already exists")
    void register_ShouldReturnConflict_WhenEmailExists() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .role(Role.PATIENT)
                .fullName("John Doe")
                .email("existing@example.com")
                .password("StrongPassword123!")
                .phone("+1234567890")
                .build();

        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new ConflictException("An account with this email already exists."));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("An account with this email already exists."));
    }

    @Test
    @DisplayName("POST /api/auth/register should return 400 Bad Request when password is under 8 characters")
    void register_ShouldReturnBadRequest_WhenPasswordShort() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .role(Role.PATIENT)
                .fullName("John Doe")
                .email("john.doe@example.com")
                .password("short")
                .phone("+1234567890")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors.password").exists());
    }

    @Test
    @DisplayName("POST /api/auth/verify-email should return 200 when OTP is correct")
    void verifyEmail_ShouldReturnOk() throws Exception {
        VerifyEmailRequest req = VerifyEmailRequest.builder()
                .email("john.doe@example.com")
                .otp("123456")
                .build();

        when(authService.verifyEmail(any(VerifyEmailRequest.class)))
                .thenReturn(ApiResponse.ok("Email successfully verified. You may now log in."));

        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Email successfully verified. You may now log in."));
    }

    @Test
    @DisplayName("POST /api/auth/verify-email should return 400 when OTP is invalid")
    void verifyEmail_ShouldReturnBadRequest_WhenOtpInvalid() throws Exception {
        VerifyEmailRequest req = VerifyEmailRequest.builder()
                .email("john.doe@example.com")
                .otp("000000")
                .build();

        when(authService.verifyEmail(any(VerifyEmailRequest.class)))
                .thenThrow(new BadRequestException("Invalid verification code. Please try again."));

        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Invalid verification code. Please try again."));
    }

    @Test
    @DisplayName("POST /api/auth/login should return 200 and UserResponse on valid credentials")
    void login_ShouldReturnUserResponse() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .email("doctor@example.com")
                .password("SecretPassword123!")
                .build();

        UserResponse userResponse = UserResponse.builder()
                .userId(1L)
                .email("doctor@example.com")
                .fullName("Dr. Sarah Smith")
                .role(Role.DOCTOR)
                .emailVerified(true)
                .doctorVerificationStatus(DoctorVerificationStatus.PENDING)
                .specialization("Cardiology")
                .licenseNumber("MED-12345")
                .build();

        when(authService.login(any(LoginRequest.class), any()))
                .thenReturn(ApiResponse.ok("Login successful.", userResponse));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("doctor@example.com"))
                .andExpect(jsonPath("$.data.role").value("DOCTOR"))
                .andExpect(jsonPath("$.data.doctorVerificationStatus").value("PENDING"));
    }

    @Test
    @DisplayName("POST /api/auth/login should return 401 when password is wrong")
    void login_ShouldReturnUnauthorized_WhenWrongPassword() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .email("doctor@example.com")
                .password("WrongPassword")
                .build();

        when(authService.login(any(LoginRequest.class), any()))
                .thenThrow(new UnauthorizedException("Invalid email or password."));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }

    @Test
    @DisplayName("POST /api/auth/logout should return 200 Ok")
    void logout_ShouldReturnOk() throws Exception {
        when(authService.logout(any(), any())).thenReturn(ApiResponse.ok("Logout successful."));

        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Logout successful."));
    }
}

