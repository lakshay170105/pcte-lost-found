import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API_URL from '../config.js';

const Found = ({ user }) => {
  const [form, setForm] = useState({ name: '', description: '', location: '', dropLocation: '', date: '', yourName: '', contact: '', phone: '', verificationQuestion: '', verificationAnswer: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [modalImage, setModalImage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user) setForm(p => ({ ...p, yourName: user.name || '', contact: user.email || '' }));
  }, [user]);

  const handleImage = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    // Compress image before preview and upload
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        setImagePreview(compressed);
        // Convert back to file for upload
        canvas.toBlob(blob => setImageFile(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.7);
        setErrors(p => ({ ...p, image: '' }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.description.trim() || form.description.trim().length < 10) e.description = 'Min 10 characters';
    if (!form.location.trim()) e.location = 'Required';
    if (!form.dropLocation.trim()) e.dropLocation = 'Required';
    if (!form.date) e.date = 'Required';
    if (!form.yourName.trim()) e.yourName = 'Required';
    if (!form.contact.trim() || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.contact)) e.contact = 'Valid email required';
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) e.phone = '10-digit number required';
    if (!imagePreview) e.image = 'Photo required';
    if (form.verificationQuestion.trim() && !form.verificationAnswer.trim()) e.verificationAnswer = 'Answer required if question is set';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix the errors'); return; }
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Please login first'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name); fd.append('description', form.description);
      fd.append('location', form.location); fd.append('dropLocation', form.dropLocation);
      fd.append('date', form.date); fd.append('reporterName', form.yourName);
      fd.append('contact', form.contact); fd.append('phone', form.phone);
      if (form.verificationQuestion.trim()) { fd.append('verificationQuestion', form.verificationQuestion.trim()); fd.append('verificationAnswer', form.verificationAnswer.trim().toLowerCase()); }
      if (imageFile) fd.append('image', imageFile);

      const res = await fetch(`${API_URL}/api/found-items`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (data.success) {
        toast.success('Found item reported! We\'ll notify the owner if we find a match.');
        setSubmitted(true);
        setForm({ name: '', description: '', location: '', dropLocation: '', date: '', yourName: user?.name || '', contact: user?.email || '', phone: '', verificationQuestion: '', verificationAnswer: '' });
        setImageFile(null); setImagePreview(''); setErrors({});
        setTimeout(() => setSubmitted(false), 4000);
      } else { toast.error(data.message || 'Failed to report'); }
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: '' })); };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <span style={s.icon}>📦</span>
          <h1 style={s.title}>Report Found Item</h1>
          <p style={s.sub}>Help reunite someone with their belongings</p>
        </div>

        {submitted && <div style={s.successBanner}>✅ Report submitted! The owner will be notified if we find a match.</div>}

        <div style={s.form}>
          <div style={s.row}>
            <Field label="Item Name *" error={errors.name}>
              <input style={inp(errors.name)} placeholder="e.g. Blue backpack, iPhone 13..." value={form.name} onChange={e => set('name', e.target.value)} />
            </Field>
            <Field label="Date Found *" error={errors.date}>
              <input type="date" style={inp(errors.date)} value={form.date} max={new Date().toISOString().split('T')[0]} onChange={e => set('date', e.target.value)} />
            </Field>
          </div>

          <div style={s.row}>
            <Field label="Found Location *" error={errors.location}>
              <input style={inp(errors.location)} placeholder="Where did you find it?" value={form.location} onChange={e => set('location', e.target.value)} />
            </Field>
            <Field label="Drop Location *" error={errors.dropLocation}>
              <input style={inp(errors.dropLocation)} placeholder="Where can owner collect?" value={form.dropLocation} onChange={e => set('dropLocation', e.target.value)} />
            </Field>
          </div>

          <Field label="Description *" error={errors.description}>
            <textarea style={{ ...inp(errors.description), minHeight: '90px', resize: 'none' }} placeholder="Describe the item in detail — color, brand, marks..." value={form.description} onChange={e => set('description', e.target.value)} />
          </Field>

          <div style={s.row}>
            <Field label="Your Name *" error={errors.yourName}>
              <input style={inp(errors.yourName)} placeholder="Full name" value={form.yourName} onChange={e => set('yourName', e.target.value)} />
            </Field>
            <Field label="Email *" error={errors.contact}>
              <input type="email" style={inp(errors.contact)} placeholder="your@email.com" value={form.contact} onChange={e => set('contact', e.target.value)} />
            </Field>
          </div>

          <Field label="Phone *" error={errors.phone}>
            <input type="tel" maxLength="10" style={inp(errors.phone)} placeholder="10-digit number" value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, ''))} />
          </Field>

          {/* Photo */}
          <Field label="Item Photo *" error={errors.image}>
            <label style={s.uploadLabel}>
              <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
              {imagePreview
                ? <img src={imagePreview} alt="Preview" style={s.preview} onClick={e => { e.preventDefault(); setModalImage(imagePreview); }} />
                : <div style={s.uploadBox}><span style={{ fontSize: '32px' }}>📷</span><span style={{ color: '#555', fontSize: '13px' }}>Click to upload (max 5MB)</span></div>
              }
            </label>
          </Field>

          {/* Verification */}
          <div style={s.verifyBox}>
            <div style={s.verifyTitle}>🔐 Ownership Verification <span style={s.verifyOptional}>(Recommended)</span></div>
            <p style={s.verifyHint}>Set a question only the real owner can answer. Prevents wrong people from claiming.</p>
            <Field label="Verification Question" error={errors.verificationQuestion}>
              <input style={inp(errors.verificationQuestion)} placeholder="e.g. What color is the zipper? What sticker is on the back?" value={form.verificationQuestion} onChange={e => set('verificationQuestion', e.target.value)} />
            </Field>
            {form.verificationQuestion.trim() && (
              <div style={{ marginTop: '10px' }}>
                <Field label="Answer (case-insensitive)" error={errors.verificationAnswer}>
                  <input style={inp(errors.verificationAnswer)} placeholder="The correct answer..." value={form.verificationAnswer} onChange={e => set('verificationAnswer', e.target.value)} />
                </Field>
              </div>
            )}
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Submitting...' : '📤 Submit Report'}
          </button>
        </div>
      </div>

      {modalImage && <div style={s.modal} onClick={() => setModalImage('')}><img src={modalImage} alt="" style={s.modalImg} /></div>}
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
  card: { width: '100%', maxWidth: '700px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '36px', color: '#e8e8f0' },
  header: { textAlign: 'center', marginBottom: '28px' },
  icon: { fontSize: '44px', display: 'block', marginBottom: '12px' },
  title: { fontSize: '26px', fontWeight: 800, margin: '0 0 6px' },
  sub: { color: '#555', fontSize: '14px', margin: 0 },
  successBanner: { background: 'rgba(100,255,218,0.08)', border: '1px solid rgba(100,255,218,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#64ffda', marginBottom: '20px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  row: { display: 'flex', gap: '14px', flexWrap: 'wrap' },
  btn: { padding: '13px', fontSize: '15px', fontWeight: 700, background: 'linear-gradient(135deg,#64ffda,#00b4d8)', color: '#0a0a0f', border: 'none', borderRadius: '12px', cursor: 'pointer', marginTop: '4px' },
  uploadLabel: { cursor: 'pointer', display: 'block' },
  uploadBox: { border: '2px dashed rgba(255,255,255,0.08)', borderRadius: '12px', padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', transition: 'border-color .2s' },
  preview: { width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(100,255,218,0.2)', cursor: 'pointer' },
  verifyBox: { background: 'rgba(100,255,218,0.03)', border: '1px solid rgba(100,255,218,0.12)', borderRadius: '14px', padding: '18px' },
  verifyTitle: { fontSize: '14px', fontWeight: 700, color: '#64ffda', marginBottom: '6px' },
  verifyOptional: { fontSize: '11px', color: '#555', fontWeight: 400 },
  verifyHint: { fontSize: '12px', color: '#555', margin: '0 0 14px', lineHeight: 1.5 },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer' },
  modalImg: { maxWidth: '90%', maxHeight: '90%', borderRadius: '12px' },
};

export default Found;
