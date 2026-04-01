import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={s.footer}>
    <div style={s.inner}>
      <div style={s.brand}>
        <img src="https://career.webindia123.com/career/institutes/aspupload/Uploads/punjab/21714/logo.jpg" alt="PCTE" style={s.logo} />
        <div>
          <div style={s.brandName}>PCTE Lost & Found</div>
          <div style={s.brandSub}>by L-SHAY · PCTE Group of Institutes, Ludhiana</div>
        </div>
      </div>

      <div style={s.cols}>
        <div style={s.col}>
          <div style={s.colTitle}>Navigate</div>
          <Link to="/" style={s.link}>Home</Link>
          <Link to="/feed" style={s.link}>Community Feed</Link>
          <Link to="/about" style={s.link}>About</Link>
          <Link to="/contact" style={s.link}>Contact</Link>
          <Link to="/feedback" style={s.link}>Feedback</Link>
        </div>
        <div style={s.col}>
          <div style={s.colTitle}>Help</div>
          <Link to="/faq" style={s.link}>FAQ</Link>
          <Link to="/support" style={s.link}>Support</Link>
          <Link to="/terms" style={s.link}>Terms & Conditions</Link>
          <Link to="/privacy" style={s.link}>Privacy Policy</Link>
        </div>
        <div style={s.col}>
          <div style={s.colTitle}>Developer</div>
          <a href="https://instagram.com/develop_by_lshay" target="_blank" rel="noreferrer" style={{ ...s.link, color: '#e1306c' }}>📸 @develop_by_lshay</a>
          <a href="mailto:developbylshay@gmail.com" style={s.link}>📧 developbylshay@gmail.com</a>
          <a href="tel:+918264105684" style={s.link}>📞 +91 8264105684</a>
          <div style={s.link}>📍 PCTE Campus, Ludhiana</div>
        </div>
      </div>
    </div>

    <div style={s.bottom}>
      <span>© 2026 PCTE Lost & Found Portal — by L-SHAY. All rights reserved.</span>
      <span style={s.bottomLinks}>
        <Link to="/terms" style={s.bottomLink}>Terms</Link>
        <span style={s.dot}>·</span>
        <Link to="/privacy" style={s.bottomLink}>Privacy</Link>
        <span style={s.dot}>·</span>
        <a href="https://instagram.com/develop_by_lshay" target="_blank" rel="noreferrer" style={s.devLink}>L-SHAY</a>
      </span>
    </div>

    <style>{`
      @media (max-width: 768px) {
        .footer-inner { flex-direction: column !important; gap: 24px !important; }
        .footer-cols { flex-direction: column !important; gap: 20px !important; }
        .footer-bottom { flex-direction: column !important; gap: 8px !important; text-align: center !important; }
      }
    `}</style>
  </footer>
);

const s = {
  footer: { background: 'rgba(0,0,0,0.6)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 20px 20px', fontFamily: 'Inter,sans-serif', color: '#e8e8f0', marginTop: 'auto' },
  inner: { maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap', marginBottom: '32px' },
  brand: { display: 'flex', alignItems: 'flex-start', gap: '12px', maxWidth: '260px' },
  logo: { width: '44px', height: '44px', borderRadius: '50%', border: '2px solid rgba(100,255,218,0.3)', objectFit: 'cover', flexShrink: 0 },
  brandName: { fontWeight: 700, fontSize: '16px', color: '#64ffda', marginBottom: '4px' },
  brandSub: { fontSize: '11px', color: '#444', lineHeight: 1.5 },
  cols: { display: 'flex', gap: '48px', flexWrap: 'wrap' },
  col: { display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '120px' },
  colTitle: { fontSize: '11px', fontWeight: 700, color: '#64ffda', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  link: { fontSize: '13px', color: '#555', textDecoration: 'none', transition: 'color .2s', cursor: 'pointer' },
  bottom: { maxWidth: '1100px', margin: '0 auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: '#333' },
  bottomLinks: { display: 'flex', alignItems: 'center', gap: '6px' },
  bottomLink: { color: '#444', textDecoration: 'none' },
  dot: { color: '#333' },
  devLink: { color: '#64ffda', textDecoration: 'none', fontWeight: 600 },
};

export default Footer;
