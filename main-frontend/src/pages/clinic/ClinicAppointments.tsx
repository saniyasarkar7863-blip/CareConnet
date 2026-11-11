import React, { useState, useEffect } from 'react';
import { CalendarDays, Filter, Clock, CheckCircle2, AlertCircle, Building2, User, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { Appointment, AppointmentStatus } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export function ClinicAppointmentsPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    if (!user) return;
    const clinicId = user.associatedId || 'clinic_1';
    const list = await appointmentService.getAppointmentsByClinic(clinicId);
    setAppointments(list);
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      await appointmentService.updateStatus(id, status);
      showToast('Facility Status Updated', 'info', `Appointment marked as ${status}`);
      loadAppointments();
    } catch {
      showToast('Error updating status', 'error');
    }
  };

  const filtered = appointments.filter(a => {
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchQuery =
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.reasonForVisit.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
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
          <h1 className="text-xl font-bold text-slate-900">Clinic Daily Consultations Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational appointment queue for facility reception desk and patient check-in
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search patient / doctor..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 w-48"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>

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

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold">
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Consultant Doctor</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Pre-Intake</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Desk Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(appt => {
                const isCompleted = appt.status === 'COMPLETED';
                const isCancelled = appt.status === 'CANCELLED';

                return (
                  <tr key={appt.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{appt.patientName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">ID: {appt.patientId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">{appt.doctorName}</span>
                      <span className="text-[11px] text-teal-800">{appt.doctorSpecialization}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="font-semibold text-slate-900 block">{appt.date}</span>
                      <span className="text-slate-500 text-[11px]">{appt.time}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                      {appt.reasonForVisit}
                    </td>
                    <td className="py-3 px-4">
                      {appt.preConsultationSubmitted ? (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Submitted
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
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
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!isCompleted && !isCancelled ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors"
                          >
                            Check-In
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                            className="px-2 py-1 text-[11px] text-slate-500 hover:text-rose-600 rounded-md"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Archived</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">
            No appointments matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
