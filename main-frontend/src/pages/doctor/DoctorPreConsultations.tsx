import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Stethoscope, CheckCircle2, AlertCircle, Calendar, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { preConsultationService } from '../../services/preConsultationService';
import { PreConsultation } from '../../types';

export function DoctorPreConsultationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [intakes, setIntakes] = useState<PreConsultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const docId = user.associatedId || 'doc_1';
      const list = await preConsultationService.getByDoctorId(docId);
      setIntakes(list);
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pre-Consultation Patient Intakes</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Patient-reported symptoms, preliminary home vitals, and concerns submitted prior to clinical consultation
        </p>
      </div>

      <div className="space-y-4">
        {intakes.map(intake => (
          <div
            key={intake.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Appointment: #{intake.appointmentId}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{intake.patientName}</h3>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2.5 py-1 rounded-lg font-semibold ${
                  intake.severity === 'Severe'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : intake.severity === 'Moderate'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-teal-50 text-teal-800 border border-teal-200'
                }`}>
                  Severity: {intake.severity}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 font-mono">
                  Submitted: {new Date(intake.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 block font-medium">Primary Symptoms Reported:</span>
                  <p className="text-slate-900 font-semibold mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {intake.primarySymptoms}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-400 block font-medium">Reported Duration:</span>
                    <span className="text-slate-800 font-bold">{intake.symptomDuration}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Known Allergies:</span>
                    <span className="text-rose-700 font-bold">{intake.knownAllergies || 'None'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {intake.vitals && (
                  <div>
                    <span className="text-slate-400 block font-medium mb-1">Home-Measured Preliminary Vitals:</span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-teal-50 rounded-lg border border-teal-100">
                        <span className="text-[10px] text-teal-700 block">BP (mmHg)</span>
                        <span className="font-mono font-bold text-teal-900 text-xs block">
                          {intake.vitals.bloodPressure || 'N/A'}
                        </span>
                      </div>
                      <div className="p-2 bg-teal-50 rounded-lg border border-teal-100">
                        <span className="text-[10px] text-teal-700 block">Pulse (bpm)</span>
                        <span className="font-mono font-bold text-teal-900 text-xs block">
                          {intake.vitals.pulseRate || 'N/A'}
                        </span>
                      </div>
                      <div className="p-2 bg-teal-50 rounded-lg border border-teal-100">
                        <span className="text-[10px] text-teal-700 block">Temp (°F)</span>
                        <span className="font-mono font-bold text-teal-900 text-xs block">
                          {intake.vitals.temperatureF || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {intake.additionalNotes && (
                  <div>
                    <span className="text-slate-400 block font-medium">Patient's Stated Questions:</span>
                    <p className="text-slate-700 italic text-[11px] mt-0.5">"{intake.additionalNotes}"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => navigate('/doctor/consultations', { state: { appointmentId: intake.appointmentId } })}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Open in Consultation Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        ))}

        {intakes.length === 0 && (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
            No pre-consultation forms submitted yet.
          </div>
        )}
      </div>
    </div>
  );
}
