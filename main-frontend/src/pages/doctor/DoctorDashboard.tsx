import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Stethoscope,
  ClipboardList,
  Pill,
  ArrowRight,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { consultationService } from '../../services/consultationService';
import { DoctorProfile, Appointment, Consultation } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { useNotification } from '../../context/NotificationContext';

export function DoctorDashboard() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const docId = user.associatedId || 'doc_1';
      const [d, appts, cons] = await Promise.all([
        doctorService.getDoctorById(docId),
        appointmentService.getAppointmentsByDoctor(docId),
        consultationService.getByDoctorId(docId),
      ]);

      setDoctor(d);
      setAppointments(appts);
      setConsultations(cons);
      setLoading(false);
    }
    loadData();
  }, [user]);

  const todayStr = '2026-11-18'; // Mock reference date
  const todayAppts = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'SCHEDULED');
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const uniquePatients = new Set(appointments.map(a => a.patientId)).size;

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-teal-400 font-semibold">
            Physician Clinical Console
          </span>
          <h1 className="text-xl sm:text-2xl font-bold mt-1">
            Welcome, {doctor?.name || user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {doctor?.specialization} · License No: <span className="font-mono text-white">{doctor?.licenseNumber}</span>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span>Rating: <strong className="text-white font-mono">{doctor?.rating} / 5.0</strong></span>
            <span>·</span>
            <span>Affiliated Facilities: <strong className="text-white">{doctor?.associatedClinicIds.length} Clinics</strong></span>
            <span>·</span>
            <span>Consultation Fee: <strong className="text-white font-mono">₹{doctor?.consultationFee}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            to="/doctor/consultations"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-xs transition-colors"
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
            <span>Consultation Workspace</span>
          </Link>
          <Link
            to="/doctor/prescriptions"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-xs"
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Write e-Prescription</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Queue"
          value={todayAppts.length}
          sublabel="Scheduled & Confirmed"
          icon={Clock}
        />
        <StatCard
          label="Total Consultations"
          value={completedCount + consultations.length}
          sublabel="Closed clinical records"
          icon={CheckCircle2}
        />
        <StatCard
          label="Unique Patients"
          value={uniquePatients || 1}
          sublabel="Under your care"
          icon={Users}
        />
        <StatCard
          label="Pre-Intakes Available"
          value={appointments.filter(a => a.preConsultationSubmitted).length}
          sublabel="Ready for review"
          icon={ClipboardList}
        />
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scheduled Appointments Queue */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Upcoming Patient Consultation Queue</h2>
              <p className="text-xs text-slate-500">Ordered by date and scheduled time slots</p>
            </div>
            <Link to="/doctor/appointments" className="text-xs text-teal-700 hover:text-teal-800 font-semibold">
              View Full Queue →
            </Link>
          </div>

          <div className="space-y-3">
            {todayAppts.map(appt => (
              <div
                key={appt.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-teal-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {appt.status}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900">{appt.date} · {appt.time}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs text-slate-500">{appt.type}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-1">{appt.patientName}</h3>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    Chief Complaint: {appt.reasonForVisit}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{appt.clinicName}</span>
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  {appt.preConsultationSubmitted ? (
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Pre-Intake Ready</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      No Pre-Intake
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => navigate('/doctor/consultations', { state: { appointmentId: appt.id } })}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                    >
                      <span>Start Consult</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {todayAppts.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                No pending consultations in your immediate queue.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pre-Consultation Alerts & Shortcuts */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Patient Intake Reviews
            </h2>
            <div className="space-y-3">
              {appointments
                .filter(a => a.preConsultationSubmitted)
                .slice(0, 3)
                .map(a => (
                  <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{a.patientName}</span>
                      <span className="font-mono text-[11px] text-slate-500">{a.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                      {a.reasonForVisit}
                    </p>
                    <div className="mt-2 text-right">
                      <Link
                        to="/doctor/pre-consultations"
                        className="text-[11px] font-semibold text-teal-700 hover:text-teal-800"
                      >
                        Inspect Vitals & Symptoms →
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick clinical actions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Doctor Shortcuts
            </h2>
            <Link
              to="/doctor/patients"
              className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-between text-slate-700 font-medium"
            >
              <span>Directory of Patient Records</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              to="/doctor/clinics"
              className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-between text-slate-700 font-medium"
            >
              <span>Manage Clinic Associations</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              to="/doctor/reports"
              className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-between text-slate-700 font-medium"
            >
              <span>Diagnostic Lab Files</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
