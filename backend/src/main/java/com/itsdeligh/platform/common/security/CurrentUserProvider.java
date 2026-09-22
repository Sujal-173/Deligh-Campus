package com.itsdeligh.platform.common.security;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.itsdeligh.platform.common.exception.ApiException;

/**
 * Every "who is calling me" lookup goes through here. Controllers must
 * NEVER read a userId/studentId from the request body or a query param —
 * the identity always comes from the verified JWT that
 * JwtAuthenticationFilter already placed in the SecurityContext.
 */
@Component
public class CurrentUserProvider {

    public UUID getCurrentUserId() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "No authenticated user found"
            );
        }

        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException exception) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid authentication token"
            );
        }
    }
}
