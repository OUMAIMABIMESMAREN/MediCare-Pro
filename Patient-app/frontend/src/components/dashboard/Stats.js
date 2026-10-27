import React, { useEffect, useState } from 'react';
import Topbar from '../layout/Topbar';
import { getDashboardStats } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#1d7a5c', '#1a6b9e', '#d4860a', '#c0392b'];
const STATUT_LABELS = { stable: 'Stable', checkup: 'Contrôle', urgent: 'Urgent', new: 'Nouveau' };

export default function Stats() {
  const [stats, setStats] = useState(null);
  useEffect(() => { getDashboardStats().then(r => setStats(r.data)); }, []);
  if (!stats) return <div className="main-content"><div className="loading"><div className="spinner" />Chargement…</div></div>;

  const pieData = stats.byStatut.map(s => ({ name: STATUT_LABELS[s._id] || s._id, value: s.count }));
  const barData = stats.consultationsParJour.map(c => ({ date: c._id.slice(5), consultations: c.count }));

  return (
    <>
      <Topbar title="Statistiques" subtitle="Analyse de l'activité du cabinet" />
      <div className="main-content">
        <div className="metrics-grid" style={{ marginBottom: '1.5rem' }}>
          {[
            { label: 'Total patients', value: stats.totalPatients, icon: '👥', color: 'green' },
            { label: 'Consultations totales', value: stats.totalConsultations, icon: '🩺', color: 'blue' },
            { label: 'Examens en attente', value: stats.examensEnAttente, icon: '🔬', color: 'amber' },
            { label: 'Cas urgents', value: stats.urgents, icon: '🚨', color: 'rose' },
          ].map(m => (
            <div className="metric-card" key={m.label}>
              <div className="metric-top"><div className={`metric-icon ${m.color}`}>{m.icon}</div></div>
              <div className="metric-value">{m.value}</div>
              <div className="metric-label">{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>
          <div className="card">
            <div className="card-header"><h3>📈 Consultations — 7 derniers jours</h3></div>
            <div className="card-body">
              {barData.length === 0 ? (
                <div className="empty-state"><p>Pas encore de données</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8e5" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#8a9e95' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#8a9e95' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8e5', fontSize: 13 }} />
                    <Bar dataKey="consultations" fill="#1d7a5c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>🥧 Répartition patients</h3></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8e5', fontSize: 13 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '1.25rem' }}>
          <div className="card-header"><h3>📊 Détail par statut</h3></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
              {stats.byStatut.map((s, i) => {
                const pct = Math.round((s.count / stats.totalPatients) * 100);
                return (
                  <div key={s._id} style={{ textAlign: 'center', padding: '1.25rem', background: 'var(--surface2)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: COLORS[i % 4], fontFamily: 'Playfair Display' }}>{s.count}</div>
                    <div style={{ fontSize: '.82rem', fontWeight: 500, color: 'var(--text)', marginTop: '.25rem' }}>{STATUT_LABELS[s._id] || s._id}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>{pct}% du total</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
