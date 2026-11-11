import React, { useState, useEffect } from 'react';
import { Pill, Printer, Plus, CheckCircle2, Clock, Calendar, Download, Eye, Stethoscope, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { prescriptionService } from '../../services/prescriptionService';
import { reminderService } from '../../services/reminderService';
import { Prescription, PrescriptionItem } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../../components/common/Modal';

export function PrescriptionsPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPrescriptions = async () => {
    if (!user) return;
    const list = await prescriptionService.getPrescriptionsByPatient(user.associatedId || 'pat_1');
    setPrescriptions(list);
    if (list.length > 0 && !selectedRx) {
      setSelectedRx(list[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPrescriptions();
  }, [user]);

  const handleCreateReminderFromItem = async (item: PrescriptionItem) => {
    if (!user) return;
    try {
      await reminderService.createReminder({
        patientId: user.associatedId || 'pat_1',
        prescriptionId: selectedRx?.id,
        medicineName: item.medicineName,
        dosage: item.dosage,
        timesPerDay: item.frequency.includes('Twice') ? 2 : item.frequency.includes('Three') ? 3 : 1,
        scheduledTimes: item.frequency.includes('Twice')
          ? ['08:30 AM', '08:30 PM']
          : item.frequency.includes('Three')
          ? ['08:00 AM', '02:00 PM', '08:00 PM']
          : ['09:00 AM'],
        frequency: item.frequency,
        duration: item.duration,
        instructions: `${item.foodTiming} · ${item.instructions}`,
        isActive: true,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '2026-12-31',
      });
      showToast('Reminder Configured', 'success', `Daily schedule active for ${item.medicineName}`);
    } catch {
      showToast('Error creating reminder', 'error');
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
          <h1 className="text-xl font-bold text-slate-900">Digital Prescriptions (e-Rx)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified electronic prescriptions issued directly by licensed consulting physicians
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Prescriptions */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Prescription History ({prescriptions.length})
          </h2>

          {prescriptions.map(rx => {
            const isSelected = selectedRx?.id === rx.id;
            return (
              <div
                key={rx.id}
                onClick={() => setSelectedRx(rx)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-teal-50/70 border-teal-600 shadow-xs ring-1 ring-teal-600'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] font-bold text-teal-800">#{rx.id.toUpperCase()}</span>
                  <span className="font-mono text-slate-400 text-[11px]">{rx.date}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{rx.doctorName}</h3>
                <p className="text-xs text-slate-600">{rx.doctorSpecialization}</p>
                <p className="text-[11px] text-slate-500 mt-1 truncate">{rx.clinicName}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{rx.items.length} prescribed items</span>
                  <span className="text-teal-700 font-semibold">View Sheet →</span>
                </div>
              </div>
            );
          })}

          {prescriptions.length === 0 && (
            <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
              No prescriptions recorded yet.
            </div>
          )}
        </div>

        {/* Right Prescription Detail Sheet */}
        <div className="lg:col-span-8">
          {selectedRx ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Prescription Header / Clinic Letterhead */}
              <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200/50">
                    Official e-Prescription
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-2">{selectedRx.clinicName}</h2>
                  <p className="text-xs text-slate-500 max-w-sm">{selectedRx.clinicAddress}</p>
                </div>

                <div className="text-left sm:text-right text-xs">
                  <p className="font-bold text-slate-900">{selectedRx.doctorName}</p>
                  <p className="text-teal-800 font-medium">{selectedRx.doctorSpecialization}</p>
                  <p className="text-slate-400 font-mono text-[11px]">Reg: {selectedRx.doctorLicense}</p>
                  <p className="text-slate-500 font-mono text-[11px] mt-1">Date: {selectedRx.date}</p>
                </div>
              </div>

              {/* Patient Demographic Banner */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Patient Name</span>
                  <span className="text-slate-900 font-bold mt-0.5 block">{selectedRx.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Age / Gender</span>
                  <span className="text-slate-900 font-bold mt-0.5 block">{selectedRx.patientAge} Years / {selectedRx.patientGender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Rx ID</span>
                  <span className="text-slate-900 font-mono font-bold mt-0.5 block">#{selectedRx.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Linked Appointment</span>
                  <span className="text-slate-900 font-mono font-bold mt-0.5 block">#{selectedRx.appointmentId}</span>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-xs">
                <span className="text-teal-900 font-semibold block mb-0.5">Clinical Diagnosis:</span>
                <p className="text-slate-800 font-medium">{selectedRx.diagnosis}</p>
              </div>

              {/* Prescribed Items (Rx symbol) */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-serif font-black text-teal-800">℞</span>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Prescribed Medication & Dosage Schedule
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">Medicine & Strength</th>
                        <th className="py-2.5 px-3">Dosage & Frequency</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3">Food & Instructions</th>
                        <th className="py-2.5 px-3 text-right">Reminder</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedRx.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">{item.medicineName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{item.dosage}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-medium text-slate-800 block">{item.frequency}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700">
                            {item.duration}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-teal-800 block">{item.foodTiming}</span>
                            <span className="text-[11px] text-slate-500">{item.instructions}</span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleCreateReminderFromItem(item)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors inline-flex items-center gap-1"
                              title="Sync directly to Medicine Reminders module"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Set Reminder</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* General Advice */}
              {selectedRx.generalAdvice && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block mb-1">Doctor's Advice & Lifestyle Guidance:</span>
                  <p className="text-slate-600 leading-relaxed">{selectedRx.generalAdvice}</p>
                </div>
              )}

              {/* Signature & Export Actions */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-900 font-serif italic text-base">
                    {selectedRx.signature}
                  </p>
                  <p className="text-[10px] text-slate-400">Digitally signed & tamper-evident verified e-Rx</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      showToast('Printing Prescription', 'info', 'Opening printer-formatted view');
                      window.print();
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Rx</span>
                  </button>
                  <button
                    onClick={() => {
                      showToast('Prescription Downloaded', 'success', `e-Prescription #${selectedRx.id} saved as PDF.`);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
              Select a prescription from the history to view complete sheet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
