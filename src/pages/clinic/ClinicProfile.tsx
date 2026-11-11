import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Clock, Edit3, Save, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clinicService } from '../../services/clinicService';
import { Clinic } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../../components/common/Modal';

export function ClinicProfilePage() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Clinic>>({});
  const [newFacility, setNewFacility] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const clinicId = user.associatedId || 'clinic_1';
      const c = await clinicService.getClinicById(clinicId);
      setClinic(c);
      if (c) setFormData(c);
      setLoading(false);
    }
    loadData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic) return;

    try {
      const updated = await clinicService.updateClinic({
        ...clinic,
        ...formData,
      } as Clinic);
      setClinic(updated);
      setIsEditing(false);
      showToast('Clinic Profile Updated', 'success', 'Facility information saved.');
    } catch {
      showToast('Error saving profile', 'error');
    }
  };

  const handleAddFacility = () => {
    if (!newFacility.trim()) return;
    const current = formData.facilities || [];
    setFormData({ ...formData, facilities: [...current, newFacility.trim()] });
    setNewFacility('');
  };

  const handleRemoveFacility = (idx: number) => {
    const current = formData.facilities || [];
    setFormData({ ...formData, facilities: current.filter((_, i) => i !== idx) });
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  if (!clinic) {
    return <div className="text-center py-12 text-slate-500">Clinic record not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-800 text-white font-extrabold flex items-center justify-center text-xl shadow-xs">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{clinic.name}</h1>
            <p className="text-xs text-slate-500">{clinic.tagline}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
              <span className="font-mono text-slate-700 font-semibold">Reg: {clinic.registrationNumber}</span>
              <span>·</span>
              <span>Est. {clinic.establishedYear}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setFormData(clinic);
            setIsEditing(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Facility Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Location & Operating Hours
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Physical Address</span>
                <span className="text-slate-900 font-semibold mt-0.5 block">
                  {clinic.address}, {clinic.city}, {clinic.state}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">OPD Consultation Timings</span>
                <span className="text-slate-900 font-semibold mt-0.5 block">{clinic.operatingHours}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Contact Channels
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Facility Phone</span>
                <span className="text-slate-900 font-semibold mt-0.5 block font-mono">{clinic.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Official Email</span>
                <span className="text-slate-900 font-semibold mt-0.5 block">{clinic.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Certified Diagnostic & Clinical Infrastructure
            </h2>
            <div className="flex flex-wrap gap-2 pt-1">
              {clinic.facilities.map((fac, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-800 border border-teal-200"
                >
                  ✓ {fac}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Healthcare Facility Information"
        subtitle="Manage clinic profile and diagnostic equipment listings"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Name *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline / Mission</label>
            <input
              type="text"
              value={formData.tagline || ''}
              onChange={e => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Hours</label>
              <input
                type="text"
                value={formData.operatingHours || ''}
                onChange={e => setFormData({ ...formData, operatingHours: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
            </div>
          </div>

          {/* Facilities list */}
          <div className="border-t border-slate-100 pt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Add Diagnostic Unit</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. 24/7 Pharmacy, Ultrasound, MRI"
                value={newFacility}
                onChange={e => setNewFacility(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
              <button
                type="button"
                onClick={handleAddFacility}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(formData.facilities || []).map((f, i) => (
                <span key={i} className="px-2.5 py-1 text-xs bg-slate-100 text-slate-800 rounded-md border flex items-center gap-1.5">
                  <span>{f}</span>
                  <button type="button" onClick={() => handleRemoveFacility(i)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="py-2 px-3 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
