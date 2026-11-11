package com.careconnect.service;

import com.careconnect.dto.HealthCheckResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

/**
 * HealthCheckService
 *
 * Business logic for the health check.
 * It tries an actual SQL query against Oracle to verify the DB connection is alive.
 *
 * Separation of concerns:
 *   Controller → only handles HTTP layer (request/response)
 *   Service    → contains business logic (here: DB ping)
 *   Repository → data access (JPA/SQL) — used in future features
 */
@Service
public class HealthCheckService {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public HealthCheckService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Returns a HealthCheckResponse.
     * Attempts a lightweight Oracle dual-table query to verify DB connectivity.
     * If DB is not reachable, the status reflects the error instead of crashing.
     */
    public HealthCheckResponse getHealth() {
        String dbStatus;
        try {
            // Oracle's "SELECT 1 FROM DUAL" is the standard connectivity test
            String result = jdbcTemplate.queryForObject(
                "SELECT 'connected' FROM DUAL", String.class
            );
            dbStatus = "Oracle FREEPDB1 — " + result;
        } catch (Exception ex) {
            dbStatus = "UNREACHABLE — " + ex.getMessage();
        }

        return new HealthCheckResponse(
            "UP",
            "CareConnect backend is running successfully",
            "CareConnect — Unified Digital Healthcare Platform",
            "1.0.0",
            dbStatus
        );
    }
}
