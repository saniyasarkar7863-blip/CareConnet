import React from 'react';
import { UserRole } from '../../types';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md';
}

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const configs = {
    patient: {
      label: 'Patient',
      textClass: 'text-teal-700 bg-teal-50/80 border-teal-200/60',
    },
    doctor: {
      label: 'Consultant Doctor',
      textClass: 'text-indigo-700 bg-indigo-50/80 border-indigo-200/60',
    },
    clinic: {
      label: 'Clinic Admin',
      textClass: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/60',
    },
  };

  const current = configs[role];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${current.textClass} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      <span>{current.label}</span>
    </span>
  );
}
