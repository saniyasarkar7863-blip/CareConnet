import React from 'react';
import { Menu, Bell, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

interface PortalHeaderProps {
  onOpenSidebar: () => void;
}

export function PortalHeader({ onOpenSidebar }: PortalHeaderProps) {
  const { user, role } = useAuth();
  const location = useLocation();

  // Generate clean breadcrumb title
  const segments = location.pathname.split('/').filter(Boolean);
  const portalName = segments[0] ? segments[0].toUpperCase() : 'PORTAL';
  const pageName = segments[1]
    ? segments[1].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Dashboard';

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      {/* Zone 1: Breadcrumbs & mobile toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-teal-700 font-semibold">{portalName}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">{pageName}</span>
        </div>
      </div>

      {/* Zone 2: Healthcare Security badge */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 text-slate-600 border border-slate-200/70">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Role-Based Access Enforced</span>
        </span>
      </div>

      {/* Zone 3: User status and profile snippet */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-900 leading-tight">{user?.name}</p>
          <p className="text-[11px] text-slate-500 leading-tight capitalize">{role} account</p>
        </div>

        <div className="w-9 h-9 rounded-full bg-teal-800 text-white font-semibold flex items-center justify-center text-xs shadow-xs">
          {user?.name?.slice(0, 2).toUpperCase() || 'CC'}
        </div>
      </div>
    </header>
  );
}
