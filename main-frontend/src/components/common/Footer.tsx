import React from 'react';
import { Activity, Shield, HeartHandshake, Database } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-base font-bold tracking-tight">CareConnect</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Unified digital healthcare management platform connecting patients, doctors, and multi-specialty clinics with complete clinical continuity.
            </p>
            <div className="pt-2 text-[11px] text-teal-400/90 font-medium">
              B.Tech CSE Major Project · Academic & Enterprise Architecture
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 text-xs uppercase tracking-wider">
              Core Modules
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#features" className="hover:text-teal-400 transition-colors">Patient Health Profile</a></li>
              <li><a href="#features" className="hover:text-teal-400 transition-colors">Doctor Appointment Booking</a></li>
              <li><a href="#features" className="hover:text-teal-400 transition-colors">Pre-Consultation Intake</a></li>
              <li><a href="#features" className="hover:text-teal-400 transition-colors">Digital Prescription Writer</a></li>
              <li><a href="#features" className="hover:text-teal-400 transition-colors">Smart Medicine Reminders</a></li>
            </ul>
          </div>

          {/* User Portals */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 text-xs uppercase tracking-wider">
              User Portals
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="/login" className="hover:text-teal-400 transition-colors">Patient Portal Access</a></li>
              <li><a href="/login" className="hover:text-teal-400 transition-colors">Doctor Consultation Workspace</a></li>
              <li><a href="/login" className="hover:text-teal-400 transition-colors">Clinic Management Console</a></li>
              <li><a href="/register" className="hover:text-teal-400 transition-colors">Doctor Onboarding</a></li>
              <li><a href="/register" className="hover:text-teal-400 transition-colors">Patient Registration</a></li>
            </ul>
          </div>

          {/* Architecture & Security Notice */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold mb-3 text-xs uppercase tracking-wider">
              Architecture & Trust
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Engineered for seamless REST API integration with <strong>Java 21</strong>, <strong>Spring Boot 3.x</strong>, and <strong>Oracle Database</strong>.
            </p>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 mt-2">
              <span className="font-semibold text-slate-300 block mb-1">Clinical Scope Disclaimer</span>
              CareConnect is a healthcare management and doctor-assistive platform, not an autonomous medical diagnosis system.
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} CareConnect Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>HIPAA/DISHA Privacy Design Compliant</span>
            <span>·</span>
            <span>REST API Ready</span>
            <span>·</span>
            <span>Phase 1 Frontend MVP</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
