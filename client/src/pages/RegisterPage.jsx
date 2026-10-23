import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { authService } from '../services/authService';
import { GraduationCap, ArrowRight, Lock, Mail, User, Phone, Sparkles, KeyRound, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const initialForm = {
    name: '',
    studentId: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    year: '1st Year',
    password: '',
    confirmPassword: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  const { register, isAuthenticated, user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Ensure all fields are clean and blank on fresh load / refresh
  useEffect(() => {
    setFormData(initialForm);
    setOtp('');
    setOtpSent(false);
  }, []);

  // OTP resend countdown
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const target = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === 'email') {
      setOtpSent(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      error('Please enter a valid Gmail / college email first');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await authService.sendOtp(formData.email.trim(), 'register');
      setOtpSent(true);
      setOtpTimer(60);
      if (res.data?.devOtp) {
        setOtp(res.data.devOtp);
      }
      success(res.message || '6-digit OTP code sent to your email!');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send OTP. Please check your email.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      error('Please complete all required fields');
      return;
    }

    if (!otpSent || !otp || otp.length < 4) {
      error('Please enter the 6-digit OTP code sent to your email to verify your account');
      return;
    }

    if (formData.password.length < 6) {
      error('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({
        ...formData,
        email: formData.email.trim(),
        studentId: formData.studentId.trim().toUpperCase(),
        otp: otp.trim()
      });
      success('Student account verified & created! Welcome to CCMS.');
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed. Please check your details or OTP.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-blob-1 dark:bg-indigo-600/20" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob-2 dark:bg-purple-600/20" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl animate-blob-3 dark:bg-sky-500/15" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 dark:opacity-20 pointer-events-none" />

      {/* Glass Card */}
      <div className="relative z-10 max-w-xl w-full space-y-8 glass-card p-8 sm:p-10 rounded-3xl border border-white/60 dark:border-slate-800 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="text-center">
          <div className="relative inline-block mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30">
              <GraduationCap className="w-9 h-9" />
            </div>
            <div className="absolute -top-1 -right-1 p-1 bg-amber-400 text-slate-950 rounded-full shadow-md animate-bounce">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">
            Student Registration
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 dark:text-slate-400">
            Create an account to submit complaints and track resolutions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-200">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="name"
                  autoComplete="off"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition dark:bg-slate-900/80 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-200">
                Student ID / Roll No. <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="studentId"
                autoComplete="off"
                required
                value={formData.studentId}
                onChange={handleChange}
                placeholder="e.g. STU1024"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition uppercase dark:bg-slate-900/80 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Gmail / College Email <span className="text-rose-500">*</span>
                </label>
                {otpSent && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> OTP Sent
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    autoComplete="off"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition dark:bg-slate-900/80 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !formData.email || otpTimer > 0}
                  className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition shrink-0 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/80 disabled:opacity-50"
                >
                  {sendingOtp ? (
                    <span className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin inline-block" />
                  ) : otpTimer > 0 ? (
                    `${otpTimer}s`
                  ) : otpSent ? (
                    'Resend'
                  ) : (
                    'Get OTP'
                  )}
                </button>
              </div>
            </div>

            {/* Email OTP Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-200">
                Email 6-Digit OTP <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder={otpSent ? 'Enter 6-digit code' : 'Click Get OTP first'}
                  disabled={!otpSent}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition font-mono tracking-wider dark:bg-slate-900/80 dark:border-slate-700 dark:text-white disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-200">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  name="phone"
                  autoComplete="off"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition dark:bg-slate-900/80 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-200">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition dark:bg-slate-900/80 dark:border-slate-700 dark:text-white"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Applied Sciences">Applied Sciences</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Academic Year */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-200">
                Academic Year <span className="text-rose-500">*</span>
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition dark:bg-slate-900/80 dark:border-slate-700 dark:text-white"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Senior)</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-200">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition dark:bg-slate-900/80 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-200">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition dark:bg-slate-900/80 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition flex items-center justify-center gap-2 mt-4 disabled:opacity-60 transform active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Student Account...
              </span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 underline dark:text-indigo-400">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

