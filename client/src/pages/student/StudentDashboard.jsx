import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../hooks/useAuth';
import StatsCard from '../../components/dashboard/StatsCard';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  FileText,
  Clock,
  CheckCircle2,
  CheckCheck,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Inbox,
  AlertCircle
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await dashboardService.getStudentDashboard();
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading student dashboard metrics..." />;
  }

  const { stats, recentComplaints = [] } = data || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-md mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              Student Support Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 mt-1 leading-relaxed">
              Track your lodged complaints, check real-time maintenance updates, and provide feedback on resolved services.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              to="/student/complaints/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-900 font-bold text-xs shadow-lg hover:bg-indigo-50 transition transform hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              Submit New Complaint
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Filed"
          value={stats?.total || 0}
          icon={FileText}
          color="indigo"
          link="/student/complaints"
        />
        <StatsCard
          title="Submitted"
          value={stats?.submitted || 0}
          icon={Clock}
          color="slate"
          link="/student/complaints?status=Submitted"
        />
        <StatsCard
          title="In Progress"
          value={stats?.inProgress || 0}
          icon={AlertCircle}
          color="amber"
          link="/student/complaints?status=In%20Progress"
        />
        <StatsCard
          title="Resolved"
          value={stats?.resolved || 0}
          icon={CheckCircle2}
          color="emerald"
          link="/student/complaints?status=Resolved"
        />
        <StatsCard
          title="Closed"
          value={stats?.closed || 0}
          icon={CheckCheck}
          color="slate"
          link="/student/complaints?status=Closed"
        />
      </div>

      {/* Recent Complaints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Complaints</h2>
            <p className="text-xs text-slate-500">Latest updates on your reported campus issues</p>
          </div>

          <Link
            to="/student/complaints"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
          >
            View All ({stats?.total || 0})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No complaints filed yet"
            description="Have an issue with campus facilities, Wi-Fi, classroom or hostel? Lodge your first complaint."
            actionText="Submit Complaint"
            actionLink="/student/complaints/new"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint._id}
                complaint={complaint}
                basePath="/student/complaints"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
