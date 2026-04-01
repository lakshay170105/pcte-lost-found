const Section = ({ title, children }) => (
  <div style={{ marginBottom: '32px' }}>
    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#64ffda', marginBottom: '12px' }}>{title}</h2>
    <div style={{ fontSize: '14px', color: '#888', lineHeight: 1.8 }}>{children}</div>
  </div>
);

const Terms = () => (
  <div style={s.page}>
    <div style={s.container}>
      <div style={s.hero}>
        <span style={s.heroIcon}>📋</span>
        <h1 style={s.title}>Terms & Conditions</h1>
        <p style={s.sub}>Last updated: January 2026 · PCTE Lost & Found Portal</p>
      </div>
      <div style={s.content}>
        <Section title="1. Acceptance of Terms">
          By accessing and using the PCTE Lost & Found Portal, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use this service.
        </Section>
        <Section title="2. Eligibility">
          This platform is intended for students, faculty, and staff of PCTE Group of Institutes, Ludhiana. Users must register with a valid email address and maintain accurate account information.
        </Section>
        <Section title="3. User Responsibilities">
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>You must provide accurate information when reporting lost or found items.</li>
            <li>You must not post false claims or attempt to claim items that do not belong to you.</li>
            <li>You are responsible for all activity under your account.</li>
            <li>You must not use the platform for any illegal or harmful purpose.</li>
          </ul>
        </Section>
        <Section title="4. Verification System">
          The verification question system is designed to protect item owners. Attempting to bypass verification or providing false answers may result in account suspension.
        </Section>
        <Section title="5. Privacy of Communications">
          Private chats between users are confidential. Do not share chat content publicly. Contact information revealed in chats must only be used for item collection purposes.
        </Section>
        <Section title="6. Limitation of Liability">
          PCTE Lost & Found Portal acts as a facilitator only. We are not responsible for the actual return of items, disputes between users, or any loss arising from use of this platform.
        </Section>
        <Section title="7. Account Termination">
          We reserve the right to suspend or terminate accounts that violate these terms, post false information, or misuse the platform.
        </Section>
        <Section title="8. Changes to Terms">
          We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
        </Section>
        <Section title="9. Contact">
          For questions about these terms, contact us at <a href="mailto:developbylshay@gmail.com" style={{ color: '#64ffda' }}>developbylshay@gmail.com</a>
        </Section>
      </div>
    </div>
  </div>
);

const s = {
  page: { background: '#0a0a0f', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Inter, sans-serif', color: '#e8e8f0' },
  container: { maxWidth: '760px', margin: '0 auto' },
  hero: { textAlign: 'center', marginBottom: '40px' },
  heroIcon: { fontSize: '48px', display: 'block', marginBottom: '12px' },
  title: { fontSize: '32px', fontWeight: 800, margin: '0 0 8px', background: 'linear-gradient(135deg,#64ffda,#00b4d8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  sub: { color: '#555', fontSize: '13px' },
  content: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '32px' },
};

export default Terms;
