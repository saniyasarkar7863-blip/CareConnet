import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Calendar, Heart, Shield, Edit3, Save, X, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patientService';
import { PatientProfile } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../../components/common/Modal';

export function PatientProfilePage() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientProfile>>({});
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const data = await patientService.getProfile(user.associatedId || 'pat_1');
      setProfile(data);
      if (data) setFormData(data);
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const updated = await patientService.updateProfile({
        ...profile,
        ...formData,
      } as PatientProfile);
      setProfile(updated);
      setIsEditing(false);
      showToast('Profile updated', 'success', 'Your health record changes have been saved.');
    } catch {
      showToast('Error saving profile', 'error');
    }
  };

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    const current = formData.allergies || [];
    setFormData({ ...formData, allergies: [...current, newAllergy.trim()] });
    setNewAllergy('');
  };

  const handleRemoveAllergy = (idx: number) => {
    const current = formData.allergies || [];
    setFormData({ ...formData, allergies: current.filter((_, i) => i !== idx) });
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    const current = formData.chronicConditions || [];
    setFormData({ ...formData, chronicConditions: [...current, newCondition.trim()] });
    setNewCondition('');
  };

  const handleRemoveCondition = (idx: number) => {
    const current = formData.chronicConditions || [];
    setFormData({ ...formData, chronicConditions: current.filter((_, i) => i !== idx) });
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12 text-slate-500">Profile record unavailable.</div>;
  }

  // Calculate BMI
  const heightM = profile.heightCm / 100;
  const bmi = (profile.weightKg / (heightM * heightM)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner with Edit Button */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-800 text-white font-extrabold flex items-center justify-center text-xl shadow-xs">
            {profile.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{profile.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              CareConnect Patient ID: <span className="font-mono text-slate-700 font-semibold">{profile.id}</span>
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
              <span>{profile.gender}</span>
              <span>·</span>
              <span>DOB: {profile.dob}</span>
              <span>·</span>
              <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/50">
                Blood Group: {profile.bloodGroup}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setFormData(profile);
            setIsEditing(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Medical Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal & Vitals */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Contact & Residential Information
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Email Address</span>
                <span className="text-slate-800 font-semibold mt-0.5 block">{profile.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Phone Number</span>
                <span className="text-slate-800 font-semibold mt-0.5 block font-mono">{profile.phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-medium">Residential Address</span>
                <span className="text-slate-800 font-semibold mt-0.5 block">{profile.address}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Anthropometric Vitals
            </h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 block">Height</span>
                <span className="text-base font-bold text-slate-900 font-mono mt-1 block">
                  {profile.heightCm} cm
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 block">Weight</span>
                <span className="text-base font-bold text-slate-900 font-mono mt-1 block">
                  {profile.weightKg} kg
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 block">Calculated BMI</span>
                <span className="text-base font-bold text-teal-800 font-mono mt-1 block">
                  {bmi}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Emergency Contact (Caregiver)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Caregiver Name</span>
                <span className="text-slate-900 font-semibold mt-0.5 block">{profile.emergencyContact.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Relationship</span>
                <span className="text-slate-900 font-semibold mt-0.5 block">{profile.emergencyContact.relationship}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Emergency Phone</span>
                <span className="text-slate-900 font-semibold mt-0.5 block font-mono">{profile.emergencyContact.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Allergies & Chronic Conditions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                Verified Drug & Environmental Allergies
              </h2>
              <span className="text-[11px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200/50">
                Critical Safety Alert
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Doctors are alerted to these contraindications prior to writing electronic prescriptions.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {profile.allergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5"
                >
                  <span>⚠️ {allergy}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Active Chronic Conditions
            </h2>
            <p className="text-xs text-slate-500">
              Ongoing diagnoses monitored across routine follow-up consultations.
            </p>
            <div className="space-y-2 pt-1">
              {profile.chronicConditions.map((cond, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-900">{cond}</span>
                  <span className="text-[11px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/50">
                    Monitored
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Patient Medical Profile"
        subtitle="Update clinical records, emergency contact, and known allergies"
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup || 'B+'}
                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-white"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Height (cm)</label>
              <input
                type="number"
                value={formData.heightCm || 170}
                onChange={e => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={formData.weightKg || 70}
                onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
            />
          </div>

          {/* Allergies management */}
          <div className="border-t border-slate-100 pt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Allergies</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add allergy (e.g. Sulfa drugs, Peanuts)"
                value={newAllergy}
                onChange={e => setNewAllergy(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(formData.allergies || []).map((a, i) => (
                <span key={i} className="px-2.5 py-1 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-md flex items-center gap-1.5">
                  <span>{a}</span>
                  <button type="button" onClick={() => handleRemoveAllergy(i)} className="text-rose-500 hover:text-rose-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Chronic conditions */}
          <div className="border-t border-slate-100 pt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chronic Conditions</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add condition (e.g. Asthma, Hypothyroidism)"
                value={newCondition}
                onChange={e => setNewCondition(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(formData.chronicConditions || []).map((c, i) => (
                <span key={i} className="px-2.5 py-1 text-xs bg-slate-100 text-slate-800 border border-slate-200 rounded-md flex items-center gap-1.5">
                  <span>{c}</span>
                  <button type="button" onClick={() => handleRemoveCondition(i)} className="text-slate-500 hover:text-slate-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
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
              Save Profile Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
