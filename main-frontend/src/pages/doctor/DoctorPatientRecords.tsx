import React, { useState, useEffect } from 'react';
import { Search, Users, FileText, AlertCircle, Phone, Mail, Calendar, Eye, Stethoscope } from 'lucide-react';
import { patientService } from '../../services/patientService';
import { reportService } from '../../services/reportService';
import { PatientProfile, MedicalReport } from '../../types';
import { Modal } from '../../components/common/Modal';
import { useNavigate } from 'react-router-dom';

export function DoctorPatientRecordsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Patient Detail Modal
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);

  useEffect(() => {
    async function loadData() {
      const [pts, reps] = await Promise.all([
        patientService.getAllPatients(),
        reportService.getReportsForDoctor('doc_1'),
      ]);
      setPatients(pts);
      setReports(reps);
      setLoading(false);
    }
    loadData();
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-xl font-bold text-slate-900">Patient Electronic Health Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Authorized patient profiles, allergy histories, and diagnostic records under your clinical care
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search patient name, email, blood..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(pat => {
          const patientReports = reports.filter(r => r.patientId === pat.id);

          return (
            <div
              key={pat.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-11 h-11 rounded-xl bg-teal-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {pat.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{pat.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      {pat.gender} · {pat.bloodGroup} Blood Group
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">DOB:</span>
                    <span className="font-mono text-slate-800">{pat.dob}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Emergency Contact:</span>
                    <span className="text-slate-800 truncate font-medium">{pat.emergencyContact.name}</span>
                  </div>
                </div>

                {/* Allergy Tags */}
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 block mb-1">
                    Contraindications:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {pat.allergies.map((a, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedPatient(pat)}
                  className="flex-1 py-1.5 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Full Chart</span>
                </button>
                <button
                  onClick={() => navigate('/doctor/consultations', { state: { patientId: pat.id } })}
                  className="py-1.5 px-3 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Consult</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <Modal
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title={`Medical Record: ${selectedPatient.name}`}
          subtitle={`Patient ID: ${selectedPatient.id} · Gender: ${selectedPatient.gender} · Blood Group: ${selectedPatient.bloodGroup}`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">DOB</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">{selectedPatient.dob}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Height</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">{selectedPatient.heightCm} cm</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Weight</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">{selectedPatient.weightKg} kg</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Phone</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block truncate">{selectedPatient.phone}</span>
              </div>
            </div>

            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-xs">
              <span className="font-bold text-rose-900 block mb-1">Drug & Environmental Allergies:</span>
              <p className="text-rose-800">{selectedPatient.allergies.join(', ') || 'None recorded'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-1">Active Chronic Conditions:</span>
              <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                {selectedPatient.chronicConditions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-1">Emergency Contact Information:</span>
              <p className="text-slate-700">
                {selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.relationship}) — Phone: {selectedPatient.emergencyContact.phone}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Close Medical Chart
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
