package com.careconnect.controller;

import com.careconnect.dto.HealthCheckResponse;
import com.careconnect.service.HealthCheckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HealthCheckController
 *
 * Exposes a single endpoint: GET /api/health
 *
 * This is used by:
 *   - The React frontend to show a "Backend Connected" status indicator
 *   - Developers to verify the application is running correctly
 *   - Future monitoring tools (e.g., Kubernetes liveness probes)
 *
 * @RestController = @Controller + @ResponseBody
 *   → Automatically serializes return values to JSON
 */
@RestController
@RequestMapping("/api")
public class HealthCheckController {

    private final HealthCheckService healthCheckService;

    @Autowired
    public HealthCheckController(HealthCheckService healthCheckService) {
        this.healthCheckService = healthCheckService;
    }

    /**
     * GET /api/health
     *
     * Example response:
     * {
     *   "status": "UP",
     *   "message": "CareConnect backend is running successfully",
     *   "application": "CareConnect — Unified Digital Healthcare Platform",
     *   "version": "1.0.0",
     *   "timestamp": "2026-10-26T03:30:00",
     *   "database": "Oracle FREEPDB1 — connected"
     * }
     */
    @GetMapping("/health")
    public ResponseEntity<HealthCheckResponse> healthCheck() {
        HealthCheckResponse response = healthCheckService.getHealth();
        return ResponseEntity.ok(response);
    }
}
