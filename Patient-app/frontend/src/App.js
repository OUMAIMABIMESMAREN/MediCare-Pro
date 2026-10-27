import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoctorLayout from './pages/DoctorLayout';
import PatientLayout from './pages/PatientLayout';

function RequireAuth({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'medecin' ? '/medecin/dashboard' : '/patient/accueil'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<RootRedirect />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/register"  element={<RegisterPage />} />

          <Route path="/medecin/*" element={
            <RequireAuth role="medecin">
              <DoctorLayout />
            </RequireAuth>
          } />

          <Route path="/patient/*" element={
            <RequireAuth role="patient">
              <PatientLayout />
            </RequireAuth>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
