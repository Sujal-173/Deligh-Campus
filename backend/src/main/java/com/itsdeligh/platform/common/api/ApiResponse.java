package com.itsdeligh.platform.common.api;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Map;

public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        HttpStatus status,
        String path,
        LocalDateTime timestamp,
        Map<String, String> errors
) {

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, null, data, null, null, null, null);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, null, null, null, null);
    }

    public static ApiResponse<Void> success(String message) {
        return new ApiResponse<>(true, message, null, null, null, null, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, null, null, null, null);
    }

    public static <T> ApiResponse<T> error(
            String message,
            HttpStatus status,
            String path
    ) {
        return new ApiResponse<>(false, message, null, status, path, LocalDateTime.now(), null);
    }

    public static <T> ApiResponse<T> error(
            String message,
            HttpStatus status,
            String path,
            Map<String, String> errors
    ) {
        return new ApiResponse<>(false, message, null, status, path, LocalDateTime.now(), errors);
    }
}