import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import ComplaintFilters from '../../components/complaints/ComplaintFilters';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { PlusCircle, LayoutGrid, List, FileText } from 'lucide-react';

const StudentComplaintList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Extract query filters from URL
  const filters = {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    category: searchParams.get('category') || 'all',
    priority: searchParams.get('priority') || 'all',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: parseInt(searchParams.get('page'), 10) || 1,
    limit: 10
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getMyComplaints(filters);
      setComplaints(res.data.complaints);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  const handleSort = (field) => {
    const next = new URLSearchParams(searchParams);
    const currentOrder = searchParams.get('sortOrder') || 'desc';
    const currentSort = searchParams.get('sortBy') || 'createdAt';

    if (currentSort === field) {
      next.set('sortOrder', currentOrder === 'asc' ? 'desc' : 'asc');
    } else {
      next.set('sortBy', field);
      next.set('sortOrder', 'desc');
    }
    setSearchParams(next);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">My Lodged Complaints</h1>
          <p className="text-xs text-slate-500 dark:text-slate-300">View and track progress on all your reported campus tickets</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center p-1 rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300' : 'text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'cards' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300' : 'text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/student/complaints/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-200"
          >
            <PlusCircle className="w-4 h-4" />
            New Complaint
          </Link>
        </div>
      </div>

      {/* Filter toolbar */}
      <ComplaintFilters
        filters={filters}
        onFilterChange={updateParam}
        onReset={handleResetFilters}
      />

      {/* Content Body */}
      {loading ? (
        <LoadingSpinner text="Fetching complaints..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No complaints found"
          description={
            filters.search || filters.status !== 'all' || filters.category !== 'all'
              ? 'No tickets match your specific filter criteria. Try resetting filters.'
              : 'You have not submitted any complaints yet.'
          }
          actionText={filters.search ? 'Reset Filters' : 'Submit First Complaint'}
          onAction={filters.search ? handleResetFilters : null}
          actionLink={!filters.search ? '/student/complaints/new' : null}
        />
      ) : (
        <div className="space-y-4">
          {viewMode === 'table' ? (
            <ComplaintTable
              complaints={complaints}
              basePath="/student/complaints"
              showDepartment={true}
              onSort={handleSort}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {complaints.map((c) => (
                <ComplaintCard key={c._id} complaint={c} basePath="/student/complaints" />
              ))}
            </div>
          )}

          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
};

export default StudentComplaintList;
