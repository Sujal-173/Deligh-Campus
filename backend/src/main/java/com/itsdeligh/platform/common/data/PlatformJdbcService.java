package com.itsdeligh.platform.common.data;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformJdbcService {
    private final NamedParameterJdbcTemplate jdbc;

    public PlatformJdbcService(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> list(String sql, Map<String, ?> params) {
        return jdbc.queryForList(sql, new MapSqlParameterSource(params));
    }

    public Map<String, Object> one(String sql, Map<String, ?> params) {
        List<Map<String, Object>> rows = list(sql, params);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public int update(String sql, Map<String, ?> params) {
        return jdbc.update(sql, new MapSqlParameterSource(params));
    }

    public Map<String, Object> params(Object... values) {
        if (values.length % 2 != 0) throw new IllegalArgumentException("Parameters must be key/value pairs");
        Map<String, Object> out = new java.util.LinkedHashMap<>();
        for (int i = 0; i < values.length; i += 2) out.put(String.valueOf(values[i]), values[i + 1]);
        return out;
    }

    public long count(String sql, Map<String, ?> params) {
        Long value = jdbc.queryForObject(sql, new MapSqlParameterSource(params), Long.class);
        return value == null ? 0L : value;
    }

    public UUID uuid(String value) {
        try {
            return UUID.fromString(value);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid identifier");
        }
    }

    public Page page(String sql, String countSql, Map<String, ?> params, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        MapSqlParameterSource source = new MapSqlParameterSource(params)
                .addValue("limit", safeSize)
                .addValue("offset", safePage * safeSize);
        List<Map<String, Object>> items = jdbc.queryForList(sql, source);
        Long total = jdbc.queryForObject(countSql, new MapSqlParameterSource(params), Long.class);
        long totalValue = total == null ? 0L : total;
        int totalPages = (int) Math.ceil(totalValue / (double) safeSize);
        return new Page(items, safePage, safeSize, totalValue, totalPages);
    }

    @Transactional
    public void touchAudit(UUID actorId, String action, String resourceType, String resourceId, String details) {
        update("""
                INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, details)
                VALUES (:actorId, :action, :resourceType, :resourceId, :details)
                """, Map.of(
                "actorId", actorId,
                "action", action,
                "resourceType", resourceType,
                "resourceId", resourceId,
                "details", details == null ? "" : details
        ));
    }

    public record Page(
            List<Map<String, Object>> items,
            int page,
            int size,
            long totalItems,
            int totalPages
    ) {
        public Map<String, Object> asMap() {
            return Map.of(
                    "items", items,
                    "page", page,
                    "size", size,
                    "totalItems", totalItems,
                    "totalPages", totalPages,
                    "total", totalItems
            );
        }
    }
}
