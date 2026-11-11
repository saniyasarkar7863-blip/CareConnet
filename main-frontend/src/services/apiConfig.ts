/**
 * CareConnect Spring Boot REST API Configuration & Integration Layer
 * 
 * Target Backend: Java 21, Spring Boot, Spring Security (JWT), Oracle Database
 * Default API Base URL: configured via VITE_API_BASE_URL (defaults to http://localhost:8080/api)
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  TIMEOUT_MS: 10000,
  AUTH_HEADER_KEY: 'Authorization',
  TOKEN_PREFIX: 'Bearer ',
  TARGET_BACKEND: 'Java 21 / Spring Boot 3.x / Oracle Database 19c+',
  IS_LIVE_BACKEND_AVAILABLE: false, // When true, delegates to live Spring Boot endpoints; when false, uses reactive in-memory mock store
};

/**
 * Standard HTTP Client for Spring Boot REST Endpoints
 * Supports JWT Bearer tokens and JSON request/response formats
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('careconnect_jwt_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers[API_CONFIG.AUTH_HEADER_KEY] = `${API_CONFIG.TOKEN_PREFIX}${token}`;
  }

  const url = `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorBody.message || `HTTP ${response.status}: Request failed`);
    }

    return (await response.json()) as T;
  } catch (error) {
    // If backend is unreachable or during frontend demonstration, we log informative context for developers
    console.info(`[Spring Boot API Integration] ${options.method || 'GET'} ${url} - Falling back to local reactive mock layer.`);
    throw error;
  }
}
