import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Pill,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { Appointment, AppointmentStatus } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    if (!user) return;
    const docId = user.associatedId || 'doc_1';
    const list = await appointmentService.getAppointmentsByDoctor(docId);
    setAppointments(list);
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      await appointmentService.updateStatus(id, status);
      showToast('Status Updated', 'info', `Appointment status set to ${status}`);
      loadAppointments();
    } catch {
      showToast('Error updating status', 'error');
    }
  };

  const filtered = appointments.filter(a => {
    if (statusFilter === 'All') return true;
    return a.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Patient Appointments & Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor incoming scheduled visits, pre-consultation status, and start consultations
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 bg-white"
          >
            <option value="All">All Statuses ({appointments.length})</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(appt => {
          const isCompleted = appt.status === 'COMPLETED';
          const isCancelled = appt.status === 'CANCELLED';

          return (
            <div
              key={appt.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : isCancelled
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-teal-50 text-teal-800 border border-teal-200'
                    }`}
                  >
                    {appt.status}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">{appt.date} · {appt.time}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs text-slate-500">{appt.type}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{appt.patientName}</h3>
                <p className="text-xs text-slate-600 line-clamp-1">
                  Reason: {appt.reasonForVisit}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{appt.clinicName}</span>
                  </span>
                  <span>·</span>
                  <span>Fee: ₹{appt.fee}</span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-wrap sm:flex-col sm:items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                {appt.preConsultationSubmitted ? (
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pre-Consultation Submitted</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                    Pre-Intake Pending
                  </span>
                )}

                <div className="flex items-center gap-1.5 pt-1">
                  {!isCompleted && !isCancelled && (
                    <>
                      <button
                        onClick={() => navigate('/doctor/consultations', { state: { appointmentId: appt.id } })}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Start Consult</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        Mark Completed
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                        className="px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {isCompleted && (
                    <button
                      onClick={() => navigate('/doctor/prescriptions', { state: { appointmentId: appt.id } })}
                      className="px-3.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>View / Issue Rx</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
            No appointments found matching "{statusFilter}".
          </div>
        )}
      </div>
    </div>
  );
}
