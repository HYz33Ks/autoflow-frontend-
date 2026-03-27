import { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onLogin, themeColors }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (isLogin) {
        onLogin(data.user, data.token);
      } else {
        setIsLogin(true); // Switch to login after successful register
        alert('Compte créé avec succès. Veuillez vous connecter.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <div style={{ width: 400, background: themeColors.surface, border: `1px solid ${themeColors.border}`, borderRadius: 16, padding: 32, boxShadow: themeColors.cardShadow, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: themeColors.muted, fontSize: 20, cursor: 'pointer' }}>×</button>
        <h2 style={{ margin: '0 0 24px 0', fontSize: 24, fontWeight: 700, textAlign: 'center' }}>
          {isLogin ? 'Connexion' : 'Créer un compte'}
        </h2>

        {error && <div style={{ background: '#ff3b7f22', color: '#ff3b7f', padding: '12px', borderRadius: 8, marginBottom: 16, fontSize: 13, border: '1px solid #ff3b7f44' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: themeColors.muted, marginBottom: 6 }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: themeColors.bg, border: `1px solid ${themeColors.border}`, borderRadius: 8, color: themeColors.text, outline: 'none' }} placeholder="votre@email.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: themeColors.muted, marginBottom: 6 }}>Mot de passe</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: themeColors.bg, border: `1px solid ${themeColors.border}`, borderRadius: 8, color: themeColors.text, outline: 'none' }} placeholder="••••••••" />
          </div>
          
          <button disabled={loading} type="submit" style={{ marginTop: 8, background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.purple})`, color: '#fff', border: 'none', padding: '14px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: themeColors.muted }}>
          {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ marginLeft: 6, color: themeColors.accent, cursor: 'pointer', fontWeight: 600 }}>
            {isLogin ? "S'inscrire" : "Se connecter"}
          </span>
        </div>
      </div>
    </div>
  );
}
