import { Consultation } from '../types';
import { Storage } from './storage';
import { apiRequest, API_CONFIG } from './apiConfig';

export const consultationService = {
  async getConsultationById(id: string): Promise<Consultation | null> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Consultation>(`/consultations/${id}`);
    }
    const list = Storage.getConsultations();
    return list.find(c => c.id === id) || null;
  },

  async getByAppointmentId(appointmentId: string): Promise<Consultation | null> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Consultation>(`/consultations/appointment/${appointmentId}`);
    }
    const list = Storage.getConsultations();
    return list.find(c => c.appointmentId === appointmentId) || null;
  },

  async getByDoctorId(doctorId: string): Promise<Consultation[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Consultation[]>(`/consultations/doctor/${doctorId}`);
    }
    return Storage.getConsultations().filter(c => c.doctorId === doctorId);
  },

  async getByPatientId(patientId: string): Promise<Consultation[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Consultation[]>(`/consultations/patient/${patientId}`);
    }
    return Storage.getConsultations().filter(c => c.patientId === patientId);
  },

  async recordConsultation(data: Omit<Consultation, 'id' | 'status'>): Promise<Consultation> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Consultation>('/consultations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }

    const newRecord: Consultation = {
      ...data,
      id: `con_${Date.now()}`,
      status: 'COMPLETED',
    };

    Storage.saveConsultation(newRecord);
    return newRecord;
  },
};
