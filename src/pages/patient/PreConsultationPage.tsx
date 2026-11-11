import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, AlertCircle, ArrowRight, Stethoscope, Building2, Calendar, Clock, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { preConsultationService } from '../../services/preConsultationService';
import { patientService } from '../../services/patientService';
import { Appointment, PreConsultation, PatientProfile } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate, useLocation } from 'react-router-dom';

export function PreConsultationPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedApptId, setSelectedApptId] = useState<string>('');
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [existingIntake, setExistingIntake] = useState<PreConsultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [primarySymptoms, setPrimarySymptoms] = useState('');
  const [symptomDuration, setSymptomDuration] = useState('3 days');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Mild');
  const [existingMedications, setExistingMedications] = useState('');
  const [knownAllergies, setKnownAllergies] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Preliminary Home Vitals
  const [bpSystolic, setBpSystolic] = useState('126');
  const [bpDiastolic, setBpDiastolic] = useState('82');
  const [pulseRate, setPulseRate] = useState('74');
  const [temperatureF, setTemperatureF] = useState('98.4');

  useEffect(() => {
    async function init() {
      if (!user) return;
      const patientId = user.associatedId || 'pat_1';
      const [appts, prof] = await Promise.all([
        appointmentService.getAppointmentsByPatient(patientId),
        patientService.getProfile(patientId),
      ]);

      const activeOnes = appts.filter(a => a.status === 'CONFIRMED' || a.status === 'SCHEDULED');
      setAppointments(activeOnes);
      setPatientProfile(prof);

      if (activeOnes.length > 0) {
        const targetId = location.state?.appointmentId && activeOnes.some(a => a.id === location.state.appointmentId)
          ? location.state.appointmentId
          : activeOnes[0].id;
        setSelectedApptId(targetId);
        await checkExisting(targetId, prof);
      }
      setLoading(false);
    }
    init();
  }, [user, location.state]);

  const checkExisting = async (apptId: string, prof?: PatientProfile | null) => {
    const intake = await preConsultationService.getByAppointmentId(apptId);
    if (intake) {
      setExistingIntake(intake);
      setPrimarySymptoms(intake.primarySymptoms);
      setSymptomDuration(intake.symptomDuration);
      setSeverity(intake.severity);
      setExistingMedications(intake.existingMedications);
      setKnownAllergies(intake.knownAllergies);
      setAdditionalNotes(intake.additionalNotes);
      if (intake.vitals?.bloodPressure) {
        const [sys, dia] = intake.vitals.bloodPressure.split('/');
        if (sys) setBpSystolic(sys);
        if (dia) setBpDiastolic(dia);
      }
      if (intake.vitals?.pulseRate) setPulseRate(String(intake.vitals.pulseRate));
      if (intake.vitals?.temperatureF) setTemperatureF(String(intake.vitals.temperatureF));
    } else {
      setExistingIntake(null);
      // Pre-fill from profile
      const p = prof || patientProfile;
      if (p) {
        setKnownAllergies(p.allergies.join(', '));
        setExistingMedications('Telmisartan 40mg daily');
      }
      setPrimarySymptoms('');
      setAdditionalNotes('');
    }
  };

  const handleAppointmentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedApptId(id);
    await checkExisting(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApptId || !primarySymptoms.trim()) {
      showToast('Please describe your symptoms', 'error');
      return;
    }

    const currentAppt = appointments.find(a => a.id === selectedApptId);
    if (!currentAppt) return;

    setIsSubmitting(true);
    try {
      const intake = await preConsultationService.submitPreConsultation({
        appointmentId: currentAppt.id,
        patientId: user?.associatedId || 'pat_1',
        patientName: user?.name || 'Aarav Sharma',
        doctorId: currentAppt.doctorId,
        primarySymptoms,
        symptomDuration,
        severity,
        existingMedications,
        knownAllergies,
        additionalNotes,
        vitals: {
          bloodPressure: `${bpSystolic}/${bpDiastolic}`,
          pulseRate: Number(pulseRate),
          temperatureF: Number(temperatureF),
        },
      });

      setExistingIntake(intake);
      showToast('Pre-Consultation Intake Transmitted', 'success', `Sent to ${currentAppt.doctorName} for review.`);
    } catch {
      showToast('Error submitting pre-consultation intake', 'error');
    } finally {
      setIsSubmitting(false);
    }
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
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pre-Consultation Intake Form</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Share symptoms, duration, and preliminary home vitals with your physician in advance
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-slate-900">No Scheduled Appointments Found</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You must have an upcoming or confirmed consultation to submit a pre-consultation intake.
          </p>
          <button
            onClick={() => navigate('/patient/doctors')}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors"
          >
            Find a Doctor & Book
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form Column */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Linked Appointment Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Associated Appointment *
                </label>
                <select
                  value={selectedApptId}
                  onChange={handleAppointmentChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 bg-white"
                >
                  {appointments.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.doctorName} ({a.doctorSpecialization}) — {a.date} at {a.time} [{a.clinicName}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Verified status if previously submitted */}
              {existingIntake && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Intake already submitted on {new Date(existingIntake.submittedAt).toLocaleDateString()}. You may update and resubmit anytime.</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold">STATUS: REVIEW READY</span>
                </div>
              )}

              {/* Chief Symptoms */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Clinical Symptoms & Presentation
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Describe your primary symptoms / discomfort *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={primarySymptoms}
                    onChange={e => setPrimarySymptoms(e.target.value)}
                    placeholder="e.g. Mild continuous headache behind the neck in evenings; accompanied by occasional dizziness when standing up."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Duration of Symptoms *
                    </label>
                    <input
                      type="text"
                      required
                      value={symptomDuration}
                      onChange={e => setSymptomDuration(e.target.value)}
                      placeholder="e.g. 5 days, 2 weeks, intermittently for 1 month"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Perceived Severity *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Mild', 'Moderate', 'Severe'] as const).map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSeverity(lvl)}
                          className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                            severity === lvl
                              ? lvl === 'Severe'
                                ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                                : lvl === 'Moderate'
                                ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                                : 'bg-teal-50 text-teal-800 border-teal-300 font-bold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preliminary Vitals (Home-Measured) */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    2. Home-Monitored Vitals (Optional)
                  </h2>
                  <span className="text-[11px] text-slate-500">Provide if measured recently</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">BP Systolic</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="120"
                        value={bpSystolic}
                        onChange={e => setBpSystolic(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                      />
                      <span className="text-[10px] text-slate-400">mmHg</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">BP Diastolic</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="80"
                        value={bpDiastolic}
                        onChange={e => setBpDiastolic(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                      />
                      <span className="text-[10px] text-slate-400">mmHg</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Pulse Rate</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="72"
                        value={pulseRate}
                        onChange={e => setPulseRate(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                      />
                      <span className="text-[10px] text-slate-400">bpm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Temperature</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="98.6"
                        value={temperatureF}
                        onChange={e => setTemperatureF(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                      />
                      <span className="text-[10px] text-slate-400">°F</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Meds & Allergies */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  3. Medications & Notes
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Medications & Supplements
                    </label>
                    <input
                      type="text"
                      value={existingMedications}
                      onChange={e => setExistingMedications(e.target.value)}
                      placeholder="e.g. Telmisartan 40mg, Vitamin C"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Known Allergies & Sensitivities
                    </label>
                    <input
                      type="text"
                      value={knownAllergies}
                      onChange={e => setKnownAllergies(e.target.value)}
                      placeholder="e.g. Penicillin, Shellfish"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Additional Context / Specific Questions for Physician
                  </label>
                  <textarea
                    rows={2}
                    value={additionalNotes}
                    onChange={e => setAdditionalNotes(e.target.value)}
                    placeholder="Any specific questions, family history, or triggers you noticed..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-6 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>{isSubmitting ? 'Transmitting Intake...' : 'Submit Pre-Consultation Intake'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Summary Spotlight */}
          <div className="lg:col-span-4 space-y-6">
            {selectedAppt && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">
                    Linked Appointment
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedAppt.doctorName}</h3>
                  <p className="text-xs text-slate-500">{selectedAppt.doctorSpecialization}</p>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedAppt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedAppt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedAppt.clinicName}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900 block mb-0.5">Why submit pre-consultation?</span>
                  Pre-intake records allow Dr. {selectedAppt.doctorName.replace('Dr. ', '')} to review your timeline, identify contraindications, and formulate differential diagnoses prior to starting the session.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
