import React from 'react';

export default function Topbar({ title, subtitle, actions }) {
  const now = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div className="topbar">
      <div className="topbar-title">
        <h2>{title}</h2>
        <p>{subtitle || now}</p>
      </div>
      <div className="topbar-actions">{actions}</div>
    </div>
  );
}
