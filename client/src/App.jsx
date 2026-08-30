import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import SubmitComplaint from './pages/student/SubmitComplaint';
import StudentComplaintList from './pages/student/StudentComplaintList';
import StudentComplaintDetails from './pages/student/StudentComplaintDetails';
import StudentProfile from './pages/student/StudentProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaintList from './pages/admin/AdminComplaintList';
import AdminComplaintDetails from './pages/admin/AdminComplaintDetails';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import StaffManagement from './pages/admin/StaffManagement';
import UserManagement from './pages/admin/UserManagement';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AdminProfile from './pages/admin/AdminProfile';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              {/* Public Routes with MainLayout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Student Portal Protected Routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="complaints" element={<StudentComplaintList />} />
                <Route path="complaints/new" element={<SubmitComplaint />} />
                <Route path="complaints/:id" element={<StudentComplaintDetails />} />
                <Route path="profile" element={<StudentProfile />} />
              </Route>

              {/* Admin Portal Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="complaints" element={<AdminComplaintList />} />
                <Route path="complaints/:id" element={<AdminComplaintDetails />} />
                <Route path="departments" element={<DepartmentManagement />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
