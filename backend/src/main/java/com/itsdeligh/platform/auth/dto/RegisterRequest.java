package com.itsdeligh.platform.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Full name is required")
        @Size(max = 150, message = "Full name is too long")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email address")
        String email,

        @Size(max = 20, message = "Mobile number is too long")
        String mobile,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        String password,

        // Only self-serve roles are allowed here. ADMIN / SUPER_ADMIN
        // can never be picked by a public signup form.
        @NotBlank(message = "Role is required")
        @Pattern(
                regexp = "(?i)STUDENT|TRAINER|RECRUITER|INSTITUTION",
                message = "Role must be one of STUDENT, TRAINER, RECRUITER, INSTITUTION"
        )
        String role
) {
}
