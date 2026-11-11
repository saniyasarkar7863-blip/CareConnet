import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-white/50">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
