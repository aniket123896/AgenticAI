import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { authService } from '../services/authService';
import { GraduationCap, Lock, Mail, ArrowRight, Sparkles, KeyRound, RotateCcw, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const [loginMode, setLoginMode] = useState('otp'); // 'otp' | 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const { login, user, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  // Ensure fields are completely blank on fresh load/refresh
  useEffect(() => {
    setEmail('');
    setPassword('');
    setOtp('');
    setOtpSent(false);
  }, []);

  // OTP resend countdown timer
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const target = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      error('Please enter a valid Gmail / college email address');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await authService.sendOtp(email.trim(), 'login');
      setOtpSent(true);
      setOtpTimer(60);
      success(res.message || '6-digit OTP code sent to your email!');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send OTP. Please check your email.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loginMode === 'otp') {
      if (!email) {
        error('Please enter your email address');
        return;
      }
      if (!otp || otp.length < 4) {
        error('Please enter the 6-digit OTP sent to your email');
        return;
      }

      setLoading(true);
      try {
        const loggedUser = await login({ email: email.trim(), otp: otp.trim() });
        success(`Welcome back, ${loggedUser.name}!`);

        const target = (from && from !== '/login' && from !== '/register' && from !== '/')
          ? from
          : (loggedUser.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');

        navigate(target, { replace: true });
      } catch (err) {
        error(err.response?.data?.message || 'Invalid or expired OTP code. Please try again.');
        setLoading(false);
      }
    } else {
      // Password login mode (Admin or Password users)
      if (!email || !password) {
        error('Please enter both email and password');
        return;
      }

      setLoading(true);
      try {
        const loggedUser = await login({ email: email.trim(), password });
        success(`Welcome back, ${loggedUser.name}!`);

        const target = (from && from !== '/login' && from !== '/register' && from !== '/')
          ? from
          : (loggedUser.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');

        navigate(target, { replace: true });
      } catch (err) {
        error(err.response?.data?.message || 'Invalid email or password. Please try again.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-blob-1 dark:bg-indigo-600/20" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob-2 dark:bg-purple-600/20" />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl animate-blob-3 dark:bg-sky-500/15" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 dark:opacity-20 pointer-events-none" />

      {/* Glass Card */}
      <div className="relative z-10 max-w-md w-full space-y-6 glass-card p-8 sm:p-10 rounded-3xl border border-white/60 dark:border-slate-800 shadow-2xl animate-slide-up">
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
            Sign In to Portal
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 dark:text-slate-400">
            Access your student grievance tracker or admin dashboard
          </p>
        </div>

        {/* Tab Toggle: Student OTP vs Password */}
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setLoginMode('otp')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              loginMode === 'otp'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-indigo-600 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Student (Email OTP)
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('password')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              loginMode === 'password'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-indigo-600 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Admin / Password
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-200">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                name="user_email"
                autoComplete="off"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setOtpSent(false);
                }}
                placeholder="name@college.com or gmail.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition dark:bg-slate-900/80 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          {loginMode === 'otp' ? (
            /* Student OTP Login Section */
            <div className="space-y-3">
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !email}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition flex items-center justify-center gap-2 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/80 disabled:opacity-50"
                >
                  {sendingOtp ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                      Sending OTP to Email...
                    </span>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Send 6-Digit Login OTP</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-800/60 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      OTP Code Sent
                    </span>
                    {otpTimer > 0 ? (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Resend in {otpTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold dark:text-indigo-400 underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Enter 6-Digit Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      autoFocus
                      className="w-full tracking-widest text-center text-lg font-mono font-bold py-2 rounded-xl border border-indigo-200 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Classic Password Section */
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-200">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="user_password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition dark:bg-slate-900/80 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (loginMode === 'otp' && !otpSent)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing In...
              </span>
            ) : (
              <>
                <span>{loginMode === 'otp' ? 'Verify & Sign In' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 underline dark:text-indigo-400">
              Register as Student
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

