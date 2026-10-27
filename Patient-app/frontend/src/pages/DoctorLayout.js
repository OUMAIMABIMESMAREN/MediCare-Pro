import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

import Dashboard    from '../components/dashboard/Dashboard';
import Patients     from '../components/patients/Patients';
import Agenda       from '../components/agenda/Agenda';
import Consultations from '../components/consultations/Consultations';
import Ordonnances  from '../components/ordonnances/Ordonnances';
import Examens      from '../components/examens/Examens';
import Stats        from '../components/dashboard/Stats';

const NAV = [
  {
    label: 'Principal',
    links: [
      { path: 'dashboard',    icon: '📊', label: 'Tableau de bord' },
      { path: 'patients',     icon: '👥', label: 'Patients' },
      { path: 'agenda',       icon: '📅', label: 'Agenda' },
    ]
  },
  {
    label: 'Médical',
    links: [
      { path: 'consultations',icon: '🩺', label: 'Consultations' },
      { path: 'ordonnances',  icon: '💊', label: 'Ordonnances' },
      { path: 'examens',      icon: '🔬', label: 'Examens & Résultats' },
    ]
  },
  {
    label: 'Analyse',
    links: [
      { path: 'statistiques', icon: '📈', label: 'Statistiques' },
    ]
  }
];

export default function DoctorLayout() {
  return (
    <div className="app-layout">
      <Sidebar items={NAV} basePath="/medecin" />
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<Dashboard />} />
        <Route path="patients"      element={<Patients />} />
        <Route path="agenda"        element={<Agenda />} />
        <Route path="consultations" element={<Consultations />} />
        <Route path="ordonnances"   element={<Ordonnances />} />
        <Route path="examens"       element={<Examens />} />
        <Route path="statistiques"  element={<Stats />} />
      </Routes>
    </div>
  );
}
