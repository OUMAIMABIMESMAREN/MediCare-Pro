import React, { useEffect, useState } from 'react';
import Topbar from '../layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { getPatient, getRendezVous, getConsultations } from '../../services/api';

export default function PatientHome() {
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [rdvs, setRdvs] = useState([]);
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    if (user?.patientId) {
      getPatient(user.patientId).then(r => setPatient(r.data));
      getRendezVous({ patientId: user.patientId }).then(r => setRdvs(r.data.filter(rdv => new Date(rdv.date) >= new Date()).slice(0, 3)));
      getConsultations({ patientId: user.patientId }).then(r => setConsultations(r.data.consultations.slice(0, 3)));
    }
  }, [user]);

  const statusLabel = { stable: 'Stable', checkup: 'Contrôle', urgent: 'Urgence', new: 'Nouveau' };

  return (
    <>
      <Topbar title="Mon espace" subtitle="Bienvenue sur votre portail patient" />
      <div className="main-content">
        <div className="portal-welcome">
          <h2>Bonjour {user?.prenom} {user?.nom} 👋</h2>
          <p>{patient ? `Dossier N° ${patient.patientId} · Groupe sanguin ${patient.sang || '—'} · ${patient.nb_visites} visites` : 'Chargement de votre dossier…'}</p>
          {patient && <span className={`pc-status ${patient.statut}`} style={{ marginTop: '.75rem', display: 'inline-flex' }}>⬤ {statusLabel[patient.statut]}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {patient && [
            ['🩸', 'Groupe sanguin', patient.sang || '—', 'green'],
            ['💊', 'Traitements', patient.medicaments ? patient.medicaments.split(',').length + ' médicament(s)' : '—', 'blue'],
            ['⚠️', 'Allergies', (patient.allergies || []).length > 0 ? patient.allergies[0] : 'Aucune', 'amber'],
          ].map(([icon, label, value, color]) => (
            <div className="metric-card" key={label}>
              <div className="metric-top"><div className={`metric-icon ${color}`}>{icon}</div></div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: '.5rem 0 .2rem' }}>{value}</div>
              <div className="metric-label">{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="card">
            <div className="card-header"><h3>📅 Prochains rendez-vous</h3></div>
            <div className="card-body">
              {rdvs.length === 0 ? <div className="empty-state" style={{ padding: '1rem' }}><div className="icon">📭</div><p>Aucun RDV à venir</p></div> :
                rdvs.map(r => {
                  const d = new Date(r.date);
                  return (
                    <div className="rdv-card" key={r._id}>
                      <div className="rdv-date">
                        <div className="day">{d.getDate()}</div>
                        <div className="mon">{d.toLocaleString('fr-FR', { month: 'short' })}</div>
                      </div>
                      <div className="rdv-info">
                        <h4>{r.type}</h4>
                        <p>⏰ {r.heure} · {r.medecin}</p>
                      </div>
                      <span className={`badge ${r.statut === 'confirmé' ? 'badge-green' : 'badge-amber'}`}>{r.statut}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>🩺 Dernières consultations</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              {consultations.length === 0 ? <div className="empty-state" style={{ padding: '1rem' }}><div className="icon">🩺</div><p>Aucune consultation</p></div> :
                <div className="timeline" style={{ padding: '1rem 1rem 1rem 2rem' }}>
                  {consultations.map(c => (
                    <div className="timeline-item" key={c._id}>
                      <div className="timeline-dot" />
                      <div className="ti-date">{new Date(c.date).toLocaleDateString('fr-FR')}</div>
                      <div className="ti-title">{c.motif}</div>
                      <div className="ti-body">{c.diagnostic || 'Pas de diagnostic renseigné'}</div>
                    </div>
                  ))}
                </div>}
            </div>
          </div>
        </div>

        {patient && (
          <div className="card" style={{ marginTop: '1.25rem' }}>
            <div className="card-header"><h3>📊 Mes constantes</h3></div>
            <div className="card-body">
              <div className="vital-grid">
                {[['Tension', patient.constantes?.tension, ''], ['FC', patient.constantes?.fc, 'bpm'], ['SpO2', patient.constantes?.spo2, '%'], ['Glycémie', patient.constantes?.glycemie, 'g/L']].map(([l, v, u]) => (
                  <div className="vital-box" key={l}><div className="vb-label">{l}</div><div className="vb-val">{v || '—'} <span className="vb-unit">{u}</span></div></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
