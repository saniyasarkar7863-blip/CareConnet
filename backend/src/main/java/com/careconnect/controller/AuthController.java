package com.careconnect.controller;

import com.careconnect.dto.*;
import com.careconnect.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Unified registration endpoint for PATIENT and DOCTOR roles.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest request) {
        ApiResponse<String> response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Verify email with 6-digit OTP.
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        ApiResponse<String> response = authService.verifyEmail(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Resend verification OTP (rate limited to once every 60s).
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<String>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        ApiResponse<String> response = authService.resendOtp(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Authenticate user with verified email.
     * Issues access token and refresh token as HttpOnly cookies.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(@Valid @RequestBody LoginRequest request,
                                                           HttpServletResponse response) {
        ApiResponse<UserResponse> authResponse = authService.login(request, response);
        return ResponseEntity.ok(authResponse);
    }

    /**
     * Rotates refresh token and issues a new access token via HttpOnly cookies.
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<UserResponse>> refresh(HttpServletRequest request,
                                                             HttpServletResponse response) {
        ApiResponse<UserResponse> refreshResponse = authService.refreshToken(request, response);
        return ResponseEntity.ok(refreshResponse);
    }

    /**
     * Revokes active refresh token and clears HttpOnly authentication cookies.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request,
                                                      HttpServletResponse response) {
        ApiResponse<String> logoutResponse = authService.logout(request, response);
        return ResponseEntity.ok(logoutResponse);
    }

    /**
     * Returns profile details for the currently authenticated user.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        ApiResponse<UserResponse> userResponse = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(userResponse);
    }

    /**
     * Returns CSRF token info for SPA clients.
     */
    @GetMapping("/csrf")
    public ResponseEntity<Map<String, String>> getCsrfToken(CsrfToken csrfToken) {
        if (csrfToken != null) {
            return ResponseEntity.ok(Map.of(
                    "token", csrfToken.getToken(),
                    "headerName", csrfToken.getHeaderName(),
                    "parameterName", csrfToken.getParameterName()
            ));
        }
        return ResponseEntity.ok(Map.of());
    }
}

