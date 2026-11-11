/**
 * CareConnect Unified API Client
 *
 * Implements:
 *   - credentials: "include" on all requests for HttpOnly cookie transport
 *   - CSRF token fetching and header inclusion (X-XSRF-TOKEN)
 *   - Automatic token refresh retry on 401 for authenticated requests
 *   - Consistent JSON parsing and error handling
 */

const API_BASE_URL = 'http://localhost:8080/api';

let csrfTokenCache = null;

/**
 * Retrieves the CSRF token either from document.cookie (if available)
 * or by calling the backend GET /api/auth/csrf endpoint.
 */
export async function getCsrfToken() {
  if (csrfTokenCache) return csrfTokenCache;

  // Attempt to read XSRF-TOKEN cookie
  const match = document.cookie.match(/(^|;\s*)XSRF-TOKEN=([^;]+)/);
  if (match && match[2]) {
    csrfTokenCache = decodeURIComponent(match[2]);
    return csrfTokenCache;
  }

  // Otherwise fetch from endpoint
  try {
    const res = await fetch(`${API_BASE_URL}/auth/csrf`, {
      method: 'GET',
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.token) {
        csrfTokenCache = data.token;
        return csrfTokenCache;
      }
    }
  } catch {
    // CSRF fetch failed — fallback
  }

  return null;
}

/**
 * Core fetch wrapper with credential transport and CSRF headers.
 */
export async function apiRequest(endpoint, options = {}, isRetry = false) {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options.method ? options.method.toUpperCase() : 'GET';

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  // Attach CSRF token on state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfToken = await getCsrfToken();
    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = csrfToken;
    }
  }

  const response = await fetch(url, {
    ...options,
    method,
    headers,
    credentials: 'include',
  });

  // Handle 401: attempt silent token refresh once (except on auth endpoints)
  if (response.status === 401 && !isRetry && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/refresh')) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': (await getCsrfToken()) || '',
        },
        credentials: 'include',
      });

      if (refreshRes.ok) {
        // Refresh succeeded — retry original request
        return apiRequest(endpoint, options, true);
      }
    } catch {
      // Refresh failed
    }
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    error.validationErrors = data?.validationErrors || null;
    throw error;
  }

  return data;
}
