import { useHealthCheck } from '../hooks/useHealthCheck';

/**
 * BackendStatus Component
 *
 * Displays a live indicator showing whether the Spring Boot backend
 * is reachable and what the Oracle database connection status is.
 *
 * States:
 *   checking — initial fetch in progress (spinner)
 *   up        — backend responded with HTTP 200 (green)
 *   down      — backend unreachable or error (red)
 */
function BackendStatus() {
  const { status, data, error, isLoading, lastChecked, refresh } = useHealthCheck();

  const statusConfig = {
    checking: {
      dot:  'bg-yellow-400',
      text: 'Connecting...',
      border: 'border-yellow-500/30',
      bg:   'bg-yellow-500/5',
    },
    up: {
      dot:  'bg-emerald-400',
      text: 'Backend Online',
      border: 'border-emerald-500/30',
      bg:   'bg-emerald-500/5',
    },
    down: {
      dot:  'bg-red-400',
      text: 'Backend Offline',
      border: 'border-red-500/30',
      bg:   'bg-red-500/5',
    },
  };

  const cfg = statusConfig[status];

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 glass rounded-2xl p-4 min-w-[280px]
                  border ${cfg.border} ${cfg.bg} shadow-2xl`}
      role="status"
      aria-live="polite"
      aria-label="Backend connection status"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} status-dot`} />
          <span className="text-sm font-semibold text-white">{cfg.text}</span>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="text-slate-500 hover:text-white transition-colors text-xs
                     disabled:opacity-40 hover:bg-white/10 rounded px-1.5 py-0.5"
          aria-label="Refresh backend status"
          title="Refresh"
        >
          {isLoading ? '⟳' : '↺'} Refresh
        </button>
      </div>

      {/* Details */}
      {status === 'up' && data && (
        <div className="flex flex-col gap-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Version:</span>
            <span className="text-slate-300 font-medium">{data.version}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-slate-500 flex-shrink-0">Database:</span>
            <span className="text-emerald-400 font-medium">{data.database}</span>
          </div>
          {data.timestamp && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Server time:</span>
              <span className="text-slate-300">{data.timestamp.replace('T', ' ')}</span>
            </div>
          )}
        </div>
      )}

      {status === 'down' && (
        <div className="text-xs text-red-400">
          {error || 'Cannot reach http://localhost:8080'}
          <div className="text-slate-500 mt-1">
            Make sure the Spring Boot backend is running.
          </div>
        </div>
      )}

      {/* Last checked timestamp */}
      {lastChecked && (
        <div className="text-xs text-slate-600 mt-2 pt-2 border-t border-white/5">
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export default BackendStatus;
