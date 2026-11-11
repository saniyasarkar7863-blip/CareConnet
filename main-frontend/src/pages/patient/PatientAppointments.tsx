import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Pill,
  XCircle,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../../components/common/Modal';

export function PatientAppointmentsPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [loading, setLoading] = useState(true);

  // Reschedule & Cancel Modals
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null);
  const [cancelAppt, setCancelAppt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('11:00 AM');

  const loadAppointments = async () => {
    if (!user) return;
    const list = await appointmentService.getAppointmentsByPatient(user.associatedId || 'pat_1');
    setAppointments(list);
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const handleConfirmCancel = async () => {
    if (!cancelAppt) return;
    try {
      await appointmentService.updateStatus(cancelAppt.id, 'CANCELLED');
      showToast('Appointment Cancelled', 'info', 'The slot has been released back to clinic availability.');
      setCancelAppt(null);
      loadAppointments();
    } catch {
      showToast('Error cancelling appointment', 'error');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleAppt || !newDate) return;

    try {
      await appointmentService.rescheduleAppointment(rescheduleAppt.id, newDate, newTime);
      showToast('Appointment Rescheduled', 'success', `New slot confirmed for ${newDate} at ${newTime}`);
      setRescheduleAppt(null);
      loadAppointments();
    } catch {
      showToast('Error rescheduling', 'error');
    }
  };

  const upcomingList = appointments.filter(
    a => a.status === 'CONFIRMED' || a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS'
  );
  const pastList = appointments.filter(
    a => a.status === 'COMPLETED' || a.status === 'CANCELLED'
  );

  const displayed = activeTab === 'upcoming' ? upcomingList : pastList;

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Consultation Appointments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage upcoming bookings, pre-consultation symptom intakes, and past clinical visits
          </p>
        </div>

        <Link
          to="/patient/doctors"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Book New Appointment</span>
        </Link>
      </div>

      {/* Segmented Tab Buttons */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'upcoming'
              ? 'border-teal-700 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Upcoming Schedule</span>
          <span className="px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-mono font-bold">
            {upcomingList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'past'
              ? 'border-teal-700 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Past Consultations</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono">
            {pastList.length}
          </span>
        </button>
      </div>

      {/* Appointment Cards */}
      <div className="space-y-4">
        {displayed.map(appt => {
          const isCancelled = appt.status === 'CANCELLED';
          const isCompleted = appt.status === 'COMPLETED';

          return (
            <div
              key={appt.id}
              className={`bg-white rounded-2xl border p-6 shadow-xs transition-colors ${
                isCancelled ? 'border-slate-200 opacity-75' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                          : isCancelled
                          ? 'bg-rose-50 text-rose-800 border border-rose-200/60'
                          : 'bg-teal-50 text-teal-800 border border-teal-200/60'
                      }`}
                    >
                      {appt.status}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-semibold text-slate-700">{appt.type}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-mono text-slate-400">ID: {appt.id}</span>
                  </div>

                  <h2 className="text-base font-bold text-slate-900 mt-2">{appt.doctorName}</h2>
                  <p className="text-xs text-teal-800 font-semibold">{appt.doctorSpecialization}</p>
                </div>

                <div className="flex flex-wrap lg:flex-col lg:items-end gap-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{appt.date}</span>
                    <Clock className="w-3.5 h-3.5 text-slate-500 ml-2" />
                    <span>{appt.time}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Fee: ₹{appt.fee} (Receipt on File)
                  </span>
                </div>
              </div>

              {/* Clinic and Reason Details */}
              <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Clinical Facility</span>
                  <div className="mt-1 flex items-start gap-1.5 text-slate-700">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">{appt.clinicName}</p>
                      <p className="text-[11px] text-slate-500">{appt.clinicAddress}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Reason for Visit</span>
                  <p className="mt-1 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {appt.reasonForVisit}
                  </p>
                </div>
              </div>

              {/* Pre-Consultation / Actions Row */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                {/* Pre-Consultation status */}
                <div className="flex items-center gap-2">
                  {appt.preConsultationSubmitted ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/50">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Pre-Consultation Intake Submitted</span>
                    </span>
                  ) : !isCancelled && !isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/50">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Pre-Consultation Form Pending</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">Consultation closed</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!isCancelled && !isCompleted && (
                    <>
                      {!appt.preConsultationSubmitted && (
                        <Link
                          to="/patient/pre-consultation"
                          state={{ appointmentId: appt.id }}
                          className="px-3 py-1.5 font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors"
                        >
                          Submit Pre-Consultation
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setRescheduleAppt(appt);
                          setNewDate(appt.date);
                          setNewTime(appt.time);
                        }}
                        className="px-3 py-1.5 font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        Reschedule
                      </button>

                      <button
                        onClick={() => setCancelAppt(appt)}
                        className="px-3 py-1.5 font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {isCompleted && (
                    <Link
                      to="/patient/prescriptions"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-lg transition-colors"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>View Prescribed Medication</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {displayed.length === 0 && (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
            No {activeTab} appointments found.
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleAppt && (
        <Modal
          isOpen={!!rescheduleAppt}
          onClose={() => setRescheduleAppt(null)}
          title={`Reschedule Consultation: ${rescheduleAppt.doctorName}`}
          subtitle={`Facility: ${rescheduleAppt.clinicName}`}
          maxWidth="md"
        >
          <form onSubmit={handleRescheduleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select New Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Available Slot *
              </label>
              <select
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 bg-white"
              >
                <option value="09:30 AM">09:30 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="02:30 PM">02:30 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRescheduleAppt(null)}
                className="py-2 px-3 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Keep Current Slot
              </button>
              <button
                type="submit"
                className="py-2 px-4 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs"
              >
                Update Appointment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelAppt && (
        <Modal
          isOpen={!!cancelAppt}
          onClose={() => setCancelAppt(null)}
          title="Cancel Scheduled Appointment"
          subtitle={`Appointment ID: #${cancelAppt.id}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to cancel your consultation with{' '}
              <strong className="text-slate-900">{cancelAppt.doctorName}</strong> on{' '}
              <strong className="text-slate-900">{cancelAppt.date} at {cancelAppt.time}</strong>?
            </p>
            <p className="text-slate-500 text-[11px]">
              This time slot will be released back into {cancelAppt.clinicName}'s OPD schedule. You can re-book at any time.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancelAppt(null)}
                className="py-2 px-3 font-medium text-slate-600 hover:text-slate-900"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="py-2 px-4 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
