import { DoctorProfile } from '../types';
import { Storage } from './storage';
import { apiRequest, API_CONFIG } from './apiConfig';

export const doctorService = {
  async getAllDoctors(): Promise<DoctorProfile[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<DoctorProfile[]>('/doctors');
    }
    return Storage.getDoctors();
  },

  async getDoctorById(id: string): Promise<DoctorProfile | null> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<DoctorProfile>(`/doctors/${id}`);
    }
    const docs = Storage.getDoctors();
    return docs.find(d => d.id === id || d.userId === id) || docs[0] || null;
  },

  async updateDoctor(doctor: DoctorProfile): Promise<DoctorProfile> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<DoctorProfile>(`/doctors/${doctor.id}`, {
        method: 'PUT',
        body: JSON.stringify(doctor),
      });
    }
    Storage.saveDoctor(doctor);
    return doctor;
  },

  async searchDoctors(query: string, specialization?: string, clinicId?: string): Promise<DoctorProfile[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (specialization) params.append('specialization', specialization);
      if (clinicId) params.append('clinicId', clinicId);
      return apiRequest<DoctorProfile[]>(`/doctors/search?${params.toString()}`);
    }

    let results = Storage.getDoctors();
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.qualification.toLowerCase().includes(q)
      );
    }
    if (specialization && specialization !== 'All') {
      results = results.filter(d => d.specialization.toLowerCase().includes(specialization.toLowerCase()));
    }
    if (clinicId && clinicId !== 'All') {
      results = results.filter(d => d.associatedClinicIds.includes(clinicId));
    }
    return results;
  },
};
