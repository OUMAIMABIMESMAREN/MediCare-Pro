import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form,  setForm]  = useState({ nom: '', prenom: '', email: '', password: '', role: 'patient', patientId: '', specialite: '' });
  const [error, setError] = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await register(form);
      navigate(user.role === 'medecin' ? '/medecin/dashboard' : '/patient/accueil');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="logo-icon">🏥</div>
          <h1>Créer un compte</h1>
          <p>Rejoignez la plateforme du Cabinet Médical Dr. Martin</p>
        </div>
        <div className="auth-features">
          {['Accès sécurisé JWT','Rôles médecin & patient','Données chiffrées','Interface intuitive'].map(f => (
            <div className="auth-feature" key={f}><span className="dot"/>{f}</div>
          ))}
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrap">
          <h2>Inscription</h2>
          <p className="subtitle">Créez votre compte en quelques secondes</p>
          {error && <div className="error-msg">⚠️ {error}</div>}
          <form onSubmit={submit}>
            <div className="form-row">
              <div className="form-group">
                <label>Prénom</label>
                <input name="prenom" value={form.prenom} onChange={handle} required placeholder="Jean" />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input name="nom" value={form.nom} onChange={handle} required placeholder="Martin" />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input name="password" type="password" value={form.password} onChange={handle} required placeholder="min. 6 caractères" />
            </div>
            <div className="form-group">
              <label>Rôle</label>
              <select name="role" value={form.role} onChange={handle}>
                <option value="patient">Patient</option>
                <option value="medecin">Médecin</option>
              </select>
            </div>
            {form.role === 'patient' && (
              <div className="form-group">
                <label>ID Patient (ex: P-00001)</label>
                <input name="patientId" value={form.patientId} onChange={handle} placeholder="P-00001" />
              </div>
            )}
            {form.role === 'medecin' && (
              <div className="form-group">
                <label>Spécialité</label>
                <input name="specialite" value={form.specialite} onChange={handle} placeholder="Médecine générale" />
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Création…' : 'Créer mon compte →'}
            </button>
          </form>
          <div className="auth-switch">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
