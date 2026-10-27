import React, { useEffect, useState } from 'react';
import Topbar from '../layout/Topbar';
import { getDashboardStats, getRendezVous } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const avatarClass = (i) => ['av1','av2','av3','av4','av5','av6'][i % 6];
const statusLabel = { stable: 'Stable', checkup: 'Contrôle', urgent: 'Urgent', new: 'Nouveau' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [rdvs,  setRdvs]  = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats().then(r => setStats(r.data));
    const today = new Date().toISOString().split('T')[0];
    getRendezVous({ date: today }).then(r => setRdvs(r.data.slice(0, 6)));
  }, []);

  if (!stats) return <div className="main-content"><div className="loading"><div className="spinner"/>Chargement…</div></div>;

  const metrics = [
    { label: 'Total Patients', value: stats.totalPatients, icon: '👥', color: 'green', trend: '+3', trendDir: 'up' },
    { label: "RDV aujourd'hui", value: stats.rdvsAujourdhui, icon: '📅', color: 'blue', trend: 'Planifiés', trendDir: 'neutral' },
    { label: 'Cas urgents', value: stats.urgents, icon: '🚨', color: 'rose', trend: 'Priorité', trendDir: 'down' },
    { label: 'Nouveaux patients', value: stats.nouveaux, icon: '✨', color: 'amber', trend: 'Ce mois', trendDir: 'up' },
  ];

  return (
    <>
      <Topbar title="Tableau de bord" subtitle="Vue d'ensemble de votre cabinet"
        actions={<button className="btn btn-primary btn-sm" onClick={() => navigate('/medecin/patients')}>+ Nouveau patient</button>}
      />
      <div className="main-content">
        <div className="metrics-grid">
          {metrics.map(m => (
            <div className="metric-card" key={m.label}>
              <div className="metric-top">
                <div className={`metric-icon ${m.color}`}>{m.icon}</div>
                <span className={`metric-trend ${m.trendDir}`}>{m.trend}</span>
              </div>
              <div className="metric-value">{m.value}</div>
              <div className="metric-label">{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* RDV du jour */}
          <div className="card">
            <div className="card-header">
              <h3>📅 Rendez-vous du jour</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/medecin/agenda')}>Voir agenda</button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {rdvs.length === 0 ? (
                <div className="empty-state"><div className="icon">📭</div><p>Aucun RDV aujourd'hui</p></div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Patient</th><th>Heure</th><th>Type</th><th>Statut</th></tr></thead>
                  <tbody>
                    {rdvs.map(r => (
                      <tr key={r._id}>
                        <td><strong>{r.patientNom}</strong></td>
                        <td>{r.heure}</td>
                        <td style={{ fontSize: '.75rem', color: 'var(--text2)' }}>{r.type}</td>
                        <td>
                          <span className={`badge ${r.statut === 'confirmé' ? 'badge-green' : r.statut === 'annulé' ? 'badge-red' : 'badge-amber'}`}>
                            {r.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Répartition patients */}
          <div className="card">
            <div className="card-header"><h3>📊 Répartition des patients</h3></div>
            <div className="card-body">
              {stats.byStatut.map(s => {
                const pct = Math.round((s.count / stats.totalPatients) * 100);
                const colors = { stable: '#1d7a5c', checkup: '#d4860a', urgent: '#c0392b', new: '#1a6b9e' };
                return (
                  <div key={s._id} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.3rem', fontSize: '.82rem' }}>
                      <span style={{ fontWeight: 500 }}>{statusLabel[s._id] || s._id}</span>
                      <span style={{ color: 'var(--text3)' }}>{s.count} patients ({pct}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: colors[s._id] || '#888', borderRadius: '99px', transition: 'width .5s' }} />
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: '1rem', padding: '.75rem', background: 'var(--surface2)', borderRadius: '8px', fontSize: '.8rem', color: 'var(--text2)' }}>
                🔬 Examens en attente : <strong>{stats.examensEnAttente}</strong> &nbsp;|&nbsp;
                📋 Consultations : <strong>{stats.totalConsultations}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
