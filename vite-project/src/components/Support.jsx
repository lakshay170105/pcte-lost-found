import { useState } from 'react';
import toast from 'react-hot-toast';
import API_URL from '../config.js';
import useSEO from '../useSEO.js';

const Support = () => {
  useSEO(
    'Support Center | PCTE Lost & Found',
    'Get help with the PCTE Lost & Found Portal. Contact support, browse FAQ, or send a message directly to the developer.'
  );
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { toast.success('Support request sent!'); setForm({ name: '', email: '', subject: '', message: '' }); }
      else toast.error(data.message || 'Failed');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.hero}>
          <span style={s.heroIcon}>🛟</span>
          <h1 style={s.title}>Support Center</h1>
          <p style={s.sub}>We're here to help. Reach out anytime.</p>
        </div>
        <div style={s.grid}>
          <div style={s.cards}>
            {[
              { icon: '📧', title: 'Email Support', val: 'developbylshay@gmail.com', link: 'mailto:developbylshay@gmail.com' },
              { icon: '📞', title: 'Phone / WhatsApp', val: '+91 8264105684', link: 'tel:+918264105684' },
              { icon: '📸', title: 'Instagram', val: '@develop_by_lshay', link: 'https://instagram.com/develop_by_lshay' },
              { icon: '❓', title: 'FAQ', val: 'Browse common questions', link: '/faq' },
            ].map(c => (
              <a key={c.title} href={c.link} target={c.link.startsWith('http') ? '_blank' : '_self'} rel="noreferrer" style={s.card}>
                <span style={{ fontSize: '28px' }}>{c.icon}</span>
                <div>
                  <div style={s.cardTitle}>{c.title}</div>
                  <div style={s.cardVal}>{c.val}</div>
                </div>
              </a>
            ))}
          </div>
          <form style={s.form} onSubmit={handleSubmit}>
            <h3 style={s.formTitle}>Send a Message</h3>
            {[['name','Your Name','text'],['email','Email Address','email'],['subject','Subject','text']].map(([k,p,t]) => (
              <div key={k} style={s.field}>
                <input type={t} style={s.inp} placeholder={p} value={form[k]} onChange={e => set(k, e.target.value)} />
              </div>
            ))}
            <textarea style={{ ...s.inp, minHeight: '120px', resize: 'none' }} placeholder="Describe your issue..." value={form.message} onChange={e => set('message', e.target.value)} />
            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Sending...' : '📤 Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: { background: '#0a0a0f', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Inter, sans-serif', color: '#e8e8f0' },
  container: { maxWidth: '900px', margin: '0 auto' },
  hero: { textAlign: 'center', marginBottom: '40px' },
  heroIcon: { fontSize: '48px', display: 'block', marginBottom: '12px' },
  title: { fontSize: '32px', fontWeight: 800, margin: '0 0 8px', background: 'linear-gradient(135deg,#64ffda,#00b4d8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  sub: { color: '#555', fontSize: '15px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'start' },
  cards: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'center', textDecoration: 'none', color: '#e8e8f0', transition: 'border-color .2s' },
  cardTitle: { fontSize: '14px', fontWeight: 700, color: '#64ffda', marginBottom: '2px' },
  cardVal: { fontSize: '12px', color: '#666' },
  form: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' },
  formTitle: { fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: '#e8e8f0' },
  field: {},
  inp: { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e8e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' },
  btn: { padding: '12px', fontSize: '14px', fontWeight: 700, background: 'linear-gradient(135deg,#64ffda,#00b4d8)', color: '#0a0a0f', border: 'none', borderRadius: '10px', cursor: 'pointer' },
};

export default Support;
