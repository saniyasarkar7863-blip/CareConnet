import {
  INITIAL_USERS,
  INITIAL_CLINICS,
  INITIAL_DOCTORS,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_PRE_CONSULTATIONS,
  INITIAL_CONSULTATIONS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_REMINDERS,
  INITIAL_REPORTS,
  INITIAL_MEDICAL_HISTORY,
} from '../data/mockData';
import {
  User,
  Clinic,
  DoctorProfile,
  PatientProfile,
  Appointment,
  PreConsultation,
  Consultation,
  Prescription,
  MedicineReminder,
  MedicalReport,
  MedicalHistoryItem,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'cc_users_v1',
  CLINICS: 'cc_clinics_v1',
  DOCTORS: 'cc_doctors_v1',
  PATIENTS: 'cc_patients_v1',
  APPOINTMENTS: 'cc_appointments_v1',
  PRE_CONSULTATIONS: 'cc_pre_consultations_v1',
  CONSULTATIONS: 'cc_consultations_v1',
  PRESCRIPTIONS: 'cc_prescriptions_v1',
  REMINDERS: 'cc_reminders_v1',
  REPORTS: 'cc_reports_v1',
  MEDICAL_HISTORY: 'cc_history_v1',
  ACTIVE_USER: 'cc_active_user_v1',
};

function getFromStorage<T>(key: string, defaultData: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving to storage', err);
  }
}

export const Storage = {
  // Users
  getUsers: (): User[] => getFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS),
  saveUser: (user: User): void => {
    const users = Storage.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) users[idx] = user;
    else users.push(user);
    saveToStorage(STORAGE_KEYS.USERS, users);
  },

  // Active session
  getActiveUser: (): User | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      return raw ? JSON.parse(raw) : INITIAL_USERS[0]; // Default Aarav Sharma (patient)
    } catch {
      return INITIAL_USERS[0];
    }
  },
  setActiveUser: (user: User | null): void => {
    if (user) localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  },

  // Clinics
  getClinics: (): Clinic[] => getFromStorage(STORAGE_KEYS.CLINICS, INITIAL_CLINICS),
  saveClinic: (clinic: Clinic): void => {
    const list = Storage.getClinics();
    const idx = list.findIndex(c => c.id === clinic.id);
    if (idx >= 0) list[idx] = clinic;
    else list.push(clinic);
    saveToStorage(STORAGE_KEYS.CLINICS, list);
  },

  // Doctors
  getDoctors: (): DoctorProfile[] => getFromStorage(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS),
  saveDoctor: (doctor: DoctorProfile): void => {
    const list = Storage.getDoctors();
    const idx = list.findIndex(d => d.id === doctor.id);
    if (idx >= 0) list[idx] = doctor;
    else list.push(doctor);
    saveToStorage(STORAGE_KEYS.DOCTORS, list);
  },

  // Patients
  getPatients: (): PatientProfile[] => getFromStorage(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS),
  savePatient: (patient: PatientProfile): void => {
    const list = Storage.getPatients();
    const idx = list.findIndex(p => p.id === patient.id);
    if (idx >= 0) list[idx] = patient;
    else list.push(patient);
    saveToStorage(STORAGE_KEYS.PATIENTS, list);
  },

  // Appointments
  getAppointments: (): Appointment[] => getFromStorage(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS),
  saveAppointment: (appt: Appointment): void => {
    const list = Storage.getAppointments();
    const idx = list.findIndex(a => a.id === appt.id);
    if (idx >= 0) list[idx] = appt;
    else list.unshift(appt);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, list);
  },

  // Pre-Consultations
  getPreConsultations: (): PreConsultation[] => getFromStorage(STORAGE_KEYS.PRE_CONSULTATIONS, INITIAL_PRE_CONSULTATIONS),
  savePreConsultation: (pre: PreConsultation): void => {
    const list = Storage.getPreConsultations();
    const idx = list.findIndex(p => p.id === pre.id);
    if (idx >= 0) list[idx] = pre;
    else list.unshift(pre);
    saveToStorage(STORAGE_KEYS.PRE_CONSULTATIONS, list);

    // Update appointment record
    const appts = Storage.getAppointments();
    const appt = appts.find(a => a.id === pre.appointmentId);
    if (appt) {
      appt.preConsultationSubmitted = true;
      appt.preConsultationId = pre.id;
      Storage.saveAppointment(appt);
    }
  },

  // Consultations
  getConsultations: (): Consultation[] => getFromStorage(STORAGE_KEYS.CONSULTATIONS, INITIAL_CONSULTATIONS),
  saveConsultation: (cons: Consultation): void => {
    const list = Storage.getConsultations();
    const idx = list.findIndex(c => c.id === cons.id);
    if (idx >= 0) list[idx] = cons;
    else list.unshift(cons);
    saveToStorage(STORAGE_KEYS.CONSULTATIONS, list);

    // Update appointment status to COMPLETED
    const appts = Storage.getAppointments();
    const appt = appts.find(a => a.id === cons.appointmentId);
    if (appt) {
      appt.status = 'COMPLETED';
      appt.consultationId = cons.id;
      if (cons.prescriptionId) appt.prescriptionId = cons.prescriptionId;
      Storage.saveAppointment(appt);
    }
  },

  // Prescriptions
  getPrescriptions: (): Prescription[] => getFromStorage(STORAGE_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS),
  savePrescription: (rx: Prescription): void => {
    const list = Storage.getPrescriptions();
    const idx = list.findIndex(p => p.id === rx.id);
    if (idx >= 0) list[idx] = rx;
    else list.unshift(rx);
    saveToStorage(STORAGE_KEYS.PRESCRIPTIONS, list);

    // Link to appointment if exists
    const appts = Storage.getAppointments();
    const appt = appts.find(a => a.id === rx.appointmentId);
    if (appt) {
      appt.prescriptionId = rx.id;
      appt.status = 'COMPLETED';
      Storage.saveAppointment(appt);
    }

    // Link to consultation if exists
    const consultations = Storage.getConsultations();
    const con = consultations.find(c => c.appointmentId === rx.appointmentId);
    if (con && !con.prescriptionId) {
      con.prescriptionId = rx.id;
      const idxCon = consultations.findIndex(c => c.id === con.id);
      if (idxCon >= 0) consultations[idxCon] = con;
      saveToStorage(STORAGE_KEYS.CONSULTATIONS, consultations);
    }
  },

  // Medicine Reminders
  getReminders: (): MedicineReminder[] => getFromStorage(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS),
  saveReminder: (rem: MedicineReminder): void => {
    const list = Storage.getReminders();
    const idx = list.findIndex(r => r.id === rem.id);
    if (idx >= 0) list[idx] = rem;
    else list.unshift(rem);
    saveToStorage(STORAGE_KEYS.REMINDERS, list);
  },
  deleteReminder: (id: string): void => {
    const list = Storage.getReminders().filter(r => r.id !== id);
    saveToStorage(STORAGE_KEYS.REMINDERS, list);
  },

  // Medical Reports
  getReports: (): MedicalReport[] => getFromStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS),
  saveReport: (rep: MedicalReport): void => {
    const list = Storage.getReports();
    const idx = list.findIndex(r => r.id === rep.id);
    if (idx >= 0) list[idx] = rep;
    else list.unshift(rep);
    saveToStorage(STORAGE_KEYS.REPORTS, list);
  },

  // Medical History
  getHistory: (): MedicalHistoryItem[] => getFromStorage(STORAGE_KEYS.MEDICAL_HISTORY, INITIAL_MEDICAL_HISTORY),
  saveHistoryItem: (item: MedicalHistoryItem): void => {
    const list = Storage.getHistory();
    const idx = list.findIndex(h => h.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
    saveToStorage(STORAGE_KEYS.MEDICAL_HISTORY, list);
  },

  // Reset to original seed
  resetAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    // reinitialize
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.CLINICS, JSON.stringify(INITIAL_CLINICS));
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS));
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.PRE_CONSULTATIONS, JSON.stringify(INITIAL_PRE_CONSULTATIONS));
    localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify(INITIAL_CONSULTATIONS));
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(INITIAL_PRESCRIPTIONS));
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(INITIAL_REMINDERS));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
    localStorage.setItem(STORAGE_KEYS.MEDICAL_HISTORY, JSON.stringify(INITIAL_MEDICAL_HISTORY));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(INITIAL_USERS[0]));
  },
};
