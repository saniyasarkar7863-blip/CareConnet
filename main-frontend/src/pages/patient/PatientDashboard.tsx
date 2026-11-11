import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  FileText,
  Pill,
  Clock,
  ArrowRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Building2,
  ChevronRight,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { reportService } from '../../services/reportService';
import { prescriptionService } from '../../services/prescriptionService';
import { reminderService } from '../../services/reminderService';
import { patientService } from '../../services/patientService';
import { Appointment, Prescription, MedicineReminder, MedicalReport, PatientProfile } from '../../types';
import { StatCard } from '../../components/common/StatCard';

export function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const patientId = user.associatedId || 'pat_1';
      const [appts, reps, rxs, rems, prof] = await Promise.all([
        appointmentService.getAppointmentsByPatient(patientId),
        reportService.getReportsByPatient(patientId),
        prescriptionService.getPrescriptionsByPatient(patientId),
        reminderService.getRemindersByPatient(patientId),
        patientService.getProfile(patientId),
      ]);

      setAppointments(appts);
      setReports(reps);
      setPrescriptions(rxs);
      setReminders(rems);
      setPatientProfile(prof);
      setLoading(false);
    }
    loadData();
  }, [user]);

  const upcomingAppt = appointments
    .filter(a => a.status === 'CONFIRMED' || a.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const activeRemindersCount = reminders.filter(r => r.isActive).length;
  const takenCount = reminders.reduce((acc, curr) => acc + curr.takenToday.filter(Boolean).length, 0);
  const totalDosesToday = reminders.reduce((acc, curr) => acc + curr.scheduledTimes.length, 0);

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
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-teal-300 font-semibold">
            Universal Health Record
          </span>
          <h1 className="text-xl sm:text-2xl font-bold mt-1">
            Welcome back, {patientProfile?.name || user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl">
            Your clinical history, ongoing prescriptions, and verified medical reports are synchronized across participating facilities.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-teal-200">
            <span>Blood Group: <strong className="text-white font-mono">{patientProfile?.bloodGroup || 'B+'}</strong></span>
            <span>·</span>
            <span>Emergency Contact: <strong className="text-white">{patientProfile?.emergencyContact.name}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            to="/patient/doctors"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-teal-900 bg-white hover:bg-teal-50 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </Link>
          <Link
            to="/patient/reports"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-teal-700/60 hover:bg-teal-700 border border-teal-500/40 rounded-xl transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Upload Report</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Appointments"
          value={appointments.length}
          sublabel={`${appointments.filter(a => a.status === 'COMPLETED').length} Completed`}
          icon={Calendar}
        />
        <StatCard
          label="Medical Records"
          value={reports.length}
          sublabel="Diagnostic lab files"
          icon={FileText}
        />
        <StatCard
          label="Active Prescriptions"
          value={prescriptions.length}
          sublabel="Issued by licensed physicians"
          icon={Pill}
        />
        <StatCard
          label="Today's Reminders"
          value={`${takenCount}/${totalDosesToday}`}
          sublabel={`${activeRemindersCount} active regimens`}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Appointment Spotlight */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-700" />
                <h2 className="text-sm font-bold text-slate-900">Upcoming Consultation</h2>
              </div>
              <Link to="/patient/appointments" className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingAppt ? (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider block">
                      Confirmed Booking
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{upcomingAppt.doctorName}</h3>
                    <p className="text-xs text-slate-600">{upcomingAppt.doctorSpecialization}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{upcomingAppt.clinicName}</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0 bg-white sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-teal-100">
                    <p className="text-xs font-mono font-bold text-slate-900">{upcomingAppt.date}</p>
                    <p className="text-xs font-semibold text-teal-700">{upcomingAppt.time}</p>
                    <span className="inline-block mt-1 text-[11px] font-medium text-slate-500">
                      Fee: ₹{upcomingAppt.fee}
                    </span>
                  </div>
                </div>

                {/* Pre-Consultation Status Notification */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    {upcomingAppt.preConsultationSubmitted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">
                        {upcomingAppt.preConsultationSubmitted
                          ? 'Pre-Consultation Form Submitted'
                          : 'Pre-Consultation Intake Pending'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {upcomingAppt.preConsultationSubmitted
                          ? 'Symptoms and preliminary vitals transmitted to Dr. Priya Nair.'
                          : 'Submit your symptoms in advance to optimize visit duration.'}
                      </p>
                    </div>
                  </div>

                  {!upcomingAppt.preConsultationSubmitted ? (
                    <Link
                      to="/patient/pre-consultation"
                      state={{ appointmentId: upcomingAppt.id }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors shrink-0"
                    >
                      Fill Form
                    </Link>
                  ) : (
                    <Link
                      to="/patient/pre-consultation"
                      state={{ appointmentId: upcomingAppt.id }}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
                    >
                      Review
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                <p>No upcoming appointments scheduled.</p>
                <Link
                  to="/patient/doctors"
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 rounded-lg"
                >
                  Find a Doctor & Book
                </Link>
              </div>
            )}
          </div>

          {/* Recent Prescriptions Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-700" />
                <h2 className="text-sm font-bold text-slate-900">Recent Prescriptions</h2>
              </div>
              <Link to="/patient/prescriptions" className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1">
                <span>View All ({prescriptions.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {prescriptions.slice(0, 2).map(rx => (
                <div key={rx.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{rx.doctorName}</span>
                      <span className="text-slate-400 mx-1.5">·</span>
                      <span className="text-slate-500">{rx.doctorSpecialization}</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">{rx.date}</span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium mt-1">
                    Diagnosis: {rx.diagnosis}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {rx.items.map(item => (
                      <span key={item.id} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.medicineName} ({item.dosage})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Medicine Reminders & Quick Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Medicine Reminder Schedule */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-700" />
                <h2 className="text-sm font-bold text-slate-900">Today's Medication Schedule</h2>
              </div>
              <Link to="/patient/reminders" className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1">
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {reminders.map(rem => (
                <div key={rem.id} className="p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{rem.medicineName}</p>
                    <p className="text-slate-500 text-[11px]">
                      {rem.dosage} · {rem.scheduledTimes.join(', ')}
                    </p>
                    <p className="text-[11px] text-teal-800 mt-1">{rem.instructions}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    rem.takenToday[0] ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {rem.takenToday[0] ? 'Taken' : 'Due'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Clinical Shortcuts
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs">
              <Link
                to="/patient/profile"
                className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-between text-slate-700 font-medium transition-colors"
              >
                <span>Edit Medical Profile & Allergies</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/patient/history"
                className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-between text-slate-700 font-medium transition-colors"
              >
                <span>View Chronic Conditions History</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/patient/reports"
                className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-between text-slate-700 font-medium transition-colors"
              >
                <span>Manage Diagnostic Lab Access</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
