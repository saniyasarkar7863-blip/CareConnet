import React, { useState, useEffect } from 'react';
import { User, Stethoscope, Award, Phone, Mail, DollarSign, Edit3, Save, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';
import { DoctorProfile } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../../components/common/Modal';

export function DoctorProfilePage() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<DoctorProfile>>({});

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const docId = user.associatedId || 'doc_1';
      const d = await doctorService.getDoctorById(docId);
      setDoctor(d);
      if (d) setFormData(d);
      setLoading(false);
    }
    loadData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;

    try {
      const updated = await doctorService.updateDoctor({
        ...doctor,
        ...formData,
      } as DoctorProfile);
      setDoctor(updated);
      setIsEditing(false);
      showToast('Doctor Profile Saved', 'success', 'Updated qualifications and consultation fees.');
    } catch {
      showToast('Error updating profile', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  if (!doctor) {
    return <div className="text-center py-12 text-slate-500">Doctor record not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-800 text-white font-extrabold flex items-center justify-center text-xl shadow-xs">
            {doctor.name.replace('Dr. ', '').charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{doctor.name}</h1>
            <p className="text-xs text-teal-800 font-semibold">{doctor.specialization}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono text-slate-700 font-semibold">License: {doctor.licenseNumber}</span>
              <span>·</span>
              <span>{doctor.experienceYears} Years Practice</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {doctor.rating} ({doctor.totalReviews} reviews)
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setFormData(doctor);
            setIsEditing(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Doctor Credentials</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Qualifications & Specialty
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Degrees & Fellowships</span>
                <span className="text-slate-900 font-semibold mt-0.5 block">{doctor.qualification}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Medical Registration Authority</span>
                <span className="text-slate-900 font-semibold mt-0.5 block font-mono">
                  Medical Council of India / National Medical Commission (NMC)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Consultation Fee</span>
                <span className="text-slate-900 font-bold mt-0.5 block font-mono text-sm">₹{doctor.consultationFee}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Contact & Communication
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Email Address</span>
                <span className="text-slate-900 font-semibold mt-0.5 block">{doctor.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Phone Number</span>
                <span className="text-slate-900 font-semibold mt-0.5 block font-mono">{doctor.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Clinical Biography & Practice Philosophy
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {doctor.bio}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Weekly Consultation Slot Availability
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {doctor.availableSlots.map(slot => (
                <span
                  key={slot}
                  className="px-2.5 py-1 text-xs font-mono bg-teal-50 text-teal-800 rounded-lg border border-teal-200"
                >
                  {slot}
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
        title="Edit Physician Profile"
        subtitle="Update public doctor credentials and consultation fee structure"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee (₹)</label>
              <input
                type="number"
                min={100}
                step={50}
                required
                value={formData.consultationFee || 600}
                onChange={e => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Specialization</label>
              <input
                type="text"
                required
                value={formData.specialization || ''}
                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Degrees & Qualifications</label>
              <input
                type="text"
                required
                value={formData.qualification || ''}
                onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Biography</label>
            <textarea
              rows={3}
              value={formData.bio || ''}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            />
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
              Save Credentials
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
