import { useState, useEffect, useCallback } from 'react';

const HEALTH_API_URL = 'http://localhost:8080/api/health';

/**
 * useHealthCheck — custom React hook
 *
 * Polls the Spring Boot backend health-check endpoint every 30 seconds.
 * Returns: { status, data, error, isLoading, lastChecked, refresh }
 *
 * Separating this logic into a hook keeps the UI component clean.
 */
export function useHealthCheck() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'up' | 'down'
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  const check = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(HEALTH_API_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // 5 second timeout — don't wait forever if backend is down
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const json = await response.json();
        setData(json);
        setStatus('up');
        setError(null);
      } else {
        setStatus('down');
        setError(`HTTP ${response.status}`);
        setData(null);
      }
    } catch (err) {
      setStatus('down');
      setError(err.name === 'TimeoutError' ? 'Request timed out' : 'Backend unreachable');
      setData(null);
    } finally {
      setIsLoading(false);
      setLastChecked(new Date());
    }
  }, []);

  // Run once on mount, then every 30 seconds
  useEffect(() => {
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [check]);

  return { status, data, error, isLoading, lastChecked, refresh: check };
}
