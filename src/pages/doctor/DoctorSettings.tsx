import React, { useState } from 'react';
import { Settings, Shield, Bell, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export function DoctorSettingsPage() {
  const { resetDemoData } = useAuth();
  const { showToast } = useNotification();

  const [instantAlerts, setInstantAlerts] = useState(true);
  const [digitalSignatureActive, setDigitalSignatureActive] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Doctor Settings Saved', 'success', 'Prescription signature defaults and alerts updated.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Doctor Clinical Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure clinical notifications, electronic signature defaults, and sandbox settings
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Clinical Alerts & Workflow
        </h2>

        <div className="space-y-4">
          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-900 block">Pre-Consultation Intake Notifications</span>
              <span className="text-xs text-slate-500">Alert immediately when an upcoming patient submits their symptom questionnaire.</span>
            </div>
            <input
              type="checkbox"
              checked={instantAlerts}
              onChange={e => setInstantAlerts(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
          </label>

          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-900 block">Automatic Digital Prescription Signing</span>
              <span className="text-xs text-slate-500">Attach verified digital signature token to all completed consultation e-Rx records.</span>
            </div>
            <input
              type="checkbox"
              checked={digitalSignatureActive}
              onChange={e => setDigitalSignatureActive(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
          </label>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors"
          >
            Save Practice Preferences
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Evaluator Sandbox Reset
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Restore initial patient records, consultation notes, and doctor schedules to factory state.
        </p>

        <div>
          <button
            onClick={resetDemoData}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Store to Factory State</span>
          </button>
        </div>
      </div>
    </div>
  );
}
