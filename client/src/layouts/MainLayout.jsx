import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import AmbientBackground from '../components/common/AmbientBackground';

const MainLayout = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <AmbientBackground />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} College Complaint Management System. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span>Campus Security & Support</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
