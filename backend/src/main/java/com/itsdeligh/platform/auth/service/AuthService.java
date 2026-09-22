package com.itsdeligh.platform.auth.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.itsdeligh.platform.auth.dto.LoginRequest;
import com.itsdeligh.platform.auth.dto.LoginResponse;
import com.itsdeligh.platform.auth.dto.RegisterRequest;
import com.itsdeligh.platform.auth.security.JwtService;
import com.itsdeligh.platform.common.exception.ApiException;
import com.itsdeligh.platform.user.entity.Role;
import com.itsdeligh.platform.user.entity.User;
import com.itsdeligh.platform.user.repository.RoleRepository;
import com.itsdeligh.platform.user.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
        public void register(RegisterRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "An account with this email already exists"
            );
        }

        String roleCode = request.role()
                .trim()
                .toUpperCase();

        Role role = roleRepository.findByCode(roleCode)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Role is not configured on the server: " + roleCode
                ));

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setMobile(request.mobile());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.addRole(role);
        
        // Generate verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiresAt(Instant.now().plus(java.time.Duration.ofHours(24)));
        
        userRepository.save(user);
        
        // Send verification email
        emailService.sendVerificationEmail(email, verificationToken);

    }

    @Transactional
    public LoginResponse login(LoginRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ApiException(
                                HttpStatus.UNAUTHORIZED,
                                "Invalid email or password"
                        )
                );

        if (!user.isActive()) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "This account is inactive"
            );
        }

        if (user.isLocked()) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "This account is locked"
            );
        }

        if (!user.isEmailVerified()) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Please verify your email before logging in"
            );
        }

        if (!passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        )) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        List<String> roles = user.getRoles()
                .stream()
                .map(Role::getCode)
                .sorted()
                .toList();

        String accessToken = jwtService.generateToken(user);

        return new LoginResponse(
                accessToken,
                "Bearer",
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                roles,
                user.isEmailVerified()
        );
    }

    @Transactional
    public LoginResponse handleOAuthLogin(String email, String name, String googleId) {
        String normalizedEmail = email.trim().toLowerCase();
        
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        
        if (user == null) {
            // Create new user from Google OAuth
            user = new User();
            user.setFullName(name);
            user.setEmail(normalizedEmail);
            user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password
            user.setEmailVerified(true); // Google OAuth users are pre-verified
            
            // Assign default role (STUDENT for OAuth users)
            Role defaultRole = roleRepository.findByCode("STUDENT")
                    .orElseThrow(() -> new ApiException(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Default role not configured"
                    ));
            user.addRole(defaultRole);
            
            userRepository.save(user);
        } else {
            // Update existing user
            user.setLastLoginAt(Instant.now());
            userRepository.save(user);
        }
        
        String accessToken = jwtService.generateToken(user);
        List<String> roles = user.getRoles()
                .stream()
                .map(Role::getCode)
                .sorted()
                .toList();
        
        return new LoginResponse(
                accessToken,
                "Bearer",
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                roles,
                user.isEmailVerified()
        );
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));
        
        if (user.isEmailVerified()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Email is already verified"
            );
        }
        
        String verificationToken = UUID.randomUUID().toString();
                user.setVerificationToken(verificationToken);
                user.setVerificationTokenExpiresAt(Instant.now().plus(java.time.Duration.ofHours(24)));
                userRepository.save(user);
        emailService.sendVerificationEmail(normalizedEmail, verificationToken);
    }

        @Transactional
        public void requestPasswordReset(String email) {
                String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
                userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
                        String resetToken = UUID.randomUUID().toString();
                        user.setResetToken(resetToken);
                        user.setResetTokenExpiresAt(Instant.now().plus(java.time.Duration.ofHours(1)));
                        userRepository.save(user);
                        emailService.sendPasswordResetEmail(normalizedEmail, resetToken);
                });
        }

        @Transactional
        public void resetPassword(String token, String password) {
                User user = userRepository.findAll().stream()
                                .filter(candidate -> token != null && token.equals(candidate.getResetToken()))
                                .filter(candidate -> candidate.getResetTokenExpiresAt() != null
                                                && candidate.getResetTokenExpiresAt().isAfter(Instant.now()))
                                .findFirst()
                                .orElseThrow(() -> new ApiException(
                                                HttpStatus.BAD_REQUEST,
                                                "Invalid or expired password reset token"
                                ));

                user.setPasswordHash(passwordEncoder.encode(password));
                user.setResetToken(null);
                user.setResetTokenExpiresAt(null);
                userRepository.save(user);
        }

    @Transactional
    public LoginResponse verifyEmailToken(String token) {
        // Verify token and update user's email verification status
        // For now, we'll just find by token since we need to implement the repository method
        User user = userRepository.findAll().stream()
                .filter(u -> token.equals(u.getVerificationToken()))
                .filter(u -> u.getVerificationTokenExpiresAt() != null && u.getVerificationTokenExpiresAt().isAfter(Instant.now()))
                .findFirst()
                .orElseThrow(() -> new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid or expired verification token"
                ));
        
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiresAt(null);
        userRepository.save(user);
        
        // Generate login response
        String accessToken = jwtService.generateToken(user);
        List<String> roles = user.getRoles()
                .stream()
                .map(Role::getCode)
                .sorted()
                .toList();
        
        return new LoginResponse(
                accessToken,
                "Bearer",
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                roles,
                true
        );
    }
}
