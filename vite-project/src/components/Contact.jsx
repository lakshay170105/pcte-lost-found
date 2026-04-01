import { useState } from 'react';
import toast from 'react-hot-toast';
import API_URL from '../config.js';
import useSEO from '../useSEO.js';

const Contact = () => {
  useSEO(
    'Contact Us | PCTE Lost & Found Portal',
    'Contact the PCTE Lost & Found team. Reach out for help, report issues, or get support. Email: developbylshay@gmail.com'
  );
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim() || form.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Message sent successfully!');
        setForm({ name: '', email: '', subject: '', message: '' });
        setErrors({});
      } else {
        toast.error(data.message || 'Failed to send');
      }
    } catch {
      toast.error('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.hero}>
          <span style={s.heroIcon}>📞</span>
          <h1 style={s.title}>Contact Us</h1>
          <p style={s.subtitle}>Have questions? We'd love to hear from you</p>
        </div>

        <div style={s.layout}>
          {/* Info */}
          <div style={s.info}>
            {[
              { icon: '📧', label: 'Email', value: 'developbylshay@gmail.com' },
              { icon: '📞', label: 'Phone', value: '+91 8264105684' },
              { icon: '📍', label: 'Address', value: 'PCTE Group of Institutes, Ludhiana, Punjab' },
              { icon: '🕐', label: 'Hours', value: 'Mon–Sat, 9 AM – 5 PM' },
            ].map(item => (
              <div key={item.label} style={s.infoItem}>
                <span style={s.infoIcon}>{item.icon}</span>
                <div>
                  <div style={s.infoLabel}>{item.label}</div>
                  <div style={s.infoValue}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form style={s.form} onSubmit={handleSubmit}>
            <div style={s.row}>
              <Field label="Your Name *" error={errors.name}>
                <input name="name" style={inp(errors.name)} placeholder="Full name" value={form.name} onChange={handleChange} />
              </Field>
              <Field label="Email *" error={errors.email}>
                <input name="email" type="email" style={inp(errors.email)} placeholder="you@example.com" value={form.email} onChange={handleChange} />
              </Field>
            </div>
            <Field label="Subject *" error={errors.subject}>
              <input name="subject" style={inp(errors.subject)} placeholder="What's this about?" value={form.subject} onChange={handleChange} />
            </Field>
            <Field label="Message *" error={errors.message}>
              <textarea name="message" style={{ ...inp(errors.message), minHeight: '120px', resize: 'none' }} placeholder="Your message..." value={form.message} onChange={handleChange} />
            </Field>
            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Sending...' : '📤 Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, error, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
    <label style={{ fontSize: '12px', color: '#aaa', fontWeight: 500 }}>{label}</label>
    {children}
    {error && <span style={{ color: '#ff4d6d', fontSize: '12px' }}>{error}</span>}
  </div>
);

const inp = (err) => ({
  padding: '11px 14px', borderRadius: '10px', width: '100%', boxSizing: 'border-box',
  border: `1px solid ${err ? '#ff4d6d' : 'rgba(255,255,255,0.12)'}`,
  background: 'rgba(255,255,255,0.06)', color: '#f4f4f4', fontSize: '14px', outline: 'none',
});

const s = {
  page: { background: 'linear-gradient(135deg, #0f0c29, #1a1a2e, #16213e)', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Poppins, sans-serif', color: '#f4f4f4' },
  container: { maxWidth: '960px', margin: '0 auto' },
  hero: { textAlign: 'center', marginBottom: '40px' },
  heroIcon: { fontSize: '48px', display: 'block', marginBottom: '12px' },
  title: { fontSize: '32px', fontWeight: 800, margin: '0 0 8px', background: 'linear-gradient(135deg, #64ffda, #00b4d8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: '#aaa', fontSize: '15px' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px', alignItems: 'start' },
  info: { display: 'flex', flexDirection: 'column', gap: '12px' },
  infoItem: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start' },
  infoIcon: { fontSize: '24px', flexShrink: 0 },
  infoLabel: { fontSize: '11px', color: '#64ffda', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' },
  infoValue: { fontSize: '13px', color: '#ccc', lineHeight: 1.5 },
  form: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' },
  row: { display: 'flex', gap: '14px', flexWrap: 'wrap' },
  btn: { padding: '13px', fontSize: '15px', fontWeight: 700, background: 'linear-gradient(135deg, #64ffda, #00b4d8)', color: '#0f0c29', border: 'none', borderRadius: '12px', cursor: 'pointer' },
};

export default Contact;
