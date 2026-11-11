import React, { useState } from 'react';
import { Settings, Building2, Bell, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export function ClinicSettingsPage() {
  const { resetDemoData } = useAuth();
  const { showToast } = useNotification();

  const [autoConfirmBookings, setAutoConfirmBookings] = useState(true);
  const [notifyDoctorsSms, setNotifyDoctorsSms] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Clinic Settings Saved', 'success', 'Reception desk preferences updated.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Clinic Administration Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure reception desk policies, automated confirmations, and testing datasets
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Reception & Appointment Automation
        </h2>

        <div className="space-y-4">
          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-900 block">Instant Patient Booking Confirmation</span>
              <span className="text-xs text-slate-500">Automatically mark appointments as confirmed when booked within valid doctor shift hours.</span>
            </div>
            <input
              type="checkbox"
              checked={autoConfirmBookings}
              onChange={e => setAutoConfirmBookings(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
          </label>

          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-900 block">Physician SMS Roster Notifications</span>
              <span className="text-xs text-slate-500">Dispatch daily morning queue summaries to affiliated doctors.</span>
            </div>
            <input
              type="checkbox"
              checked={notifyDoctorsSms}
              onChange={e => setNotifyDoctorsSms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
          </label>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors"
          >
            Save Facility Configuration
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Evaluator Sandbox Management
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Reset all cross-portal patient appointments, clinical notes, and doctor memberships back to clean initial demo seed.
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
