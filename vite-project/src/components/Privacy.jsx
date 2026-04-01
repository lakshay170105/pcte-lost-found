import useSEO from '../useSEO.js';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '32px' }}>
    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#64ffda', marginBottom: '12px' }}>{title}</h2>
    <div style={{ fontSize: '14px', color: '#888', lineHeight: 1.8 }}>{children}</div>
  </div>
);

const Privacy = () => {
  useSEO('Privacy Policy | PCTE Lost & Found', 'Privacy policy for PCTE Lost & Found Portal. Learn how we collect, use, and protect your data. Contact info only shared after verified ownership.');
  return (
  <div style={s.page}>
    <div style={s.container}>
      <div style={s.hero}>
        <span style={s.heroIcon}>🔒</span>
        <h1 style={s.title}>Privacy Policy</h1>
        <p style={s.sub}>Last updated: January 2026 · PCTE Lost & Found Portal</p>
      </div>
      <div style={s.content}>
        <Section title="1. Information We Collect">
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong style={{ color: '#ccc' }}>Account info:</strong> Name, email address, password (hashed)</li>
            <li><strong style={{ color: '#ccc' }}>Item reports:</strong> Item name, description, location, date, photos</li>
            <li><strong style={{ color: '#ccc' }}>Contact info:</strong> Phone number (only shared after verified claim)</li>
            <li><strong style={{ color: '#ccc' }}>Usage data:</strong> Login timestamps, last active</li>
          </ul>
        </Section>
        <Section title="2. How We Use Your Information">
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>To match lost and found items</li>
            <li>To send real-time notifications about matches and claims</li>
            <li>To enable private chat between verified users</li>
            <li>To maintain account security</li>
          </ul>
        </Section>
        <Section title="3. Contact Information Visibility">
          Your email and phone number are <strong style={{ color: '#64ffda' }}>never shown publicly</strong>. They are only revealed inside a private chat after the claimant has correctly answered the verification question set by the finder.
        </Section>
        <Section title="4. Data Storage">
          All data is stored securely on MongoDB Atlas (cloud database). Passwords are hashed using bcrypt and never stored in plain text. Images are stored as compressed data.
        </Section>
        <Section title="5. Real-Time Communication">
          Chat messages are stored in our database to allow message history. Messages are only accessible to the two participants of a claim. Admins can view messages for moderation purposes only.
        </Section>
        <Section title="6. Data Sharing">
          We do not sell, trade, or share your personal information with third parties. Contact details are only shared between verified claim participants.
        </Section>
        <Section title="7. Cookies & Local Storage">
          We use browser local storage to maintain your login session (JWT token). No tracking cookies are used.
        </Section>
        <Section title="8. Your Rights">
          You can delete your account and all associated data by contacting us. You can also delete your own item reports from your dashboard.
        </Section>
        <Section title="9. Contact">
          For privacy concerns, contact: <a href="mailto:developbylshay@gmail.com" style={{ color: '#64ffda' }}>developbylshay@gmail.com</a>
        </Section>
      </div>
    </div>
  </div>
  );
};

const s = {
  page: { background: '#0a0a0f', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Inter, sans-serif', color: '#e8e8f0' },
  container: { maxWidth: '760px', margin: '0 auto' },
  hero: { textAlign: 'center', marginBottom: '40px' },
  heroIcon: { fontSize: '48px', display: 'block', marginBottom: '12px' },
  title: { fontSize: '32px', fontWeight: 800, margin: '0 0 8px', background: 'linear-gradient(135deg,#64ffda,#00b4d8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  sub: { color: '#555', fontSize: '13px' },
  content: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '32px' },
};

export default Privacy;
