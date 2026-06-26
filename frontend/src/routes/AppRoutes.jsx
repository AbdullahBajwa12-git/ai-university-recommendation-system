import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Layouts
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Unauthorized from '../pages/Unauthorized';

// Student Pages
import Dashboard from '../pages/student/Dashboard';
import Profile from '../pages/student/Profile';
import Universities from '../pages/student/UniversityDetails';
import Preferences from '../pages/student/Preferences';
import AdmissionPrediction from '../pages/student/AdmissionPrediction';
import Applications from '../pages/student/Applications';
import ResumeAnalyzer from '../pages/student/ResumeAnalyzer';
import SOPAnalyzer from '../pages/student/SOPAnalyzer';
import Scholarships from '../pages/student/Scholarships';
import AIChatAssistant from '../pages/student/AIChatAssistant';
import FindUniversities from '../pages/student/FindUniversities';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Standalone: shown when a role-guard rejects access */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<StudentLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/find-universities" element={<FindUniversities />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/universities" element={<Universities />} />
          {/* Mock Recommendations page retired — redirect to the real AI flow */}
          <Route path="/recommendations" element={<Navigate to="/find-universities" replace />} />
          <Route path="/predict" element={<AdmissionPrediction />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/sop-analyzer" element={<SOPAnalyzer />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/ai-chat" element={<AIChatAssistant />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
