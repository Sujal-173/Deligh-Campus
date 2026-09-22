package com.itsdeligh.platform.common.api;

import java.util.Map;

public record ApiErrorResponse(
        boolean success,
        String message,
        Map<String, String> errors
) {

    public static ApiErrorResponse error(String message) {
        return new ApiErrorResponse(false, message, null);
    }

    public static ApiErrorResponse validation(
            String message,
            Map<String, String> errors
    ) {
        return new ApiErrorResponse(false, message, errors);
    }
}