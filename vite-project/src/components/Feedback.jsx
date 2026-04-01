import { useState } from 'react';
import toast from 'react-hot-toast';
import API_URL from '../config.js';

const Feedback = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '', rating: 5 });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.message.trim() || form.message.trim().length < 10) e.message = 'Min 10 characters';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Feedback submitted!');
        setForm({ name: '', email: '', message: '', rating: 5 });
        setErrors({});
      } else {
        toast.error(data.message || 'Failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: '' })); };

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Inter, sans-serif', color: '#e8e8f0' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>💬</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>Send Feedback</h1>
          <p style={{ color: '#555', fontSize: '14px' }}>Help us improve the portal</p>
        </div>
        <form style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#888' }}>Name *</label>
              <input style={{ padding: '11px 14px', borderRadius: '10px', border: errors.name ? '1px solid #ff4d6d55' : '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e8e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', width: '100%' }} placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} />
              {errors.name && <span style={{ color: '#ff4d6d', fontSize: '11px' }}>{errors.name}</span>}
            </div>
            <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#888' }}>Email *</label>
              <input type="email" style={{ padding: '11px 14px', borderRadius: '10px', border: errors.email ? '1px solid #ff4d6d55' : '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e8e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', width: '100%' }} placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              {errors.email && <span style={{ color: '#ff4d6d', fontSize: '11px' }}>{errors.email}</span>}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px' }}>Rating</label>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[1,2,3,4,5].map(star => (
                <span key={star} onClick={() => set('rating', star)} style={{ fontSize: '28px', cursor: 'pointer', opacity: form.rating >= star ? 1 : 0.25 }}>⭐</span>
              ))}
              <span style={{ fontSize: '13px', color: '#64ffda', marginLeft: '8px', fontWeight: 600 }}>{form.rating}/5</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', color: '#888' }}>Feedback *</label>
            <textarea style={{ padding: '11px 14px', borderRadius: '10px', border: errors.message ? '1px solid #ff4d6d55' : '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e8e8f0', fontSize: '14px', outline: 'none', minHeight: '120px', resize: 'none', boxSizing: 'border-box', width: '100%' }} placeholder="Share your experience..." value={form.message} onChange={e => set('message', e.target.value)} />
            {errors.message && <span style={{ color: '#ff4d6d', fontSize: '11px' }}>{errors.message}</span>}
          </div>
          <button type="submit" disabled={loading} style={{ padding: '13px', fontSize: '15px', fontWeight: 700, background: 'linear-gradient(135deg,#64ffda,#00b4d8)', color: '#0a0a0f', border: 'none', borderRadius: '12px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Submitting...' : '📤 Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
