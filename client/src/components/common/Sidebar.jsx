import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Building2,
  Users,
  UserCheck,
  BarChart3,
  User,
  LogOut,
  X,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    success('Logged out successfully');
    navigate('/login');
  };

  const studentNavItems = [
    { name: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Complaints', to: '/student/complaints', icon: FileText },
    { name: 'Submit Complaint', to: '/student/complaints/new', icon: PlusCircle },
    { name: 'My Profile', to: '/student/profile', icon: User }
  ];

  const adminNavItems = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'All Complaints', to: '/admin/complaints', icon: FileText },
    { name: 'Departments', to: '/admin/departments', icon: Building2 },
    { name: 'Staff Directory', to: '/admin/staff', icon: UserCheck },
    { name: 'User Management', to: '/admin/users', icon: Users },
    { name: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
    { name: 'Admin Profile', to: '/admin/profile', icon: User }
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 dark:bg-slate-900 dark:border-slate-700 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-auto lg:h-[calc(100vh-4rem)]`}
      >
        {/* Header on mobile */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden dark:border-slate-700">
          <span className="font-bold text-slate-800 text-sm tracking-wide dark:text-slate-200">PORTAL NAVIGATION</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User preview header block */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/50 border border-indigo-100/60 dark:from-indigo-900/40 dark:to-slate-800 dark:border-indigo-700/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-200 shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate dark:text-slate-100">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate dark:text-slate-300">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to === '/student/dashboard' || item.to === '/admin/dashboard' || item.to === '/student/complaints' || item.to === '/student/complaints/new' || item.to === '/admin/complaints' || item.to === '/admin/departments' || item.to === '/admin/staff' || item.to === '/admin/users' || item.to === '/admin/analytics' || item.to === '/admin/profile'}
                className={({ isActive, isPending }) => {
                  const active = isActive || (
                    !isPending && item.to === '/student/complaints' && window.location.pathname.startsWith('/student/complaints/') && !window.location.pathname.endsWith('/new')
                  );

                  return `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`;
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom CTA / Sign out */}
        <div className="p-3 border-t border-slate-100 space-y-2 dark:border-slate-700">
          {!isAdmin && (
            <NavLink
              to="/student/complaints/new"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 hover:shadow-lg transition transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              New Complaint
            </NavLink>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition dark:hover:bg-rose-950/30"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
