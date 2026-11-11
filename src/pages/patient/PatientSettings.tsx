import React, { useState } from 'react';
import { Settings, Shield, Bell, Lock, User, RefreshCw, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export function PatientSettingsPage() {
  const { user, resetDemoData } = useAuth();
  const { showToast } = useNotification();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsReminders, setSmsReminders] = useState(true);
  const [shareRecordsWithClinics, setShareRecordsWithClinics] = useState(true);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Preferences Saved', 'success', 'Your notification and privacy configurations are active.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Patient Account Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage notification channels, privacy access policies, and authentication credentials
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Notification Preferences
        </h2>

        <div className="space-y-4">
          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-900 block">Medication Reminder Alerts</span>
              <span className="text-xs text-slate-500">Receive SMS / in-app alerts at scheduled medication times.</span>
            </div>
            <input
              type="checkbox"
              checked={smsReminders}
              onChange={e => setSmsReminders(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
          </label>

          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-900 block">Appointment Confirmations</span>
              <span className="text-xs text-slate-500">Receive email receipts when consultations are booked or rescheduled.</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={e => setEmailAlerts(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
          </label>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Healthcare Privacy & Consent (DISHA / HIPAA Compliant)
        </h2>

        <div className="space-y-4">
          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-900 block">Clinical Continuity Sharing</span>
              <span className="text-xs text-slate-500">
                Permit authorized doctors at registered clinics to inspect past verified prescriptions and allergy lists during active consultations.
              </span>
            </div>
            <input
              type="checkbox"
              checked={shareRecordsWithClinics}
              onChange={e => setShareRecordsWithClinics(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
          </label>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSavePreferences}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors"
          >
            Save Account Settings
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Evaluator Testing & Data Sandbox
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Need to test appointment booking and clinical intake from a clean baseline? You can reset the reactive localStorage dataset to initial factory seed anytime.
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
