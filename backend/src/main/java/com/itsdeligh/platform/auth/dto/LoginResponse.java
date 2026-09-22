package com.itsdeligh.platform.auth.dto;

import java.util.List;
import java.util.UUID;

public record LoginResponse(

        String accessToken,

        String tokenType,

        UUID userId,

        String fullName,

        String email,

        List<String> roles,

        boolean emailVerified
) {
}