package com.itsdeligh.platform.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            org.springframework.core.env.Environment env
    ) {
        CorsConfiguration configuration = new CorsConfiguration();
        
        String allowedOrigins = env.getProperty("app.cors.allowed-origins", "http://localhost:3000,http://localhost:3001");
        String allowedMethods = env.getProperty("app.cors.allowed-methods", "GET,POST,PUT,DELETE,OPTIONS");
        String allowedHeaders = env.getProperty("app.cors.allowed-headers", "*");
        Boolean allowCredentials = env.getProperty("app.cors.allow-credentials", Boolean.class, true);
        
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList(allowedMethods.split(",")));
        configuration.setAllowedHeaders(Arrays.asList(allowedHeaders.split(",")));
        configuration.setAllowCredentials(allowCredentials);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}