import { MedicineReminder } from '../types';
import { Storage } from './storage';
import { apiRequest, API_CONFIG } from './apiConfig';

export const reminderService = {
  async getRemindersByPatient(patientId: string): Promise<MedicineReminder[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<MedicineReminder[]>(`/reminders/patient/${patientId}`);
    }
    return Storage.getReminders().filter(r => r.patientId === patientId);
  },

  async toggleReminderActive(id: string, isActive: boolean): Promise<MedicineReminder> {
    const list = Storage.getReminders();
    const item = list.find(r => r.id === id);
    if (!item) throw new Error('Reminder not found');
    item.isActive = isActive;
    Storage.saveReminder(item);
    return item;
  },

  async toggleTakenDose(id: string, doseIndex: number): Promise<MedicineReminder> {
    const list = Storage.getReminders();
    const item = list.find(r => r.id === id);
    if (!item) throw new Error('Reminder not found');
    item.takenToday[doseIndex] = !item.takenToday[doseIndex];
    Storage.saveReminder(item);
    return item;
  },

  async createReminder(data: Omit<MedicineReminder, 'id' | 'takenToday'>): Promise<MedicineReminder> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<MedicineReminder>('/reminders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }

    const newReminder: MedicineReminder = {
      ...data,
      id: `rem_${Date.now()}`,
      takenToday: new Array(data.scheduledTimes.length).fill(false),
    };

    Storage.saveReminder(newReminder);
    return newReminder;
  },

  async deleteReminder(id: string): Promise<void> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      await apiRequest(`/reminders/${id}`, { method: 'DELETE' });
      return;
    }
    Storage.deleteReminder(id);
  },
};
