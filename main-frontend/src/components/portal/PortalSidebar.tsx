import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  History,
  Search,
  Calendar,
  ClipboardList,
  FileText,
  Pill,
  Clock,
  Settings,
  LogOut,
  Building2,
  Users,
  Stethoscope,
  BarChart3,
  CalendarDays,
  Activity,
  HeartHandshake,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/RoleBadge';

interface PortalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PortalSidebar({ isOpen, onClose }: PortalSidebarProps) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const patientNav = [
    { label: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/patient/profile', icon: User },
    { label: 'Medical History', path: '/patient/history', icon: History },
    { label: 'Find Doctors', path: '/patient/doctors', icon: Search },
    { label: 'Appointments', path: '/patient/appointments', icon: Calendar },
    { label: 'Pre-Consultation', path: '/patient/pre-consultation', icon: ClipboardList },
    { label: 'Medical Reports', path: '/patient/reports', icon: FileText },
    { label: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
    { label: 'Medicine Reminders', path: '/patient/reminders', icon: Clock },
    { label: 'Settings', path: '/patient/settings', icon: Settings },
  ];

  const doctorNav = [
    { label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/doctor/profile', icon: User },
    { label: 'My Clinics', path: '/doctor/clinics', icon: Building2 },
    { label: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { label: 'Patient Records', path: '/doctor/patients', icon: Users },
    { label: 'Pre-Consultation Forms', path: '/doctor/pre-consultations', icon: ClipboardList },
    { label: 'Medical Reports', path: '/doctor/reports', icon: FileText },
    { label: 'Consultations', path: '/doctor/consultations', icon: Stethoscope },
    { label: 'Prescriptions', path: '/doctor/prescriptions', icon: Pill },
    { label: 'Settings', path: '/doctor/settings', icon: Settings },
  ];

  const clinicNav = [
    { label: 'Dashboard', path: '/clinic/dashboard', icon: LayoutDashboard },
    { label: 'Clinic Profile', path: '/clinic/profile', icon: Building2 },
    { label: 'Associated Doctors', path: '/clinic/doctors', icon: Users },
    { label: 'Daily Appointments', path: '/clinic/appointments', icon: CalendarDays },
    { label: 'Doctor Availability', path: '/clinic/availability', icon: Clock },
    { label: 'Clinic Analytics', path: '/clinic/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/clinic/settings', icon: Settings },
  ];

  const items = role === 'patient' ? patientNav : role === 'doctor' ? doctorNav : clinicNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                CareConnect
              </span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                Healthcare OS
              </span>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current user role card */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm shrink-0 border border-teal-200/60">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
              <div className="mt-0.5">
                {role && <RoleBadge role={role} size="sm" />}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 stroke-[1.8]" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer logout & switch */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
