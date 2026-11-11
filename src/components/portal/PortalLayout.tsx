import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PortalSidebar } from './PortalSidebar';
import { PortalHeader } from './PortalHeader';
import { SpringNotice } from '../common/SpringNotice';
import { ShieldAlert } from 'lucide-react';
import { UserRole } from '../../types';

interface PortalLayoutProps {
  requiredRole: UserRole;
}

export function PortalLayout({ requiredRole }: PortalLayoutProps) {
  const { user, role, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  // Not logged in -> go to login
  if (!user || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role mismatch protection: e.g. Patient trying to open /doctor or Doctor trying to open /clinic
  if (role !== requiredRole) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <SpringNotice />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              You are currently signed in as <strong>{user.name}</strong> ({role.toUpperCase()}).
              This section is reserved exclusively for authorized <strong>{requiredRole.toUpperCase()}</strong> personnel.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
              <Navigate to={`/${role}/dashboard`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col">
      <SpringNotice />
      <div className="flex-1 flex">
        <PortalSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <PortalHeader onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
