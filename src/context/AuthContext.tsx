import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { Storage } from '../services/storage';
import { authService, LoginCredentials, RegisterPatientPayload, RegisterDoctorPayload, RegisterClinicPayload } from '../services/authService';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  registerPatient: (payload: RegisterPatientPayload) => Promise<User>;
  registerDoctor: (payload: RegisterDoctorPayload) => Promise<User>;
  registerClinic: (payload: RegisterClinicPayload) => Promise<User>;
  logout: () => Promise<void>;
  switchDemoRole: (targetRole: UserRole) => void;
  resetDemoData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useNotification();

  useEffect(() => {
    const current = Storage.getActiveUser();
    setUser(current);
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const loggedIn = await authService.login(credentials);
      setUser(loggedIn);
      showToast(`Welcome back, ${loggedIn.name}`, 'success', `Authenticated as ${loggedIn.role.toUpperCase()}`);
      return loggedIn;
    } catch (err) {
      showToast('Authentication failed', 'error', (err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerPatient = async (payload: RegisterPatientPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await authService.registerPatient(payload);
      setUser(newUser);
      showToast('Registration successful', 'success', 'Welcome to CareConnect. Your patient profile is active.');
      return newUser;
    } catch (err) {
      showToast('Registration failed', 'error', (err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerDoctor = async (payload: RegisterDoctorPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await authService.registerDoctor(payload);
      setUser(newUser);
      showToast('Registration successful', 'success', 'Doctor credentials verified and registered.');
      return newUser;
    } catch (err) {
      showToast('Registration failed', 'error', (err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerClinic = async (payload: RegisterClinicPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await authService.registerClinic(payload);
      setUser(newUser);
      showToast('Registration successful', 'success', 'Healthcare facility onboarded to CareConnect.');
      return newUser;
    } catch (err) {
      showToast('Registration failed', 'error', (err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    showToast('Logged out', 'info', 'You have been securely signed out.');
  };

  const switchDemoRole = (targetRole: UserRole) => {
    const allUsers = Storage.getUsers();
    let target = allUsers.find(u => u.role === targetRole);
    if (!target) {
      // fallback creation
      target = {
        id: `user_${targetRole}_demo`,
        email: `${targetRole}@careconnect.io`,
        name: targetRole === 'doctor' ? 'Dr. Priya Nair' : targetRole === 'clinic' ? 'Apex Metro Healthcare' : 'Aarav Sharma',
        role: targetRole,
        phone: '+91 98000 11111',
        associatedId: targetRole === 'doctor' ? 'doc_1' : targetRole === 'clinic' ? 'clinic_1' : 'pat_1',
      };
      Storage.saveUser(target);
    }
    Storage.setActiveUser(target);
    setUser(target);
    showToast(`Switched role to ${targetRole.toUpperCase()}`, 'info', `Active user: ${target.name}`);
  };

  const resetDemoData = () => {
    Storage.resetAll();
    const current = Storage.getActiveUser();
    setUser(current);
    showToast('Demo data reset', 'info', 'Storage restored to baseline test scenarios.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerPatient,
        registerDoctor,
        registerClinic,
        logout,
        switchDemoRole,
        resetDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
