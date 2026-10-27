import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ items, basePath }) {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const initials  = user ? (user.prenom[0] + user.nom[0]).toUpperCase() : '??';

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-row">
          <div className="icon">🏥</div>
          <div>
            <h2>Cabinet Médical</h2>
            <p>Dr. Martin — Médecine générale</p>
          </div>
        </div>
      </div>

      <div className="sidebar-doctor">
        <div className="doctor-avatar">{initials}</div>
        <div className="doctor-info">
          <p>{user?.prenom} {user?.nom}</p>
          <span>{user?.role === 'medecin' ? '👨‍⚕️ Médecin' : '🧑 Patient'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((section) => (
          <div key={section.label}>
            <div className="nav-section">{section.label}</div>
            {section.links.map((link) => {
              const active = location.pathname === `${basePath}/${link.path}`;
              return (
                <button
                  key={link.path}
                  className={`nav-item ${active ? 'active' : ''}`}
                  onClick={() => navigate(`${basePath}/${link.path}`)}
                >
                  <span className="nav-icon">{link.icon}</span>
                  {link.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>
          🚪 Déconnexion
        </button>
      </div>
    </div>
  );
}
