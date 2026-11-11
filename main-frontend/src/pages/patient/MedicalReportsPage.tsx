import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Eye,
  Download,
  Lock,
  ShieldCheck,
  Calendar,
  Building2,
  CheckCircle2,
  Plus,
  X,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reportService } from '../../services/reportService';
import { doctorService } from '../../services/doctorService';
import { MedicalReport, DoctorProfile } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../../components/common/Modal';

export function MedicalReportsPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MedicalReport['category']>('Blood Work');
  const [testDate, setTestDate] = useState('2026-11-05');
  const [labName, setLabName] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>(['doc_1']);
  const [simulatedFile, setSimulatedFile] = useState<File | null>(null);

  // Preview Modal
  const [previewReport, setPreviewReport] = useState<MedicalReport | null>(null);

  const loadReports = async () => {
    if (!user) return;
    const [reps, docs] = await Promise.all([
      reportService.getReportsByPatient(user.associatedId || 'pat_1'),
      doctorService.getAllDoctors(),
    ]);
    setReports(reps);
    setDoctors(docs);
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, [user]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !labName) {
      showToast('Please fill all required report details', 'error');
      return;
    }

    try {
      await reportService.uploadReport({
        patientId: user?.associatedId || 'pat_1',
        patientName: user?.name || 'Aarav Sharma',
        title,
        category,
        testDate,
        labName,
        doctorNotes,
        fileSize: simulatedFile ? `${(simulatedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB',
        fileType: 'PDF Document / Scanned Lab',
        accessGrantedDoctorIds: selectedDoctors,
      });

      showToast('Medical Report Uploaded', 'success', 'Report encrypted and saved to universal medical records.');
      setUploadModalOpen(false);
      setTitle('');
      setLabName('');
      setDoctorNotes('');
      setSimulatedFile(null);
      loadReports();
    } catch {
      showToast('Error uploading report', 'error');
    }
  };

  const handleToggleDoctorAccess = async (reportId: string, doctorId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    let updatedAccess: string[];
    if (report.accessGrantedDoctorIds.includes(doctorId)) {
      updatedAccess = report.accessGrantedDoctorIds.filter(id => id !== doctorId);
    } else {
      updatedAccess = [...report.accessGrantedDoctorIds, doctorId];
    }

    try {
      await reportService.updateDoctorAccess(reportId, updatedAccess);
      showToast('Permissions Updated', 'info', 'Doctor record access updated.');
      loadReports();
    } catch {
      showToast('Error updating permissions', 'error');
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
          <h1 className="text-xl font-bold text-slate-900">Diagnostic Reports & Lab Archives</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Store diagnostic tests and grant individual permissions to authorized doctors
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Medical Report</span>
        </button>
      </div>

      {/* Reports Table / Card View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(rep => {
          return (
            <div
              key={rep.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 border border-teal-100">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-800 bg-teal-50/70 px-2 py-0.5 rounded border border-teal-200/50">
                        {rep.category}
                      </span>
                      <h2 className="text-sm font-bold text-slate-900 mt-1 leading-snug">{rep.title}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{rep.labName}</p>
                    </div>
                  </div>

                  <span className="font-mono text-[11px] text-slate-400 shrink-0">
                    {rep.fileSize}
                  </span>
                </div>

                {rep.doctorNotes && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Lab Summary:</strong> {rep.doctorNotes}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Test Date: <strong>{rep.testDate}</strong></span>
                  </div>
                  <span>Uploaded: {rep.uploadDate}</span>
                </div>

                {/* Doctor Access Section */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                    Authorized Medical Access
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {doctors.map(doc => {
                      const hasAccess = rep.accessGrantedDoctorIds.includes(doc.id);
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => handleToggleDoctorAccess(rep.id, doc.id)}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                            hasAccess
                              ? 'bg-teal-50 text-teal-800 border-teal-300'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
                          }`}
                          title={`Click to ${hasAccess ? 'revoke' : 'grant'} access to ${doc.name}`}
                        >
                          <Lock className="w-3 h-3" />
                          <span>{doc.name}</span>
                          {hasAccess ? '✓' : '+'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setPreviewReport(rep)}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Lab Summary</span>
                </button>
                <button
                  onClick={() => {
                    showToast('Report Download Initiated', 'info', `Downloading verified copy of ${rep.title}`);
                  }}
                  className="py-2 px-3 text-xs font-semibold text-teal-800 hover:bg-teal-50 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {reports.length === 0 && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
          No diagnostic medical reports stored yet.
        </div>
      )}

      {/* Upload Report Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Diagnostic Report"
        subtitle="Store clinical laboratory investigations with strict authorization controls"
        maxWidth="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document / Investigation Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. 2D Echocardiography with Color Doppler"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as MedicalReport['category'])}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 bg-white"
              >
                <option value="Blood Work">Blood Work</option>
                <option value="Radiology / X-Ray">Radiology / X-Ray</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Pathology">Pathology</option>
                <option value="Prescription Scan">Prescription Scan</option>
                <option value="Discharge Summary">Discharge Summary</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Test *</label>
              <input
                type="date"
                required
                value={testDate}
                onChange={e => setTestDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnostic Laboratory / Hospital *</label>
            <input
              type="text"
              required
              value={labName}
              onChange={e => setLabName(e.target.value)}
              placeholder="e.g. Metropolis Diagnostics, Powai Center"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Findings / Key Lab Values</label>
            <textarea
              rows={2}
              value={doctorNotes}
              onChange={e => setDoctorNotes(e.target.value)}
              placeholder="e.g. Total Cholesterol: 188 mg/dL, Fasting Glucose: 92 mg/dL. Normal limits."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            />
          </div>

          {/* File Picker Simulation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select File (PDF, Scan, DICOM)</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setSimulatedFile(e.target.files[0]);
                  }
                }}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <span className="text-xs font-semibold text-teal-700 hover:text-teal-800">
                  {simulatedFile ? simulatedFile.name : 'Click to select report file'}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">PDF, PNG, JPEG up to 25 MB</p>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="py-2 px-3 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs"
            >
              Save Report to Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      {previewReport && (
        <Modal
          isOpen={!!previewReport}
          onClose={() => setPreviewReport(null)}
          title={previewReport.title}
          subtitle={`${previewReport.category} · Performed on ${previewReport.testDate} at ${previewReport.labName}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Clinical Lab Summary & Observations
              </span>
              <p className="text-xs text-slate-800 leading-relaxed">
                {previewReport.doctorNotes || 'No specific clinical flags entered. General evaluation results within normal reference ranges.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Diagnostic Facility</span>
                <span className="text-slate-900 font-semibold mt-0.5 block">{previewReport.labName}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">File Specifications</span>
                <span className="text-slate-900 font-semibold mt-0.5 block font-mono">{previewReport.fileSize} · {previewReport.fileType}</span>
              </div>
            </div>

            <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-xs text-teal-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Authorized doctors: {previewReport.accessGrantedDoctorIds.length} physicians permitted</span>
              </div>
              <button
                onClick={() => {
                  showToast('Download Ready', 'success', 'Verified digital copy compiled.');
                }}
                className="px-3 py-1 font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
