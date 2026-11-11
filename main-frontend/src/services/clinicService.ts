import { Clinic } from '../types';
import { Storage } from './storage';
import { apiRequest, API_CONFIG } from './apiConfig';

export const clinicService = {
  async getAllClinics(): Promise<Clinic[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Clinic[]>('/clinics');
    }
    return Storage.getClinics();
  },

  async getClinicById(id: string): Promise<Clinic | null> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Clinic>(`/clinics/${id}`);
    }
    const clinics = Storage.getClinics();
    return clinics.find(c => c.id === id) || clinics[0] || null;
  },

  async updateClinic(clinic: Clinic): Promise<Clinic> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Clinic>(`/clinics/${clinic.id}`, {
        method: 'PUT',
        body: JSON.stringify(clinic),
      });
    }
    Storage.saveClinic(clinic);
    return clinic;
  },

  async addDoctorToClinic(clinicId: string, doctorId: string): Promise<Clinic> {
    const clinic = await clinicService.getClinicById(clinicId);
    if (!clinic) throw new Error('Clinic not found');
    if (!clinic.doctorIds.includes(doctorId)) {
      clinic.doctorIds.push(doctorId);
      return clinicService.updateClinic(clinic);
    }
    return clinic;
  },

  async removeDoctorFromClinic(clinicId: string, doctorId: string): Promise<Clinic> {
    const clinic = await clinicService.getClinicById(clinicId);
    if (!clinic) throw new Error('Clinic not found');
    clinic.doctorIds = clinic.doctorIds.filter(id => id !== doctorId);
    return clinicService.updateClinic(clinic);
  },
};
