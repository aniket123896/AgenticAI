import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staffService';
import { departmentService } from '../../services/departmentService';
import { useToast } from '../../hooks/useToast';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { UserCheck, Plus, Edit2, Trash2, Mail, Phone, Building2, User } from 'lucide-react';

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: ''
  });

  const { success, error } = useToast();

  const fetchStaffAndDepts = async () => {
    setLoading(true);
    try {
      const [staffRes, deptsRes] = await Promise.all([
        staffService.getStaff(),
        departmentService.getDepartments()
      ]);
      setStaffList(staffRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch staff directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffAndDepts();
  }, []);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: departments[0]?._id || '',
      designation: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone || '',
      department: typeof staff.department === 'object' ? staff.department._id : staff.department,
      designation: staff.designation
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.department || !formData.designation) {
      error('Please fill in all required fields');
      return;
    }

    setActionLoading(true);
    try {
      if (editingStaff) {
        await staffService.updateStaff(editingStaff._id, formData);
        success('Staff member updated successfully');
      } else {
        await staffService.createStaff(formData);
        success('Staff member registered successfully');
      }
      setModalOpen(false);
      await fetchStaffAndDepts();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save staff');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!staffToDelete) return;
    setActionLoading(true);
    try {
      await staffService.deleteStaff(staffToDelete._id);
      success(`Staff member "${staffToDelete.name}" removed`);
      setDeleteConfirmOpen(false);
      await fetchStaffAndDepts();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to remove staff member');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">Staff & Technician Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-300">Manage departmental staff assigned to troubleshoot and resolve issues</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading staff directory..." />
      ) : staffList.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No staff members registered"
          description="Add designated staff and technicians to assign tickets to them."
          actionText="Add Staff Member"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((member) => (
            <div
              key={member._id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between dark:bg-slate-900 dark:border-slate-700"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition"
                      title="Edit Staff Member"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setStaffToDelete(member);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Staff Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-0.5 dark:text-white">{member.name}</h3>
                <p className="text-xs font-semibold text-indigo-600 mb-3 dark:text-indigo-300">{member.designation}</p>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800 truncate dark:text-slate-100">
                      {member.department?.name || 'Department'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate dark:text-slate-200">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="dark:text-slate-200">{member.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-300">Active Workload:</span>
                <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-600/50">
                  {member.activeComplaints || 0} Tickets Assigned
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStaff ? 'Edit Staff Member' : 'Register Staff Member'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Robert Martinez"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="robert.it@college.com"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition bg-white"
              >
                <option value="">Select Dept...</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Designation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Network Admin"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : editingStaff ? 'Save Changes' : 'Register Staff'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title={`Remove "${staffToDelete?.name}"?`}
        message="Are you sure you want to remove this staff member? Any ongoing tickets assigned to them will be unassigned."
        confirmText="Remove Staff Member"
        type="danger"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default StaffManagement;
