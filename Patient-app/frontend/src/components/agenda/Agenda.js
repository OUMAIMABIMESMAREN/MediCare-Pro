import React, { useEffect, useState } from 'react';
import Topbar from '../layout/Topbar';
import { getRendezVous, createRendezVous, updateRendezVous, deleteRendezVous, getPatients } from '../../services/api';

const DAYS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const TYPES = ['Consultation générale','Suivi chronique','Bilan annuel','Urgence','Renouvellement','Résultats'];
const HEURES = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

function buildCalendar(year, month) {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const start = first === 0 ? 6 : first - 1;
  const cells = [];
  for (let i = 0; i < start; i++) cells.push({ day: null });
  for (let d = 1; d <= days; d++) cells.push({ day: d });
  return cells;
}

function RDVModal({ rdv, patients, onClose, onSave }) {
  const [form, setForm] = useState(rdv || { patientId: '', patientNom: '', date: new Date().toISOString().split('T')[0], heure: '09:00', type: 'Consultation générale', motif: '', statut: 'confirmé', duree_min: 30 });
  const [saving, setSaving] = useState(false);
  const set = (e) => {
    const val = e.target.value;
    if (e.target.name === 'patientId') {
      const p = patients.find(x => x.patientId === val);
      setForm(f => ({ ...f, patientId: val, patientNom: p ? `${p.prenom} ${p.nom}` : '' }));
    } else {
      setForm(f => ({ ...f, [e.target.name]: val }));
    }
  };
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (rdv?._id) await updateRendezVous(rdv._id, form);
      else await createRendezVous(form);
      onSave();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header"><h3>{rdv ? '✏️ Modifier RDV' : '➕ Nouveau RDV'}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group"><label>Patient</label>
              <select name="patientId" value={form.patientId} onChange={set} required>
                <option value="">— Choisir un patient —</option>
                {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.prenom} {p.nom}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
              <div className="form-group"><label>Date</label><input name="date" type="date" value={form.date?.split?.('T')[0] || form.date} onChange={set} required /></div>
              <div className="form-group"><label>Heure</label><select name="heure" value={form.heure} onChange={set}>{HEURES.map(h => <option key={h}>{h}</option>)}</select></div>
              <div className="form-group"><label>Type</label><select name="type" value={form.type} onChange={set}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div className="form-group"><label>Statut</label>
                <select name="statut" value={form.statut} onChange={set}>
                  <option value="confirmé">Confirmé</option><option value="en attente">En attente</option><option value="annulé">Annulé</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Motif</label><input name="motif" value={form.motif} onChange={set} /></div>
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

export default function Agenda() {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [rdvs,  setRdvs]  = useState([]);
  const [selDay, setSelDay] = useState(today.getDate());
  const [dayRdvs, setDayRdvs] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRdv, setEditRdv] = useState(null);

  const load = async () => {
    const { data } = await getRendezVous();
    setRdvs(data);
  };

  useEffect(() => {
    load();
    getPatients({ limit: 100 }).then(r => setPatients(r.data.patients));
  }, []);

  useEffect(() => {
    if (selDay) {
      const d = new Date(year, month, selDay);
      const ds = d.toISOString().split('T')[0];
      setDayRdvs(rdvs.filter(r => new Date(r.date).toISOString().split('T')[0] === ds));
    }
  }, [selDay, rdvs, year, month]);

  const cells = buildCalendar(year, month);
  const rdvDays = new Set(rdvs.map(r => {
    const d = new Date(r.date);
    return d.getFullYear() === year && d.getMonth() === month ? d.getDate() : null;
  }).filter(Boolean));

  const prev = () => { if (month === 0) { setYear(y => y-1); setMonth(11); } else setMonth(m => m-1); };
  const next = () => { if (month === 11) { setYear(y => y+1); setMonth(0); } else setMonth(m => m+1); };

  return (
    <>
      <Topbar title="Agenda" subtitle={`${MONTHS[month]} ${year}`}
        actions={<button className="btn btn-primary btn-sm" onClick={() => { setEditRdv(null); setShowForm(true); }}>+ Nouveau RDV</button>}
      />
      <div className="main-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.25rem' }}>
          <div className="card">
            <div className="card-header">
              <button className="btn-icon" onClick={prev}>‹</button>
              <h3 style={{ flex: 1, textAlign: 'center' }}>{MONTHS[month]} {year}</h3>
              <button className="btn-icon" onClick={next}>›</button>
            </div>
            <div className="card-body">
              <div className="calendar-grid">
                {DAYS.map(d => <div key={d} className="cal-day-header">{d}</div>)}
                {cells.map((c, i) => (
                  <div key={i}
                    className={`cal-day ${!c.day ? 'other-month' : ''} ${c.day === today.getDate() && month === today.getMonth() && year === today.getFullYear() ? 'today' : ''} ${rdvDays.has(c.day) ? 'has-rdv' : ''}`}
                    onClick={() => c.day && setSelDay(c.day)}
                    style={{ cursor: c.day ? 'pointer' : 'default', background: selDay === c.day && c.day ? 'var(--accent-light)' : '' }}
                  >
                    {c.day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>📋 {selDay ? `${selDay} ${MONTHS[month]}` : 'Sélectionner un jour'}</h3>
              <span className="badge badge-blue">{dayRdvs.length} RDV</span>
            </div>
            <div className="card-body" style={{ padding: 0, maxHeight: 480, overflowY: 'auto' }}>
              {dayRdvs.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}><div className="icon">📭</div><p>Aucun RDV ce jour</p></div>
              ) : dayRdvs.sort((a, b) => a.heure.localeCompare(b.heure)).map(r => (
                <div key={r._id} style={{ padding: '.85rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, background: 'var(--accent-light)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--accent)' }}>{r.heure}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.85rem', fontWeight: 500 }}>{r.patientNom}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>{r.type}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.25rem' }}>
                    <span className={`badge ${r.statut === 'confirmé' ? 'badge-green' : r.statut === 'annulé' ? 'badge-red' : 'badge-amber'}`}>{r.statut}</span>
                    <div style={{ display: 'flex', gap: '.25rem' }}>
                      <button className="btn-icon" style={{ padding: '.2rem .4rem', fontSize: '.75rem' }} onClick={() => { setEditRdv(r); setShowForm(true); }}>✏️</button>
                      <button className="btn-icon" style={{ padding: '.2rem .4rem', fontSize: '.75rem', color: 'var(--danger)' }} onClick={() => { if (window.confirm('Supprimer ?')) deleteRendezVous(r._id).then(load); }}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '1.25rem' }}>
          <div className="card-header"><h3>📅 Prochains rendez-vous</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead><tr><th>Patient</th><th>Date</th><th>Heure</th><th>Type</th><th>Statut</th><th></th></tr></thead>
              <tbody>
                {rdvs.filter(r => new Date(r.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 10).map(r => (
                  <tr key={r._id}>
                    <td><strong>{r.patientNom}</strong></td>
                    <td>{new Date(r.date).toLocaleDateString('fr-FR')}</td>
                    <td>{r.heure}</td>
                    <td style={{ color: 'var(--text2)', fontSize: '.8rem' }}>{r.type}</td>
                    <td><span className={`badge ${r.statut === 'confirmé' ? 'badge-green' : r.statut === 'annulé' ? 'badge-red' : 'badge-amber'}`}>{r.statut}</span></td>
                    <td>
                      <div className="action-cell">
                        <button className="btn-icon" onClick={() => { setEditRdv(r); setShowForm(true); }}>✏️</button>
                        <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => { if (window.confirm('Supprimer ?')) deleteRendezVous(r._id).then(load); }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showForm && <RDVModal rdv={editRdv} patients={patients} onClose={() => { setShowForm(false); setEditRdv(null); }} onSave={() => { setShowForm(false); setEditRdv(null); load(); }} />}
    </>
  );
}
