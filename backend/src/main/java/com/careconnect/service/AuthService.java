package com.careconnect.service;

import com.careconnect.dto.*;
import com.careconnect.entity.*;
import com.careconnect.exception.BadRequestException;
import com.careconnect.exception.ConflictException;
import com.careconnect.exception.UnauthorizedException;
import com.careconnect.repository.*;
import com.careconnect.security.CookieUtil;
import com.careconnect.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final EmailOtpRepository emailOtpRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CookieUtil cookieUtil;
    private final EmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${careconnect.otp.expiration-minutes:5}")
    private int otpExpirationMinutes;

    @Value("${careconnect.otp.resend-interval-seconds:60}")
    private int otpResendIntervalSeconds;

    @Value("${careconnect.otp.max-attempts:5}")
    private int otpMaxAttempts;

    @Value("${careconnect.jwt.refresh-token-expiration-seconds:604800}") // 7 days
    private long refreshTokenExpirationSeconds;

    @Transactional
    public ApiResponse<String> register(RegisterRequest req) {
        if (req.getRole() == null) {
            throw new BadRequestException("Role is required. Choose PATIENT or DOCTOR.");
        }
        if (req.getRole() != Role.PATIENT && req.getRole() != Role.DOCTOR) {
            throw new BadRequestException("Public registration is only permitted for PATIENT and DOCTOR roles.");
        }

        if (req.getRole() == Role.PATIENT) {
            return registerPatient(RegisterPatientRequest.builder()
                    .fullName(req.getFullName())
                    .email(req.getEmail())
                    .password(req.getPassword())
                    .phone(req.getPhone())
                    .build());
        } else {
            if (req.getLicenseNumber() == null || req.getLicenseNumber().trim().isEmpty()) {
                throw new BadRequestException("Medical license number is required for doctor registration.");
            }
            if (req.getSpecialization() == null || req.getSpecialization().trim().isEmpty()) {
                throw new BadRequestException("Specialization is required for doctor registration.");
            }
            return registerDoctor(RegisterDoctorRequest.builder()
                    .fullName(req.getFullName())
                    .email(req.getEmail())
                    .password(req.getPassword())
                    .phone(req.getPhone())
                    .licenseNumber(req.getLicenseNumber())
                    .specialization(req.getSpecialization())
                    .build());
        }
    }

    @Transactional
    public ApiResponse<String> registerPatient(RegisterPatientRequest req) {
        String email = normalizeEmail(req.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("An account with this email already exists.");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(Role.PATIENT)
                .isActive(1)
                .isEmailVerified(0)
                .build();
        User savedUser = userRepository.save(user);

        PatientProfile profile = PatientProfile.builder()
                .user(savedUser)
                .fullName(req.getFullName().trim())
                .phone(req.getPhone().trim())
                .build();
        patientProfileRepository.save(profile);

        boolean emailSent = generateAndSendOtp(email);

        String message = "Registration successful. Please verify your email with the 6-digit OTP sent to your inbox." +
                (emailSent ? ""
                        : " (Note: SMTP not configured on server. See server logs for configuration guidance.)");

        return ApiResponse.ok(message, email);
    }

    @Transactional
    public ApiResponse<String> registerDoctor(RegisterDoctorRequest req) {
        String email = normalizeEmail(req.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("An account with this email already exists.");
        }

        if (doctorProfileRepository.existsByLicenseNumber(req.getLicenseNumber().trim())) {
            throw new ConflictException("A doctor with this medical license number is already registered.");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(Role.DOCTOR)
                .isActive(1)
                .isEmailVerified(0)
                .build();
        User savedUser = userRepository.save(user);

        DoctorProfile profile = DoctorProfile.builder()
                .user(savedUser)
                .fullName(req.getFullName().trim())
                .specialization(req.getSpecialization().trim())
                .licenseNumber(req.getLicenseNumber().trim())
                .phone(req.getPhone().trim())
                .verificationStatus(DoctorVerificationStatus.PENDING)
                .build();
        doctorProfileRepository.save(profile);

        boolean emailSent = generateAndSendOtp(email);

        String message = "Doctor registration successful. Please verify your email with the 6-digit OTP." +
                (emailSent ? ""
                        : " (Note: SMTP not configured on server. See server logs for configuration guidance.)");

        return ApiResponse.ok(message, email);
    }

    @Transactional
    public ApiResponse<String> verifyEmail(VerifyEmailRequest req) {
        String email = normalizeEmail(req.getEmail());

        EmailOtp otp = emailOtpRepository.findFirstByEmailAndIsConsumedOrderByCreatedAtDesc(email, 0)
                .orElseThrow(() -> new BadRequestException(
                        "No active verification code found for this email. Please request a new one."));

        if (otp.isAlreadyConsumed()) {
            throw new BadRequestException("This verification code has already been used. Please request a new code.");
        }

        if (otp.isExpired()) {
            otp.setIsConsumed(1);
            emailOtpRepository.save(otp);
            throw new BadRequestException("Verification code has expired. Please request a new code.");
        }

        if (otp.getAttempts() >= otpMaxAttempts) {
            otp.setIsConsumed(1);
            emailOtpRepository.save(otp);
            throw new BadRequestException("Maximum verification attempts reached. Please request a new code.");
        }

        otp.setAttempts(otp.getAttempts() + 1);

        String inputHash = hashSha256(req.getOtp().trim(), email);
        if (!inputHash.equals(otp.getOtpHash())) {
            emailOtpRepository.save(otp);
            throw new BadRequestException("Invalid verification code. Please try again.");
        }

        // OTP is valid
        otp.setIsConsumed(1);
        emailOtpRepository.save(otp);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User account not found."));
        user.setIsEmailVerified(1);
        userRepository.save(user);

        return ApiResponse.ok("Email successfully verified. You may now log in.");
    }

    @Transactional
    public ApiResponse<String> resendOtp(ResendOtpRequest req) {
        String email = normalizeEmail(req.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No account found with this email address."));

        if (user.isVerified()) {
            throw new BadRequestException("Your email is already verified. You can log in directly.");
        }

        // Rate limiting check
        emailOtpRepository.findFirstByEmailAndIsConsumedOrderByCreatedAtDesc(email, 0).ifPresent(lastOtp -> {
            long secondsSince = Duration.between(lastOtp.getCreatedAt(), LocalDateTime.now()).getSeconds();
            if (secondsSince < otpResendIntervalSeconds) {
                long waitTime = otpResendIntervalSeconds - secondsSince;
                throw new BadRequestException("Please wait " + waitTime + " seconds before requesting another code.");
            }
        });

        // Invalidate older OTPs
        List<EmailOtp> oldOtps = emailOtpRepository.findAllByEmailAndIsConsumed(email, 0);
        for (EmailOtp o : oldOtps) {
            o.setIsConsumed(1);
        }
        emailOtpRepository.saveAll(oldOtps);

        boolean emailSent = generateAndSendOtp(email);

        String message = "A new verification code has been generated and sent." +
                (emailSent ? "" : " (Note: SMTP not configured on server.)");

        return ApiResponse.ok(message);
    }

    @Transactional
    public ApiResponse<UserResponse> login(LoginRequest req, HttpServletResponse response) {
        String email = normalizeEmail(req.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (!user.isAccountActive()) {
            throw new UnauthorizedException("Account is deactivated. Please contact support.");
        }

        if (!user.isVerified()) {
            throw new BadRequestException("Email is not verified. Please verify your email before logging in.");
        }

        // Issue Access Token
        String accessToken = jwtService.generateAccessToken(user);
        cookieUtil.addAccessTokenCookie(response, accessToken, jwtService.getAccessTokenExpirationMs() / 1000);

        // Issue Refresh Token
        String rawRefreshToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String tokenHash = hashSha256(rawRefreshToken, "careconnect_refresh_salt");

        RefreshToken rt = RefreshToken.builder()
                .userId(user.getUserId())
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpirationSeconds))
                .isRevoked(0)
                .build();
        refreshTokenRepository.save(rt);

        cookieUtil.addRefreshTokenCookie(response, rawRefreshToken, refreshTokenExpirationSeconds);

        UserResponse userResponse = buildUserResponse(user);
        return ApiResponse.ok("Login successful.", userResponse);
    }

    @Transactional
    public ApiResponse<UserResponse> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String rawRefreshToken = cookieUtil.extractCookieValue(request, CookieUtil.REFRESH_TOKEN_COOKIE);
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new UnauthorizedException("Refresh token is missing. Please log in.");
        }

        String tokenHash = hashSha256(rawRefreshToken, "careconnect_refresh_salt");
        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token. Please log in again."));

        // Refresh token reuse detection
        if (token.getIsRevoked() != null && token.getIsRevoked() == 1) {
            log.warn("Detected reuse of revoked refresh token for userId: {}. Revoking all user sessions.",
                    token.getUserId());
            refreshTokenRepository.revokeAllByUserId(token.getUserId());
            cookieUtil.clearAuthCookies(response);
            throw new UnauthorizedException("Security violation: Revoked token reuse detected. Please log in again.");
        }

        if (token.isExpired()) {
            token.setIsRevoked(1);
            refreshTokenRepository.save(token);
            cookieUtil.clearAuthCookies(response);
            throw new UnauthorizedException("Session expired. Please log in again.");
        }

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new UnauthorizedException("User not found or deleted."));

        if (!user.isAccountActive()) {
            cookieUtil.clearAuthCookies(response);
            throw new UnauthorizedException("User account is inactive.");
        }

        // Token rotation: Issue new refresh token and invalidate old one
        String newRawRefreshToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String newTokenHash = hashSha256(newRawRefreshToken, "careconnect_refresh_salt");

        token.setIsRevoked(1);
        token.setReplacedByHash(newTokenHash);
        refreshTokenRepository.save(token);

        RefreshToken newToken = RefreshToken.builder()
                .userId(user.getUserId())
                .tokenHash(newTokenHash)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpirationSeconds))
                .isRevoked(0)
                .build();
        refreshTokenRepository.save(newToken);

        // Issue new access token
        String newAccessToken = jwtService.generateAccessToken(user);
        cookieUtil.addAccessTokenCookie(response, newAccessToken, jwtService.getAccessTokenExpirationMs() / 1000);
        cookieUtil.addRefreshTokenCookie(response, newRawRefreshToken, refreshTokenExpirationSeconds);

        UserResponse userResponse = buildUserResponse(user);
        return ApiResponse.ok("Session refreshed successfully.", userResponse);
    }

    @Transactional
    public ApiResponse<String> logout(HttpServletRequest request, HttpServletResponse response) {
        String rawRefreshToken = cookieUtil.extractCookieValue(request, CookieUtil.REFRESH_TOKEN_COOKIE);
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            String tokenHash = hashSha256(rawRefreshToken, "careconnect_refresh_salt");
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
                token.setIsRevoked(1);
                refreshTokenRepository.save(token);
            });
        }

        cookieUtil.clearAuthCookies(response);
        return ApiResponse.ok("Logout successful.");
    }

    @Transactional(readOnly = true)
    public ApiResponse<UserResponse> getCurrentUser(String email) {
        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("User not found."));

        return ApiResponse.ok("User retrieved successfully.", buildUserResponse(user));
    }

    // ── Helper methods ──

    private boolean generateAndSendOtp(String email) {
        // Secure 6-digit number between 100000 and 999999
        int code = 100000 + secureRandom.nextInt(900000);
        String rawOtp = String.valueOf(code);

        String otpHash = hashSha256(rawOtp, email);

        EmailOtp otp = EmailOtp.builder()
                .email(email)
                .otpHash(otpHash)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes))
                .attempts(0)
                .isConsumed(0)
                .build();
        emailOtpRepository.save(otp);

        return emailService.sendOtpEmail(email, rawOtp);
    }

    private UserResponse buildUserResponse(User user) {
        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .role(user.getRole())
                .emailVerified(user.isVerified());

        if (user.getRole() == Role.PATIENT) {
            patientProfileRepository.findByUser(user).ifPresent(p -> {
                builder.fullName(p.getFullName());
                builder.phone(p.getPhone());
            });
        } else if (user.getRole() == Role.DOCTOR) {
            doctorProfileRepository.findByUser(user).ifPresent(d -> {
                builder.fullName(d.getFullName());
                builder.phone(d.getPhone());
                builder.specialization(d.getSpecialization());
                builder.licenseNumber(d.getLicenseNumber());
                builder.doctorVerificationStatus(d.getVerificationStatus());
            });
        }

        return builder.build();
    }

    private String normalizeEmail(String email) {
        if (email == null)
            return "";
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String hashSha256(String input, String salt) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt.getBytes(StandardCharsets.UTF_8));
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}