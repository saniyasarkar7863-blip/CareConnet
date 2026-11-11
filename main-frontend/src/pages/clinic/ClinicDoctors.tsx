import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Building2, Star, CheckCircle2, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clinicService } from '../../services/clinicService';
import { doctorService } from '../../services/doctorService';
import { Clinic, DoctorProfile } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../../components/common/Modal';

export function ClinicDoctorsPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [allDoctors, setAllDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Onboarding Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');

  const loadData = async () => {
    if (!user) return;
    const clinicId = user.associatedId || 'clinic_1';
    const [c, docs] = await Promise.all([
      clinicService.getClinicById(clinicId),
      doctorService.getAllDoctors(),
    ]);
    setClinic(c);
    setAllDoctors(docs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic || !selectedDocId) return;

    try {
      await clinicService.addDoctorToClinic(clinic.id, selectedDocId);
      const doc = allDoctors.find(d => d.id === selectedDocId);
      if (doc) {
        await doctorService.updateDoctor({
          ...doc,
          associatedClinicIds: [...doc.associatedClinicIds, clinic.id],
        });
      }

      showToast('Doctor Onboarded to Roster', 'success', 'Doctor slots now active for this clinic.');
      setModalOpen(false);
      loadData();
    } catch {
      showToast('Error onboarding doctor', 'error');
    }
  };

  const handleRemoveDoctor = async (doctorId: string) => {
    if (!clinic) return;
    try {
      await clinicService.removeDoctorFromClinic(clinic.id, doctorId);
      showToast('Doctor Affiliation Removed', 'info', 'Doctor unlinked from this clinic facility.');
      loadData();
    } catch {
      showToast('Error removing doctor', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  const affiliatedDocs = allDoctors.filter(d => clinic?.doctorIds.includes(d.id));
  const availableToOnboard = allDoctors.filter(d => !clinic?.doctorIds.includes(d.id));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Physician Membership Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Credentialed medical specialists actively practicing at {clinic?.name}
          </p>
        </div>

        {availableToOnboard.length > 0 && (
          <button
            onClick={() => {
              setSelectedDocId(availableToOnboard[0].id);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Onboard Doctor to Clinic</span>
          </button>
        )}
      </div>

      {/* Grid of Affiliated Doctors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {affiliatedDocs.map(doc => (
          <div
            key={doc.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {doc.name.replace('Dr. ', '').charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-xs text-teal-800 font-semibold">{doc.specialization}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Reg: {doc.licenseNumber}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveDoctor(doc.id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                  title="Remove from clinic roster"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Consultation Fee:</span>
                  <span className="font-mono font-bold text-slate-900">₹{doc.consultationFee}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Qualifications:</span>
                  <span className="text-slate-800 font-medium truncate">{doc.qualification}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Clinical Experience:</span>
                  <span className="text-slate-800 font-medium">{doc.experienceYears} Years</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                  Assigned Slot Schedule
                </span>
                <div className="flex flex-wrap gap-1">
                  {doc.availableSlots.map(s => (
                    <span key={s} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Roster Active</span>
              </span>
              <span>{doc.rating} ★ ({doc.totalReviews} reviews)</span>
            </div>
          </div>
        ))}
      </div>

      {/* Onboarding Modal */}
      {availableToOnboard.length > 0 && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Onboard Doctor to Clinic Roster"
          subtitle="Add an accredited physician to your facility appointment booking system"
          maxWidth="md"
        >
          <form onSubmit={handleAddDoctor} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Medical Specialist *
              </label>
              <select
                value={selectedDocId}
                onChange={e => setSelectedDocId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 bg-white"
              >
                {availableToOnboard.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialization}) — Fee: ₹{d.consultationFee}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-xs text-teal-900">
              Onboarding links this physician to {clinic?.name}. Patients searching for doctors by clinic or specialty will be able to book appointments immediately.
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
                Add to Clinic Roster
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
