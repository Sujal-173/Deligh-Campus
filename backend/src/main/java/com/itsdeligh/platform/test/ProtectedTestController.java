package com.itsdeligh.platform.test;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itsdeligh.platform.common.api.ApiResponse;

@RestController
@RequestMapping("/api/v1/test")
public class ProtectedTestController {

    @GetMapping("/protected")
    public ApiResponse<Map<String, Object>> protectedEndpoint(
            Authentication authentication
    ) {

        return ApiResponse.success(
                "Protected endpoint accessed successfully",
                Map.of(
                        "userId", authentication.getPrincipal(),
                        "authorities", authentication.getAuthorities()
                )
        );
    }
}