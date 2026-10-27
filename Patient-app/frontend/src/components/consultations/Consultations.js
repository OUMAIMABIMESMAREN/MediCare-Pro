import React, { useEffect, useState, useCallback } from 'react';
import Topbar from '../layout/Topbar';
import { getConsultations, getPatients, createConsultation, deleteConsultation } from '../../services/api';

const EMPTY = { patientId:'', date:'', motif:'', diagnostic:'', notes:'', tension:'', fc:'', spo2:'', glycemie:'', poids_kg:'', temperature:'', traitement:'', arret_travail: false, arret_jours:'', suivi_requis: false };

function ConsultationModal({ onClose, onSave }) {
  const [form, setForm] = useState({ ...EMPTY, date: new Date().toISOString().split('T')[0] });
  const [patients, setPatients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { getPatients({ limit: 100 }).then(r => setPatients(r.data.patients)); }, []);

  const set = (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [e.target.name]: v }));
  };

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await createConsultation({ ...form, fc: Number(form.fc), spo2: Number(form.spo2), glycemie: Number(form.glycemie), poids_kg: Number(form.poids_kg), temperature: Number(form.temperature) });
      onSave();
    } catch (err) { setError(err.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header"><h3>🩺 Nouvelle consultation</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {error && <div className="error-msg">⚠️ {error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
              <div className="form-group"><label>Patient</label>
                <select name="patientId" value={form.patientId} onChange={set} required>
                  <option value="">— Choisir un patient —</option>
                  {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.prenom} {p.nom} ({p.patientId})</option>)}
                </select>
              </div>
              <div className="form-group"><label>Date</label><input name="date" type="date" value={form.date} onChange={set} required /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Motif</label><input name="motif" value={form.motif} onChange={set} required placeholder="Motif de consultation" /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Diagnostic</label><input name="diagnostic" value={form.diagnostic} onChange={set} /></div>
            </div>
            <p style={{ fontSize: '.75rem', color: 'var(--text3)', margin: '.75rem 0 .5rem', fontWeight: 500, textTransform: 'uppercase' }}>Constantes mesurées</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '.5rem' }}>
              {[['tension','Tension','120/80'],['fc','FC (bpm)','72'],['spo2','SpO2 (%)','98'],['glycemie','Glycémie','5.1'],['temperature','Temp. (°C)','37.0']].map(([n,l,ph]) => (
                <div className="form-group" key={n}><label>{l}</label><input name={n} value={form[n]} onChange={set} placeholder={ph} /></div>
              ))}
            </div>
            <div className="form-group"><label>Poids (kg)</label><input name="poids_kg" type="number" step=".1" value={form.poids_kg} onChange={set} /></div>
            <div className="form-group"><label>Traitement prescrit</label><input name="traitement" value={form.traitement} onChange={set} /></div>
            <div className="form-group"><label>Notes cliniques</label>
              <textarea name="notes" value={form.notes} onChange={set} rows="3" style={{ width: '100%', padding: '.6rem .9rem', border: '1.5px solid var(--border)', borderRadius: '10px', fontFamily: 'DM Sans', fontSize: '.88rem', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.85rem', cursor: 'pointer' }}>
                <input type="checkbox" name="arret_travail" checked={form.arret_travail} onChange={set} /> Arrêt de travail
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.85rem', cursor: 'pointer' }}>
                <input type="checkbox" name="suivi_requis" checked={form.suivi_requis} onChange={set} /> Suivi requis
              </label>
            </div>
            {form.arret_travail && <div className="form-group" style={{ marginTop: '.75rem' }}><label>Durée (jours)</label><input name="arret_jours" type="number" value={form.arret_jours} onChange={set} /></div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await getConsultations({ limit: 50 }); setConsultations(data.consultations); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Topbar title="Consultations" subtitle={`${consultations.length} consultations`}
        actions={<button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Nouvelle consultation</button>}
      />
      <div className="main-content">
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="loading"><div className="spinner" />Chargement…</div>
            ) : consultations.length === 0 ? (
              <div className="empty-state"><div className="icon">🩺</div><p>Aucune consultation enregistrée</p></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Patient</th><th>Date</th><th>Motif</th><th>Diagnostic</th><th>Tension</th><th>SpO2</th><th>Suivi</th><th></th></tr>
                </thead>
                <tbody>
                  {consultations.map(c => (
                    <tr key={c._id}>
                      <td><strong>{c.patientId}</strong></td>
                      <td>{new Date(c.date).toLocaleDateString('fr-FR')}</td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.motif}</td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text2)' }}>{c.diagnostic || '—'}</td>
                      <td>{c.tension || '—'}</td>
                      <td>{c.spo2 ? `${c.spo2}%` : '—'}</td>
                      <td>{c.suivi_requis ? <span className="badge badge-amber">⚠ Requis</span> : <span className="badge badge-green">✓ Non</span>}</td>
                      <td><button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => { if (window.confirm('Supprimer ?')) deleteConsultation(c._id).then(load); }}>🗑</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {showForm && <ConsultationModal onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); load(); }} />}
    </>
  );
}
