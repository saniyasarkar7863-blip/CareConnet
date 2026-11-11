import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register, verifyEmail, resendOtp } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'verify-otp'
  const [role, setRole] = useState('PATIENT'); // 'PATIENT' | 'DOCTOR'

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [otp, setOtp] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // OTP resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage('');
    setSuccessMessage('');
    setValidationErrors({});
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleClose = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setValidationErrors({});
    onClose();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setValidationErrors({});
    setLoading(true);

    try {
      await login(email, password);
      handleClose();
    } catch (err) {
      if (err.data && err.data.validationErrors) {
        setValidationErrors(err.data.validationErrors);
      }
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setValidationErrors({});

    if (password.length < 8) {
      setValidationErrors({ password: 'Password must be at least 8 characters long.' });
      return;
    }

    setLoading(true);

    const payload = {
      role,
      fullName,
      email,
      password,
      phone,
      ...(role === 'DOCTOR' ? { licenseNumber, specialization } : {}),
    };

    try {
      const res = await register(payload);
      setSuccessMessage(res.message || 'Registration successful! Please check your email for the OTP.');
      setResendCooldown(60);
      setMode('verify-otp');
    } catch (err) {
      if (err.data && err.data.validationErrors) {
        setValidationErrors(err.data.validationErrors);
      }
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setValidationErrors({});
    setLoading(true);

    try {
      const res = await verifyEmail(email, otp.trim());
      setSuccessMessage(res.message || 'Email verified successfully! You may now log in.');
      setOtp('');
      setMode('login');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await resendOtp(email);
      setSuccessMessage(res.message || 'A new verification code has been dispatched.');
      setResendCooldown(60);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md glass-strong rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-teal-500 text-2xl shadow-lg glow-blue mb-3">
            ⚕️
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-bold text-white tracking-tight">
            {mode === 'login' && 'Sign in to CareConnect'}
            {mode === 'register' && 'Create your CareConnect account'}
            {mode === 'verify-otp' && 'Verify your email address'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Enter your credentials to access your unified healthcare portal.'}
            {mode === 'register' && 'Join the next-generation unified healthcare platform.'}
            {mode === 'verify-otp' && `Enter the 6-digit verification code sent to ${email || 'your email'}.`}
          </p>
        </div>

        {/* Alerts / Error Messages */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex flex-col gap-1.5">
            <div className="flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <span className="flex-1">{errorMessage}</span>
            </div>
            {errorMessage.toLowerCase().includes('not verified') && (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setMode('verify-otp');
                }}
                className="self-end text-xs font-semibold text-brand-400 underline hover:text-brand-300"
              >
                Verify email now →
              </button>
            )}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <span className="text-sm">✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 1: LOGIN                                            */}
        {/* ======================================================== */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
              {validationErrors.email && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
              {validationErrors.password && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-teal-500 text-white font-semibold text-sm hover:opacity-95 transition-opacity disabled:opacity-50 shadow-lg glow-blue flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center pt-2 text-xs text-slate-400">
              Don’t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setSuccessMessage('');
                  setMode('register');
                }}
                className="text-brand-400 font-semibold hover:underline"
              >
                Register now
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* MODE 2: REGISTER                                         */}
        {/* ======================================================== */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {/* Role Selector Tabs */}
            <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 mb-4">
              <button
                type="button"
                onClick={() => setRole('PATIENT')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${role === 'PATIENT'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>🩺</span> Patient
              </button>
              <button
                type="button"
                onClick={() => setRole('DOCTOR')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${role === 'DOCTOR'
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>👨‍⚕️</span> Doctor
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {role === 'DOCTOR' ? 'Doctor Full Name' : 'Full Name'}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === 'DOCTOR' ? 'Dr. Jane Smith' : 'Jane Doe'}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
              {validationErrors.fullName && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
              {validationErrors.email && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 chars"
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
                {validationErrors.password && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
                {validationErrors.phone && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Doctor Specific Fields */}
            {role === 'DOCTOR' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-white/5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    License / Reg. Number
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. MED-78945"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  {validationErrors.licenseNumber && (
                    <p className="text-xs text-red-400 mt-1">{validationErrors.licenseNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Cardiology"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  {validationErrors.specialization && (
                    <p className="text-xs text-red-400 mt-1">{validationErrors.specialization}</p>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-95 transition-opacity disabled:opacity-50 shadow-lg mt-2 flex items-center justify-center gap-2 ${role === 'DOCTOR'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 glow-teal'
                  : 'bg-gradient-to-r from-brand-500 to-indigo-500 glow-blue'
                }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                `Register as ${role === 'DOCTOR' ? 'Doctor' : 'Patient'}`
              )}
            </button>

            <div className="text-center pt-2 text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setSuccessMessage('');
                  setMode('login');
                }}
                className="text-brand-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* MODE 3: VERIFY EMAIL OTP                                 */}
        {/* ======================================================== */}
        {mode === 'verify-otp' && (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Account Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-center font-mono text-xl tracking-[0.5em] focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-teal-500 text-white font-semibold text-sm hover:opacity-95 transition-opacity disabled:opacity-50 shadow-lg glow-blue flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                'Verify Email'
              )}
            </button>

            {/* Resend OTP button with cooldown */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                className="text-slate-400 hover:text-white disabled:text-slate-600 font-medium transition-colors"
              >
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : 'Didn’t receive code? Resend'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-brand-400 hover:underline font-medium"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

AuthModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialMode: PropTypes.oneOf(['login', 'register', 'verify-otp']),
};