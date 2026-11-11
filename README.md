# CareConnect — Unified Digital Healthcare Platform

> **Feature 1: Project Setup & Database Design** — Complete ✅
> **Feature 2: Secure Registration, Email OTP Verification & JWT Authentication** — Complete ✅

---

## Table of Contents

1. [Folder Structure](#folder-structure)
2. [Technology Stack](#technology-stack)
3. [How to Run](#how-to-run)
4. [Oracle Database Setup](#oracle-database-setup)
5. [Feature 2: Authentication & Security Architecture](#feature-2-auth)
6. [API Endpoints Reference](#api-endpoints)
7. [Health-Check API](#health-check-api)
8. [Database Schema (ER Design)](#database-schema)
9. [Common Errors & Fixes](#common-errors)
10. [Feature Checklists](#checklist)

---

## 1. Folder Structure

```
CareConnet/                          ← Git repository root
├── README.md                        ← This file
│
├── frontend/                        ← React + Vite + Tailwind CSS
│   ├── index.html                   ← HTML entry point (SEO meta tags)
│   ├── package.json
│   ├── tailwind.config.js           ← CareConnect brand colors + animations
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx                 ← React entry point
│       ├── index.css                ← Global styles (glassmorphism, animations)
│       ├── App.jsx                  ← Landing page layout
│       ├── App.css
│       ├── components/
│       │   ├── RoleCard.jsx         ← Role card (Patient/Doctor/Clinic/Donor)
│       │   └── BackendStatus.jsx    ← Live backend connectivity widget
│       └── hooks/
│           └── useHealthCheck.js    ← Polls GET /api/health every 30s
│
├── backend/                         ← Java 21 + Spring Boot 3 + Maven
│   ├── pom.xml                      ← Spring Boot parent, Oracle JDBC driver
│   ├── .env.example                 ← Template for environment variables
│   ├── .gitignore
│   └── src/
│       ├── main/
│       │   ├── java/com/careconnect/
│       │   │   ├── CareConnectApplication.java   ← @SpringBootApplication entry
│       │   │   ├── config/
│       │   │   │   └── CorsConfig.java           ← CORS for localhost:5173
│       │   │   ├── controller/
│       │   │   │   └── HealthCheckController.java ← GET /api/health
│       │   │   ├── service/
│       │   │   │   └── HealthCheckService.java    ← Oracle DB ping
│       │   │   ├── dto/
│       │   │   │   └── HealthCheckResponse.java   ← JSON response shape
│       │   │   ├── entity/          ← JPA entities (Feature 2+)
│       │   │   └── repository/      ← Spring Data JPA repos (Feature 2+)
│       │   └── resources/
│       │       └── application.properties         ← Config (env-var placeholders)
│       └── test/
│           └── java/com/careconnect/
│               └── HealthCheckControllerTest.java ← JUnit 5 + Mockito test

database/                            ← SQL scripts (outside git repo root)
└── CareConnect123.sql               ← Full Oracle schema (all 9 entities)
```

---

## 2. Technology Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 + Vite 5 + Tailwind CSS 3  |
| Backend   | Java 21 + Spring Boot 3.3.5 + Maven |
| Database  | Oracle 23ai Free (Docker)           |
| JDBC      | ojdbc11 23.6.0.24.10                |
| Testing   | JUnit 5 + Mockito (via spring-boot-starter-test) |

---

## 3. How to Run

### Prerequisites
- Docker running with the `oracle-free` container
- Java 21, Maven 3.10+, Node 24, npm 11+

### Backend (Terminal 1)

```bash
cd CareConnet/backend

# Set environment variables and start
ORACLE_JDBC_URL="jdbc:oracle:thin:@localhost:1521/FREEPDB1" \
ORACLE_DB_USERNAME="CARECONNECT123" \
ORACLE_DB_PASSWORD="careconnect123" \
mvn spring-boot:run
```

The server starts at **http://localhost:8080** in ~3 seconds.

### Frontend (Terminal 2)

```bash
cd CareConnet/frontend
npm run dev
```

The Vite dev server starts at **http://localhost:5173**.

---

## 4. Oracle Database Setup

### Current Docker Container

The Oracle 23ai Free container `oracle-free` is already running:

```
Container: oracle-free
Image:      gvenzl/oracle-free
Port:       1521 (host) → 1521 (container)
SID:        FREE
PDB:        FREEPDB1
User:       CARECONNECT123
Password:   careconnect123  (set manually — rotate as needed)
```

### Start/Stop Oracle Container

```bash
# Start
docker start oracle-free

# Stop
docker stop oracle-free

# Check status
docker ps | grep oracle-free
```

### If You Need to Recreate the User

```bash
# Enter Oracle as DBA
docker exec -i oracle-free sqlplus -S / as sysdba <<EOF
ALTER SESSION SET CONTAINER = FREEPDB1;
CREATE USER CARECONNECT123 IDENTIFIED BY careconnect123;
GRANT CONNECT, RESOURCE, DBA TO CARECONNECT123;
GRANT UNLIMITED TABLESPACE TO CARECONNECT123;
EOF
```

### Run the Schema SQL

```bash
# From the project root
docker exec -i oracle-free sqlplus \
  CARECONNECT123/careconnect123@localhost:1521/FREEPDB1 \
  < database/CareConnect123.sql
```

> **Note**: The schema SQL is for reference/future use. Feature 1 does not require any tables — the health check only runs `SELECT 'connected' FROM DUAL`.

### Environment Variables (keep secrets out of git)

Copy `backend/.env.example` to `backend/.env` and fill in values. Never commit `.env`.

```
ORACLE_JDBC_URL=jdbc:oracle:thin:@localhost:1521/FREEPDB1
ORACLE_DB_USERNAME=CARECONNECT123
ORACLE_DB_PASSWORD=careconnect123
```

---

## 5. Health-Check API

**Endpoint:** `GET http://localhost:8080/api/health`

**Example response (verified live):**
```json
{
  "status": "UP",
  "message": "CareConnect backend is running successfully",
  "application": "CareConnect — Unified Digital Healthcare Platform",
  "version": "1.0.0",
  "timestamp": "2026-10-26T03:41:45.511066",
  "database": "Oracle FREEPDB1 — connected"
}
```

Test with curl:
```bash
curl http://localhost:8080/api/health
```

---

## 6. Database Schema (ER Design) {#database-schema}

### Entities & Relationships

```
users (1) ──────────────── (1) patient_profiles
users (1) ──────────────── (1) doctor_profiles
users (1) ──────────────── (1) clinics

clinics (1) ─────────────── (N) doctor_profiles

patient_profiles (1) ───── (N) appointments
doctor_profiles  (1) ───── (N) appointments
clinics          (1) ───── (N) appointments

appointments (1) ────────── (1) consultations

consultations (1) ──────── (N) prescriptions
patient_profiles (1) ───── (N) medical_records
doctor_profiles  (1) ───── (N) medical_records

prescriptions (1) ──────── (N) medication_items
```

### Primary Keys
All tables use `NUMBER GENERATED ALWAYS AS IDENTITY` — Oracle's equivalent of `SERIAL` / `AUTO_INCREMENT`.

### Foreign Keys
- `patient_profiles.user_id` → `users.user_id` (CASCADE DELETE)
- `doctor_profiles.user_id` → `users.user_id` (CASCADE DELETE)
- `doctor_profiles.clinic_id` → `clinics.clinic_id`
- `clinics.user_id` → `users.user_id` (CASCADE DELETE)
- `appointments.patient_id` → `patient_profiles.profile_id`
- `appointments.doctor_id` → `doctor_profiles.profile_id`
- `appointments.clinic_id` → `clinics.clinic_id`
- `consultations.appointment_id` → `appointments.appointment_id` (UNIQUE — 1:1)
- `prescriptions.consultation_id` → `consultations.consultation_id`
- `medication_items.prescription_id` → `prescriptions.prescription_id` (CASCADE DELETE)
- `medical_records.patient_id` → `patient_profiles.profile_id`
- `medical_records.recorded_by` → `doctor_profiles.profile_id`

Full SQL: [`database/CareConnect123.sql`](database/CareConnect123.sql)

---

## 7. Verify Frontend → Backend Connection {#verify-connection}

1. Start the backend (port 8080)
2. Start the frontend (port 5173)
3. Open **http://localhost:5173** in your browser
4. Look at the **bottom-right corner** — you'll see a widget:
   - 🟢 **Backend Online** — Spring Boot is reachable and Oracle is connected
   - 🔴 **Backend Offline** — backend is not running or CORS is blocking
5. The widget auto-refreshes every 30 seconds; click **Refresh** to check immediately.

To test CORS manually:
```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:8080/api/health -v
```
You should see `Access-Control-Allow-Origin: http://localhost:5173` in the response headers.

---

## 8. Common Errors & Fixes {#common-errors}

| Error | Cause | Fix |
|-------|-------|-----|
| `ORA-01017: invalid credential` | Wrong username/password | Check `ORACLE_DB_USERNAME` and `ORACLE_DB_PASSWORD` env vars |
| `ORA-12505: wrong SID` | Using `FREE` instead of `FREEPDB1` | Use `FREEPDB1` as the service name in the JDBC URL |
| `Connection refused :1521` | Oracle container not running | `docker start oracle-free` |
| `Could not resolve placeholder 'ORACLE_JDBC_URL'` | Env vars not set | Set env vars before running `mvn spring-boot:run` |
| Backend Status widget shows red | Backend not started or on wrong port | Run `mvn spring-boot:run` in `backend/` |
| CORS error in browser console | Origin not allowed | Check `careconnect.cors.allowed-origin` in `application.properties` |
| `HHH90000025` Hibernate warning | Dialect is auto-detected — the explicit config is redundant | Safe to remove `spring.jpa.database-platform` from properties |
| `spring.jpa.open-in-view` warning | Spring Boot default behaviour | Add `spring.jpa.open-in-view=false` to properties (safe for Feature 1) |

---

## 10. Feature Checklists {#checklist}

### ✅ Feature 1: Project Setup & Database Design — Complete
- [x] React + Vite + Tailwind CSS frontend
- [x] Spring Boot 3 + Java 21 + Maven backend
- [x] Oracle 23ai Free connectivity verified (`FREEPDB1`)
- [x] Live `GET /api/health` endpoint
- [x] Full database schema and ER design

### ✅ Feature 2: Registration, Email OTP & JWT Auth — Complete
- [x] Public registration for `PATIENT` and `DOCTOR` (disallows privileged roles like `ADMIN`)
- [x] Doctor credentials tracked with separate `PENDING` verification status
- [x] Password hashing with Spring Security `BCryptPasswordEncoder` (strength 12)
- [x] Email OTP verification: cryptographically secure 6-digit random code, SHA-256 hashed in Oracle
- [x] OTP rate limiting (60s cooldown) and maximum attempt protection (5 attempts)
- [x] Previous OTP invalidation upon resend
- [x] Unverified users cannot log in
- [x] JWT access tokens (15-minute expiry) issued via `HttpOnly` cookie
- [x] 7-day refresh tokens stored as SHA-256 hashes in Oracle with automatic rotation
- [x] Token reuse detection that invalidates all active sessions for the user
- [x] Logout endpoint revoking refresh token session and clearing authentication cookies
- [x] CSRF protection using `CookieCsrfTokenRepository` with `X-XSRF-TOKEN` headers
- [x] Strict CORS configuration with credentials allowed for frontend origin
- [x] Frontend React components: Auth Modal (Role toggle, Register, Login, OTP verification)
- [x] Credentialed API client with automatic CSRF token header and 401 refresh retry
- [x] 20/20 backend unit, WebMvc, and Oracle DB integration tests passing (100%)

### ⏳ Future Features (Feature 3+)
- [ ] Appointment booking system
- [ ] Prescriptions and medical records
- [ ] Role-based dashboards & analytics
- [ ] AI symptom checker
- [ ] Blood donor network