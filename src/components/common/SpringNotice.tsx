import React, { useState } from 'react';
import { Database, Server, RefreshCw, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export function SpringNotice() {
  const { role, switchDemoRole, resetDemoData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900 text-slate-300 border-b border-slate-800 text-xs py-1.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-teal-400 font-medium">
            <Server className="w-3.5 h-3.5" />
            <span>CareConnect Phase 1 MVP</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">
            Target Architecture: Spring Boot 3.x REST · Java 21 · Oracle DB ready
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 text-xs"
              title="Quickly test any role's portal"
            >
              <span>Demo Role:</span>
              <strong className="text-teal-300 capitalize">{role || 'Guest'}</strong>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                <div className="absolute right-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 py-1.5">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Switch Test Account
                  </div>

                  <button
                    onClick={() => {
                      switchDemoRole('patient');
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 ${
                      role === 'patient' ? 'text-teal-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="leading-tight">Aarav Sharma</p>
                      <p className="text-[10px] text-slate-500">Patient Portal</p>
                    </div>
                    {role === 'patient' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole('doctor');
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 ${
                      role === 'doctor' ? 'text-teal-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="leading-tight">Dr. Priya Nair</p>
                      <p className="text-[10px] text-slate-500">Doctor Portal (Cardiology)</p>
                    </div>
                    {role === 'doctor' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole('clinic');
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 ${
                      role === 'clinic' ? 'text-teal-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="leading-tight">Apex Metro Healthcare</p>
                      <p className="text-[10px] text-slate-500">Clinic Admin Portal</p>
                    </div>
                    {role === 'clinic' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="border-t border-slate-800 mt-1 pt-1 px-1">
                    <button
                      onClick={() => {
                        resetDemoData();
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset Demo Data to Initial</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
