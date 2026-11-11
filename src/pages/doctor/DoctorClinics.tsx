import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Clock, Plus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clinicService } from '../../services/clinicService';
import { doctorService } from '../../services/doctorService';
import { Clinic, DoctorProfile } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../../components/common/Modal';

export function DoctorClinicsPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [allClinics, setAllClinics] = useState<Clinic[]>([]);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Associate Modal
  const [associateModalOpen, setAssociateModalOpen] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState('');

  const loadData = async () => {
    if (!user) return;
    const docId = user.associatedId || 'doc_1';
    const [cls, d] = await Promise.all([
      clinicService.getAllClinics(),
      doctorService.getDoctorById(docId),
    ]);
    setAllClinics(cls);
    setDoctor(d);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAssociate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !selectedClinicId) return;

    if (doctor.associatedClinicIds.includes(selectedClinicId)) {
      showToast('Already affiliated with this clinic', 'info');
      setAssociateModalOpen(false);
      return;
    }

    try {
      const updatedDoctor = {
        ...doctor,
        associatedClinicIds: [...doctor.associatedClinicIds, selectedClinicId],
      };
      await doctorService.updateDoctor(updatedDoctor);
      await clinicService.addDoctorToClinic(selectedClinicId, doctor.id);

      showToast('Clinic Affiliation Confirmed', 'success', 'You can now receive consultation appointments at this facility.');
      setAssociateModalOpen(false);
      loadData();
    } catch {
      showToast('Error affiliating with clinic', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  const myClinics = allClinics.filter(c => doctor?.associatedClinicIds.includes(c.id));
  const availableClinics = allClinics.filter(c => !doctor?.associatedClinicIds.includes(c.id));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Affiliated Healthcare Facilities</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Clinics and diagnostic centers where you conduct outpatient consultations
          </p>
        </div>

        {availableClinics.length > 0 && (
          <button
            onClick={() => {
              setSelectedClinicId(availableClinics[0].id);
              setAssociateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Affiliate with New Clinic</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myClinics.map(clinic => (
          <div
            key={clinic.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Reg: {clinic.registrationNumber}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{clinic.name}</h3>
                  <p className="text-xs text-slate-500">{clinic.tagline}</p>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Active Roster</span>
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{clinic.address}, {clinic.city}, {clinic.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{clinic.operatingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono">{clinic.phone}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                Available Facility Infrastructure
              </span>
              <div className="flex flex-wrap gap-1.5">
                {clinic.facilities.map((fac, i) => (
                  <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200">
                    {fac}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Associate Modal */}
      {availableClinics.length > 0 && (
        <Modal
          isOpen={associateModalOpen}
          onClose={() => setAssociateModalOpen(false)}
          title="Affiliate with Healthcare Facility"
          subtitle="Expand your consultation practice to another registered facility"
          maxWidth="md"
        >
          <form onSubmit={handleAssociate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Facility to Join *
              </label>
              <select
                value={selectedClinicId}
                onChange={e => setSelectedClinicId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 bg-white"
              >
                {availableClinics.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.address}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-xs text-teal-900">
              Your consultation fee (₹{doctor?.consultationFee}) and weekly appointment schedule will automatically become available to patients booking through this clinic.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssociateModalOpen(false)}
                className="py-2 px-3 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs"
              >
                Confirm Affiliation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
