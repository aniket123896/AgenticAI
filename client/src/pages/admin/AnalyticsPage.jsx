import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import StatusChart from '../../components/dashboard/StatusChart';
import CategoryChart from '../../components/dashboard/CategoryChart';
import TrendChart from '../../components/dashboard/TrendChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BarChart3, TrendingUp, PieChart as PieIcon, ShieldCheck, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await dashboardService.getAdminDashboard();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Compiling analytical charts and intelligence..." />;
  }

  const { stats, charts } = data || {};

  const resolutionRate = stats?.total > 0
    ? Math.round(((stats.resolved + stats.closed) / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-16 dark:text-slate-100">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">System Performance & Analytics</h1>
        <p className="text-xs text-slate-500 dark:text-slate-300">Historical grievance data, resolution throughput, and incident frequency</p>
      </div>

      {/* Metric highlight banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Resolution Efficiency</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          </div>
          <p className="text-3xl font-black">{resolutionRate}%</p>
          <p className="text-[11px] text-emerald-100 mt-1">Complaints closed or resolved out of {stats?.total || 0} total tickets</p>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Active Work Queue</span>
            <Clock className="w-5 h-5 text-indigo-200" />
          </div>
          <p className="text-3xl font-black">{(stats?.submitted || 0) + (stats?.underReview || 0) + (stats?.assigned || 0) + (stats?.inProgress || 0)}</p>
          <p className="text-[11px] text-indigo-100 mt-1">Tickets currently undergoing review and active maintenance</p>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-tr from-rose-600 to-orange-500 text-white shadow-lg shadow-rose-600/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-100">Critical Priority Ratio</span>
            <AlertTriangle className="w-5 h-5 text-rose-200" />
          </div>
          <p className="text-3xl font-black">{stats?.critical || 0}</p>
          <p className="text-[11px] text-rose-100 mt-1">High-impact urgent campus infrastructure items</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Status Breakdown</h3>
            </div>
          </div>
          <StatusChart data={charts?.byStatus} />
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Category Frequency</h3>
            </div>
          </div>
          <CategoryChart data={charts?.byCategory} />
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Long-term Submission Trajectory</h3>
            </div>
          </div>
          <TrendChart data={charts?.monthlyTrend} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
