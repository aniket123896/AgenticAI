import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import {
  Menu,
  LogOut,
  User,
  GraduationCap,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin, isStudent, isAuthenticated } = useAuth();
  const { success } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/80 dark:border-slate-700/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: Hamburger & Logo */}
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none transition lg:hidden"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to={isAdmin ? '/admin/dashboard' : isStudent ? '/student/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent dark:from-slate-100 dark:via-indigo-200 dark:to-indigo-400">
                  CCMS
                </span>
                <span className="hidden sm:inline-block ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100/80 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-700/60">
                  Campus Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Right section: Theme toggle, User Profile / Auth buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pl-3 rounded-full border border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition focus:outline-none dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-700"
                >
                  <div className="flex flex-col text-right hidden sm:block">
                    <span className="text-xs font-bold text-slate-800 leading-none dark:text-slate-100">{user?.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium capitalize mt-0.5 dark:text-slate-400">
                      {isAdmin ? 'Administrator' : user?.studentId || 'Student'}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1 dark:text-slate-300" />
                </button>

                {/* Profile Dropdown */}
                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 animate-slide-up dark:bg-slate-800 dark:border-slate-700">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5 dark:text-slate-100">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate dark:text-slate-300">{user?.email}</p>
                        <span className="inline-block mt-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-700/60">
                          {user?.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to={isAdmin ? '/admin/profile' : '/student/profile'}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          My Profile
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
