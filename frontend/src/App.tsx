import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { OAuthCallbackPage } from './pages/auth/OAuthCallbackPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';

import { DashboardPage } from './pages/app/DashboardPage';
import { JobsPage } from './pages/app/JobsPage';
import { JobFormPage } from './pages/app/JobFormPage';
import { GeneratorSelectionPage } from './pages/app/GeneratorSelectionPage';
import { CoverLetterGeneratorPage } from './pages/app/CoverLetterGeneratorPage';
import { CoverLettersLibraryPage } from './pages/app/CoverLettersLibraryPage';
import { SettingsPage } from './pages/app/SettingsPage';
import { AdminPage } from './pages/app/AdminPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAdminLoading } = useAuth();

  if (isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />

          <Route path="/auth/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/add"
            element={
              <ProtectedRoute>
                <JobFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute>
                <JobFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generator"
            element={
              <ProtectedRoute>
                <GeneratorSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generator/cover-letter"
            element={
              <ProtectedRoute>
                <CoverLetterGeneratorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cover-letters"
            element={
              <ProtectedRoute>
                <CoverLettersLibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/console"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/console" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
