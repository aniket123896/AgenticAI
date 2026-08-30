import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import StatsCard from '../../components/dashboard/StatsCard';
import StatusChart from '../../components/dashboard/StatusChart';
import CategoryChart from '../../components/dashboard/CategoryChart';
import TrendChart from '../../components/dashboard/TrendChart';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatDateOnly } from '../../utils/formatters';
import {
  FileText,
  Clock,
  UserCheck,
  CheckCircle2,
  CheckCheck,
  ShieldAlert,
  Building2,
  Users,
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  History
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      setLoading(true);
      try {
        const res = await dashboardService.getAdminDashboard();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading administrative analytics..." />;
  }

  const { stats, charts, recentComplaints = [], recentActivities = [] } = data || {};

  return (
    <div className="space-y-8 animate-fade-in pb-12 dark:text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">Admin Executive Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-300">Live operational overview, grievance statistics, and department workflows</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-200"
          >
            <FileText className="w-4 h-4" />
            Manage All Complaints
          </Link>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatsCard title="Total" value={stats?.total} icon={FileText} color="indigo" link="/admin/complaints" />
        <StatsCard title="New" value={stats?.submitted} icon={Clock} color="slate" link="/admin/complaints?status=Submitted" />
        <StatsCard title="Review" value={stats?.underReview} icon={Clock} color="blue" link="/admin/complaints?status=Under%20Review" />
        <StatsCard title="Assigned" value={stats?.assigned} icon={UserCheck} color="purple" link="/admin/complaints?status=Assigned" />
        <StatsCard title="In Progress" value={stats?.inProgress} icon={Clock} color="amber" link="/admin/complaints?status=In%20Progress" />
        <StatsCard title="Resolved" value={stats?.resolved} icon={CheckCircle2} color="emerald" link="/admin/complaints?status=Resolved" />
        <StatsCard title="Closed" value={stats?.closed} icon={CheckCheck} color="slate" link="/admin/complaints?status=Closed" />
        <StatsCard title="Critical" value={stats?.critical} icon={ShieldAlert} color="rose" link="/admin/complaints?priority=Critical" />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Status Distribution</h3>
            </div>
          </div>
          <StatusChart data={charts?.byStatus} />
        </div>

        {/* Complaints by Category */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Top Categories</h3>
            </div>
          </div>
          <CategoryChart data={charts?.byCategory} />
        </div>

        {/* Monthly Submission Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Submission Volume Trend</h3>
            </div>
          </div>
          <TrendChart data={charts?.monthlyTrend} />
        </div>
      </div>

      {/* Bottom Section: Recent Complaints & Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Lodged Complaints Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Campus Complaints</h3>
            <Link
              to="/admin/complaints"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead>
                <tr className="text-left text-slate-400 font-bold uppercase text-[11px]">
                  <th className="pb-3">Ticket ID</th>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Title & Dept</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {recentComplaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 font-mono font-bold text-indigo-600">{c.complaintId}</td>
                    <td className="py-3 font-medium text-slate-800">{c.submittedBy?.name || 'Student'}</td>
                    <td className="py-3">
                      <div className="font-semibold text-slate-900 line-clamp-1 max-w-xs">{c.title}</div>
                      <div className="text-[10px] text-slate-400">{c.category} • {c.assignedDepartment?.name || 'Unassigned'}</div>
                    </td>
                    <td className="py-3">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td className="py-3">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/complaints/${c._id}`}
                        className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-600 hover:text-white transition"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live History Audit Stream */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Live Audit Activity</h3>
          </div>

          <div className="space-y-3.5">
            {recentActivities.map((act) => (
              <div key={act._id} className="text-xs border-l-2 border-indigo-200 pl-3 py-0.5 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{act.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {act.complaint?.complaintId}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  {act.notes || `By ${act.performedBy?.name || 'Admin'}`}
                </p>
                <p className="text-[10px] text-slate-400">{formatDate(act.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
