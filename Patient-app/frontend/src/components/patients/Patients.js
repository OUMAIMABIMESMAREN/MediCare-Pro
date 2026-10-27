import React, { useEffect, useState, useCallback } from 'react';
import Topbar from '../layout/Topbar';
import { getPatients, createPatient, updatePatient, deletePatient } from '../../services/api';

const AV = ['av1','av2','av3','av4','av5','av6'];
const statusLabel = { stable:'Stable', checkup:'Contrôle', urgent:'Urgent', new:'Nouveau' };
const SANG = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const STATUTS_FILTRE = ['all','stable','checkup','urgent','new'];
const EMPTY = { patientId:'', prenom:'', nom:'', naissance:'', sexe:'M', secu:'', tel:'', email:'', adresse:'', sang:'A+', taille_cm:'', poids_kg:'', pathologies:'', allergies:'', medicaments:'', statut:'new', constantes:{ tension:'', fc:'', spo2:'', glycemie:'' } };

function PatientModal({ patient, onClose, onSave }) {
  const editing = !!patient?._id;
  const [form, setForm] = useState(editing ? {
    ...patient,
    pathologies: (patient.pathologies||[]).join(', '),
    allergies:   (patient.allergies||[]).join(', '),
    constantes:  patient.constantes || { tension:'', fc:'', spo2:'', glycemie:'' }
  } : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const setC = (e) => setForm(f => ({ ...f, constantes: { ...f.constantes, [e.target.name]: e.target.value } }));

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const payload = { ...form,
        pathologies: form.pathologies ? form.pathologies.split(',').map(s=>s.trim()).filter(Boolean) : [],
        allergies:   form.allergies   ? form.allergies.split(',').map(s=>s.trim()).filter(Boolean) : [],
        taille_cm: Number(form.taille_cm), poids_kg: Number(form.poids_kg),
        imc: form.taille_cm && form.poids_kg ? +(form.poids_kg / ((form.taille_cm/100)**2)).toFixed(1) : undefined,
        constantes: { tension: form.constantes.tension, fc: Number(form.constantes.fc), spo2: Number(form.constantes.spo2), glycemie: Number(form.constantes.glycemie) }
      };
      if (editing) await updatePatient(patient.patientId, payload);
      else await createPatient(payload);
      onSave();
    } catch (err) { setError(err.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{editing ? '✏️ Modifier patient' : '➕ Nouveau patient'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {error && <div className="error-msg">⚠️ {error}</div>}
            <p style={{fontSize:'.75rem',color:'var(--text3)',marginBottom:'1rem',fontWeight:500,textTransform:'uppercase',letterSpacing:'.05em'}}>Identité</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem'}}>
              {!editing && <div className="form-group"><label>ID Patient</label><input name="patientId" value={form.patientId} onChange={set} required placeholder="P-00013"/></div>}
              <div className="form-group"><label>Prénom</label><input name="prenom" value={form.prenom} onChange={set} required/></div>
              <div className="form-group"><label>Nom</label><input name="nom" value={form.nom} onChange={set} required/></div>
              <div className="form-group"><label>Date de naissance</label><input name="naissance" type="date" value={form.naissance?.split?.('T')[0]||form.naissance||''} onChange={set}/></div>
              <div className="form-group"><label>Sexe</label><select name="sexe" value={form.sexe} onChange={set}><option value="M">Masculin</option><option value="F">Féminin</option></select></div>
              <div className="form-group"><label>N° Sécurité sociale</label><input name="secu" value={form.secu} onChange={set}/></div>
              <div className="form-group"><label>Statut</label><select name="statut" value={form.statut} onChange={set}><option value="new">Nouveau</option><option value="stable">Stable</option><option value="checkup">Contrôle</option><option value="urgent">Urgent</option></select></div>
            </div>
            <p style={{fontSize:'.75rem',color:'var(--text3)',margin:'1rem 0 .5rem',fontWeight:500,textTransform:'uppercase',letterSpacing:'.05em'}}>Contact</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem'}}>
              <div className="form-group"><label>Téléphone</label><input name="tel" value={form.tel} onChange={set}/></div>
              <div className="form-group"><label>Email</label><input name="email" type="email" value={form.email} onChange={set}/></div>
              <div className="form-group" style={{gridColumn:'1/-1'}}><label>Adresse</label><input name="adresse" value={form.adresse} onChange={set}/></div>
            </div>
            <p style={{fontSize:'.75rem',color:'var(--text3)',margin:'1rem 0 .5rem',fontWeight:500,textTransform:'uppercase',letterSpacing:'.05em'}}>Médical</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'.75rem'}}>
              <div className="form-group"><label>Groupe sanguin</label><select name="sang" value={form.sang} onChange={set}>{SANG.map(s=><option key={s}>{s}</option>)}</select></div>
              <div className="form-group"><label>Taille (cm)</label><input name="taille_cm" type="number" value={form.taille_cm} onChange={set}/></div>
              <div className="form-group"><label>Poids (kg)</label><input name="poids_kg" type="number" step=".1" value={form.poids_kg} onChange={set}/></div>
              <div className="form-group"><label>Tension</label><input name="tension" value={form.constantes.tension} onChange={setC} placeholder="120/80"/></div>
              <div className="form-group"><label>FC (bpm)</label><input name="fc" type="number" value={form.constantes.fc} onChange={setC}/></div>
              <div className="form-group"><label>SpO2 (%)</label><input name="spo2" type="number" value={form.constantes.spo2} onChange={setC}/></div>
              <div className="form-group"><label>Glycémie (g/L)</label><input name="glycemie" type="number" step=".1" value={form.constantes.glycemie} onChange={setC}/></div>
            </div>
            <div className="form-group"><label>Pathologies (séparées par virgule)</label><input name="pathologies" value={form.pathologies} onChange={set} placeholder="Diabète type 2, Hypertension"/></div>
            <div className="form-group"><label>Allergies (séparées par virgule)</label><input name="allergies" value={form.allergies} onChange={set}/></div>
            <div className="form-group"><label>Médicaments en cours</label><input name="medicaments" value={form.medicaments} onChange={set}/></div>
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

function PatientDetail({ patient, onClose, onEdit }) {
  const age = patient.naissance ? Math.floor((new Date() - new Date(patient.naissance)) / 3.15576e10) : '?';
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{maxWidth:'720px'}}>
        <div className="modal-header">
          <h3>🗂️ Dossier patient — {patient.prenom} {patient.nom}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div>
              <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.25rem',padding:'1rem',background:'var(--surface2)',borderRadius:'10px'}}>
                <div className="pc-avatar av1" style={{width:52,height:52,fontSize:'1rem',flexShrink:0}}>{patient.prenom[0]}{patient.nom[0]}</div>
                <div>
                  <div style={{fontWeight:600,fontSize:'.95rem'}}>{patient.prenom} {patient.nom}</div>
                  <div style={{fontSize:'.78rem',color:'var(--text3)'}}>{patient.patientId} · {age} ans · {patient.sexe === 'M' ? '♂' : '♀'}</div>
                  <span className={`pc-status ${patient.statut}`} style={{marginTop:'.25rem'}}>{statusLabel[patient.statut]}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>📞 Contact</h4>
                {[['Téléphone', patient.tel], ['Email', patient.email], ['Adresse', patient.adresse], ['Sécurité sociale', patient.secu]].map(([l,v]) => v && (
                  <div key={l} className="detail-field" style={{marginBottom:'.5rem'}}><div className="df-label">{l}</div><div className="df-value">{v}</div></div>
                ))}
              </div>

              <div className="detail-section">
                <h4>📊 Constantes</h4>
                <div className="vital-grid">
                  {[['Tension',patient.constantes?.tension,''],['FC',patient.constantes?.fc,'bpm'],['SpO2',patient.constantes?.spo2,'%'],['Glycémie',patient.constantes?.glycemie,'g/L']].map(([l,v,u]) => (
                    <div className="vital-box" key={l}><div className="vb-label">{l}</div><div className="vb-val">{v||'—'} <span className="vb-unit">{u}</span></div></div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="detail-section">
                <h4>🩺 Informations médicales</h4>
                <div className="detail-row">
                  {[['Groupe sanguin',patient.sang],['Taille',patient.taille_cm ? patient.taille_cm+'cm' : '—'],['Poids',patient.poids_kg ? patient.poids_kg+'kg' : '—'],['IMC',patient.imc||'—']].map(([l,v]) => (
                    <div key={l} className="detail-field"><div className="df-label">{l}</div><div className="df-value">{v}</div></div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h4>🦠 Pathologies</h4>
                <div style={{display:'flex',flexWrap:'wrap',gap:'.4rem'}}>
                  {(patient.pathologies||[]).map(p=><span key={p} className="badge badge-amber">{p}</span>)}
                  {(!patient.pathologies?.length) && <span style={{fontSize:'.82rem',color:'var(--text3)'}}>Aucune</span>}
                </div>
              </div>

              <div className="detail-section">
                <h4>⚠️ Allergies</h4>
                <div style={{display:'flex',flexWrap:'wrap',gap:'.4rem'}}>
                  {(patient.allergies||[]).map(a=><span key={a} className="badge badge-red">{a}</span>)}
                  {(!patient.allergies?.length) && <span style={{fontSize:'.82rem',color:'var(--text3)'}}>Aucune allergie connue</span>}
                </div>
              </div>

              <div className="detail-section">
                <h4>💊 Médicaments</h4>
                <div style={{background:'var(--surface2)',borderRadius:'8px',padding:'.75rem',fontSize:'.83rem',color:'var(--text2)',lineHeight:1.6}}>
                  {patient.medicaments || 'Aucun traitement en cours'}
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.5rem',marginTop:'.5rem',fontSize:'.78rem',color:'var(--text3)'}}>
                <div>🏥 Visites : <strong style={{color:'var(--text)'}}>{patient.nb_visites}</strong></div>
                <div>📅 Dernier RDV : <strong style={{color:'var(--text)'}}>{patient.dernier_rdv ? new Date(patient.dernier_rdv).toLocaleDateString('fr-FR') : '—'}</strong></div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Fermer</button>
          <button className="btn btn-primary" onClick={() => onEdit(patient)}>✏️ Modifier</button>
        </div>
      </div>
    </div>
  );
}

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filtre,   setFiltre]   = useState('all');
  const [selected, setSelected] = useState(null);
  const [editing,  setEditing]  = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {}; if (filtre !== 'all') params.statut = filtre; if (search) params.search = search;
      const { data } = await getPatients(params);
      setPatients(data.patients);
    } finally { setLoading(false); }
  }, [filtre, search]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Supprimer ${p.prenom} ${p.nom} ?`)) return;
    await deletePatient(p.patientId); load();
  };

  const openEdit = (p) => { setEditing(p); setSelected(null); setShowForm(true); };

  return (
    <>
      <Topbar title="Patients" subtitle={`${patients.length} patients`}
        actions={<button className="btn btn-primary btn-sm" onClick={()=>{setEditing(null);setShowForm(true)}}>+ Nouveau patient</button>}
      />
      <div className="main-content">
        <div className="search-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par nom, prénom, ID…"/>
          </div>
          {STATUTS_FILTRE.map(s=>(
            <button key={s} className={`filter-btn ${filtre===s?'active':''}`} onClick={()=>setFiltre(s)}>
              {s==='all'?'Tous':statusLabel[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"/>Chargement…</div>
        ) : patients.length === 0 ? (
          <div className="empty-state"><div className="icon">👥</div><p>Aucun patient trouvé</p></div>
        ) : (
          <div className="patients-grid">
            {patients.map((p, i) => (
              <div className="patient-card" key={p._id} onClick={()=>setSelected(p)}>
                <div className="pc-top">
                  <div className={`pc-avatar ${AV[i%6]}`}>{p.prenom[0]}{p.nom[0]}</div>
                  <div style={{flex:1}}>
                    <div className="pc-name">{p.prenom} {p.nom}</div>
                    <div className="pc-id">{p.patientId}</div>
                  </div>
                  <div style={{display:'flex',gap:'.3rem'}} onClick={e=>e.stopPropagation()}>
                    <button className="btn-icon" onClick={()=>openEdit(p)}>✏️</button>
                    <button className="btn-icon" style={{color:'var(--danger)'}} onClick={()=>handleDelete(p)}>🗑</button>
                  </div>
                </div>
                <div className="pc-info">
                  <div className="pc-field"><div className="label">Groupe sanguin</div><div className="value">{p.sang||'—'}</div></div>
                  <div className="pc-field"><div className="label">Visites</div><div className="value">{p.nb_visites}</div></div>
                  <div className="pc-field"><div className="label">Téléphone</div><div className="value" style={{fontSize:'.73rem'}}>{p.tel||'—'}</div></div>
                  <div className="pc-field"><div className="label">Tension</div><div className="value">{p.constantes?.tension||'—'}</div></div>
                </div>
                {(p.pathologies||[]).length > 0 && (
                  <div style={{marginTop:'.5rem',display:'flex',flexWrap:'wrap',gap:'.3rem'}}>
                    {p.pathologies.slice(0,2).map(pa=><span key={pa} className="badge badge-amber">{pa}</span>)}
                    {p.pathologies.length > 2 && <span className="badge badge-gray">+{p.pathologies.length-2}</span>}
                  </div>
                )}
                <div><span className={`pc-status ${p.statut}`}>⬤ {statusLabel[p.statut]}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <PatientDetail patient={selected} onClose={()=>setSelected(null)} onEdit={openEdit}/>}
      {showForm && <PatientModal patient={editing} onClose={()=>{setShowForm(false);setEditing(null)}} onSave={()=>{setShowForm(false);setEditing(null);load()}}/>}
    </>
  );
}
