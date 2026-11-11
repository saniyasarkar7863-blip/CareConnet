package com.careconnect;

import com.careconnect.dto.*;
import com.careconnect.entity.*;
import com.careconnect.exception.BadRequestException;
import com.careconnect.exception.ConflictException;
import com.careconnect.exception.UnauthorizedException;
import com.careconnect.repository.*;
import com.careconnect.security.CookieUtil;
import com.careconnect.security.JwtService;
import com.careconnect.service.AuthService;
import com.careconnect.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

        @Mock
        private UserRepository userRepository;

        @Mock
        private PatientProfileRepository patientProfileRepository;

        @Mock
        private DoctorProfileRepository doctorProfileRepository;

        @Mock
        private EmailOtpRepository emailOtpRepository;

        @Mock
        private RefreshTokenRepository refreshTokenRepository;

        @Mock
        private JwtService jwtService;

        @Mock
        private CookieUtil cookieUtil;

        @Mock
        private EmailService emailService;

        @Mock
        private HttpServletRequest request;

        @Mock
        private HttpServletResponse response;

        private PasswordEncoder passwordEncoder;
        private AuthService authService;

        @BeforeEach
        void setUp() {
                passwordEncoder = new BCryptPasswordEncoder(12);
                authService = new AuthService(
                                userRepository,
                                patientProfileRepository,
                                doctorProfileRepository,
                                emailOtpRepository,
                                refreshTokenRepository,
                                passwordEncoder,
                                jwtService,
                                cookieUtil,
                                emailService);

                ReflectionTestUtils.setField(authService, "otpExpirationMinutes", 5);
                ReflectionTestUtils.setField(authService, "otpResendIntervalSeconds", 60);
                ReflectionTestUtils.setField(authService, "otpMaxAttempts", 5);
                ReflectionTestUtils.setField(authService, "refreshTokenExpirationSeconds", 604800L);
        }

        @Test
        @DisplayName("Patient registration should hash password with BCrypt and save unverified user")
        void registerPatient_ShouldHashPasswordAndSaveUser() {
                RegisterRequest req = RegisterRequest.builder()
                                .role(Role.PATIENT)
                                .fullName("Alice Wonderland")
                                .email("alice@example.com")
                                .password("PlainPassword123!")
                                .phone("+1234567890")
                                .build();

                when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
                when(userRepository.save(any(User.class))).thenAnswer(i -> {
                        User u = i.getArgument(0);
                        u.setUserId(10L);
                        return u;
                });

                ApiResponse<String> res = authService.register(req);

                assertTrue(res.isSuccess());

                ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
                verify(userRepository).save(userCaptor.capture());
                User savedUser = userCaptor.getValue();

                assertEquals("alice@example.com", savedUser.getEmail());
                assertEquals(Role.PATIENT, savedUser.getRole());
                assertEquals(0, savedUser.getIsEmailVerified());
                assertNotEquals("PlainPassword123!", savedUser.getPasswordHash());
                assertTrue(passwordEncoder.matches("PlainPassword123!", savedUser.getPasswordHash()));

                verify(patientProfileRepository).save(any(PatientProfile.class));
                verify(emailOtpRepository).save(any(EmailOtp.class));
        }

        @Test
        @DisplayName("Doctor registration should set verification_status to PENDING")
        void registerDoctor_ShouldSetVerificationStatusPending() {
                RegisterRequest req = RegisterRequest.builder()
                                .role(Role.DOCTOR)
                                .fullName("Dr. Gregory House")
                                .email("house@example.com")
                                .password("Diagnostics123!")
                                .phone("+1987654321")
                                .licenseNumber("MED-88990")
                                .specialization("Infectious Diseases")
                                .build();

                when(userRepository.existsByEmail("house@example.com")).thenReturn(false);
                when(doctorProfileRepository.existsByLicenseNumber("MED-88990")).thenReturn(false);
                when(userRepository.save(any(User.class))).thenAnswer(i -> {
                        User u = i.getArgument(0);
                        u.setUserId(20L);
                        return u;
                });

                ApiResponse<String> res = authService.register(req);

                assertTrue(res.isSuccess());

                ArgumentCaptor<DoctorProfile> docCaptor = ArgumentCaptor.forClass(DoctorProfile.class);
                verify(doctorProfileRepository).save(docCaptor.capture());
                DoctorProfile savedDoctor = docCaptor.getValue();

                assertEquals("Dr. Gregory House", savedDoctor.getFullName());
                assertEquals("MED-88990", savedDoctor.getLicenseNumber());
                assertEquals(DoctorVerificationStatus.PENDING, savedDoctor.getVerificationStatus());
        }

        @Test
        @DisplayName("Public registration should reject privileged roles like ADMIN")
        void register_ShouldRejectAdminRole() {
                RegisterRequest req = RegisterRequest.builder()
                                .role(Role.ADMIN)
                                .fullName("Admin User")
                                .email("admin@example.com")
                                .password("AdminPass123!")
                                .phone("+1112223333")
                                .build();

                BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(req));
                assertTrue(ex.getMessage().contains("Public registration is only permitted for PATIENT and DOCTOR"));
        }

        @Test
        @DisplayName("Registration should reject duplicate email")
        void register_ShouldRejectDuplicateEmail() {
                RegisterRequest req = RegisterRequest.builder()
                                .role(Role.PATIENT)
                                .fullName("Bob")
                                .email("bob@example.com")
                                .password("Password123!")
                                .phone("+1234567890")
                                .build();

                when(userRepository.existsByEmail("bob@example.com")).thenReturn(true);

                ConflictException ex = assertThrows(ConflictException.class, () -> authService.register(req));
                assertEquals("An account with this email already exists.", ex.getMessage());
        }

        @Test
        @DisplayName("Email verification should succeed with correct OTP and mark user verified")
        void verifyEmail_ShouldSucceedWithCorrectOtp() {
                String email = "verify@example.com";
                String otpRaw = "654321";

                // Calculate expected hash
                String hash = ReflectionTestUtils.invokeMethod(authService, "hashSha256", otpRaw, email);

                EmailOtp otp = EmailOtp.builder()
                                .otpId(1L)
                                .email(email)
                                .otpHash(hash)
                                .expiresAt(LocalDateTime.now().plusMinutes(5))
                                .attempts(0)
                                .isConsumed(0)
                                .build();

                User user = User.builder()
                                .userId(1L)
                                .email(email)
                                .isEmailVerified(0)
                                .build();

                when(emailOtpRepository.findFirstByEmailAndIsConsumedOrderByCreatedAtDesc(email, 0))
                                .thenReturn(Optional.of(otp));
                when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

                VerifyEmailRequest req = VerifyEmailRequest.builder()
                                .email(email)
                                .otp(otpRaw)
                                .build();

                ApiResponse<String> res = authService.verifyEmail(req);

                assertTrue(res.isSuccess());
                assertEquals(1, otp.getIsConsumed());
                assertEquals(1, user.getIsEmailVerified());
                verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Email verification should fail and increment attempts on wrong OTP")
        void verifyEmail_ShouldFailOnWrongOtp() {
                String email = "verify@example.com";
                EmailOtp otp = EmailOtp.builder()
                                .otpId(1L)
                                .email(email)
                                .otpHash("some_other_hash")
                                .expiresAt(LocalDateTime.now().plusMinutes(5))
                                .attempts(1)
                                .isConsumed(0)
                                .build();

                when(emailOtpRepository.findFirstByEmailAndIsConsumedOrderByCreatedAtDesc(email, 0))
                                .thenReturn(Optional.of(otp));

                VerifyEmailRequest req = VerifyEmailRequest.builder()
                                .email(email)
                                .otp("111111")
                                .build();

                BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.verifyEmail(req));
                assertEquals("Invalid verification code. Please try again.", ex.getMessage());
                assertEquals(2, otp.getAttempts());
                verify(emailOtpRepository).save(otp);
        }

        @Test
        @DisplayName("Login should reject unverified users")
        void login_ShouldRejectUnverifiedUser() {
                String email = "unverified@example.com";
                User user = User.builder()
                                .userId(5L)
                                .email(email)
                                .passwordHash(passwordEncoder.encode("Secret123!"))
                                .role(Role.PATIENT)
                                .isActive(1)
                                .isEmailVerified(0) // Not verified
                                .build();

                when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

                LoginRequest req = LoginRequest.builder()
                                .email(email)
                                .password("Secret123!")
                                .build();

                BadRequestException ex = assertThrows(BadRequestException.class,
                                () -> authService.login(req, response));
                assertTrue(ex.getMessage().contains("Email is not verified"));
        }

        @Test
        @DisplayName("Login should succeed for verified user and set cookies")
        void login_ShouldSucceedForVerifiedUser() {
                String email = "verified@example.com";
                User user = User.builder()
                                .userId(5L)
                                .email(email)
                                .passwordHash(passwordEncoder.encode("Secret123!"))
                                .role(Role.PATIENT)
                                .isActive(1)
                                .isEmailVerified(1) // Verified
                                .build();

                when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
                when(jwtService.generateAccessToken(user)).thenReturn("jwt.access.token");
                when(jwtService.getAccessTokenExpirationMs()).thenReturn(900000L);

                LoginRequest req = LoginRequest.builder()
                                .email(email)
                                .password("Secret123!")
                                .build();

                ApiResponse<UserResponse> res = authService.login(req, response);

                assertTrue(res.isSuccess());
                verify(cookieUtil).addAccessTokenCookie(eq(response), eq("jwt.access.token"), eq(900L));
                verify(cookieUtil).addRefreshTokenCookie(eq(response), any(String.class), eq(604800L));
                verify(refreshTokenRepository).save(any(RefreshToken.class));
        }

        @Test
        @DisplayName("Refresh token reuse should trigger revocation of all user tokens")
        void refreshToken_ShouldDetectReuseAndRevokeAll() {
                String rawToken = "compromised-token";
                String tokenHash = ReflectionTestUtils.invokeMethod(authService, "hashSha256", rawToken,
                                "careconnect_refresh_salt");

                RefreshToken revokedToken = RefreshToken.builder()
                                .tokenId(1L)
                                .userId(42L)
                                .tokenHash(tokenHash)
                                .isRevoked(1) // Already revoked
                                .expiresAt(LocalDateTime.now().plusDays(1))
                                .build();

                when(cookieUtil.extractCookieValue(request, CookieUtil.REFRESH_TOKEN_COOKIE)).thenReturn(rawToken);
                when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(revokedToken));

                UnauthorizedException ex = assertThrows(UnauthorizedException.class,
                                () -> authService.refreshToken(request, response));
                assertTrue(ex.getMessage().toLowerCase().contains("token reuse detected"));

                verify(refreshTokenRepository).revokeAllByUserId(42L);
                verify(cookieUtil).clearAuthCookies(response);
        }
}