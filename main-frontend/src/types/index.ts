export type UserRole = 'patient' | 'doctor' | 'clinic';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatarUrl?: string;
  phone?: string;
  associatedId?: string; // Links to patientId, doctorId, or clinicId
}

export interface PatientProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  address: string;
  allergies: string[];
  chronicConditions: string[];
  heightCm: number;
  weightKg: number;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  licenseNumber: string;
  bio: string;
  consultationFee: number;
  rating: number;
  totalReviews: number;
  associatedClinicIds: string[];
  availableSlots: string[]; // e.g. ["09:00 AM", "10:30 AM", "02:00 PM"]
  availableDays: string[]; // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri"]
}

export interface Clinic {
  id: string;
  name: string;
  tagline: string;
  registrationNumber: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  operatingHours: string;
  doctorIds: string[];
  facilities: string[];
  establishedYear: number;
}

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  clinicId: string;
  clinicName: string;
  clinicAddress: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 AM"
  status: AppointmentStatus;
  type: 'In-Person' | 'Video Consultation';
  reasonForVisit: string;
  fee: number;
  preConsultationSubmitted: boolean;
  preConsultationId?: string;
  consultationId?: string;
  prescriptionId?: string;
  createdAt: string;
}

export interface PreConsultation {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  primarySymptoms: string;
  symptomDuration: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  existingMedications: string;
  knownAllergies: string;
  additionalNotes: string;
  vitals?: {
    bloodPressure?: string;
    temperatureF?: number;
    pulseRate?: number;
  };
  submittedAt: string;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  clinicId: string;
  clinicName: string;
  date: string;
  chiefComplaint: string;
  clinicalObservations: string;
  diagnosis: string;
  treatmentPlan: string;
  followUpDays?: number;
  prescriptionId?: string;
  status: 'COMPLETED';
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string; // e.g. "500 mg"
  frequency: string; // e.g. "Twice a day (1-0-1)"
  duration: string; // e.g. "5 days"
  foodTiming: 'Before Food' | 'After Food' | 'With Food' | 'Empty Stomach';
  instructions: string; // e.g. "Take with plenty of warm water"
}

export interface Prescription {
  id: string;
  consultationId?: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorLicense: string;
  clinicName: string;
  clinicAddress: string;
  date: string;
  diagnosis: string;
  items: PrescriptionItem[];
  generalAdvice: string;
  followUpDate?: string;
  signature: string;
}

export interface MedicineReminder {
  id: string;
  patientId: string;
  prescriptionId?: string;
  medicineName: string;
  dosage: string;
  timesPerDay: number;
  scheduledTimes: string[]; // e.g. ["08:00 AM", "08:00 PM"]
  frequency: string;
  duration: string;
  instructions: string;
  isActive: boolean;
  takenToday: boolean[]; // corresponds to scheduledTimes
  startDate: string;
  endDate: string;
}

export interface MedicalReport {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  category: 'Blood Work' | 'Radiology / X-Ray' | 'Cardiology' | 'Pathology' | 'Prescription Scan' | 'Discharge Summary';
  testDate: string;
  uploadDate: string;
  labName: string;
  doctorNotes?: string;
  fileSize: string;
  fileType: string;
  accessGrantedDoctorIds: string[];
}

export interface MedicalHistoryItem {
  id: string;
  patientId: string;
  condition: string;
  diagnosedDate: string;
  status: 'Active' | 'Resolved' | 'Chronic';
  treatmentDoctor?: string;
  notes: string;
}
