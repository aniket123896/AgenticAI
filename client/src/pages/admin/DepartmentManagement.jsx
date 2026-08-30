import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';
import { useToast } from '../../hooks/useToast';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Building2, Plus, Edit2, Trash2, Users, AlertCircle } from 'lucide-react';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);

  const [formData, setFormData] = useState({ name: '', description: '' });

  const { success, error } = useToast();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await departmentService.getDepartments();
      setDepartments(res.data);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, description: dept.description || '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setActionLoading(true);
    try {
      if (editingDept) {
        await departmentService.updateDepartment(editingDept._id, formData);
        success('Department updated successfully');
      } else {
        await departmentService.createDepartment(formData);
        success('Department created successfully');
      }
      setModalOpen(false);
      await fetchDepartments();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save department');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deptToDelete) return;
    setActionLoading(true);
    try {
      await departmentService.deleteDepartment(deptToDelete._id);
      success(`Department "${deptToDelete.name}" deleted`);
      setDeleteConfirmOpen(false);
      await fetchDepartments();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete department');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">Department Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-300">Configure college service departments and responsibility areas</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          Add New Department
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading departments..." />
      ) : departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments found"
          description="Create your first department to start routing student complaints."
          actionText="Add Department"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between dark:bg-slate-900 dark:border-slate-700"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition"
                      title="Edit Department"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeptToDelete(dept);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1 dark:text-white">{dept.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed dark:text-slate-300">
                  {dept.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 dark:border-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {dept.staffCount || 0} Staff Members
                </span>
                <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md dark:bg-indigo-900/40 dark:text-indigo-200">
                  {dept.activeComplaints || 0} Active Tickets
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Department Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create New Department'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. IT Department, Hostel Administration"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Scope
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what services and campus facilities this department is responsible for..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition resize-none"
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
              disabled={actionLoading || !formData.name.trim()}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : editingDept ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title={`Delete "${deptToDelete?.name}"?`}
        message="Are you sure you want to delete this department? Departments with assigned staff members cannot be deleted until staff are reassigned."
        confirmText="Delete Department"
        type="danger"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default DepartmentManagement;
