import useSEO from '../useSEO.js';

const About = () => {
  useSEO(
    'About — PCTE Lost & Found Portal by L-SHAY',
    'Learn about the PCTE Lost & Found Portal — built by L-SHAY (BCA, PCTE Ludhiana). Real-time item recovery with secure verification and private chat.'
  );
  return (
  <div style={s.page}>
    <div style={s.container}>
      <div style={s.hero}>
        <span style={s.heroIcon}>🎓</span>
        <h1 style={s.title}>About PCTE Lost & Found</h1>
        <p style={s.subtitle}>A real-time platform to reunite students with their belongings</p>
      </div>

      <div style={s.grid}>
        {[
          { icon: '🎯', title: 'Our Mission', text: 'Create a seamless platform where PCTE students and staff can report and recover lost items, fostering honesty and community support.' },
          { icon: '🔌', title: 'Real-Time Sync', text: 'All items update live across every device. When someone posts a found item, everyone sees it instantly — no refresh needed.' },
          { icon: '🔐', title: 'Privacy First', text: 'Contact details are hidden until ownership is verified via a secret question. Only the real owner can unlock the finder\'s contact.' },
          { icon: '💬', title: 'Private Chat', text: 'Once verified, a private chat opens between finder and owner to coordinate item collection — fully secure and real-time.' },
        ].map(card => (
          <div key={card.title} style={s.card}>
            <span style={s.cardIcon}>{card.icon}</span>
            <h3 style={s.cardTitle}>{card.title}</h3>
            <p style={s.cardText}>{card.text}</p>
          </div>
        ))}
      </div>

      <div style={s.steps}>
        <h2 style={s.sectionTitle}>How It Works</h2>
        <div style={s.stepsGrid}>
          {[
            { n: '1', icon: '📦', title: 'Report Found', text: 'Upload a photo and set a verification question to protect the item' },
            { n: '2', icon: '📋', title: 'Browse Feed', text: 'All users see the live community board of found items' },
            { n: '3', icon: '✋', title: 'Claim & Verify', text: 'Answer the secret question to prove ownership' },
            { n: '4', icon: '💬', title: 'Chat & Collect', text: 'Private chat opens — coordinate pickup with the finder securely' },
          ].map(step => (
            <div key={step.n} style={s.step}>
              <div style={s.stepNum}>{step.n}</div>
              <span style={{ fontSize: '28px', margin: '10px 0 6px' }}>{step.icon}</span>
              <h4 style={s.stepTitle}>{step.title}</h4>
              <p style={s.stepText}>{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Developer card */}
      <div style={s.devCard}>
        <div style={s.devAvatar}>L</div>
        <div style={{ flex: 1 }}>
          <div style={s.devName}>L-shay</div>
          <div style={s.devRole}>BCA Student · PCTE Group of Institutes · Ludhiana</div>
          <div style={s.devBio}>Passionate about building community-driven solutions</div>
          <div style={s.devLinks}>
            <a href="https://instagram.com/develop_by_lshay" target="_blank" rel="noreferrer" style={s.devLink}>
              📸 @develop_by_lshay
            </a>
            <a href="mailto:developbylshay@gmail.com" style={s.devLink}>
              📧 developbylshay@gmail.com
            </a>
            <a href="tel:+918264105684" style={s.devLink}>
              📞 +91 8264105684
            </a>
          </div>
        </div>
        <div style={s.devYear}>2026</div>
      </div>
    </div>
  </div>
);
};

const s = {
  page: { background: '#0a0a0f', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Inter, sans-serif', color: '#e8e8f0' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  hero: { textAlign: 'center', marginBottom: '48px' },
  heroIcon: { fontSize: '56px', display: 'block', marginBottom: '16px' },
  title: { fontSize: '36px', fontWeight: 800, margin: '0 0 10px', background: 'linear-gradient(135deg,#64ffda,#00b4d8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  subtitle: { color: '#555', fontSize: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '48px' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(100,255,218,0.08)', borderRadius: '16px', padding: '24px', textAlign: 'center' },
  cardIcon: { fontSize: '36px', display: 'block', marginBottom: '12px' },
  cardTitle: { fontSize: '15px', fontWeight: 700, color: '#64ffda', marginBottom: '8px' },
  cardText: { fontSize: '13px', color: '#666', lineHeight: 1.7 },
  steps: { marginBottom: '48px' },
  sectionTitle: { fontSize: '22px', fontWeight: 800, textAlign: 'center', marginBottom: '24px' },
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' },
  step: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '24px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  stepNum: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#64ffda,#00b4d8)', color: '#0a0a0f', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  stepTitle: { fontSize: '14px', fontWeight: 700, color: '#e8e8f0', margin: '8px 0 4px' },
  stepText: { fontSize: '12px', color: '#666', lineHeight: 1.6 },
  devCard: { background: 'linear-gradient(135deg,rgba(100,255,218,0.06),rgba(0,180,216,0.06))', border: '1px solid rgba(100,255,218,0.15)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' },
  devAvatar: { width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#64ffda,#00b4d8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 800, color: '#0a0a0f', flexShrink: 0 },
  devName: { fontSize: '20px', fontWeight: 800, color: '#e8e8f0', marginBottom: '4px' },
  devRole: { fontSize: '13px', color: '#64ffda', marginBottom: '4px' },
  devBio: { fontSize: '12px', color: '#666', marginBottom: '10px' },
  devLinks: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  devLink: { fontSize: '13px', color: '#888', textDecoration: 'none', transition: 'color .2s' },
  devYear: { fontSize: '48px', fontWeight: 800, color: 'rgba(100,255,218,0.1)', flexShrink: 0 },
};

export default About;
