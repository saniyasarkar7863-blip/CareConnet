import { Prescription } from '../types';
import { Storage } from './storage';
import { apiRequest, API_CONFIG } from './apiConfig';

export const prescriptionService = {
  async getPrescriptionById(id: string): Promise<Prescription | null> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Prescription>(`/prescriptions/${id}`);
    }
    const list = Storage.getPrescriptions();
    return list.find(p => p.id === id) || null;
  },

  async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Prescription[]>(`/prescriptions/patient/${patientId}`);
    }
    return Storage.getPrescriptions().filter(p => p.patientId === patientId);
  },

  async getPrescriptionsByDoctor(doctorId: string): Promise<Prescription[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Prescription[]>(`/prescriptions/doctor/${doctorId}`);
    }
    return Storage.getPrescriptions().filter(p => p.doctorId === doctorId);
  },

  async createPrescription(data: Omit<Prescription, 'id'>): Promise<Prescription> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Prescription>('/prescriptions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }

    const newPrescription: Prescription = {
      ...data,
      id: `rx_${Date.now()}`,
    };

    Storage.savePrescription(newPrescription);
    return newPrescription;
  },
};
