import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import socket from '../socket.js';
import API_URL from '../config.js';

const Lost = ({ user }) => {
  const [form, setForm] = useState({ name: '', description: '', location: '', date: '', yourName: '', contact: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user) setForm(p => ({ ...p, yourName: user.name || '', contact: user.email || '' }));
  }, [user]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.description.trim() || form.description.trim().length < 10) e.description = 'Min 10 characters';
    if (!form.location.trim()) e.location = 'Required';
    if (!form.date) e.date = 'Required';
    if (!form.yourName.trim()) e.yourName = 'Required';
    if (!form.contact.trim() || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.contact)) e.contact = 'Valid email required';
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) e.phone = '10-digit number required';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix the errors'); return; }
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Please login first'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/lost-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: form.name, description: form.description, location: form.location, date: form.date, reporterName: form.yourName, contact: form.contact, phone: form.phone }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Lost item reported! We\'ll notify you if we find a match.');
        setSubmitted(true);
        setForm({ name: '', description: '', location: '', date: '', yourName: user?.name || '', contact: user?.email || '', phone: '' });
        setErrors({});
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        toast.error(data.message || 'Failed to report');
      }
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: '' })); };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <span style={s.icon}>🔍</span>
          <h1 style={s.title}>Report Lost Item</h1>
          <p style={s.sub}>Fill in the details and we'll help you find it</p>
        </div>

        {submitted && <div style={s.successBanner}>✅ Report submitted! We'll notify you when a match is found.</div>}

        <div style={s.form}>
          <div style={s.row}>
            <Field label="Item Name *" error={errors.name}>
              <input style={inp(errors.name)} placeholder="e.g. Blue backpack, iPhone 13..." value={form.name} onChange={e => set('name', e.target.value)} />
            </Field>
            <Field label="Location Lost *" error={errors.location}>
              <input style={inp(errors.location)} placeholder="e.g. Library, Canteen, Block A..." value={form.location} onChange={e => set('location', e.target.value)} />
            </Field>
          </div>

          <Field label="Description *" error={errors.description}>
            <textarea style={{ ...inp(errors.description), minHeight: '90px', resize: 'none' }} placeholder="Describe the item — color, brand, any unique marks..." value={form.description} onChange={e => set('description', e.target.value)} />
          </Field>

          <div style={s.row}>
            <Field label="Date Lost *" error={errors.date}>
              <input type="date" style={inp(errors.date)} value={form.date} max={new Date().toISOString().split('T')[0]} onChange={e => set('date', e.target.value)} />
            </Field>
            <Field label="Your Name *" error={errors.yourName}>
              <input style={inp(errors.yourName)} placeholder="Full name" value={form.yourName} onChange={e => set('yourName', e.target.value)} />
            </Field>
          </div>

          <div style={s.row}>
            <Field label="Email *" error={errors.contact}>
              <input type="email" style={inp(errors.contact)} placeholder="your@email.com" value={form.contact} onChange={e => set('contact', e.target.value)} />
            </Field>
            <Field label="Phone *" error={errors.phone}>
              <input type="tel" maxLength="10" style={inp(errors.phone)} placeholder="10-digit number" value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, ''))} />
            </Field>
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Submitting...' : '📤 Submit Report'}
          </button>
        </div>

        <div style={s.tip}>
          <span style={s.tipIcon}>💡</span>
          <span>After submitting, check your <strong>Dashboard</strong> to track status and get match notifications.</span>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, error, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '200px' }}>
    <label style={{ fontSize: '12px', color: '#888', fontWeight: 500 }}>{label}</label>
    {children}
    {error && <span style={{ color: '#ff4d6d', fontSize: '11px' }}>{error}</span>}
  </div>
);

const inp = err => ({ padding: '11px 14px', borderRadius: '10px', width: '100%', boxSizing: 'border-box', border: `1px solid ${err ? '#ff4d6d55' : 'rgba(255,255,255,0.08)'}`, background: err ? 'rgba(255,77,109,0.04)' : 'rgba(255,255,255,0.04)', color: '#e8e8f0', fontSize: '14px', outline: 'none' });

const s = {
  page: { background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', fontFamily: 'Inter, sans-serif' },
  card: { width: '100%', maxWidth: '680px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '36px', color: '#e8e8f0' },
  header: { textAlign: 'center', marginBottom: '28px' },
  icon: { fontSize: '44px', display: 'block', marginBottom: '12px' },
  title: { fontSize: '26px', fontWeight: 800, margin: '0 0 6px' },
  sub: { color: '#555', fontSize: '14px', margin: 0 },
  successBanner: { background: 'rgba(100,255,218,0.08)', border: '1px solid rgba(100,255,218,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#64ffda', marginBottom: '20px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  row: { display: 'flex', gap: '14px', flexWrap: 'wrap' },
  btn: { padding: '13px', fontSize: '15px', fontWeight: 700, background: 'linear-gradient(135deg,#64ffda,#00b4d8)', color: '#0a0a0f', border: 'none', borderRadius: '12px', cursor: 'pointer', marginTop: '4px' },
  tip: { display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 14px', fontSize: '12px', color: '#666' },
  tipIcon: { fontSize: '16px', flexShrink: 0 },
};

export default Lost;
