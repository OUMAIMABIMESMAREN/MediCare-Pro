import React, { useEffect, useState } from 'react';
import Topbar from '../layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { getRendezVous } from '../../services/api';

export default function PatientRDV() {
  const { user } = useAuth();
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.patientId) {
      getRendezVous({ patientId: user.patientId })
        .then(r => setRdvs(r.data))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const upcoming = rdvs.filter(r => new Date(r.date) >= new Date() && r.statut !== 'annulé').sort((a, b) => new Date(a.date) - new Date(b.date));
  const past     = rdvs.filter(r => new Date(r.date) < new Date() || r.statut === 'annulé').sort((a, b) => new Date(b.date) - new Date(a.date));

  const Card = ({ r }) => {
    const d = new Date(r.date);
    return (
      <div className="rdv-card">
        <div className="rdv-date">
          <div className="day">{d.getDate()}</div>
          <div className="mon">{d.toLocaleString('fr-FR', { month: 'short' })}</div>
        </div>
        <div className="rdv-info">
          <h4>{r.type}</h4>
          <p>⏰ {r.heure} · {r.medecin}</p>
          {r.motif && <p style={{ color: 'var(--text3)', marginTop: 2 }}>{r.motif}</p>}
        </div>
        <span className={`badge ${r.statut === 'confirmé' ? 'badge-green' : r.statut === 'annulé' ? 'badge-red' : 'badge-amber'}`}>{r.statut}</span>
      </div>
    );
  };

  return (
    <>
      <Topbar title="Mes rendez-vous" subtitle={`${rdvs.length} rendez-vous au total`} />
      <div className="main-content">
        {loading ? <div className="loading"><div className="spinner" />Chargement…</div> : (
          <>
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div className="card-header"><h3>📅 À venir ({upcoming.length})</h3></div>
              <div className="card-body">
                {upcoming.length === 0 ? <div className="empty-state"><div className="icon">📭</div><p>Aucun RDV à venir</p></div> :
                  upcoming.map(r => <Card key={r._id} r={r} />)}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h3>🕐 Historique ({past.length})</h3></div>
              <div className="card-body">
                {past.length === 0 ? <div className="empty-state"><div className="icon">📂</div><p>Aucun historique</p></div> :
                  past.map(r => <Card key={r._id} r={r} />)}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
