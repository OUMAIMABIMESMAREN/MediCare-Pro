import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

import PatientHome    from '../components/patients/PatientHome';
import PatientRDV     from '../components/patients/PatientRDV';
import PatientDossier from '../components/patients/PatientDossier';
import PatientExamens from '../components/patients/PatientExamens';
import PatientOrdo    from '../components/patients/PatientOrdo';

const NAV = [
  {
    label: 'Mon espace',
    links: [
      { path: 'accueil',   icon: '🏠', label: 'Accueil' },
      { path: 'rdv',       icon: '📅', label: 'Mes rendez-vous' },
      { path: 'dossier',   icon: '📋', label: 'Mon dossier' },
      { path: 'resultats', icon: '🔬', label: 'Mes résultats' },
      { path: 'ordonnances',icon: '💊', label: 'Mes ordonnances' },
    ]
  }
];

export default function PatientLayout() {
  return (
    <div className="app-layout">
      <Sidebar items={NAV} basePath="/patient" />
      <Routes>
        <Route index element={<Navigate to="accueil" replace />} />
        <Route path="accueil"    element={<PatientHome />} />
        <Route path="rdv"        element={<PatientRDV />} />
        <Route path="dossier"    element={<PatientDossier />} />
        <Route path="resultats"  element={<PatientExamens />} />
        <Route path="ordonnances" element={<PatientOrdo />} />
      </Routes>
    </div>
  );
}
