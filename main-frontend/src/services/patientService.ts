import { PatientProfile } from '../types';
import { Storage } from './storage';
import { apiRequest, API_CONFIG } from './apiConfig';

export const patientService = {
  async getProfile(patientId: string): Promise<PatientProfile | null> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<PatientProfile>(`/patients/${patientId}`);
    }
    const patients = Storage.getPatients();
    return patients.find(p => p.id === patientId || p.userId === patientId) || patients[0] || null;
  },

  async updateProfile(profile: PatientProfile): Promise<PatientProfile> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<PatientProfile>(`/patients/${profile.id}`, {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
    }
    Storage.savePatient(profile);
    return profile;
  },

  async getAllPatients(): Promise<PatientProfile[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<PatientProfile[]>('/patients');
    }
    return Storage.getPatients();
  },
};
