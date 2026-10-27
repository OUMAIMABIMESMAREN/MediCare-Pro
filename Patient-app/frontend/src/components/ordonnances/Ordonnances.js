import React, { useEffect, useState, useCallback } from 'react';
import Topbar from '../layout/Topbar';
import { getOrdonnances, createOrdonnance, deleteOrdonnance, getPatients } from '../../services/api';

function OrdoModal({ onClose, onSave }) {
  const [form, setForm] = useState({ patientId: '', patientNom: '', date: new Date().toISOString().split('T')[0], renouvellement: false, duree_traitement: '1 mois', notes: '', medicaments: [{ nom: '', dosage: '', frequence: '1 fois par jour', duree: '1 mois', instructions: '' }] });
  const [patients, setPatients] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getPatients({ limit: 100 }).then(r => setPatients(r.data.patients)); }, []);

  const setP = (e) => {
    if (e.target.name === 'patientId') {
      const p = patients.find(x => x.patientId === e.target.value);
      setForm(f => ({ ...f, patientId: e.target.value, patientNom: p ? `${p.prenom} ${p.nom}` : '' }));
    } else {
      setForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    }
  };
  const setMed = (i, field, val) => setForm(f => ({ ...f, medicaments: f.medicaments.map((m, idx) => idx === i ? { ...m, [field]: val } : m) }));
  const addMed  = () => setForm(f => ({ ...f, medicaments: [...f.medicaments, { nom: '', dosage: '', frequence: '1 fois par jour', duree: '1 mois', instructions: '' }] }));
  const rmMed   = (i) => setForm(f => ({ ...f, medicaments: f.medicaments.filter((_, idx) => idx !== i) }));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await createOrdonnance(form); onSave(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header"><h3>💊 Nouvelle ordonnance</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
              <div className="form-group"><label>Patient</label>
                <select name="patientId" value={form.patientId} onChange={setP} required>
                  <option value="">— Choisir —</option>
                  {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.prenom} {p.nom}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Date</label><input name="date" type="date" value={form.date} onChange={setP} required /></div>
              <div className="form-group"><label>Durée traitement</label><input name="duree_traitement" value={form.duree_traitement} onChange={setP} /></div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', paddingTop: '1.5rem' }}>
                <input type="checkbox" name="renouvellement" checked={form.renouvellement} onChange={setP} id="renouv" />
                <label htmlFor="renouv" style={{ cursor: 'pointer' }}>Renouvellement</label>
              </div>
            </div>

            <p style={{ fontSize: '.75rem', color: 'var(--text3)', margin: '.75rem 0 .5rem', fontWeight: 500, textTransform: 'uppercase' }}>Médicaments</p>
            {form.medicaments.map((m, i) => (
              <div key={i} style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '.75rem', marginBottom: '.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.5rem', marginBottom: '.5rem' }}>
                  <div className="form-group"><label>Médicament</label><input value={m.nom} onChange={e => setMed(i, 'nom', e.target.value)} required placeholder="Amoxicilline" /></div>
                  <div className="form-group"><label>Dosage</label><input value={m.dosage} onChange={e => setMed(i, 'dosage', e.target.value)} placeholder="500mg" /></div>
                  <div className="form-group"><label>Fréquence</label><input value={m.frequence} onChange={e => setMed(i, 'frequence', e.target.value)} /></div>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}><input value={m.instructions} onChange={e => setMed(i, 'instructions', e.target.value)} placeholder="Instructions…" /></div>
                  {form.medicaments.length > 1 && <button type="button" className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => rmMed(i)}>✕</button>}
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={addMed}>+ Ajouter médicament</button>
            <div className="form-group" style={{ marginTop: '.75rem' }}><label>Notes</label><input name="notes" value={form.notes} onChange={setP} /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Créer l\'ordonnance'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Ordonnances() {
  const [ordos, setOrdos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await getOrdonnances(); setOrdos(data); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Topbar title="Ordonnances" subtitle={`${ordos.length} ordonnances`}
        actions={<button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Nouvelle ordonnance</button>}
      />
      <div className="main-content">
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? <div className="loading"><div className="spinner" />Chargement…</div> :
              ordos.length === 0 ? <div className="empty-state"><div className="icon">💊</div><p>Aucune ordonnance</p></div> : (
              <table className="data-table">
                <thead><tr><th>Patient</th><th>Date</th><th>Médicaments</th><th>Durée</th><th>Renouvellement</th><th></th></tr></thead>
                <tbody>
                  {ordos.map(o => (
                    <tr key={o._id} style={{ cursor: 'pointer' }} onClick={() => setDetail(o)}>
                      <td><strong>{o.patientNom || o.patientId}</strong></td>
                      <td>{new Date(o.date).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
                          {(o.medicaments || []).slice(0, 3).map((m, i) => <span key={i} className="badge badge-blue">{m.nom}</span>)}
                          {(o.medicaments?.length || 0) > 3 && <span className="badge badge-gray">+{o.medicaments.length - 3}</span>}
                        </div>
                      </td>
                      <td>{o.duree_traitement || '—'}</td>
                      <td>{o.renouvellement ? <span className="badge badge-green">✓ Oui</span> : <span className="badge badge-gray">Non</span>}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => { if (window.confirm('Supprimer ?')) deleteOrdonnance(o._id).then(load); }}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>💊 Ordonnance — {detail.patientNom}</h3><button className="modal-close" onClick={() => setDetail(null)}>✕</button></div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '.82rem', color: 'var(--text2)' }}>
                <span>📅 {new Date(detail.date).toLocaleDateString('fr-FR')}</span>
                <span>👨‍⚕️ {detail.medecin}</span>
                {detail.renouvellement && <span className="badge badge-green">Renouvellement</span>}
              </div>
              {(detail.medicaments || []).map((m, i) => (
                <div key={i} style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '.85rem', marginBottom: '.5rem' }}>
                  <div style={{ fontWeight: 500, marginBottom: '.25rem' }}>{m.nom} {m.dosage}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--text2)' }}>{m.frequence} · {m.duree}</div>
                  {m.instructions && <div style={{ fontSize: '.78rem', color: 'var(--text3)', marginTop: '.2rem' }}>{m.instructions}</div>}
                </div>
              ))}
              {detail.notes && <div style={{ marginTop: '.75rem', fontSize: '.83rem', color: 'var(--text2)' }}>📝 {detail.notes}</div>}
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDetail(null)}>Fermer</button></div>
          </div>
        </div>
      )}

      {showForm && <OrdoModal onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); load(); }} />}
    </>
  );
}
