import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form,  setForm]  = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'medecin' ? '/medecin/dashboard' : '/patient/accueil');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects');
    }
  };

  const fillDemo = (role) => {
    if (role === 'medecin') setForm({ email: 'dr.martin@cabinet.fr', password: 'medecin123' });
    else setForm({ email: 'sophie.bernard@email.fr', password: 'patient123' });
  };

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="logo-icon">🏥</div>
          <h1>Cabinet Médical</h1>
          <p>Plateforme de gestion médicale sécurisée pour professionnels de santé</p>
        </div>
        <div className="auth-features">
          {['Dossiers patients complets','Gestion des rendez-vous','Ordonnances & examens','Tableau de bord en temps réel'].map(f => (
            <div className="auth-feature" key={f}><span className="dot"/>{f}</div>
          ))}
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrap">
          <h2>Connexion</h2>
          <p className="subtitle">Accédez à votre espace sécurisé</p>

          {error && <div className="error-msg">⚠️ {error}</div>}

          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.25rem' }}>
            <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => fillDemo('medecin')}>👨‍⚕️ Démo Médecin</button>
            <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => fillDemo('patient')}>🧑 Démo Patient</button>
          </div>

          <form onSubmit={submit}>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} required placeholder="votre@email.fr" />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input name="password" type="password" value={form.password} onChange={handle} required placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter →'}
            </button>
          </form>
          <div className="auth-switch">
            Pas encore de compte ? <Link to="/register">S'inscrire</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
