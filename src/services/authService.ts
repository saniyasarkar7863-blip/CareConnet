import { User, UserRole } from '../types';
import { Storage } from './storage';
import { apiRequest, API_CONFIG } from './apiConfig';

export interface LoginCredentials {
  email: string;
  password?: string;
  role?: UserRole;
}

export interface RegisterPatientPayload {
  name: string;
  email: string;
  password?: string;
  phone: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface RegisterDoctorPayload {
  name: string;
  email: string;
  password?: string;
  phone: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  licenseNumber: string;
  consultationFee: number;
}

export interface RegisterClinicPayload {
  name: string;
  email: string;
  password?: string;
  phone: string;
  tagline: string;
  registrationNumber: string;
  address: string;
  city: string;
  operatingHours: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    }

    // Demo authentication layer
    const users = Storage.getUsers();
    let matchedUser = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

    if (!matchedUser && credentials.role) {
      matchedUser = users.find(u => u.role === credentials.role);
    }

    if (!matchedUser) {
      // Create user on the fly for demo if not found
      matchedUser = {
        id: `user_${Date.now()}`,
        email: credentials.email,
        name: credentials.email.split('@')[0],
        role: credentials.role || 'patient',
        phone: '+91 98000 00000',
        associatedId: credentials.role === 'doctor' ? 'doc_1' : credentials.role === 'clinic' ? 'clinic_1' : 'pat_1',
      };
      Storage.saveUser(matchedUser);
    }

    Storage.setActiveUser(matchedUser);
    localStorage.setItem('careconnect_jwt_token', `demo_jwt_token_for_${matchedUser.id}`);
    return matchedUser;
  },

  async registerPatient(payload: RegisterPatientPayload): Promise<User> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<User>('/auth/register/patient', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    const patientId = `pat_${Date.now()}`;
    const userId = `user_pat_${Date.now()}`;

    const newUser: User = {
      id: userId,
      email: payload.email,
      name: payload.name,
      role: 'patient',
      phone: payload.phone,
      associatedId: patientId,
    };

    Storage.saveUser(newUser);

    Storage.savePatient({
      id: patientId,
      userId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      dob: payload.dob,
      gender: payload.gender,
      bloodGroup: payload.bloodGroup,
      emergencyContact: {
        name: payload.emergencyContactName,
        relationship: 'Family Member',
        phone: payload.emergencyContactPhone,
      },
      address: 'Powai, Mumbai',
      allergies: ['None listed'],
      chronicConditions: ['None reported'],
      heightCm: 172,
      weightKg: 68,
    });

    Storage.setActiveUser(newUser);
    return newUser;
  },

  async registerDoctor(payload: RegisterDoctorPayload): Promise<User> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<User>('/auth/register/doctor', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    const doctorId = `doc_${Date.now()}`;
    const userId = `user_doc_${Date.now()}`;

    const newUser: User = {
      id: userId,
      email: payload.email,
      name: payload.name.startsWith('Dr.') ? payload.name : `Dr. ${payload.name}`,
      role: 'doctor',
      phone: payload.phone,
      associatedId: doctorId,
    };

    Storage.saveUser(newUser);

    Storage.saveDoctor({
      id: doctorId,
      userId,
      name: newUser.name,
      email: payload.email,
      phone: payload.phone,
      specialization: payload.specialization,
      qualification: payload.qualification,
      experienceYears: payload.experienceYears,
      licenseNumber: payload.licenseNumber,
      bio: `Practicing ${payload.specialization} specialist committed to evidence-based healthcare.`,
      consultationFee: payload.consultationFee || 600,
      rating: 5.0,
      totalReviews: 1,
      associatedClinicIds: ['clinic_1'],
      availableSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'],
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    });

    Storage.setActiveUser(newUser);
    return newUser;
  },

  async registerClinic(payload: RegisterClinicPayload): Promise<User> {
    if (API_CONFIG.IS_LIVE_BACKEND_AVAILABLE) {
      return apiRequest<User>('/auth/register/clinic', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    const clinicId = `clinic_${Date.now()}`;
    const userId = `user_clinic_${Date.now()}`;

    const newUser: User = {
      id: userId,
      email: payload.email,
      name: payload.name,
      role: 'clinic',
      phone: payload.phone,
      associatedId: clinicId,
    };

    Storage.saveUser(newUser);

    Storage.saveClinic({
      id: clinicId,
      name: payload.name,
      tagline: payload.tagline || 'Comprehensive outpatient healthcare facility',
      registrationNumber: payload.registrationNumber,
      address: payload.address,
      city: payload.city || 'Mumbai',
      state: 'Maharashtra',
      phone: payload.phone,
      email: payload.email,
      operatingHours: payload.operatingHours || '08:00 AM - 08:00 PM (Mon - Sat)',
      doctorIds: ['doc_1'],
      facilities: ['Digital X-Ray', 'Clinical Pathology Lab', 'Pharmacy'],
      establishedYear: new Date().getFullYear(),
    });

    Storage.setActiveUser(newUser);
    return newUser;
  },

  async getCurrentUser(): Promise<User | null> {
    return Storage.getActiveUser();
  },

  async logout(): Promise<void> {
    localStorage.removeItem('careconnect_jwt_token');
    Storage.setActiveUser(null);
  },
};
