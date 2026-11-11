import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Stethoscope,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { UserRole } from '../../types';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { SpringNotice } from '../../components/common/SpringNotice';

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('aarav.sharma@careconnect.io');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login({ email, password, role });
      const destination = `/${user.role}/dashboard`;
      navigate(destination);
    } catch (err) {
      // toast is handled in authContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemoAccount = (demoRole: UserRole, demoEmail: string) => {
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SpringNotice />

      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                CareConnect
              </span>
            </Link>
          </div>
          <h2 className="mt-4 text-center text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Sign in to your clinical portal
          </h2>
          <p className="mt-1 text-center text-xs text-slate-500">
            Unified access for Patients, Physicians, and Healthcare Facilities
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
            {/* Demo Quick-Switcher Banner */}
            <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  1-Click Demo Accounts:
                </span>
                <span className="text-[10px] text-teal-700 font-medium bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/50">
                  Evaluator Ready
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectDemoAccount('patient', 'aarav.sharma@careconnect.io')}
                  className={`px-2 py-1.5 text-[11px] font-medium rounded-lg border transition-colors flex flex-col items-center text-center ${
                    role === 'patient' && email === 'aarav.sharma@careconnect.io'
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 mb-0.5" />
                  <span>Patient</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectDemoAccount('doctor', 'dr.priya.nair@careconnect.io')}
                  className={`px-2 py-1.5 text-[11px] font-medium rounded-lg border transition-colors flex flex-col items-center text-center ${
                    role === 'doctor' && email === 'dr.priya.nair@careconnect.io'
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5 mb-0.5" />
                  <span>Doctor</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectDemoAccount('clinic', 'admin@apexmetro.org')}
                  className={`px-2 py-1.5 text-[11px] font-medium rounded-lg border transition-colors flex flex-col items-center text-center ${
                    role === 'clinic' && email === 'admin@apexmetro.org'
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 mb-0.5" />
                  <span>Clinic</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Portal Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['patient', 'doctor', 'clinic'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-1.5 text-xs font-medium rounded-lg border capitalize transition-colors ${
                        role === r
                          ? 'border-teal-700 bg-teal-50 text-teal-800 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    placeholder="name@example.com"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-xs text-teal-700 hover:text-teal-800 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                    placeholder="••••••••"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In to {role.toUpperCase()} Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Don't have an account yet?{' '}
                <Link to="/register" className="text-teal-700 hover:text-teal-800 font-semibold">
                  Register here
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-700">
              ← Return to Public Homepage
            </Link>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
      />
    </div>
  );
}
