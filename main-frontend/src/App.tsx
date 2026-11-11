import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Common Layouts
import { PortalLayout } from './components/portal/PortalLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Patient Portal Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientProfilePage } from './pages/patient/PatientProfile';
import { PatientMedicalHistoryPage } from './pages/patient/PatientMedicalHistory';
import { FindDoctorsPage } from './pages/patient/FindDoctors';
import { PatientAppointmentsPage } from './pages/patient/PatientAppointments';
import { PreConsultationPage } from './pages/patient/PreConsultationPage';
import { MedicalReportsPage } from './pages/patient/MedicalReportsPage';
import { PrescriptionsPage } from './pages/patient/PrescriptionsPage';
import { MedicineRemindersPage } from './pages/patient/MedicineRemindersPage';
import { PatientSettingsPage } from './pages/patient/PatientSettings';

// Doctor Portal Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorProfilePage } from './pages/doctor/DoctorProfile';
import { DoctorClinicsPage } from './pages/doctor/DoctorClinics';
import { DoctorAppointmentsPage } from './pages/doctor/DoctorAppointments';
import { DoctorPatientRecordsPage } from './pages/doctor/DoctorPatientRecords';
import { DoctorPreConsultationsPage } from './pages/doctor/DoctorPreConsultations';
import { DoctorReportsPage } from './pages/doctor/DoctorReportsPage';
import { DoctorConsultationWorkspace } from './pages/doctor/DoctorConsultationWorkspace';
import { DoctorPrescriptionWriter } from './pages/doctor/DoctorPrescriptionWriter';
import { DoctorSettingsPage } from './pages/doctor/DoctorSettings';

// Clinic Portal Pages
import { ClinicDashboard } from './pages/clinic/ClinicDashboard';
import { ClinicProfilePage } from './pages/clinic/ClinicProfile';
import { ClinicDoctorsPage } from './pages/clinic/ClinicDoctors';
import { ClinicAppointmentsPage } from './pages/clinic/ClinicAppointments';
import { ClinicAvailabilityPage } from './pages/clinic/ClinicAvailability';
import { ClinicAnalyticsPage } from './pages/clinic/ClinicAnalytics';
import { ClinicSettingsPage } from './pages/clinic/ClinicSettings';

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Patient Portal */}
            <Route path="/patient" element={<PortalLayout requiredRole="patient" />}>
              <Route index element={<Navigate to="/patient/dashboard" replace />} />
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="profile" element={<PatientProfilePage />} />
              <Route path="history" element={<PatientMedicalHistoryPage />} />
              <Route path="doctors" element={<FindDoctorsPage />} />
              <Route path="appointments" element={<PatientAppointmentsPage />} />
              <Route path="pre-consultation" element={<PreConsultationPage />} />
              <Route path="reports" element={<MedicalReportsPage />} />
              <Route path="prescriptions" element={<PrescriptionsPage />} />
              <Route path="reminders" element={<MedicineRemindersPage />} />
              <Route path="settings" element={<PatientSettingsPage />} />
            </Route>

            {/* Doctor Portal */}
            <Route path="/doctor" element={<PortalLayout requiredRole="doctor" />}>
              <Route index element={<Navigate to="/doctor/dashboard" replace />} />
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="profile" element={<DoctorProfilePage />} />
              <Route path="clinics" element={<DoctorClinicsPage />} />
              <Route path="appointments" element={<DoctorAppointmentsPage />} />
              <Route path="patients" element={<DoctorPatientRecordsPage />} />
              <Route path="pre-consultations" element={<DoctorPreConsultationsPage />} />
              <Route path="reports" element={<DoctorReportsPage />} />
              <Route path="consultations" element={<DoctorConsultationWorkspace />} />
              <Route path="prescriptions" element={<DoctorPrescriptionWriter />} />
              <Route path="settings" element={<DoctorSettingsPage />} />
            </Route>

            {/* Clinic Portal */}
            <Route path="/clinic" element={<PortalLayout requiredRole="clinic" />}>
              <Route index element={<Navigate to="/clinic/dashboard" replace />} />
              <Route path="dashboard" element={<ClinicDashboard />} />
              <Route path="profile" element={<ClinicProfilePage />} />
              <Route path="doctors" element={<ClinicDoctorsPage />} />
              <Route path="appointments" element={<ClinicAppointmentsPage />} />
              <Route path="availability" element={<ClinicAvailabilityPage />} />
              <Route path="analytics" element={<ClinicAnalyticsPage />} />
              <Route path="settings" element={<ClinicSettingsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
}
