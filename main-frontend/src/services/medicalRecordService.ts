import { MedicalHistoryItem } from '../types';
import { Storage } from './storage';
import { apiRequest, API_CONFIG } from './apiConfig';

export const medicalRecordService = {
  async getHistoryByPatient(patientId: string): Promise<MedicalHistoryItem[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<MedicalHistoryItem[]>(`/medical-records/patient/${patientId}`);
    }
    return Storage.getHistory().filter(h => h.patientId === patientId);
  },

  async addHistoryItem(item: Omit<MedicalHistoryItem, 'id'>): Promise<MedicalHistoryItem> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<MedicalHistoryItem>('/medical-records', {
        method: 'POST',
        body: JSON.stringify(item),
      });
    }

    const newItem: MedicalHistoryItem = {
      ...item,
      id: `hist_${Date.now()}`,
    };

    Storage.saveHistoryItem(newItem);
    return newItem;
  },
};
