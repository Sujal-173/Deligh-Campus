package com.itsdeligh.platform.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Validated
@ConfigurationProperties(prefix = "app")
public record ApplicationProperties(
        
        @NotBlank(message = "Application name is required")
        String name,
        
        @NotBlank(message = "Application version is required")
        String version,
        
        @NotNull(message = "Environment is required")
        Environment environment,
        
        Security security,
        
        Database database,
        
        Cors cors
        
) {
    
    public enum Environment {
        DEVELOPMENT,
        STAGING,
        PRODUCTION
    }
    
    public record Security(
            @NotBlank(message = "JWT secret is required")
            String jwtSecret,
            
            @Positive(message = "JWT expiration must be positive")
            Long jwtExpirationMs,
            
            @Positive(message = "Session timeout must be positive")
            Long sessionTimeoutMs
    ) {}
    
    public record Database(
            @NotBlank(message = "Database URL is required")
            String url,
            
            @NotBlank(message = "Database username is required")
            String username,
            
            @NotBlank(message = "Database password is required")
            String password,
            
            @Positive(message = "Connection pool size must be positive")
            Integer connectionPoolSize,
            
            @Positive(message = "Connection timeout must be positive")
            Long connectionTimeoutMs
    ) {}
    
    public record Cors(
            @NotBlank(message = "Allowed origins are required")
            String allowedOrigins,
            
            @NotBlank(message = "Allowed methods are required")
            String allowedMethods,
            
            @NotBlank(message = "Allowed headers are required")
            String allowedHeaders,
            
            @NotNull(message = "Allow credentials is required")
            Boolean allowCredentials
    ) {}
}