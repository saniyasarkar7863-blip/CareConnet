import { PreConsultation } from '../types';
import { Storage } from './storage';
import { apiRequest, API_CONFIG } from './apiConfig';

export const preConsultationService = {
  async getByAppointmentId(appointmentId: string): Promise<PreConsultation | null> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<PreConsultation>(`/pre-consultations/appointment/${appointmentId}`);
    }
    const list = Storage.getPreConsultations();
    return list.find(p => p.appointmentId === appointmentId) || null;
  },

  async getByPatientId(patientId: string): Promise<PreConsultation[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<PreConsultation[]>(`/pre-consultations/patient/${patientId}`);
    }
    return Storage.getPreConsultations().filter(p => p.patientId === patientId);
  },

  async getByDoctorId(doctorId: string): Promise<PreConsultation[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<PreConsultation[]>(`/pre-consultations/doctor/${doctorId}`);
    }
    return Storage.getPreConsultations().filter(p => p.doctorId === doctorId);
  },

  async submitPreConsultation(data: Omit<PreConsultation, 'id' | 'submittedAt'>): Promise<PreConsultation> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<PreConsultation>('/pre-consultations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }

    const newRecord: PreConsultation = {
      ...data,
      id: `pre_${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };

    Storage.savePreConsultation(newRecord);
    return newRecord;
  },
};
