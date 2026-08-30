import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { departmentService } from '../../services/departmentService';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import ComplaintFilters from '../../components/complaints/ComplaintFilters';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { FileText, ShieldAlert } from 'lucide-react';

const AdminComplaintList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const filters = {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    category: searchParams.get('category') || 'all',
    department: searchParams.get('department') || 'all',
    priority: searchParams.get('priority') || 'all',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: parseInt(searchParams.get('page'), 10) || 1,
    limit: 10
  };

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await departmentService.getDepartments();
        setDepartments(res.data);
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    };
    fetchDepts();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getAllComplaints(filters);
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
    <div className="space-y-6 animate-fade-in pb-12 dark:text-slate-100">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">Manage All Campus Complaints</h1>
        <p className="text-xs text-slate-500 dark:text-slate-300">Filter, inspect, delegate, update statuses, and log resolutions</p>
      </div>

      <ComplaintFilters
        filters={filters}
        onFilterChange={updateParam}
        onReset={handleResetFilters}
        departments={departments}
        showDepartmentFilter={true}
      />

      {loading ? (
        <LoadingSpinner text="Loading campus complaints..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No complaints found"
          description="No complaints match the specified search or filter criteria."
          actionText="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-4">
          <ComplaintTable
            complaints={complaints}
            basePath="/admin/complaints"
            showStudent={true}
            showDepartment={true}
            onSort={handleSort}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
          />

          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
};

export default AdminComplaintList;
