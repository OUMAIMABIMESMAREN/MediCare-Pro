import React, { useEffect, useState } from 'react';
import Topbar from '../layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { getPatient, getConsultations } from '../../services/api';

export default function PatientDossier() {
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    if (user?.patientId) {
      getPatient(user.patientId).then(r => setPatient(r.data));
      getConsultations({ patientId: user.patientId }).then(r => setConsultations(r.data.consultations));
    }
  }, [user]);

  if (!patient) return <div className="main-content"><div className="loading"><div className="spinner" />Chargement…</div></div>;
  const age = Math.floor((new Date() - new Date(patient.naissance)) / 3.15576e10);

  return (
    <>
      <Topbar title="Mon dossier médical" subtitle={`Dossier N° ${patient.patientId}`} />
      <div className="main-content">
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.25rem' }}>
          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="card-body" style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div className="pc-avatar av1" style={{ width: 64, height: 64, fontSize: '1.2rem', margin: '0 auto 1rem' }}>{patient.prenom[0]}{patient.nom[0]}</div>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{patient.prenom} {patient.nom}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text3)', margin: '.25rem 0 .75rem' }}>{age} ans · {patient.sexe === 'M' ? 'Homme' : 'Femme'}</div>
                <span className={`pc-status ${patient.statut}`}>⬤ {patient.statut}</span>
              </div>
            </div>

            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="card-header"><h3>📞 Coordonnées</h3></div>
              <div className="card-body">
                {[['Tél', patient.tel], ['Email', patient.email], ['Adresse', patient.adresse]].map(([l, v]) => v && (
                  <div key={l} style={{ marginBottom: '.6rem' }}>
                    <div style={{ fontSize: '.68rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '2px' }}>{l}</div>
                    <div style={{ fontSize: '.83rem', color: 'var(--text)' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3>📊 Constantes</h3></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
                  {[['Tension', patient.constantes?.tension, ''], ['FC', patient.constantes?.fc, 'bpm'], ['SpO2', patient.constantes?.spo2, '%'], ['Glycémie', patient.constantes?.glycemie, 'g/L']].map(([l, v, u]) => (
                    <div className="vital-box" key={l}><div className="vb-label">{l}</div><div className="vb-val">{v || '—'} <span className="vb-unit">{u}</span></div></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="card-header"><h3>🩺 Informations médicales</h3></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.75rem', marginBottom: '1rem' }}>
                  {[['Groupe sanguin', patient.sang], ['Taille', patient.taille_cm ? patient.taille_cm + ' cm' : '—'], ['Poids', patient.poids_kg ? patient.poids_kg + ' kg' : '—'], ['IMC', patient.imc || '—'], ['N° Sécu', patient.secu], ['Visites totales', patient.nb_visites]].map(([l, v]) => (
                    <div key={l} className="detail-field"><div className="df-label">{l}</div><div className="df-value">{v || '—'}</div></div>
                  ))}
                </div>
                <div style={{ marginBottom: '.75rem' }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--text2)', marginBottom: '.4rem' }}>🦠 Pathologies</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
                    {(patient.pathologies || []).map(p => <span key={p} className="badge badge-amber">{p}</span>)}
                    {!patient.pathologies?.length && <span style={{ fontSize: '.8rem', color: 'var(--text3)' }}>Aucune</span>}
                  </div>
                </div>
                <div style={{ marginBottom: '.75rem' }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--text2)', marginBottom: '.4rem' }}>⚠️ Allergies</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
                    {(patient.allergies || []).map(a => <span key={a} className="badge badge-red">{a}</span>)}
                    {!patient.allergies?.length && <span style={{ fontSize: '.8rem', color: 'var(--text3)' }}>Aucune allergie connue</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--text2)', marginBottom: '.4rem' }}>💊 Traitement en cours</div>
                  <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '.75rem', fontSize: '.83rem', color: 'var(--text2)', lineHeight: 1.6 }}>{patient.medicaments || 'Aucun'}</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3>🕐 Historique des consultations ({consultations.length})</h3></div>
              <div className="card-body">
                {consultations.length === 0 ? <div className="empty-state"><div className="icon">📋</div><p>Aucune consultation</p></div> :
                  <div className="timeline">
                    {consultations.map(c => (
                      <div className="timeline-item" key={c._id}>
                        <div className="timeline-dot" />
                        <div className="ti-date">{new Date(c.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <div className="ti-title">{c.motif}</div>
                        <div className="ti-body">{c.diagnostic || 'Pas de diagnostic renseigné'}</div>
                        {c.traitement && <div style={{ marginTop: '.3rem', fontSize: '.78rem', color: 'var(--accent)' }}>💊 {c.traitement}</div>}
                      </div>
                    ))}
                  </div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
