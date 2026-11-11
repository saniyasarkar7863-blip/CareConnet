package com.careconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * CareConnect — Unified Digital Healthcare Platform
 * Main Spring Boot entry point.
 */
@SpringBootApplication
public class CareConnectApplication {

    public static void main(String[] args) {
        // Prevent external environment variable pollution (e.g. PostgreSQL SPRING_DATASOURCE_* from Octobyte)
        // System properties take higher precedence than OS environment variables in Spring Boot.
        String envUrl = System.getenv("SPRING_DATASOURCE_URL");
        String envUser = System.getenv("SPRING_DATASOURCE_USERNAME");

        if ((envUrl != null && envUrl.contains("postgresql")) || "postgres".equalsIgnoreCase(envUser)) {
            String oracleUrl = System.getenv("ORACLE_JDBC_URL");
            System.setProperty(
                "spring.datasource.url",
                (oracleUrl != null && !oracleUrl.isBlank()) ? oracleUrl : "jdbc:oracle:thin:@localhost:1521/FREEPDB1"
            );

            String oracleUser = System.getenv("ORACLE_DB_USERNAME");
            System.setProperty(
                "spring.datasource.username",
                (oracleUser != null && !oracleUser.isBlank()) ? oracleUser : "CARECONNECT123"
            );

            String oraclePass = System.getenv("ORACLE_DB_PASSWORD");
            System.setProperty(
                "spring.datasource.password",
                (oraclePass != null && !oraclePass.isBlank()) ? oraclePass : "careconnect123"
            );
        }

        SpringApplication.run(CareConnectApplication.class, args);
    }
}
