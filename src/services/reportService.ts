import { MedicalReport } from '../types';
import { Storage } from './storage';
import { apiRequest, API_CONFIG } from './apiConfig';

export const reportService = {
  async getReportsByPatient(patientId: string): Promise<MedicalReport[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<MedicalReport[]>(`/reports/patient/${patientId}`);
    }
    return Storage.getReports().filter(r => r.patientId === patientId);
  },

  async getReportsForDoctor(doctorId: string): Promise<MedicalReport[]> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<MedicalReport[]>(`/reports/doctor/${doctorId}`);
    }
    return Storage.getReports().filter(r => r.accessGrantedDoctorIds.includes(doctorId));
  },

  async uploadReport(data: Omit<MedicalReport, 'id' | 'uploadDate'>): Promise<MedicalReport> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<MedicalReport>('/reports', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }

    const newReport: MedicalReport = {
      ...data,
      id: `rep_${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
    };

    Storage.saveReport(newReport);
    return newReport;
  },

  async updateDoctorAccess(reportId: string, doctorIds: string[]): Promise<MedicalReport> {
    const reports = Storage.getReports();
    const rep = reports.find(r => r.id === reportId);
    if (!rep) throw new Error('Report not found');
    rep.accessGrantedDoctorIds = doctorIds;
    Storage.saveReport(rep);
    return rep;
  },
};
