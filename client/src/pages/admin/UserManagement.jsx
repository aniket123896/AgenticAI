import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDateOnly } from '../../utils/formatters';
import { Users, Search, Shield, GraduationCap, Mail, Phone, Building } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers({
        search,
        role: role !== 'all' ? role : undefined,
        page,
        limit: 15
      });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, role]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 dark:text-slate-100">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">Registered Campus Users</h1>
        <p className="text-xs text-slate-500 dark:text-slate-300">Student roster, department affiliations, and administrator accounts</p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, ID, email, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition bg-white font-medium dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="admin">Administrators</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading user directory..." />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try broadening your search or switching the role filter."
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs dark:divide-slate-700">
              <thead className="bg-slate-50/80 uppercase tracking-wider font-semibold text-slate-500 dark:bg-slate-800/80 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3.5">User</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Student ID</th>
                  <th className="px-4 py-3.5">Department & Year</th>
                  <th className="px-4 py-3.5">Complaints Filed</th>
                  <th className="px-4 py-3.5 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 dark:divide-slate-700 dark:text-slate-300">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-indigo-50/30 transition-colors dark:hover:bg-slate-800/80">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{u.name}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-600/50'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-600/50'
                        }`}
                      >
                        {u.role === 'admin' ? (
                          <Shield className="w-3 h-3 text-purple-600" />
                        ) : (
                          <GraduationCap className="w-3 h-3 text-indigo-600" />
                        )}
                        {u.role === 'admin' ? 'Admin' : 'Student'}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap font-mono font-semibold text-slate-700 dark:text-slate-200">
                      {u.studentId || '—'}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800 dark:text-slate-100">{u.department || 'General'}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-400">{u.year || '—'}</div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-md font-bold text-indigo-700 bg-indigo-50 border border-indigo-100">
                        {u.complaintCount || 0} Tickets
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-right text-slate-400 dark:text-slate-300">
                      {formatDateOnly(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default UserManagement;
