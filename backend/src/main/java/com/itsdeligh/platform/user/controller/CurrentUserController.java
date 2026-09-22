package com.itsdeligh.platform.user.controller;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.itsdeligh.platform.common.api.ApiResponse;
import com.itsdeligh.platform.common.data.PlatformJdbcService;
import com.itsdeligh.platform.common.security.CurrentUserProvider;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class CurrentUserController {
    private final PlatformJdbcService db;
    private final CurrentUserProvider currentUser;

    public CurrentUserController(PlatformJdbcService db, CurrentUserProvider currentUser) {
        this.db = db;
        this.currentUser = currentUser;
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Map<String, Object>> me() {
        UUID id = currentUser.getCurrentUserId();
        Map<String, Object> row = db.one("SELECT id, full_name, email, mobile, email_verified, is_active, is_locked, role_title, about, gender, avatar_url, organization_id, profile_complete FROM users WHERE id = :id", Map.of("id", id));
        if (row == null) return ApiResponse.error("User not found");
        List<Map<String, Object>> roleRows = db.list("SELECT r.code FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = :id ORDER BY r.code", Map.of("id", id));
        List<String> roles = roleRows.stream().map(r -> String.valueOf(r.get("code")).trim().toLowerCase()).toList();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", row.get("id")); out.put("fullName", row.get("full_name")); out.put("email", row.get("email")); out.put("mobile", row.get("mobile"));
        out.put("emailVerified", row.get("email_verified")); out.put("roles", roles); out.put("role", roles.isEmpty() ? "user" : roles.get(0));
        out.put("roleTitle", row.get("role_title")); out.put("about", row.get("about")); out.put("gender", row.get("gender"));
        out.put("avatarUrl", row.get("avatar_url")); out.put("organizationId", row.get("organization_id"));
        out.put("profileComplete", row.get("profile_complete"));
        return ApiResponse.success(out);
    }
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Map<String, Object>> update(@RequestBody Map<String, Object> body) {
        UUID id = currentUser.getCurrentUserId();
        Map<String, Object> params = new LinkedHashMap<>();
        params.put("id", id);
        params.put("fullName", body.get("fullName"));
        params.put("mobile", body.get("mobile"));
        params.put("roleTitle", body.get("roleTitle"));
        params.put("about", body.get("about"));
        params.put("gender", body.get("gender"));
        params.put("avatarUrl", body.get("avatarUrl"));
        db.update("""
                UPDATE users SET
                    full_name=COALESCE(:fullName,full_name),
                    mobile=COALESCE(:mobile,mobile),
                    role_title=COALESCE(:roleTitle,role_title),
                    about=COALESCE(:about,about),
                    gender=COALESCE(:gender,gender),
                    avatar_url=COALESCE(:avatarUrl,avatar_url),
                    updated_at=NOW()
                WHERE id=:id
                """, params);
        return me();
    }

    @PostMapping("/me/complete-profile")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Map<String, Object>> completeProfile(@RequestBody Map<String, Object> body) {
        UUID id = currentUser.getCurrentUserId();
        String about = String.valueOf(body.getOrDefault("bio", "")).trim();
        String organizationName = String.valueOf(body.getOrDefault("organization", "")).trim();
        if (about.length() > 2000 || organizationName.length() > 180) {
            return ApiResponse.error("Profile details are too long");
        }

        Map<String, Object> params = new LinkedHashMap<>();
        params.put("id", id);
        params.put("about", about);
        params.put("organizationName", organizationName);
        db.update("""
                UPDATE users SET
                    about = NULLIF(:about, ''),
                    organization_id = COALESCE(
                        (SELECT id FROM organizations WHERE LOWER(name) = LOWER(:organizationName) AND status = 'active' LIMIT 1),
                        organization_id
                    ),
                    profile_complete = TRUE,
                    updated_at = NOW()
                WHERE id = :id
                """, params);
        return me();
    }

}
