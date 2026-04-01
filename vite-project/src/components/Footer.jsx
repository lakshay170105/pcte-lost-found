import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={s.footer}>
    <div style={s.inner}>
      <div style={s.brand}>
        <img src="https://career.webindia123.com/career/institutes/aspupload/Uploads/punjab/21714/logo.jpg" alt="PCTE" style={s.logo} />
        <div>
          <div style={s.brandName}>PCTE Lost & Found</div>
          <div style={s.brandSub}>Reuniting students with their belongings</div>
        </div>
      </div>

      <div style={s.links}>
        <div style={s.linkGroup}>
          <div style={s.linkTitle}>Navigate</div>
          {[['/', 'Home'], ['/feed', 'Community Feed'], ['/about', 'About'], ['/contact', 'Contact'], ['/feedback', 'Feedback']].map(([to, label]) => (
            <Link key={to} to={to} style={s.link}>{label}</Link>
          ))}
        </div>
        <div style={s.linkGroup}>
          <div style={s.linkTitle}>Contact</div>
          <div style={s.contactItem}>📧 developbylshay@gmail.com</div>
          <div style={s.contactItem}>📍 PCTE Campus, Ludhiana</div>
          <a href="https://instagram.com/develop_by_lshay" target="_blank" rel="noreferrer" style={{ ...s.contactItem, color: '#e1306c', textDecoration: 'none' }}>
            📸 @develop_by_lshay
          </a>
        </div>
      </div>
    </div>

    <div style={s.bottom}>
      <span>© 2026 PCTE Lost & Found Portal. All rights reserved.</span>
      <span>
        Developed by{' '}
        <a href="https://instagram.com/develop_by_lshay" target="_blank" rel="noreferrer" style={s.devLink}>
          L-shay
        </a>
        {' '}· BCA, PCTE
      </span>
    </div>
  </footer>
);

const s = {
  footer: { background: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 20px 20px', fontFamily: 'Inter, sans-serif', color: '#e8e8f0' },
  inner: { maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap', marginBottom: '30px' },
  brand: { display: 'flex', alignItems: 'center', gap: '12px' },
  logo: { width: '44px', height: '44px', borderRadius: '50%', border: '2px solid rgba(100,255,218,0.3)', objectFit: 'cover' },
  brandName: { fontWeight: 700, fontSize: '16px', color: '#64ffda' },
  brandSub: { fontSize: '12px', color: '#555', marginTop: '2px' },
  links: { display: 'flex', gap: '48px', flexWrap: 'wrap' },
  linkGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  linkTitle: { fontSize: '11px', fontWeight: 700, color: '#64ffda', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  link: { fontSize: '13px', color: '#666', textDecoration: 'none' },
  contactItem: { fontSize: '13px', color: '#666' },
  bottom: { maxWidth: '1100px', margin: '0 auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: '#444' },
  devLink: { color: '#64ffda', textDecoration: 'none', fontWeight: 600 },
};

export default Footer;
