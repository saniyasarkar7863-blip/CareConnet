import React, { useState, useEffect } from 'react';
import { History, Plus, Calendar, Stethoscope, CheckCircle2, AlertCircle, Pill, FileText, Building2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { medicalRecordService } from '../../services/medicalRecordService';
import { consultationService } from '../../services/consultationService';
import { patientService } from '../../services/patientService';
import { MedicalHistoryItem, Consultation, PatientProfile } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../../components/common/Modal';

export function PatientMedicalHistoryPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'consultations' | 'conditions' | 'allergies'>('consultations');
  const [historyItems, setHistoryItems] = useState<MedicalHistoryItem[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  // Add Item Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [condition, setCondition] = useState('');
  const [diagnosedDate, setDiagnosedDate] = useState('2024-01-15');
  const [status, setStatus] = useState<MedicalHistoryItem['status']>('Active');
  const [treatmentDoctor, setTreatmentDoctor] = useState('');
  const [notes, setNotes] = useState('');

  const loadAll = async () => {
    if (!user) return;
    const patId = user.associatedId || 'pat_1';
    const [items, cons, prof] = await Promise.all([
      medicalRecordService.getHistoryByPatient(patId),
      consultationService.getByPatientId(patId),
      patientService.getProfile(patId),
    ]);
    setHistoryItems(items);
    setConsultations(cons);
    setPatientProfile(prof);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [user]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condition) return;

    try {
      await medicalRecordService.addHistoryItem({
        patientId: user?.associatedId || 'pat_1',
        condition,
        diagnosedDate,
        status,
        treatmentDoctor: treatmentDoctor || 'Consulting Physician',
        notes,
      });

      showToast('Medical History Updated', 'success', `Logged ${condition} to your permanent records.`);
      setModalOpen(false);
      setCondition('');
      setNotes('');
      loadAll();
    } catch {
      showToast('Error recording condition', 'error');
    }
  };

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
          <h1 className="text-xl font-bold text-slate-900">Medical History & Clinical Records</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Previous doctor consultations, active chronic diagnoses, and verified allergy alerts
          </p>
        </div>

        {activeTab === 'conditions' && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Medical Condition</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab('consultations')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'consultations'
              ? 'border-teal-700 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Previous Consultations</span>
          <span className="px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-mono font-bold">
            {consultations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('conditions')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'conditions'
              ? 'border-teal-700 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Chronic Diagnoses & Surgeries</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono">
            {historyItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('allergies')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'allergies'
              ? 'border-teal-700 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>Allergies & Sensitivities</span>
          <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-mono">
            {patientProfile?.allergies.length || 0}
          </span>
        </button>
      </div>

      {/* TAB 1: Previous Consultations */}
      {activeTab === 'consultations' && (
        <div className="space-y-4">
          {consultations.map(con => (
            <div
              key={con.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Completed Visit
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-mono font-bold text-slate-900">{con.date}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-mono text-slate-400">ID: #{con.id}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1.5">{con.doctorName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{con.clinicName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedConsultation(con)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Clinical Notes</span>
                  </button>

                  <Link
                    to="/patient/prescriptions"
                    className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>View Prescribed Rx</span>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium block">Chief Complaint</span>
                  <p className="text-slate-800 font-semibold">{con.chiefComplaint}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-medium block">Clinical Diagnosis</span>
                  <p className="text-teal-900 font-bold bg-teal-50/70 p-2 rounded-lg border border-teal-100">
                    {con.diagnosis}
                  </p>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <span className="text-slate-400 font-medium block">Physician Treatment Plan</span>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {con.treatmentPlan}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {consultations.length === 0 && (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
              No previous consultations logged yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Chronic Diagnoses & Surgeries */}
      {activeTab === 'conditions' && (
        <div className="space-y-4">
          {historyItems.map(item => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      item.status === 'Resolved'
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : item.status === 'Chronic'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-teal-50 text-teal-800 border border-teal-200'
                    }`}
                  >
                    {item.status} Condition
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-mono text-slate-500">Diagnosed: {item.diagnosedDate}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">{item.condition}</h3>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">{item.notes}</p>
              </div>

              <div className="text-left md:text-right shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 text-xs">
                <span className="text-slate-400 block font-medium">Attending Physician</span>
                <span className="text-slate-800 font-semibold block mt-0.5">
                  {item.treatmentDoctor || 'Attending Specialist'}
                </span>
              </div>
            </div>
          ))}

          {historyItems.length === 0 && (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
              No previous medical history recorded.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Allergies & Sensitivities */}
      {activeTab === 'allergies' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Verified Drug & Food Allergies</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                These contraindications are automatically highlighted to prescribing physicians.
              </p>
            </div>
            <Link
              to="/patient/profile"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              Edit in Profile →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(patientProfile?.allergies || []).map((allergy, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 font-bold text-xs">
                  ⚠️
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-950">{allergy}</h4>
                  <p className="text-[11px] text-rose-800 mt-0.5">
                    Contraindicated for administration and pharmaceutical substitution.
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <strong className="text-slate-900 block mb-1">Clinical Safety Guarantee:</strong>
            CareConnect automatically scans written prescriptions against this allergy registry to prevent adverse drug reactions.
          </div>
        </div>
      )}

      {/* Add Condition Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Medical Condition or Past Surgery"
        subtitle="Maintain an accurate retrospective history for clinical safety"
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Condition or Surgical Procedure *
            </label>
            <input
              type="text"
              required
              value={condition}
              onChange={e => setCondition(e.target.value)}
              placeholder="e.g. Appendectomy, Type 2 Diabetes"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosed Date</label>
              <input
                type="date"
                required
                value={diagnosedDate}
                onChange={e => setDiagnosedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as MedicalHistoryItem['status'])}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Chronic">Chronic</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Treating Doctor / Hospital
            </label>
            <input
              type="text"
              value={treatmentDoctor}
              onChange={e => setTreatmentDoctor(e.target.value)}
              placeholder="e.g. Dr. Rajesh Kulkarni / Apollo Hospital"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Notes / Treatment Plan
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Medications taken, lifestyle management, or surgical outcomes..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="py-2 px-3 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs"
            >
              Add to History
            </button>
          </div>
        </form>
      </Modal>

      {/* View Consultation Notes Modal */}
      {selectedConsultation && (
        <Modal
          isOpen={!!selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
          title={`Consultation Summary: ${selectedConsultation.doctorName}`}
          subtitle={`${selectedConsultation.clinicName} · Date: ${selectedConsultation.date}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
              <span className="font-semibold text-teal-900 block mb-1">Confirmed Diagnosis:</span>
              <p className="font-bold text-teal-950 text-sm">{selectedConsultation.diagnosis}</p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-700 block">Chief Complaint:</span>
              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {selectedConsultation.chiefComplaint}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-700 block">Clinical Observations:</span>
              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {selectedConsultation.clinicalObservations}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-700 block">Treatment & Management Plan:</span>
              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {selectedConsultation.treatmentPlan}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500">
                Follow-up interval: {selectedConsultation.followUpDays} days
              </span>
              <button
                type="button"
                onClick={() => setSelectedConsultation(null)}
                className="py-1.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Close View
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
