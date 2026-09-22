package com.itsdeligh.platform.auth;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itsdeligh.platform.auth.dto.LoginResponse;
import com.itsdeligh.platform.auth.service.AuthService;
import com.itsdeligh.platform.common.api.ApiResponse;

@RestController
@RequestMapping("/api/v1/auth/oauth2")
public class OAuth2Controller {

    private final AuthService authService;

    public OAuth2Controller(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/google/success")
    public ResponseEntity<ApiResponse<LoginResponse>> googleOAuthSuccess(
            @AuthenticationPrincipal OAuth2User oauth2User
    ) {
        if (oauth2User == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("OAuth authentication failed"));
        }

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String googleId = oauth2User.getAttribute("sub");
        
        // Create or update user from Google OAuth data
        LoginResponse response = authService.handleOAuthLogin(email, name, googleId);
        
        return ResponseEntity.ok(ApiResponse.success("Google authentication successful", response));
    }

    @PostMapping("/google/callback")
    public ResponseEntity<ApiResponse<LoginResponse>> googleOAuthCallback(
            @RequestBody Map<String, String> request
    ) {
        // This endpoint handles the authorization code from the frontend
        // For now, we'll use a simplified approach - in production, you'd exchange
        // the code for tokens with Google's token endpoint
        
        String code = request.get("code");
        if (code == null || code.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Authorization code is required"));
        }
        
        // For the MVP, we'll return an error since we need proper OAuth2 flow
        // The actual implementation would exchange the code for access tokens
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("OAuth2 code exchange not yet implemented. Please use password-based login."));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerificationEmail(
            @RequestBody Map<String, String> request
    ) {
        String email = request.get("email");
        authService.resendVerificationEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Verification email sent"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @RequestBody Map<String, String> request
    ) {
        authService.requestPasswordReset(request.get("email"));
        return ResponseEntity.ok(ApiResponse.success("If the account exists, a reset email has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestBody Map<String, String> request
    ) {
        authService.resetPassword(request.get("token"), request.get("password"));
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<LoginResponse>> verifyEmail(
            @RequestBody Map<String, String> request
    ) {
        String token = request.get("token");
        LoginResponse response = authService.verifyEmailToken(token);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully", response));
    }
}