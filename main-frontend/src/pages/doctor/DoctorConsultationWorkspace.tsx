import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  FileText,
  Pill,
  Clock,
  ArrowRight,
  ClipboardList,
  Heart,
  Save,
  Building2,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { preConsultationService } from '../../services/preConsultationService';
import { consultationService } from '../../services/consultationService';
import { Appointment, PatientProfile, PreConsultation } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export function DoctorConsultationWorkspace() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedApptId, setSelectedApptId] = useState<string>('');
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [preIntake, setPreIntake] = useState<PreConsultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Clinical Form Fields
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalObservations, setClinicalObservations] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUpDays, setFollowUpDays] = useState<number>(7);

  useEffect(() => {
    async function loadWorkspace() {
      if (!user) return;
      const docId = user.associatedId || 'doc_1';
      const appts = await appointmentService.getAppointmentsByDoctor(docId);
      setAppointments(appts);

      const targetId = location.state?.appointmentId || (appts.length > 0 ? appts[0].id : '');
      if (targetId) {
        setSelectedApptId(targetId);
        await loadAppointmentDetails(targetId, appts);
      }
      setLoading(false);
    }
    loadWorkspace();
  }, [user, location.state]);

  const loadAppointmentDetails = async (apptId: string, currentAppts: Appointment[]) => {
    const appt = currentAppts.find(a => a.id === apptId);
    if (!appt) return;

    const [p, intake, existingCon] = await Promise.all([
      patientService.getProfile(appt.patientId),
      preConsultationService.getByAppointmentId(appt.id),
      consultationService.getByAppointmentId(appt.id),
    ]);

    setPatient(p);
    setPreIntake(intake);

    if (existingCon) {
      setChiefComplaint(existingCon.chiefComplaint);
      setClinicalObservations(existingCon.clinicalObservations);
      setDiagnosis(existingCon.diagnosis);
      setTreatmentPlan(existingCon.treatmentPlan);
      setFollowUpDays(existingCon.followUpDays || 7);
    } else {
      setChiefComplaint(appt.reasonForVisit || (intake?.primarySymptoms || ''));
      setClinicalObservations('General condition stable. Chest clear bilaterally. Vitals verified.');
      setDiagnosis('');
      setTreatmentPlan('');
    }
  };

  const handleSelectAppointment = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedApptId(id);
    await loadAppointmentDetails(id, appointments);
  };

  const handleSaveConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt || !patient) return;
    if (!diagnosis.trim() || !treatmentPlan.trim()) {
      showToast('Please enter diagnosis and treatment plan', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await consultationService.recordConsultation({
        appointmentId: selectedAppt.id,
        patientId: patient.id,
        patientName: patient.name,
        doctorId: user?.associatedId || 'doc_1',
        doctorName: user?.name || 'Dr. Priya Nair',
        clinicId: selectedAppt.clinicId,
        clinicName: selectedAppt.clinicName,
        date: new Date().toISOString().split('T')[0],
        chiefComplaint,
        clinicalObservations,
        diagnosis,
        treatmentPlan,
        followUpDays,
      });

      showToast(
        'Consultation Recorded',
        'success',
        `Clinical notes logged for ${patient.name}. Appointment marked completed.`
      );
    } catch {
      showToast('Error saving consultation notes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProceedToPrescription = async () => {
    if (!selectedAppt || !patient) return;
    if (diagnosis.trim() || treatmentPlan.trim() || chiefComplaint.trim()) {
      try {
        await consultationService.recordConsultation({
          appointmentId: selectedAppt.id,
          patientId: patient.id,
          patientName: patient.name,
          doctorId: user?.associatedId || 'doc_1',
          doctorName: user?.name || 'Dr. Priya Nair',
          clinicId: selectedAppt.clinicId,
          clinicName: selectedAppt.clinicName,
          date: new Date().toISOString().split('T')[0],
          chiefComplaint: chiefComplaint || selectedAppt.reasonForVisit,
          clinicalObservations: clinicalObservations || 'Clinical examination noted.',
          diagnosis: diagnosis || selectedAppt.reasonForVisit,
          treatmentPlan: treatmentPlan || 'Symptomatic management',
          followUpDays,
        });
      } catch (e) {
        console.error('Draft auto-save notice:', e);
      }
    }
    navigate('/doctor/prescriptions', {
      state: {
        appointmentId: selectedAppt.id,
        patientId: patient.id,
        patientName: patient.name,
        diagnosis: diagnosis || selectedAppt.reasonForVisit,
      },
    });
  };

  const selectedAppt = appointments.find(a => a.id === selectedApptId);

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
          <h1 className="text-xl font-bold text-slate-900">Clinical Consultation Workspace</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Conduct examination, review patient pre-intakes, and record definitive diagnosis
          </p>
        </div>

        {selectedAppt && (
          <button
            type="button"
            onClick={handleProceedToPrescription}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Write Digital Prescription →</span>
          </button>
        )}
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
          No appointments available to consult.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Patient Selector Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 shrink-0">
              Active Patient Queue:
            </span>
            <select
              value={selectedApptId}
              onChange={handleSelectAppointment}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 bg-white font-medium"
            >
              {appointments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.patientName} — {a.date} at {a.time} [{a.clinicName}] ({a.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 4 Cols: Patient Demographics & Pre-Consultation Intake */}
            <div className="lg:col-span-4 space-y-6">
              {/* Patient Snapshot */}
              {patient && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{patient.name}</h2>
                      <p className="text-[11px] text-slate-500">
                        {patient.gender} · DOB: {patient.dob}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-medium">Blood Group</span>
                      <span className="font-bold text-teal-800 font-mono mt-0.5 block">{patient.bloodGroup}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-medium">Height / Weight</span>
                      <span className="font-bold text-slate-800 font-mono mt-0.5 block">
                        {patient.heightCm}cm / {patient.weightKg}kg
                      </span>
                    </div>
                  </div>

                  {/* Contraindication Alert */}
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200/70 text-xs">
                    <span className="font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Known Allergies:
                    </span>
                    <p className="text-rose-900 text-[11px]">
                      {patient.allergies.join(', ') || 'None reported'}
                    </p>
                  </div>

                  {/* Chronic conditions */}
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                      Chronic Medical Conditions:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {patient.chronicConditions.map((cond, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pre-Consultation Symptom Sheet */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-teal-700" />
                    Patient-Submitted Intake
                  </span>
                  {preIntake ? (
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Verified
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                      Not Submitted
                    </span>
                  )}
                </div>

                {preIntake ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block">Reported Symptoms</span>
                      <p className="text-slate-800 font-medium mt-0.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {preIntake.primarySymptoms}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 block font-medium">Duration</span>
                        <span className="text-slate-800 font-semibold mt-0.5 block">{preIntake.symptomDuration}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Severity</span>
                        <span className="text-slate-800 font-semibold mt-0.5 block">{preIntake.severity}</span>
                      </div>
                    </div>

                    {preIntake.vitals && (
                      <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-100 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <span className="text-[10px] text-teal-700 block">Blood Pressure</span>
                          <span className="font-mono font-bold text-teal-900 text-xs block">
                            {preIntake.vitals.bloodPressure || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-teal-700 block">Pulse</span>
                          <span className="font-mono font-bold text-teal-900 text-xs block">
                            {preIntake.vitals.pulseRate ? `${preIntake.vitals.pulseRate} bpm` : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-teal-700 block">Temp</span>
                          <span className="font-mono font-bold text-teal-900 text-xs block">
                            {preIntake.vitals.temperatureF ? `${preIntake.vitals.temperatureF}°F` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}

                    {preIntake.additionalNotes && (
                      <div>
                        <span className="text-slate-400 block font-medium">Patient's Notes / Questions</span>
                        <p className="text-slate-600 text-[11px] mt-0.5 italic">"{preIntake.additionalNotes}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-3">
                    Patient did not submit pre-consultation intake. Proceed with standard clinical anamnesis.
                  </p>
                )}
              </div>
            </div>

            {/* Right 8 Cols: Clinical Notes Form */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <form onSubmit={handleSaveConsultation} className="space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">
                    Clinical Examination & Differential Diagnosis
                  </h2>
                  <span className="text-xs font-mono text-slate-400">
                    Date: {new Date().toISOString().split('T')[0]}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chief Complaint *
                  </label>
                  <input
                    type="text"
                    required
                    value={chiefComplaint}
                    onChange={e => setChiefComplaint(e.target.value)}
                    placeholder="e.g. Occasional mild tension headache behind neck in evenings"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinical Observations & Physical Examination *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={clinicalObservations}
                    onChange={e => setClinicalObservations(e.target.value)}
                    placeholder="Findings: S1 S2 heard normal, chest clear, no ankle edema, posterior pharynx non-congested, fundus normal..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Definitive / Working Diagnosis *
                  </label>
                  <input
                    type="text"
                    required
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    placeholder="e.g. Tension-Type Cephalea secondary to Cervical Strain & Stage 1 Essential Hypertension"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Treatment Plan & Lifestyle Modifications *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={treatmentPlan}
                    onChange={e => setTreatmentPlan(e.target.value)}
                    placeholder="Prescription of anti-hypertensive maintenance, neck isometric stretches, hydration regimen, avoid late screen exposure..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recommended Follow-Up (Days)
                    </label>
                    <select
                      value={followUpDays}
                      onChange={e => setFollowUpDays(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 bg-white"
                    >
                      <option value={3}>3 Days (Acute review)</option>
                      <option value={7}>7 Days (1 Week)</option>
                      <option value={14}>14 Days (2 Weeks)</option>
                      <option value={30}>30 Days (1 Month)</option>
                      <option value={90}>90 Days (Quarterly Chronic Review)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleProceedToPrescription}
                      className="w-full py-2 px-3 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>Prepare Electronic Prescription</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="py-2.5 px-6 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Logging Notes...' : 'Save Consultation Record'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
