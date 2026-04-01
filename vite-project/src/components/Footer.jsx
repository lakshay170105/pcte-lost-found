import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={s.footer}>
    {/* Title bar */}
    <div style={s.titleBar}>
      <div style={s.titleLeft}>
        <img
          src="https://career.webindia123.com/career/institutes/aspupload/Uploads/punjab/21714/logo.jpg"
          alt="PCTE"
          style={s.logo}
        />
        <span style={s.titleText}>PCTE Lost &amp; Found — Footer</span>
      </div>
    </div>

    {/* Body */}
    <div style={s.body}>
      <div style={s.cols}>
        {/* Navigate */}
        <div style={s.col}>
          <div style={s.colTitle}>Navigate</div>
          <div style={s.colLinks}>
            <Link to="/" style={s.link}>Home</Link>
            <Link to="/feed" style={s.link}>Community Feed</Link>
            <Link to="/about" style={s.link}>About</Link>
            <Link to="/contact" style={s.link}>Contact</Link>
            <Link to="/feedback" style={s.link}>Feedback</Link>
          </div>
        </div>

        {/* Help */}
        <div style={s.col}>
          <div style={s.colTitle}>Help &amp; Legal</div>
          <div style={s.colLinks}>
            <Link to="/faq" style={s.link}>FAQ</Link>
            <Link to="/support" style={s.link}>Support</Link>
            <Link to="/terms" style={s.link}>Terms &amp; Conditions</Link>
            <Link to="/privacy" style={s.link}>Privacy Policy</Link>
          </div>
        </div>

        {/* Developer */}
        <div style={s.col}>
          <div style={s.colTitle}>Developer Contact</div>
          <div style={s.colLinks}>
            <a href="https://instagram.com/develop_by_lshay" target="_blank" rel="noreferrer" style={{ ...s.link, color: '#800080' }}>📸 @develop_by_lshay</a>
            <a href="mailto:developbylshay@gmail.com" style={s.link}>📧 developbylshay@gmail.com</a>
            <span style={s.link}>📍 PCTE Campus, Ludhiana</span>
          </div>
        </div>
      </div>
    </div>

    {/* Status bar */}
    <div style={s.statusBar}>
      <span style={s.statusItem}>© 2026 PCTE Lost &amp; Found Portal — by L-SHAY. All rights reserved.</span>
      <span style={{ ...s.statusItem, display: 'flex', gap: '6px', alignItems: 'center' }}>
        <Link to="/terms" style={s.bottomLink}>Terms</Link>
        <span>·</span>
        <Link to="/privacy" style={s.bottomLink}>Privacy</Link>
        <span>·</span>
        <a href="https://instagram.com/develop_by_lshay" target="_blank" rel="noreferrer" style={{ ...s.bottomLink, color: '#000080', fontWeight: 700 }}>L-SHAY</a>
      </span>
    </div>
  </footer>
);

const font = '"Tahoma", "MS Sans Serif", Arial, sans-serif';

const s = {
  footer: {
    background: '#d4d0c8',
    border: '2px solid',
    borderColor: '#ffffff #808080 #808080 #ffffff',
    boxShadow: '0 -2px 6px rgba(0,0,0,0.3)',
    marginTop: '10px',
    fontFamily: font,
  },
  titleBar: {
    background: 'linear-gradient(to right, #000080, #1084d0)',
    padding: '3px 8px',
    display: 'flex',
    alignItems: 'center',
    userSelect: 'none',
  },
  titleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
  },
  logo: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.5)',
    objectFit: 'cover',
    flexShrink: 0,
  },
  titleText: { color: '#fff', fontWeight: 700, fontSize: '12px' },
  body: {
    background: '#fff',
    padding: '16px 20px',
    boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.1)',
  },
  cols: {
    display: 'flex',
    gap: '40px',
    flexWrap: 'wrap',
    maxWidth: '900px',
    margin: '0 auto',
  },
  col: { flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: '6px' },
  colTitle: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#000080',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    borderBottom: '1px solid #a0a0a0',
    paddingBottom: '4px',
    marginBottom: '4px',
    fontFamily: font,
  },
  colLinks: { display: 'flex', flexDirection: 'column', gap: '3px' },
  link: {
    fontSize: '12px',
    color: '#000080',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontFamily: font,
  },
  statusBar: {
    background: '#d4d0c8',
    borderTop: '2px solid',
    borderColor: '#808080',
    boxShadow: 'inset 0 1px 0 #fff',
    padding: '4px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
    fontSize: '11px',
    fontFamily: font,
    color: '#333',
  },
  statusItem: { fontSize: '11px', fontFamily: font, color: '#333' },
  bottomLink: { color: '#000080', textDecoration: 'underline', fontSize: '11px', fontFamily: font },
};

export default Footer;
