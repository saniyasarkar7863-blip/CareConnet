import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  CalendarDays,
  Clock,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clinicService } from '../../services/clinicService';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { Clinic, Appointment, DoctorProfile } from '../../types';
import { StatCard } from '../../components/common/StatCard';

export function ClinicDashboard() {
  const { user } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const clinicId = user.associatedId || 'clinic_1';
      const [c, appts, allDocs] = await Promise.all([
        clinicService.getClinicById(clinicId),
        appointmentService.getAppointmentsByClinic(clinicId),
        doctorService.getAllDoctors(),
      ]);

      setClinic(c);
      setAppointments(appts);
      if (c) {
        setDoctors(allDocs.filter(d => c.doctorIds.includes(d.id)));
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const activeCount = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'SCHEDULED').length;

  return (
    <div className="space-y-6">
      {/* Clinic Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
            Healthcare Facility Administration
          </span>
          <h1 className="text-xl sm:text-2xl font-bold mt-1">{clinic?.name}</h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
            {clinic?.tagline} · Reg: <span className="font-mono text-white">{clinic?.registrationNumber}</span>
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{clinic?.address}, {clinic?.city}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{clinic?.operatingHours}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            to="/clinic/doctors"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-teal-950 bg-white hover:bg-emerald-50 rounded-xl shadow-xs transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>Manage Doctors ({doctors.length})</span>
          </Link>
          <Link
            to="/clinic/appointments"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700/60 hover:bg-emerald-700 border border-emerald-500/40 rounded-xl transition-colors shadow-xs"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Facility Appointments</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Consultations"
          value={activeCount}
          sublabel="Today's scheduled OPD queue"
          icon={CalendarDays}
        />
        <StatCard
          label="Affiliated Physicians"
          value={doctors.length}
          sublabel="Active credentialed doctors"
          icon={Users}
        />
        <StatCard
          label="Completed Visits"
          value={completedCount}
          sublabel="Prescriptions issued on-site"
          icon={CheckCircle2}
        />
        <StatCard
          label="Diagnostic Infrastructure"
          value={clinic?.facilities.length || 0}
          sublabel="Operational clinical units"
          icon={Building2}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8: Daily Appointment List */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Today's Clinic Consultation Flow</h2>
              <p className="text-xs text-slate-500">Cross-departmental patient appointments</p>
            </div>
            <Link to="/clinic/appointments" className="text-xs text-teal-700 hover:text-teal-800 font-semibold">
              View All ({appointments.length}) →
            </Link>
          </div>

          <div className="space-y-3">
            {appointments.slice(0, 5).map(a => (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{a.patientName}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-slate-500 font-bold">{a.time}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {a.status}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    Specialist: <strong className="text-slate-900">{a.doctorName}</strong> ({a.doctorSpecialization})
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Reason: {a.reasonForVisit}</p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs font-bold text-slate-900 font-mono">₹{a.fee}</span>
                  <span className="block text-[10px] text-slate-400">Consultation Fee</span>
                </div>
              </div>
            ))}

            {appointments.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                No appointments booked for this facility yet.
              </div>
            )}
          </div>
        </div>

        {/* Right 4: Associated Doctors Overview */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Active Doctors on Duty</h2>
              <Link to="/clinic/doctors" className="text-xs text-teal-700 hover:text-teal-800 font-semibold">
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {doctors.map(d => (
                <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{d.name}</span>
                    <span className="font-mono text-[11px] text-teal-800">₹{d.consultationFee}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{d.specialization}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Slots: {d.availableSlots.slice(0, 3).join(', ')}...
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Operational Facilities
            </h2>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {clinic?.facilities.map((fac, i) => (
                <span key={i} className="px-2.5 py-1 text-xs rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                  {fac}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
