package com.itsdeligh.platform.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itsdeligh.platform.auth.dto.LoginRequest;
import com.itsdeligh.platform.auth.dto.LoginResponse;
import com.itsdeligh.platform.auth.dto.RegisterRequest;
import com.itsdeligh.platform.auth.service.AuthService;
import com.itsdeligh.platform.common.api.ApiResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
@Validated
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
        public ResponseEntity<ApiResponse<Void>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
                authService.register(request);

        return ResponseEntity
                .status(201)
                .body(
                        ApiResponse.success(
                                "Account created. Check your email to verify it before logging in.",
                                null
                        )
                );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Login successful",
                        response
                )
        );
    }
}