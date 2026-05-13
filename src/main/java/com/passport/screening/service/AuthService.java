package com.passport.screening.service;

import com.passport.screening.model.User;
import com.passport.screening.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            CustomUserDetailsService userDetailsService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (request.getMobile() != null && userRepository.existsByMobile(request.getMobile())) {
            throw new RuntimeException("Mobile number already registered");
        }

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword())
        );
        user.setMobile(request.getMobile());

        userRepository.save(user);
        logger.info("New user registered: {}", user.getUsername());

        return new RegisterResponse("Registration successful", user.getUsername());
    }

    public OtpResponse sendOtp(String mobile) {
        User user = userRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("Mobile number not registered"));

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        // In production, integrate with SMS gateway (Twilio, AWS SNS, etc.)
        logger.info("OTP generated for mobile {}: {} (In production, this would be sent via SMS)", mobile, otp);

        return new OtpResponse("OTP sent successfully", true);
    }

    public OtpResponse verifyOtp(String mobile, String otp) {
        User user = userRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("Mobile number not found"));

        if (user.getOtp() == null || user.getOtpExpiry() == null) {
            throw new RuntimeException("No OTP requested");
        }

        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new RuntimeException("OTP has expired");
        }

        if (!user.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        return new OtpResponse("OTP verified successfully", true);
    }

    public OtpResponse resetPassword(String mobile, String otp, String newPassword) {
        User user = userRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("Mobile number not found"));

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new RuntimeException("OTP has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        logger.info("Password reset successful for user: {}", user.getUsername());

        return new OtpResponse("Password reset successful", true);
    }

    private String generateOtp() {
        return String.format("%06d", new java.util.Random().nextInt(999999));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        logger.info("User logged in: {}", user.getUsername());

        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole());
    }

    public static class RegisterRequest {
        private String username;
        private String email;
        private String password;
        private String mobile;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getMobile() { return mobile; }
        public void setMobile(String mobile) { this.mobile = mobile; }
    }

    public static class RegisterResponse {
        private String message;
        private String username;

        public RegisterResponse(String message, String username) {
            this.message = message;
            this.username = username;
        }

        public String getMessage() { return message; }
        public String getUsername() { return username; }
    }

    public static class OtpRequest {
        private String mobile;
        private String otp;
        private String newPassword;

        public String getMobile() { return mobile; }
        public void setMobile(String mobile) { this.mobile = mobile; }
        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class OtpResponse {
        private String message;
        private boolean success;

        public OtpResponse(String message, boolean success) {
            this.message = message;
            this.success = success;
        }

        public String getMessage() { return message; }
        public boolean isSuccess() { return success; }
    }

    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        private String username;
        private String email;
        private String role;

        public AuthResponse(String token, String username, String email, String role) {
            this.token = token;
            this.username = username;
            this.email = email;
            this.role = role;
        }

        public String getToken() { return token; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
    }
}
