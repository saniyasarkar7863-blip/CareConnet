package com.careconnect.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * HealthCheckResponse DTO (Data Transfer Object)
 *
 * This is what the /api/health endpoint sends back as JSON.
 * DTOs are simple data containers — they should not contain business logic.
 */
@Data
public class HealthCheckResponse {

    @JsonProperty("status")
    private String status;

    @JsonProperty("message")
    private String message;

    @JsonProperty("application")
    private String application;

    @JsonProperty("version")
    private String version;

    @JsonProperty("timestamp")
    private String timestamp;

    @JsonProperty("database")
    private String database;

    // No-arg constructor (required for Jackson serialization)
    public HealthCheckResponse() {
    }

    // All-arg constructor for convenience
    public HealthCheckResponse(String status, String message, String application,
            String version, String database) {
        this.status = status;
        this.message = message;
        this.application = application;
        this.version = version;
        this.database = database;
        this.timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    // ===== Getters and Setters =====

}
