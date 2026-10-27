import React, { useEffect, useState } from 'react';
import Topbar from '../layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { getOrdonnances } from '../../services/api';

export default function PatientOrdo() {
  const { user } = useAuth();
  const [ordos, setOrdos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.patientId) {
      getOrdonnances({ patientId: user.patientId }).then(r => setOrdos(r.data)).finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <>
      <Topbar title="Mes ordonnances" subtitle={`${ordos.length} ordonnances`} />
      <div className="main-content">
        {loading ? <div className="loading"><div className="spinner" />Chargement…</div> :
          ordos.length === 0 ? <div className="card"><div className="empty-state" style={{ padding: '3rem' }}><div className="icon">💊</div><p>Aucune ordonnance</p></div></div> : (
            ordos.map(o => (
              <div className="card" key={o._id} style={{ marginBottom: '1rem' }}>
                <div className="card-header">
                  <div>
                    <h3>Ordonnance du {new Date(o.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                    <p style={{ fontSize: '.75rem', color: 'var(--text3)', marginTop: 2 }}>{o.medecin} · Durée : {o.duree_traitement || '—'}</p>
                  </div>
                  {o.renouvellement && <span className="badge badge-blue">🔄 Renouvellement</span>}
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '.6rem' }}>
                    {(o.medicaments || []).map((m, i) => (
                      <div key={i} style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '.85rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--text)', marginBottom: '.25rem' }}>💊 {m.nom} {m.dosage}</div>
                        <div style={{ fontSize: '.78rem', color: 'var(--text2)' }}>📅 {m.frequence}</div>
                        <div style={{ fontSize: '.78rem', color: 'var(--text2)' }}>⏱ {m.duree}</div>
                        {m.instructions && <div style={{ fontSize: '.75rem', color: 'var(--text3)', marginTop: '.25rem', fontStyle: 'italic' }}>{m.instructions}</div>}
                      </div>
                    ))}
                  </div>
                  {o.notes && <div style={{ marginTop: '.75rem', padding: '.6rem .8rem', background: 'var(--warn-light)', borderRadius: '8px', fontSize: '.82rem', color: 'var(--warn)' }}>📝 {o.notes}</div>}
                </div>
              </div>
            ))
          )}
      </div>
    </>
  );
}
