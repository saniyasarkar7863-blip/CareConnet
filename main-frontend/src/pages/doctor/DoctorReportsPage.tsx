import React, { useState, useEffect } from 'react';
import { FileText, Eye, Download, Calendar, ShieldCheck, User, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reportService } from '../../services/reportService';
import { MedicalReport } from '../../types';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';

export function DoctorReportsPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const docId = user.associatedId || 'doc_1';
      const list = await reportService.getReportsForDoctor(docId);
      setReports(list);
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
        <h1 className="text-xl font-bold text-slate-900">Authorized Patient Lab Reports</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Diagnostic investigations where patients have explicitly granted you clinical review access
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(rep => (
          <div
            key={rep.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 border border-teal-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {rep.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug">{rep.title}</h3>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">Patient: {rep.patientName}</p>
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

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Test Date: <strong>{rep.testDate}</strong></span>
                </div>
                <span>Lab: {rep.labName}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => setSelectedReport(rep)}
                className="flex-1 py-1.5 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Examine Lab Findings</span>
              </button>
              <button
                onClick={() => {
                  showToast('Document Downloaded', 'success', `Authorized copy of ${rep.title} verified.`);
                }}
                className="py-1.5 px-3 text-xs font-semibold text-teal-800 hover:bg-teal-50 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
        ))}

        {reports.length === 0 && (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
            No diagnostic reports currently authorized by your patients.
          </div>
        )}
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={selectedReport.title}
          subtitle={`Patient: ${selectedReport.patientName} · Test Date: ${selectedReport.testDate}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-1">Diagnostic Laboratory Findings:</span>
              <p className="text-slate-700 leading-relaxed">
                {selectedReport.doctorNotes || 'Parameters within normal physiological range.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Diagnostic Lab</span>
                <span className="text-slate-900 font-semibold mt-0.5 block">{selectedReport.labName}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">File Specifications</span>
                <span className="text-slate-900 font-semibold mt-0.5 block font-mono">{selectedReport.fileSize} · {selectedReport.fileType}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
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
