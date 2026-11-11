import { Appointment, AppointmentStatus } from '../types';
import { Storage } from './storage';
import { apiRequest, API_CONFIG } from './apiConfig';

export interface CreateAppointmentPayload {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  clinicId: string;
  clinicName: string;
  clinicAddress: string;
  date: string;
  time: string;
  type: 'In-Person' | 'Video Consultation';
  reasonForVisit: string;
  fee: number;
}

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Appointment[]>('/appointments');
    }
    return Storage.getAppointments();
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Appointment>(`/appointments/${id}`);
    }
    const list = Storage.getAppointments();
    return list.find(a => a.id === id) || null;
  },

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Appointment[]>(`/appointments/patient/${patientId}`);
    }
    return Storage.getAppointments().filter(a => a.patientId === patientId);
  },

  async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Appointment[]>(`/appointments/doctor/${doctorId}`);
    }
    return Storage.getAppointments().filter(a => a.doctorId === doctorId);
  },

  async getAppointmentsByClinic(clinicId: string): Promise<Appointment[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Appointment[]>(`/appointments/clinic/${clinicId}`);
    }
    return Storage.getAppointments().filter(a => a.clinicId === clinicId);
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Appointment>('/appointments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    const newAppt: Appointment = {
      id: `apt_${Date.now()}`,
      patientId: payload.patientId,
      patientName: payload.patientName,
      doctorId: payload.doctorId,
      doctorName: payload.doctorName,
      doctorSpecialization: payload.doctorSpecialization,
      clinicId: payload.clinicId,
      clinicName: payload.clinicName,
      clinicAddress: payload.clinicAddress,
      date: payload.date,
      time: payload.time,
      status: 'CONFIRMED',
      type: payload.type,
      reasonForVisit: payload.reasonForVisit,
      fee: payload.fee,
      preConsultationSubmitted: false,
      createdAt: new Date().toISOString(),
    };

    Storage.saveAppointment(newAppt);
    return newAppt;
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Appointment>(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }

    const appt = await appointmentService.getAppointmentById(id);
    if (!appt) throw new Error('Appointment not found');
    appt.status = status;
    Storage.saveAppointment(appt);
    return appt;
  },

  async rescheduleAppointment(id: string, date: string, time: string): Promise<Appointment> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<Appointment>(`/appointments/${id}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify({ date, time }),
      });
    }

    const appt = await appointmentService.getAppointmentById(id);
    if (!appt) throw new Error('Appointment not found');
    appt.date = date;
    appt.time = time;
    appt.status = 'CONFIRMED';
    Storage.saveAppointment(appt);
    return appt;
  },
};
