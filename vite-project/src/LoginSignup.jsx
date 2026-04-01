import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API_URL from './config.js';
import socket from './socket.js';

const LoginSignup = ({ setUser, setIsAdmin }) => {
  const [mode, setMode] = useState('login'); // login | signup
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleLogin = async () => {
    if (!form.email || !form.password) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const endpoint = role === 'admin' ? '/api/auth/admin-login' : '/api/auth/login';
      const res = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, password: form.password }) });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        socket.emit('join:user', data.user.id);
        if (data.user.role === 'admin') {
          localStorage.setItem('isAdmin', 'true');
          localStorage.removeItem('loggedInUser');
          setIsAdmin(true); setUser(null);
          toast.success(`Welcome, ${data.user.name}!`);
          navigate('/admin');
        } else {
          localStorage.setItem('loggedInUser', JSON.stringify(data.user));
          localStorage.removeItem('isAdmin');
          setUser(data.user); setIsAdmin(false);
          toast.success(`Welcome back, ${data.user.name}!`);
          navigate('/dashboard');
        }
      } else { toast.error(data.message || 'Login failed'); }
    } catch { toast.error('Network error — is the backend running?'); }
    finally { setLoading(false); }
  };

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password || !form.confirm) { toast.error('Fill all fields'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, password: form.password }) });
      const data = await res.json();
      if (data.success) {
        toast.success('Account created! Please sign in.');
        setMode('login'); setForm({ name: '', email: '', password: '', confirm: '' });
      } else { toast.error(data.message || 'Signup failed'); }
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.bg} />
      <div style={s.card}>
        {/* Logo */}
        <div style={s.logo}>
          <img src="https://career.webindia123.com/career/institutes/aspupload/Uploads/punjab/21714/logo.jpg" alt="PCTE" style={s.logoImg} />
          <div>
            <div style={s.logoName}>PCTE Lost & Found</div>
            <div style={s.logoSub}>Portal</div>
          </div>
        </div>

        <h2 style={s.title}>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
        <p style={s.sub}>{mode === 'login' ? 'Sign in to continue' : 'Join the PCTE community'}</p>

        {/* Role toggle — only on login */}
        {mode === 'login' && (
          <div style={s.roleRow}>
            {['user', 'admin'].map(r => (
              <button key={r} onClick={() => setRole(r)} style={{ ...s.roleBtn, ...(role === r ? s.roleBtnActive : {}) }}>
                {r === 'admin' ? '🛡 Admin' : '👤 Student'}
              </button>
            ))}
          </div>
        )}

        {/* Fields */}
        {mode === 'signup' && (
          <div style={s.field}>
            <label style={s.label}>Full Name</label>
            <input style={s.inp} placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
        )}

        <div style={s.field}>
          <label style={s.label}>{role === 'admin' ? 'Admin Email' : 'Email'}</label>
          <input type="email" style={s.inp} placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())} />
        </div>

        <div style={s.field}>
          <label style={s.label}>Password</label>
          <div style={s.passRow}>
            <input type={showPass ? 'text' : 'password'} style={{ ...s.inp, flex: 1, marginBottom: 0 }} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())} />
            <button onClick={() => setShowPass(!showPass)} style={s.eyeBtn}>{showPass ? '🙈' : '👁'}</button>
          </div>
        </div>

        {mode === 'signup' && (
          <div style={s.field}>
            <label style={s.label}>Confirm Password</label>
            <input type="password" style={s.inp} placeholder="••••••••" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
          </div>
        )}

        <button onClick={mode === 'login' ? handleLogin : handleSignup} disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
          {loading ? '⏳ Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        {role === 'user' && (
          <p style={s.switchText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setForm({ name: '', email: '', password: '', confirm: '' }); }} style={s.switchLink}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </span>
          </p>
        )}

        <div style={s.backHome}>
          <Link to="/" style={s.backLink}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', padding: '20px', fontFamily: 'Inter, sans-serif', position: 'relative' },
  bg: { position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(100,255,218,0.06) 0%, transparent 70%)', pointerEvents: 'none' },
  card: { width: '100%', maxWidth: '420px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '36px', color: '#e8e8f0', position: 'relative', zIndex: 1 },
  logo: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', justifyContent: 'center' },
  logoImg: { width: '44px', height: '44px', borderRadius: '50%', border: '2px solid rgba(100,255,218,0.3)', objectFit: 'cover' },
  logoName: { fontSize: '15px', fontWeight: 700, color: '#64ffda' },
  logoSub: { fontSize: '11px', color: '#555' },
  title: { fontSize: '24px', fontWeight: 800, margin: '0 0 4px', textAlign: 'center' },
  sub: { fontSize: '13px', color: '#555', textAlign: 'center', margin: '0 0 24px' },
  roleRow: { display: 'flex', gap: '8px', marginBottom: '20px' },
  roleBtn: { flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#666', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all .2s' },
  roleBtnActive: { background: 'rgba(100,255,218,0.1)', border: '1px solid rgba(100,255,218,0.25)', color: '#64ffda' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '12px', color: '#888', fontWeight: 500, marginBottom: '6px' },
  inp: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e8e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' },
  passRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  eyeBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', cursor: 'pointer', fontSize: '16px', flexShrink: 0 },
  btn: { width: '100%', padding: '13px', marginTop: '4px', fontSize: '15px', fontWeight: 700, background: 'linear-gradient(135deg,#64ffda,#00b4d8)', color: '#0a0a0f', border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'opacity .2s' },
  switchText: { textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#555' },
  switchLink: { color: '#64ffda', cursor: 'pointer', fontWeight: 600 },
  backHome: { textAlign: 'center', marginTop: '16px' },
  backLink: { fontSize: '12px', color: '#444', textDecoration: 'none' },
};

export default LoginSignup;
