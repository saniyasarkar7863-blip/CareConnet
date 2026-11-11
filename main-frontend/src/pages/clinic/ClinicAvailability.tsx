import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Users, Building2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clinicService } from '../../services/clinicService';
import { doctorService } from '../../services/doctorService';
import { Clinic, DoctorProfile } from '../../types';

export function ClinicAvailabilityPage() {
  const { user } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const clinicId = user.associatedId || 'clinic_1';
      const [c, allDocs] = await Promise.all([
        clinicService.getClinicById(clinicId),
        doctorService.getAllDoctors(),
      ]);
      setClinic(c);
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

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Doctor Shift & Roster Availability</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Departmental consultation slots and duty schedules across the weekly outpatient timetable
        </p>
      </div>

      {/* Facility Hours Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">
            Operational Hours
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">{clinic?.name}</h2>
          <p className="text-xs text-slate-500">{clinic?.operatingHours}</p>
        </div>

        <span className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">
          ● OPD Facilities Open
        </span>
      </div>

      {/* Doctor Timetable Grid */}
      <div className="space-y-4">
        {doctors.map(doc => (
          <div
            key={doc.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {doc.name.replace('Dr. ', '').charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{doc.name}</h3>
                  <p className="text-xs text-teal-800 font-semibold">{doc.specialization}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Practice Days:</span>
                <div className="flex gap-1">
                  {daysOfWeek.map(day => {
                    const isAvailable = doc.availableDays.includes(day);
                    return (
                      <span
                        key={day}
                        className={`w-7 h-6 rounded flex items-center justify-center text-[11px] font-semibold ${
                          isAvailable
                            ? 'bg-teal-700 text-white'
                            : 'bg-slate-100 text-slate-300'
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                Outpatient Time Slots
              </span>
              <div className="flex flex-wrap gap-2">
                {doc.availableSlots.map(slot => (
                  <div
                    key={slot}
                    className="px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50/60 text-xs font-mono font-medium text-teal-900 flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-teal-700" />
                    <span>{slot}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
