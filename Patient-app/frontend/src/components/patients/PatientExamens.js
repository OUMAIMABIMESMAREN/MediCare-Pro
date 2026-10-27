import React, { useEffect, useState } from 'react';
import Topbar from '../layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { getExamens } from '../../services/api';

const statutBadge = (s) => ({ 'disponible': 'badge-green', 'urgent': 'badge-red', 'en attente': 'badge-amber', 'transmis': 'badge-blue' }[s] || 'badge-gray');

export default function PatientExamens() {
  const { user } = useAuth();
  const [examens, setExamens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.patientId) {
      getExamens({ patientId: user.patientId }).then(r => setExamens(r.data)).finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <>
      <Topbar title="Mes résultats d'examens" subtitle={`${examens.length} examens`} />
      <div className="main-content">
        {loading ? <div className="loading"><div className="spinner" />Chargement…</div> :
          examens.length === 0 ? <div className="card"><div className="empty-state" style={{ padding: '3rem' }}><div className="icon">🔬</div><p>Aucun examen prescrit</p></div></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }}>
              {examens.map(e => (
                <div className="card" key={e._id}>
                  <div className="card-header">
                    <div>
                      <h3>{e.type}</h3>
                      <p style={{ fontSize: '.75rem', color: 'var(--text3)', marginTop: '2px' }}>{new Date(e.date).toLocaleDateString('fr-FR')} · {e.laboratoire}</p>
                    </div>
                    <span className={`badge ${statutBadge(e.statut)}`}>{e.statut}</span>
                  </div>
                  <div className="card-body">
                    {e.statut === 'disponible' || e.statut === 'transmis' ? (
                      <>
                        <div style={{ fontWeight: 500, marginBottom: '.5rem', fontSize: '.85rem' }}>{e.resultat || 'Résultat disponible'}</div>
                        {e.valeurs && Object.keys(e.valeurs).some(k => e.valeurs[k]) && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.4rem', marginTop: '.5rem' }}>
                            {[['Glycémie', e.valeurs.glycemie, 'g/L'], ['Cholestérol', e.valeurs.cholesterol, 'g/L'], ['HDL', e.valeurs.hdl, 'g/L'], ['LDL', e.valeurs.ldl, 'g/L'], ['Créatinine', e.valeurs.creatinine, 'µmol/L'], ['Hémoglobine', e.valeurs.hemoglobine, 'g/dL']].map(([l, v, u]) => v ? (
                              <div key={l} className="vital-box"><div className="vb-label">{l}</div><div className="vb-val">{v} <span className="vb-unit">{u}</span></div></div>
                            ) : null)}
                          </div>
                        )}
                        {e.commentaire && <div style={{ marginTop: '.75rem', fontSize: '.8rem', color: 'var(--text2)', padding: '.6rem', background: 'var(--surface2)', borderRadius: '7px' }}>💬 {e.commentaire}</div>}
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text3)' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '.4rem' }}>⏳</div>
                        <p style={{ fontSize: '.83rem' }}>Résultats en cours d'analyse</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </>
  );
}
