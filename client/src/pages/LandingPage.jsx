import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  FileCheck2,
  Lock,
  ChevronRight,
  Star
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="space-y-16 pb-20 dark:bg-slate-950 dark:text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-indigo-50/70 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-200/60 shadow-sm animate-fade-in dark:bg-indigo-950/50 dark:text-indigo-200 dark:border-indigo-700/50">
            <Sparkles className="w-3.5 h-3.5" />
            Official Campus Grievance & Facility Portal
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none dark:text-white">
            College Complaint{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed dark:text-slate-300">
            Report facility issues, academic concerns, hostel repairs, and campus services with real-time status tracking and direct administrative resolution.
          </p>

          {/* Call to action buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-2xl transition flex items-center justify-center gap-2"
              >
                Go to {isAdmin ? 'Admin' : 'Student'} Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-2xl transition flex items-center justify-center gap-2"
                >
                  Student / Admin Login
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-slate-700 font-bold text-sm border border-slate-200 shadow-sm hover:bg-slate-50 transition flex items-center justify-center gap-2 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Create Student Account
                </Link>
              </>
            )}
          </div>

          {/* Quick Demo Credentials pill */}
          <div className="mt-10 inline-flex flex-wrap items-center justify-center gap-4 p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/90 shadow-sm text-xs text-slate-600 dark:bg-slate-900/70 dark:border-slate-700 dark:text-slate-300">
            <span className="font-bold text-indigo-700 dark:text-indigo-300">Quick Demo Access:</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-100">Admin:</span>
              <code className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono dark:bg-slate-800">admin@college.com</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-100">Student:</span>
              <code className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono dark:bg-slate-800">student@college.com</code>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 dark:text-indigo-400">
            Structured Resolution Pipeline
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            How Complaints Are Handled Step-by-Step
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { step: '01', title: 'Submission', desc: 'Student lodges complaint with photo/PDF evidence & category', color: 'slate' },
            { step: '02', title: 'Review', desc: 'Admin reviews urgency, location & priority', color: 'blue' },
            { step: '03', title: 'Assignment', desc: 'Delegated to specific department & designated staff', color: 'purple' },
            { step: '04', title: 'In Progress', desc: 'Staff executes physical inspection and repair work', color: 'amber' },
            { step: '05', title: 'Resolved', desc: 'Resolution details documented & logged', color: 'emerald' },
            { step: '06', title: 'Closure & Rating', desc: 'Student inspects fix, marks closed & submits rating', color: 'gray' }
          ].map((item, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-indigo-200 transition dark:bg-slate-900 dark:border-slate-700 dark:hover:border-indigo-500/60"
            >
              <div>
                <span className="text-xs font-mono font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md dark:bg-indigo-950/60 dark:text-indigo-300">
                  {item.step}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-3 mb-1 dark:text-white">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-300">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition dark:bg-slate-900 dark:border-slate-700">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 dark:bg-indigo-950/60 dark:text-indigo-300">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 dark:text-white">Automated Ticket ID</h3>
            <p className="text-sm text-slate-600 leading-relaxed dark:text-slate-300">
              Every complaint receives a standardized human-readable tracking ID (<code className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-300">CMP-YYYY-XXXX</code>) for transparency.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition dark:bg-slate-900 dark:border-slate-700">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 dark:bg-emerald-950/60 dark:text-emerald-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 dark:text-white">Department Allocation</h3>
            <p className="text-sm text-slate-600 leading-relaxed dark:text-slate-300">
              Route issues directly to IT, Electrical, Maintenance, Hostel Wardens, and Housekeeping staff with audit trails.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition dark:bg-slate-900 dark:border-slate-700">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 dark:bg-amber-950/60 dark:text-amber-300">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 dark:text-white">Feedback & Quality Metrics</h3>
            <p className="text-sm text-slate-600 leading-relaxed dark:text-slate-300">
              Rate service resolution quality from 1 to 5 stars, enabling administration to continuously improve campus infrastructure.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
