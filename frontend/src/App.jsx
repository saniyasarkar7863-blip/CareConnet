import { useState } from 'react';
import RoleCard from './components/RoleCard';
import BackendStatus from './components/BackendStatus';
import AuthModal from './components/AuthModal';
import { useAuth } from './hooks/useAuth';

/**
 * App — CareConnect Platform
 *
 * Feature 2:
 *   - Secure Patient & Doctor Registration
 *   - Email OTP Verification with Rate Limiting
 *   - JWT Access & Refresh Token Authentication via HttpOnly Cookies
 *   - Role-based Session State and User Banner
 */

const ROLES = [
  {
    icon: '🩺',
    title: 'Patient',
    description:
      'Manage your health journey in one place. Book appointments, view prescriptions, and track your medical history securely.',
    gradient: 'linear-gradient(135deg, #3b68f4, #1e37d4)',
    features: [
      'Self-service patient registration',
      'Email OTP verification & secure login',
      'Digital prescription records',
      'Emergency health profile',
    ],
    delay: 'delay-100',
  },
  {
    icon: '👨‍⚕️',
    title: 'Doctor',
    description:
      'Streamline your clinical workflow. View patient histories, create prescriptions, and manage your schedule efficiently.',
    gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)',
    features: [
      'Medical license & specialty verification',
      'Encrypted clinical session access',
      'Consultation history tracking',
      'Digital prescription authoring',
    ],
    delay: 'delay-200',
  },
  {
    icon: '🏥',
    title: 'Clinic',
    description:
      'Centralized management for your healthcare facility. Oversee staff, appointments, and patient flow with ease.',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    features: [
      'Staff & resource management',
      'Appointment scheduling',
      'Patient flow analytics',
      'Multi-branch support',
    ],
    delay: 'delay-300',
  },
  {
    icon: '🩸',
    title: 'Blood Donor',
    description:
      'Connect life-saving donors with recipients in real time. Register, track eligibility, and get notified for urgent requests.',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    features: [
      'Donor registration & profiling',
      'Blood type compatibility',
      'Urgent request alerts',
      'Donation history tracking',
    ],
    delay: 'delay-400',
  },
];

const ROADMAP = [
  { step: '01', label: 'Project Setup & DB Design', done: true },
  { step: '02', label: 'Patient & Doctor Registration, Email OTP & JWT Auth', done: true },
  { step: '03', label: 'Appointment Booking System', done: false },
  { step: '04', label: 'Prescriptions & Medical Records', done: false },
  { step: '05', label: 'Dashboards & Analytics', done: false },
  { step: '06', label: 'AI Symptom Checker', done: false },
  { step: '07', label: 'Blood Donor Network', done: false },
];

function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const openAuth = (mode) => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ── Ambient background orbs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* ── Header / Nav ── */}
        <header className="relative z-10 border-b border-white/5 glass-strong sticky top-0">
          <nav
            className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between"
            role="navigation"
            aria-label="Main navigation"
          >
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center text-lg shadow-lg glow-blue"
                aria-hidden="true"
              >
                ⚕️
              </div>
              <span className="text-xl font-bold gradient-text tracking-tight">
                CareConnect
              </span>
            </div>

              {/* Nav links */}
              <div className="hidden md:flex items-center gap-1">
                {['Platform', 'Roadmap', 'About'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all duration-200"
                  >
                    {item}
                  </a>
                ))}
              </div>

                {/* User / Auth Action Controls */}
                <div className="flex items-center gap-3">
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-brand-400 rounded-full animate-spin" />
                  ) : user ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-white/10 text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-semibold text-white">
                          {user.fullName || user.email}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${user.role === 'DOCTOR'
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                            }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <button
                        onClick={logout}
                        className="text-xs text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 font-medium"
                      >
                        Log Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openAuth('login')}
                        className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => openAuth('register')}
                        className="text-xs font-semibold text-white px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-teal-500 hover:opacity-95 shadow-md glow-blue transition-opacity"
                      >
                        Register
                      </button>
                    </div>
                  )}
                </div>
              </nav>
            </header>

            {/* ── Hero Section ── */}
            <main>
                <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-16 text-center">
                  {/* Badge */}
                    <div className="inline-flex items-center gap-2 glass border border-white/10 rounded-full px-4 py-1.5 text-xs text-slate-400 mb-8 animate-fade-in">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Unified Digital Healthcare Platform · Feature 2 Complete
                    </div>

                      {/* Heading */}
                      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-slide-up">
                        Healthcare,{' '}
                        <span className="gradient-text">Reimagined</span>
                        <br />
                        with Enterprise Security
                      </h1>

                      {/* Subheading */}
                        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
                          CareConnect unifies <strong className="text-slate-300">Patients</strong> and{' '}
                          <strong className="text-slate-300">Doctors</strong> with secure cryptographic
                          registration, email OTP verification, and JWT session rotation backed by Oracle Database.
                        </p>

                        {/* User Session Banner (if logged in) */}
                        {user ? (
                          <div className="max-w-xl mx-auto mb-10 p-6 rounded-2xl glass-strong border border-emerald-500/30 shadow-xl bg-emerald-500/5 text-left">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                                  {user.role === 'DOCTOR' ? '👨‍⚕️' : '🩺'}
                                </div>
                                <div>
                                  <h3 className="text-sm font-bold text-white">{user.fullName || user.email}</h3>
                                  <p className="text-xs text-slate-400">{user.email}</p>
                                </div>
                              </div>
                              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                                ✓ Active Session
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border-t border-white/5 pt-3">
                              <div>
                                <span className="text-slate-500 block">Assigned Role:</span>
                                <span className="font-semibold text-white">{user.role}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Email Verified:</span>
                                <span className="font-semibold text-emerald-400">
                                  {user.emailVerified ? 'Yes (Verified)' : 'No'}
                                </span>
                              </div>
                              {user.role === 'DOCTOR' && (
                                <div>
                                  <span className="text-slate-500 block">Doctor Credential:</span>
                                  <span
                                    className={`font-semibold ${user.doctorVerificationStatus === 'VERIFIED'
                                        ? 'text-emerald-400'
                                        : 'text-amber-400'
                                      }`}
                                  >
                                    {user.doctorVerificationStatus || 'PENDING'}
                                  </span>
                                </div>
                              )}
                              {user.specialization && (
                                <div>
                                  <span className="text-slate-500 block">Specialty:</span>
                                  <span className="font-semibold text-white">{user.specialization}</span>
                                </div>
                              )}
                              {user.licenseNumber && (
                                <div>
                                  <span className="text-slate-500 block">License #:</span>
                                  <span className="font-mono text-slate-300">{user.licenseNumber}</span>
                                </div>
                              )}
                              {user.phone && (
                                <div>
                                  <span className="text-slate-500 block">Phone:</span>
                                  <span className="text-slate-300">{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Action Buttons (if guest) */
                          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                            <button
                              onClick={() => openAuth('register')}
                              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-teal-500 text-white font-semibold text-sm hover:opacity-95 shadow-lg glow-blue transition-opacity"
                            >
                              Create Account
                            </button>
                            <button
                              onClick={() => openAuth('login')}
                              className="px-6 py-3 rounded-xl glass border border-white/10 hover:border-white/20 text-white font-semibold text-sm transition-colors"
                            >
                              Sign In
                            </button>
                            <button
                              onClick={() => openAuth('verify-otp')}
                              className="px-4 py-3 text-xs text-brand-400 hover:text-brand-300 underline font-medium"
                            >
                              Verify Pending OTP →
                            </button>
                          </div>
                        )}

                        {/* Tech stack pills */}
                        <div
                          className="flex flex-wrap items-center justify-center gap-2 mb-16"
                          aria-label="Technology stack"
                        >
                          {[
                            { label: 'React + Vite', color: 'text-sky-400 border-sky-500/30 bg-sky-500/5' },
                            { label: 'Spring Boot 3', color: 'text-green-400 border-green-500/30 bg-green-500/5' },
                            { label: 'Spring Security 6', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' },
                            { label: 'JWT HttpOnly Cookies', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5' },
                            { label: 'BCrypt (Cost 12)', color: 'text-amber-400 border-amber-500/30 bg-amber-500/5' },
                            { label: 'Email OTP (Hashed)', color: 'text-teal-400 border-teal-500/30 bg-teal-500/5' },
                            { label: 'Oracle 23ai Free', color: 'text-red-400 border-red-500/30 bg-red-500/5' },
                          ].map(({ label, color }) => (
                            <span
                              key={label}
                              className={`text-xs font-medium px-3 py-1.5 rounded-full border ${color}`}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </section>

                      {/* ── Role Cards Section ── */}
                        <section id="platform" className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
                          <div className="text-center mb-12">
                              <h2 className="text-3xl font-bold text-white mb-3">
                                One Platform. Four Purpose-Built Experiences.
                              </h2>
                                <p className="text-slate-400 text-sm max-w-xl mx-auto">
                                  Every role in CareConnect gets tailored workflows, enterprise security, and dedicated tools.
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {ROLES.map((role) => (
                                  <RoleCard key={role.title} {...role} />
                                ))}
                              </div>
                            </section>

                            {/* ── Roadmap Section ── */}
                              <section id="roadmap" className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
                                <div className="text-center mb-12">
                                  <h2 className="text-3xl font-bold text-white mb-3">Development Roadmap</h2>
                                  <p className="text-slate-400 text-sm">Building CareConnect feature by feature.</p>
                                </div>

                                <div className="flex flex-col gap-3">
                                  {ROADMAP.map(({ step, label, done }) => (
                                    <div
                                      key={step}
                                      className={`glass rounded-xl px-5 py-4 flex items-center gap-4 card-hover border ${done
                                          ? 'border-emerald-500/30 bg-emerald-500/5'
                                          : 'border-white/5'
                                        }`}
                                    >
                                      <span
                                        className={`text-xs font-bold font-mono flex-shrink-0 ${done ? 'text-emerald-400' : 'text-slate-600'
                                          }`}
                                      >
                                        {step}
                                      </span>
                                      <span className={`text-sm font-medium ${done ? 'text-white' : 'text-slate-500'}`}>
                                        {label}
                                      </span>
                                      {done && (
                                        <span className="ml-auto text-xs text-emerald-400 font-medium flex items-center gap-1">
                                          ✓ Complete
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </section>

                                {/* ── Architecture / About Section ── */}
                                <section id="about" className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
                                  <div className="glass rounded-3xl p-8 sm:p-12 border border-white/5">
                                    <div className="grid sm:grid-cols-2 gap-10 items-center">
                                      <div>
                                          <h2 className="text-2xl font-bold text-white mb-4">
                                            Built on a modern, <span className="gradient-text">production-grade</span> security stack
                                          </h2>
                                          <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                            Feature 2 brings end-to-end security: BCrypt hashing with unique salts, cryptographically
                                            random 6-digit email OTP verification, short-lived JWT access tokens, and rotating refresh tokens
                                            stored exclusively in HttpOnly cookies with CSRF defense.
                                          </p>
                                          <p className="text-slate-400 text-sm leading-relaxed">
                                            Doctor credentials undergo a distinct verification lifecycle (<code className="text-teal-400 font-mono">PENDING</code> status)
                                            independent of standard email verification.
                                          </p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        {[
                                          { icon: '🔒', label: 'BCrypt Salted', sub: '12 work factor' },
                                          { icon: '✉️', label: 'Email OTP', sub: 'Rate-limited & hashed' },
                                          { icon: '🍪', label: 'HttpOnly Cookies', sub: 'No localStorage tokens' },
                                          { icon: '🔄', label: 'Token Rotation', sub: '7-day refresh session' },
                                          { icon: '🛡️', label: 'CSRF Protection', sub: 'SPA token repository' },
                                          { icon: '🗄️', label: 'Oracle 23ai Free', sub: 'JPA persistence' },
                                        ].map(({ icon, label, sub }) => (
                                            <div key={label} className="glass rounded-xl p-4 flex items-start gap-3 card-hover">
                                              <span className="text-xl flex-shrink-0" aria-hidden="true">{icon}</span>
                                              <div>
                                                <div className="text-sm font-semibold text-white">{label}</div>
                                                <div className="text-xs text-slate-500">{sub}</div>
                                              </div>
                                            </div>
                ))}
                                          </div>
            </div>
                                    </div>
                                </section>
                              </main>

                              {/* ── Footer ── */}
                              <footer className="relative z-10 border-t border-white/5 py-8">
                                  <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
                                    <div className="flex items-center gap-2">
                                      <span aria-hidden="true">⚕️</span>
                                      <span>CareConnect · Unified Digital Healthcare Platform</span>
                                    </div>
                                    <div>Feature 2: Secure Registration, Email OTP & JWT Auth · © 2026</div>
                                  </div>
                              </footer>

                              {/* ── Backend Status Widget ── */}
                              <BackendStatus />

                              {/* ── Auth Modal ── */}
                              <AuthModal
                                isOpen={isAuthModalOpen}
                                onClose={() => setIsAuthModalOpen(false)}
                                initialMode={authModalMode}
                              />
                          </div>
                          );
}

                          export default App;
