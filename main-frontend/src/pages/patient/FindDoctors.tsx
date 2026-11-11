import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Clock, Star, MapPin, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { clinicService } from '../../services/clinicService';
import { appointmentService } from '../../services/appointmentService';
import { DoctorProfile, Clinic, Appointment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../../components/common/Modal';
import { useNavigate } from 'react-router-dom';

export function FindDoctorsPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [selectedClinic, setSelectedClinic] = useState('All');

  // Booking Modal
  const [bookingDoctor, setBookingDoctor] = useState<DoctorProfile | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('2026-11-20');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultType, setConsultType] = useState<'In-Person' | 'Video Consultation'>('In-Person');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [docs, cls] = await Promise.all([
        doctorService.getAllDoctors(),
        clinicService.getAllClinics(),
      ]);
      setDoctors(docs);
      setClinics(cls);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    const matchQuery =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.qualification.toLowerCase().includes(searchQuery.toLowerCase());

    const matchSpec =
      selectedSpecialization === 'All' ||
      doc.specialization.toLowerCase().includes(selectedSpecialization.toLowerCase());

    const matchClinic =
      selectedClinic === 'All' || doc.associatedClinicIds.includes(selectedClinic);

    return matchQuery && matchSpec && matchClinic;
  });

  const handleOpenBooking = (doc: DoctorProfile) => {
    setBookingDoctor(doc);
    setSelectedClinicId(doc.associatedClinicIds[0] || 'clinic_1');
    setSelectedSlot(doc.availableSlots[0] || '10:00 AM');
    setReasonForVisit('');
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDoctor || !selectedSlot || !reasonForVisit.trim()) {
      showToast('Please provide a reason for the consultation', 'error');
      return;
    }

    const clinic = clinics.find(c => c.id === selectedClinicId) || clinics[0];

    setIsSubmitting(true);
    try {
      const newAppt = await appointmentService.createAppointment({
        patientId: user?.associatedId || 'pat_1',
        patientName: user?.name || 'Aarav Sharma',
        doctorId: bookingDoctor.id,
        doctorName: bookingDoctor.name,
        doctorSpecialization: bookingDoctor.specialization,
        clinicId: clinic.id,
        clinicName: clinic.name,
        clinicAddress: clinic.address,
        date: appointmentDate,
        time: selectedSlot,
        type: consultType,
        reasonForVisit,
        fee: bookingDoctor.consultationFee,
      });

      showToast(
        'Appointment Scheduled Successfully',
        'success',
        `Booked with ${bookingDoctor.name} on ${appointmentDate} at ${selectedSlot}`
      );
      setBookingDoctor(null);
      navigate('/patient/appointments');
    } catch {
      showToast('Failed to schedule appointment', 'error');
    } finally {
      setIsSubmitting(false);
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
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Find Doctors & Book Consultation</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Consult credentialed medical specialists across accredited clinic locations
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name, specialty, or condition..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <select
            value={selectedSpecialization}
            onChange={e => setSelectedSpecialization(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 bg-white text-slate-700"
          >
            <option value="All">All Specialties</option>
            <option value="Cardiology">Cardiology</option>
            <option value="General & Family Medicine">General Medicine</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Orthopedics">Orthopedics</option>
          </select>

          <select
            value={selectedClinic}
            onChange={e => setSelectedClinic(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 bg-white text-slate-700"
          >
            <option value="All">All Clinics</option>
            {clinics.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDoctors.map(doc => {
          const associatedClinicNames = clinics
            .filter(c => doc.associatedClinicIds.includes(c.id))
            .map(c => c.name);

          return (
            <div
              key={doc.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-teal-800 text-white font-bold flex items-center justify-center text-base shrink-0 shadow-xs">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{doc.name}</h2>
                      <p className="text-xs text-teal-800 font-semibold">{doc.specialization}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{doc.qualification}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-slate-900">₹{doc.consultationFee}</span>
                    <span className="block text-[10px] text-slate-400">Consultation Fee</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-4 leading-relaxed line-clamp-2">
                  {doc.bio}
                </p>

                {/* Clinics & Experience */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-slate-900">{doc.rating}</span>
                    <span className="text-slate-400">({doc.totalReviews} reviews)</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">{doc.experienceYears}+ years</span>
                    <span className="text-slate-400"> experience</span>
                  </div>
                </div>

                {/* Associated Clinic Tags */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{associatedClinicNames.join(' · ')}</span>
                </div>

                {/* Available Slots Preview */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                    Available Time Slots
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.availableSlots.map(slot => (
                      <span
                        key={slot}
                        className="px-2 py-0.5 text-[11px] font-mono bg-slate-50 text-slate-700 rounded border border-slate-200"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-2">
                <button
                  onClick={() => handleOpenBooking(doc)}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule Consultation</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
          No medical specialists found matching your search and filter criteria.
        </div>
      )}

      {/* Appointment Booking Modal */}
      {bookingDoctor && (
        <Modal
          isOpen={!!bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          title={`Schedule Consultation: ${bookingDoctor.name}`}
          subtitle={`${bookingDoctor.specialization} · Fee: ₹${bookingDoctor.consultationFee}`}
          maxWidth="lg"
        >
          <form onSubmit={handleConfirmBooking} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Consultation Facility *
              </label>
              <select
                value={selectedClinicId}
                onChange={e => setSelectedClinicId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 bg-white"
              >
                {clinics
                  .filter(c => bookingDoctor.associatedClinicIds.includes(c.id))
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.address}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={e => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consultation Mode
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['In-Person', 'Video Consultation'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setConsultType(mode)}
                      className={`py-2 text-[11px] font-semibold rounded-lg border transition-colors ${
                        consultType === mode
                          ? 'bg-teal-50 border-teal-700 text-teal-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Available Appointment Slot *
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {bookingDoctor.availableSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-2 text-xs font-mono font-medium rounded-lg border text-center transition-colors ${
                      selectedSlot === slot
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Reason for Consultation *
              </label>
              <textarea
                rows={3}
                required
                value={reasonForVisit}
                onChange={e => setReasonForVisit(e.target.value)}
                placeholder="Describe your current symptoms or reason for visit (e.g. Chest tightness during morning jogs for 2 weeks)..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
            </div>

            <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100 text-xs text-teal-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span>
                After booking, you will be invited to complete the <strong>Pre-Consultation Intake Form</strong> to share preliminary vitals and symptom duration directly with {bookingDoctor.name}.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBookingDoctor(null)}
                className="py-2 px-3 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2 px-4 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
