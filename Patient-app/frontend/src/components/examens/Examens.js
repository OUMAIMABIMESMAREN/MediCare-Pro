import React, { useEffect, useState, useCallback } from 'react';
import Topbar from '../layout/Topbar';
import { getExamens, createExamen, updateExamen, getPatients } from '../../services/api';

const TYPES = ['Bilan sanguin','Radiographie','Échographie','ECG','IRM','Scanner','Spirométrie',"Fond d'œil",'Autre'];
const STATUTS = ['en attente','disponible','transmis','urgent'];

function ExamenModal({ onClose, onSave }) {
  const [form, setForm] = useState({ patientId: '', patientNom: '', type: 'Bilan sanguin', date: new Date().toISOString().split('T')[0], laboratoire: 'Laboratoire Central Paris', resultat: '', statut: 'en attente', commentaire: '' });
  const [patients, setPatients] = useState([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => { getPatients({ limit: 100 }).then(r => setPatients(r.data.patients)); }, []);
  const set = (e) => {
    if (e.target.name === 'patientId') {
      const p = patients.find(x => x.patientId === e.target.value);
      setForm(f => ({ ...f, patientId: e.target.value, patientNom: p ? `${p.prenom} ${p.nom}` : '' }));
    } else { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }
  };
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await createExamen(form); onSave(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); setSaving(false); }
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header"><h3>🔬 Prescrire un examen</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group"><label>Patient</label>
              <select name="patientId" value={form.patientId} onChange={set} required>
                <option value="">— Choisir —</option>
                {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.prenom} {p.nom}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
              <div className="form-group"><label>Type</label><select name="type" value={form.type} onChange={set}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div className="form-group"><label>Date</label><input name="date" type="date" value={form.date} onChange={set} required /></div>
              <div className="form-group"><label>Laboratoire</label><input name="laboratoire" value={form.laboratoire} onChange={set} /></div>
              <div className="form-group"><label>Statut</label><select name="statut" value={form.statut} onChange={set}>{STATUTS.map(s => <option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="form-group"><label>Résultat</label><input name="resultat" value={form.resultat} onChange={set} /></div>
            <div className="form-group"><label>Commentaire</label><input name="commentaire" value={form.commentaire} onChange={set} /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Prescrire'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Examens() {
  const [examens, setExamens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filtre, setFiltre] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filtre !== 'all' ? { statut: filtre } : {};
      const { data } = await getExamens(params);
      setExamens(data);
    } finally { setLoading(false); }
  }, [filtre]);

  useEffect(() => { load(); }, [load]);

  const statutBadge = (s) => ({ 'disponible': 'badge-green', 'urgent': 'badge-red', 'en attente': 'badge-amber', 'transmis': 'badge-blue' }[s] || 'badge-gray');

  return (
    <>
      <Topbar title="Examens & Résultats" subtitle={`${examens.length} examens`}
        actions={<button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Prescrire un examen</button>}
      />
      <div className="main-content">
        <div className="search-bar">
          {['all', ...STATUTS].map(s => (
            <button key={s} className={`filter-btn ${filtre === s ? 'active' : ''}`} onClick={() => setFiltre(s)}>
              {s === 'all' ? 'Tous' : s}
            </button>
          ))}
        </div>
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? <div className="loading"><div className="spinner" />Chargement…</div> :
              examens.length === 0 ? <div className="empty-state"><div className="icon">🔬</div><p>Aucun examen</p></div> : (
              <table className="data-table">
                <thead><tr><th>Patient</th><th>Type</th><th>Date</th><th>Laboratoire</th><th>Résultat</th><th>Statut</th><th></th></tr></thead>
                <tbody>
                  {examens.map(e => (
                    <tr key={e._id}>
                      <td><strong>{e.patientNom || e.patientId}</strong></td>
                      <td>{e.type}</td>
                      <td>{new Date(e.date).toLocaleDateString('fr-FR')}</td>
                      <td style={{ fontSize: '.78rem', color: 'var(--text2)' }}>{e.laboratoire || '—'}</td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.resultat || '—'}</td>
                      <td><span className={`badge ${statutBadge(e.statut)}`}>{e.statut}</span></td>
                      <td>
                        <select value={e.statut} style={{ fontSize: '.75rem', padding: '.2rem .4rem', border: '1px solid var(--border)', borderRadius: '6px', background: '#fff' }}
                          onChange={async (ev) => { await updateExamen(e._id, { statut: ev.target.value }); load(); }}>
                          {STATUTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {showForm && <ExamenModal onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); load(); }} />}
    </>
  );
}
