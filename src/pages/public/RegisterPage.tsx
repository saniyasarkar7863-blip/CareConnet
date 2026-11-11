import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  UserCheck,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  Calendar,
  Award,
  Building2,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { SpringNotice } from '../../components/common/SpringNotice';

export function RegisterPage() {
  const { registerPatient, registerDoctor, registerClinic } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'patient' | 'doctor' | 'clinic'>('patient');
  const [loading, setLoading] = useState(false);

  // Patient Fields
  const [patName, setPatName] = useState('');
  const [patEmail, setPatEmail] = useState('');
  const [patPhone, setPatPhone] = useState('');
  const [patDob, setPatDob] = useState('1995-05-12');
  const [patGender, setPatGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patBlood, setPatBlood] = useState('B+');
  const [patEmergName, setPatEmergName] = useState('');
  const [patEmergPhone, setPatEmergPhone] = useState('');
  const [patPassword, setPatPassword] = useState('');

  // Doctor Fields
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docSpecialization, setDocSpecialization] = useState('Cardiology & Preventive Cardiology');
  const [docQualification, setDocQualification] = useState('MBBS, MD (Medicine)');
  const [docLicense, setDocLicense] = useState('');
  const [docExperience, setDocExperience] = useState<number>(8);
  const [docFee, setDocFee] = useState<number>(700);
  const [docPassword, setDocPassword] = useState('');

  // Clinic Fields
  const [clinicName, setClinicName] = useState('');
  const [clinicEmail, setClinicEmail] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  const [clinicRegNumber, setClinicRegNumber] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [clinicCity, setClinicCity] = useState('Mumbai');
  const [clinicHours, setClinicHours] = useState('08:00 AM - 08:00 PM (Mon - Sat)');
  const [clinicPassword, setClinicPassword] = useState('');

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patName || !patEmail || !patPhone || !patEmergName || !patEmergPhone) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await registerPatient({
        name: patName,
        email: patEmail,
        password: patPassword,
        phone: patPhone,
        dob: patDob,
        gender: patGender,
        bloodGroup: patBlood,
        emergencyContactName: patEmergName,
        emergencyContactPhone: patEmergPhone,
      });
      navigate('/patient/dashboard');
    } catch {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docEmail || !docPhone || !docLicense) {
      showToast('Please fill all required doctor credential fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await registerDoctor({
        name: docName,
        email: docEmail,
        password: docPassword,
        phone: docPhone,
        specialization: docSpecialization,
        qualification: docQualification,
        experienceYears: Number(docExperience),
        licenseNumber: docLicense,
        consultationFee: Number(docFee),
      });
      navigate('/doctor/dashboard');
    } catch {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleClinicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName || !clinicEmail || !clinicPhone || !clinicRegNumber || !clinicAddress) {
      showToast('Please fill all required facility fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await registerClinic({
        name: clinicName,
        email: clinicEmail,
        password: clinicPassword,
        phone: clinicPhone,
        tagline: 'Multi-specialty outpatient healthcare facility',
        registrationNumber: clinicRegNumber,
        address: clinicAddress,
        city: clinicCity,
        operatingHours: clinicHours,
      });
      navigate('/clinic/dashboard');
    } catch {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SpringNotice />

      <div className="flex-1 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              CareConnect
            </span>
          </Link>
          <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Create your CareConnect account
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Select your clinical role to begin the registration process
          </p>

          {/* Role selector tabs */}
          <div className="mt-6 flex rounded-xl bg-slate-200/80 p-1 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setActiveTab('patient')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'patient'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Patient</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('doctor')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'doctor'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-indigo-700" />
              <span>Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('clinic')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'clinic'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Clinic Facility</span>
            </button>
          </div>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
          <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
            {activeTab === 'patient' ? (
              <form onSubmit={handlePatientSubmit} className="space-y-4">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-900">1. Personal & Contact Details</h3>
                  <p className="text-xs text-slate-500">Essential details for your universal patient record.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Neha Deshmukh"
                      value={patName}
                      onChange={e => setPatName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="neha@example.com"
                      value={patEmail}
                      onChange={e => setPatEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98200 00000"
                      value={patPhone}
                      onChange={e => setPatPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={patDob}
                      onChange={e => setPatDob(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group *</label>
                    <select
                      value={patBlood}
                      onChange={e => setPatBlood(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-white"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">2. Emergency Contact & Security</h3>
                  <p className="text-xs text-slate-500 mb-3">Required for clinical safety and immediate caregiver notification.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Deshmukh (Father)"
                        value={patEmergName}
                        onChange={e => setPatEmergName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98200 99999"
                        value={patEmergPhone}
                        onChange={e => setPatEmergPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Set Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 8 characters"
                      value={patPassword}
                      onChange={e => setPatPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? 'Creating Patient Profile...' : 'Complete Patient Registration'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : activeTab === 'doctor' ? (
              <form onSubmit={handleDoctorSubmit} className="space-y-4">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Doctor Credentials & Licensing</h3>
                  <p className="text-xs text-slate-500">Provide medical council registration and practice details.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Practitioner Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Amit Bannerjee"
                      value={docName}
                      onChange={e => setDocName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="dr.amit@clinic.org"
                      value={docEmail}
                      onChange={e => setDocEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Specialization *</label>
                    <select
                      value={docSpecialization}
                      onChange={e => setDocSpecialization(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-white"
                    >
                      <option value="Cardiology & Preventive Cardiology">Cardiology & Preventive Cardiology</option>
                      <option value="General & Family Medicine">General & Family Medicine</option>
                      <option value="Pediatrics & Adolescent Care">Pediatrics & Adolescent Care</option>
                      <option value="Orthopedics & Joint Care">Orthopedics & Joint Care</option>
                      <option value="Dermatology & Skin Science">Dermatology & Skin Science</option>
                      <option value="Neurology & Cognitive Health">Neurology & Cognitive Health</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Qualifications *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MBBS, MD, DNB"
                      value={docQualification}
                      onChange={e => setDocQualification(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">License / Reg Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="MCI-2015-88912"
                      value={docLicense}
                      onChange={e => setDocLicense(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={docExperience}
                      onChange={e => setDocExperience(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee (₹)</label>
                    <input
                      type="number"
                      min={100}
                      step={50}
                      value={docFee}
                      onChange={e => setDocFee(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Create secure password"
                    value={docPassword}
                    onChange={e => setDocPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? 'Verifying Credentials...' : 'Complete Doctor Registration'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleClinicSubmit} className="space-y-4">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Healthcare Facility Onboarding</h3>
                  <p className="text-xs text-slate-500">Register hospital, polyclinic, or specialized care center.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CityCare Specialty Hospital"
                      value={clinicName}
                      onChange={e => setClinicName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Registration Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MH-MC-2024-0012"
                      value={clinicRegNumber}
                      onChange={e => setClinicRegNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Official Facility Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@citycare.org"
                      value={clinicEmail}
                      onChange={e => setClinicEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Reception Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 22 2800 0000"
                      value={clinicPhone}
                      onChange={e => setClinicPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="Street, Landmark, Area"
                      value={clinicAddress}
                      onChange={e => setClinicAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={clinicCity}
                      onChange={e => setClinicCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={clinicHours}
                    onChange={e => setClinicHours(e.target.value)}
                    placeholder="08:00 AM - 08:00 PM (Mon - Sat)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Create secure administrator password"
                    value={clinicPassword}
                    onChange={e => setClinicPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? 'Registering Facility...' : 'Complete Clinic Onboarding'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <Link to="/login" className="text-teal-700 hover:text-teal-800 font-semibold">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
