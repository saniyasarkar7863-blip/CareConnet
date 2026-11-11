import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Pill,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Building2,
  Calendar,
  Eye,
  Printer,
  Download,
  Stethoscope,
  Clock,
  History,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { prescriptionService } from '../../services/prescriptionService';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { Appointment, PatientProfile, PrescriptionItem, DoctorProfile, Prescription } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../../components/common/Modal';

export function DoctorPrescriptionWriter() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'builder' | 'history'>('builder');
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedApptId, setSelectedApptId] = useState<string>('');
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [issuedHistory, setIssuedHistory] = useState<Prescription[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [previewPrescription, setPreviewPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [items, setItems] = useState<PrescriptionItem[]>([
    {
      id: `rx_item_${Date.now()}`,
      medicineName: 'Telmisartan',
      dosage: '40 mg',
      frequency: 'Once daily in the morning (1-0-0)',
      duration: '30 days',
      foodTiming: 'After Food',
      instructions: 'Take every morning with a glass of water.',
    },
    {
      id: `rx_item_${Date.now() + 1}`,
      medicineName: 'Paracetamol',
      dosage: '650 mg',
      frequency: 'As needed (SOS)',
      duration: '3 days',
      foodTiming: 'After Food',
      instructions: 'Take only if temperature or body ache occurs. Max 3 times/day.',
    },
  ]);
  const [generalAdvice, setGeneralAdvice] = useState(
    'Maintain daily BP log. Restrict dietary sodium (< 2g/day). Engage in 30 minutes brisk walking daily. Adequate hydration.'
  );
  const [followUpDate, setFollowUpDate] = useState('2026-12-18');

  const loadData = async () => {
    if (!user) return;
    const docId = user.associatedId || 'doc_1';
    const [d, appts, history] = await Promise.all([
      doctorService.getDoctorById(docId),
      appointmentService.getAppointmentsByDoctor(docId),
      prescriptionService.getPrescriptionsByDoctor(docId),
    ]);

    setDoctor(d);
    setAppointments(appts);
    setIssuedHistory(history);

    const targetId = location.state?.appointmentId || (appts.length > 0 ? appts[0].id : '');
    if (targetId) {
      setSelectedApptId(targetId);
      await handleApptSelection(targetId, appts);
    }
    if (location.state?.diagnosis) {
      setDiagnosis(location.state.diagnosis);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user, location.state]);

  const handleApptSelection = async (apptId: string, list: Appointment[]) => {
    const appt = list.find(a => a.id === apptId);
    if (!appt) return;
    const p = await patientService.getProfile(appt.patientId);
    setPatient(p);
    if (!diagnosis && appt.reasonForVisit) {
      setDiagnosis(appt.reasonForVisit);
    }
  };

  const handleAddMedicine = () => {
    const newItem: PrescriptionItem = {
      id: `rx_item_${Date.now()}`,
      medicineName: '',
      dosage: '500 mg',
      frequency: 'Twice daily (1-0-1)',
      duration: '5 days',
      foodTiming: 'After Food',
      instructions: 'Take after meals with water.',
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof PrescriptionItem, value: any) => {
    setItems(items.map(it => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      showToast('Prescription must have at least one medication item', 'error');
      return;
    }
    setItems(items.filter(it => it.id !== id));
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    const appt = appointments.find(a => a.id === selectedApptId);
    if (!appt || !patient || !doctor) {
      showToast('Missing required appointment or physician record', 'error');
      return;
    }

    if (!diagnosis.trim()) {
      showToast('Please state clinical diagnosis', 'error');
      return;
    }

    const invalidItems = items.some(it => !it.medicineName.trim());
    if (invalidItems) {
      showToast('All prescribed medicine items must have names', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const birthYear = patient.dob ? new Date(patient.dob).getFullYear() : 1990;
      const patientAge = new Date().getFullYear() - birthYear;

      const newRx = await prescriptionService.createPrescription({
        appointmentId: appt.id,
        patientId: patient.id,
        patientName: patient.name,
        patientAge,
        patientGender: patient.gender,
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialization: doctor.specialization,
        doctorLicense: doctor.licenseNumber,
        clinicName: appt.clinicName,
        clinicAddress: appt.clinicAddress,
        date: new Date().toISOString().split('T')[0],
        diagnosis,
        items,
        generalAdvice,
        followUpDate,
        signature: `${doctor.name}, ${doctor.qualification}`,
      });

      showToast(
        'e-Prescription Issued Successfully',
        'success',
        `Prescription #${newRx.id} generated and added to ${patient.name}'s records.`
      );

      // Refresh history and open the preview modal
      await loadData();
      setPreviewPrescription(newRx);
      setActiveTab('history');
    } catch {
      showToast('Failed to issue prescription', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredHistory = issuedHistory.filter(
    rx =>
      rx.patientName.toLowerCase().includes(historySearch.toLowerCase()) ||
      rx.diagnosis.toLowerCase().includes(historySearch.toLowerCase()) ||
      rx.id.toLowerCase().includes(historySearch.toLowerCase())
  );

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
          <h1 className="text-xl font-bold text-slate-900">Digital Prescription Center (e-Rx)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Construct itemized electronic medication orders and review previously signed prescriptions
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'builder'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Issue e-Prescription</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Prescription History ({issuedHistory.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'builder' ? (
        appointments.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
            No active appointments found to prescribe for.
          </div>
        ) : (
          <form onSubmit={handleSavePrescription} className="space-y-6">
            {/* Patient and Appointment Target Selector */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
              <span className="text-xs font-semibold text-slate-700 shrink-0">
                Prescribe for Patient Visit:
              </span>
              <select
                value={selectedApptId}
                onChange={e => {
                  setSelectedApptId(e.target.value);
                  handleApptSelection(e.target.value, appointments);
                }}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 bg-white font-medium"
              >
                {appointments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.patientName} — {a.date} at {a.time} [{a.clinicName}] ({a.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Allergy Safety Contraindication Alert */}
            {patient && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-rose-900 block">
                    Patient Allergy Warning for {patient.name}:
                  </span>
                  <p className="text-rose-800 mt-0.5 font-medium">
                    {patient.allergies.length > 0
                      ? `Known Allergies: ${patient.allergies.join(', ')}`
                      : 'No known drug allergies reported.'}
                  </p>
                </div>
              </div>
            )}

            {/* Diagnosis Input */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Clinical Diagnosis *
              </label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="e.g. Stage 1 Essential Hypertension & Tension Cephalea"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
            </div>

            {/* Itemized Medications Builder */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-serif font-black text-teal-800">℞</span>
                  <h2 className="text-sm font-bold text-slate-900">
                    Prescribed Medications ({items.length})
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medication</span>
                </button>
              </div>

              <div className="space-y-4">
                {items.map((it, idx) => (
                  <div
                    key={it.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/50">
                        Item #{idx + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(it.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Medicine & Formulation *
                        </label>
                        <input
                          type="text"
                          required
                          value={it.medicineName}
                          onChange={e => handleUpdateItem(it.id, 'medicineName', e.target.value)}
                          placeholder="e.g. Tab. Telmisartan or Syp. Guaifenesin"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Dosage / Strength
                        </label>
                        <input
                          type="text"
                          value={it.dosage}
                          onChange={e => handleUpdateItem(it.id, 'dosage', e.target.value)}
                          placeholder="e.g. 40 mg / 10 ml"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Frequency & Schedule
                        </label>
                        <select
                          value={it.frequency}
                          onChange={e => handleUpdateItem(it.id, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                        >
                          <option value="Once daily in the morning (1-0-0)">Once daily morning (1-0-0)</option>
                          <option value="Once daily at bedtime (0-0-1)">Once daily bedtime (0-0-1)</option>
                          <option value="Twice daily (1-0-1)">Twice daily (1-0-1)</option>
                          <option value="Three times daily (1-1-1)">Three times daily (1-1-1)</option>
                          <option value="As needed (SOS for pain/fever)">As needed (SOS)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={it.duration}
                          onChange={e => handleUpdateItem(it.id, 'duration', e.target.value)}
                          placeholder="e.g. 5 days, 1 month"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Food Administration
                        </label>
                        <select
                          value={it.foodTiming}
                          onChange={e => handleUpdateItem(it.id, 'foodTiming', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                        >
                          <option value="After Food">After Food</option>
                          <option value="Before Food">Before Food</option>
                          <option value="With Food">With Food</option>
                          <option value="Empty Stomach">Empty Stomach</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Patient Instructions
                      </label>
                      <input
                        type="text"
                        value={it.instructions}
                        onChange={e => handleUpdateItem(it.id, 'instructions', e.target.value)}
                        placeholder="e.g. Take with warm water. Avoid dairy products within 2 hours."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advice & Follow-Up */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Doctor's General Clinical Advice & Lifestyle Guidelines
                </label>
                <textarea
                  rows={3}
                  value={generalAdvice}
                  onChange={e => setGeneralAdvice(e.target.value)}
                  placeholder="Dietary modifications, exercise recommendations, hydration guidelines..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                />
              </div>

              <div className="max-w-xs">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scheduled Follow-up Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-6 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Signing e-Prescription...' : 'Sign & Issue Digital Prescription'}</span>
              </button>
            </div>
          </form>
        )
      ) : (
        /* Prescription History Tab */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                placeholder="Search patient, diagnosis, or Rx ID..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredHistory.length} of {issuedHistory.length} signed orders
            </span>
          </div>

          <div className="space-y-3">
            {filteredHistory.map(rx => (
              <div
                key={rx.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {rx.id}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{rx.date}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">{rx.clinicName}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Patient: {rx.patientName} ({rx.patientAge}y, {rx.patientGender})
                  </h3>
                  <p className="text-xs text-slate-700 font-medium">
                    Diagnosis: <span className="text-slate-900">{rx.diagnosis}</span>
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rx.items.map(m => (
                      <span
                        key={m.id}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                      >
                        {m.medicineName} ({m.dosage})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewPrescription(rx)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View / Print Sheet</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredHistory.length === 0 && (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
                No issued prescriptions found matching your query.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prescription View / Print Modal */}
      {previewPrescription && (
        <Modal
          isOpen={!!previewPrescription}
          onClose={() => setPreviewPrescription(null)}
          title={`Digital Prescription — ${previewPrescription.id}`}
          subtitle={`Issued on ${previewPrescription.date} by ${previewPrescription.doctorName}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-slate-800 print:text-black">
            {/* Clinic / Doctor Letterhead Header */}
            <div className="border-b-2 border-teal-800 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-800 text-white font-bold flex items-center justify-center text-xs">
                    C+
                  </div>
                  <h2 className="text-base font-black text-teal-900 tracking-tight">CareConnect Health</h2>
                </div>
                <p className="text-xs font-bold text-slate-900 mt-1">{previewPrescription.clinicName}</p>
                <p className="text-[11px] text-slate-500">{previewPrescription.clinicAddress}</p>
              </div>

              <div className="text-left sm:text-right text-xs">
                <p className="font-bold text-slate-900">{previewPrescription.doctorName}</p>
                <p className="text-teal-800 font-medium">{previewPrescription.doctorSpecialization}</p>
                <p className="text-[11px] text-slate-500 font-mono">Reg. No: {previewPrescription.doctorLicense}</p>
              </div>
            </div>

            {/* Patient Meta Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Patient Name</span>
                <span className="font-bold text-slate-900 block">{previewPrescription.patientName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Age / Gender</span>
                <span className="font-medium text-slate-800 block">
                  {previewPrescription.patientAge} Yrs / {previewPrescription.patientGender}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Date Issued</span>
                <span className="font-mono text-slate-800 block">{previewPrescription.date}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Prescription ID</span>
                <span className="font-mono font-bold text-teal-800 block">{previewPrescription.id}</span>
              </div>
            </div>

            {/* Clinical Diagnosis */}
            <div className="text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                Diagnosis
              </span>
              <p className="text-slate-900 font-semibold text-sm mt-0.5">{previewPrescription.diagnosis}</p>
            </div>

            {/* Medications Table */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl font-serif font-black text-teal-800">℞</span>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Medications Prescribed
                </h3>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px]">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Medicine & Dosage</th>
                      <th className="py-2 px-3 font-semibold">Frequency</th>
                      <th className="py-2 px-3 font-semibold">Duration</th>
                      <th className="py-2 px-3 font-semibold">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewPrescription.items.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">{item.medicineName}</span>
                          <span className="text-[11px] text-slate-500">{item.dosage}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{item.frequency}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-800">{item.duration}</td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          <span className="block font-medium text-teal-800">{item.foodTiming}</span>
                          {item.instructions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Advice and Follow Up */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div>
                <span className="font-bold text-slate-700 block text-[11px]">General Clinical Advice:</span>
                <p className="text-slate-700 mt-0.5">{previewPrescription.generalAdvice}</p>
              </div>

              {previewPrescription.followUpDate && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">Scheduled Follow-up Date:</span>
                  <span className="font-bold font-mono text-slate-900">{previewPrescription.followUpDate}</span>
                </div>
              )}
            </div>

            {/* Signature & Verification Seal */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-fit">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-medium">Cryptographically Verified Electronic Signature</span>
              </div>

              <div className="text-left sm:text-right">
                <p className="font-serif italic text-base text-slate-900">{previewPrescription.signature}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Authorized Attending Medical Practitioner</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2 px-4 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Prescription</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewPrescription(null)}
                className="py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
