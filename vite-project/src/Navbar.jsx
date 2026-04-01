import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ isLoggedIn, isAdmin, onLogout }) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); };
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const active = (p) => location.pathname === p;
  const lnk = (to, label) => (
    <Link key={to} to={to} style={{ ...s.link, ...(active(to) ? s.linkActive : {}) }}>{label}</Link>
  );

  return (
    <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
      <div style={s.inner}>
        <Link to="/" style={s.brand}>
          <img src="https://career.webindia123.com/career/institutes/aspupload/Uploads/punjab/21714/logo.jpg" alt="PCTE" style={s.logo} />
          <div>
            <div style={s.brandName}>PCTE Lost & Found</div>
            <div style={s.brandSub}>by L-SHAY</div>
          </div>
        </Link>

        {!isMobile && (
          <div style={s.links}>
            {lnk('/', 'Home')}
            {lnk('/feed', '📋 Feed')}
            {lnk('/about', 'About')}
            {lnk('/faq', 'FAQ')}
            {lnk('/contact', 'Contact')}
            {isLoggedIn && !isAdmin && <>{lnk('/lost', 'Report Lost')}{lnk('/found', 'Report Found')}{lnk('/dashboard', 'Dashboard')}</>}
            {isAdmin && lnk('/admin', '🛡 Admin')}
            <div style={s.divider} />
            {!isLoggedIn
              ? <Link to="/login" style={s.btnLogin}>Sign In</Link>
              : <button onClick={() => { onLogout(); navigate('/'); }} style={s.btnLogout}>Sign Out</button>
            }
          </div>
        )}

        {isMobile && (
          <button style={s.burger} onClick={() => setOpen(!open)}>
            <span style={{ ...s.bar, ...(open ? { transform: 'rotate(45deg) translate(5px,5px)' } : {}) }} />
            <span style={{ ...s.bar, ...(open ? { opacity: 0 } : {}) }} />
            <span style={{ ...s.bar, ...(open ? { transform: 'rotate(-45deg) translate(5px,-5px)' } : {}) }} />
          </button>
        )}
      </div>

      {isMobile && open && (
        <div style={s.mobileMenu}>
          {[['/', 'Home'], ['/feed', '📋 Community Feed'], ['/about', 'About'], ['/faq', 'FAQ'], ['/contact', 'Contact'], ['/feedback', 'Feedback'], ['/support', 'Support'],
            ...(isLoggedIn && !isAdmin ? [['/lost', 'Report Lost'], ['/found', 'Report Found'], ['/dashboard', 'My Dashboard']] : []),
            ...(isAdmin ? [['/admin', '🛡 Admin Panel']] : []),
          ].map(([to, label]) => (
            <Link key={to} to={to} style={{ ...s.mobileLink, ...(active(to) ? s.mobileLinkActive : {}) }}>{label}</Link>
          ))}
          <div style={s.mobileDivider} />
          {!isLoggedIn
            ? <Link to="/login" style={s.mobileBtnLogin}>Sign In</Link>
            : <button onClick={() => { onLogout(); navigate('/'); setOpen(false); }} style={s.mobileBtnLogout}>Sign Out</button>
          }
        </div>
      )}
    </nav>
  );
};

const s = {
  nav: { position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.3s', fontFamily: 'Inter, sans-serif' },
  navScrolled: { background: 'rgba(10,10,15,0.97)', borderBottom: '1px solid rgba(100,255,218,0.12)' },
  inner: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 },
  logo: { width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(100,255,218,0.3)', objectFit: 'cover' },
  brandName: { fontSize: '15px', fontWeight: 700, color: '#64ffda', lineHeight: 1.2 },
  brandSub: { fontSize: '10px', color: '#64ffda88', lineHeight: 1, fontWeight: 500, letterSpacing: '0.3px' },
  links: { display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'nowrap' },
  link: { padding: '6px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: '#888', textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap' },
  linkActive: { background: 'rgba(100,255,218,0.1)', color: '#64ffda' },
  divider: { width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 6px' },
  btnLogin: { padding: '7px 16px', borderRadius: '8px', background: 'linear-gradient(135deg,#64ffda,#00b4d8)', color: '#0a0a0f', fontWeight: 700, fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap' },
  btnLogout: { padding: '7px 14px', borderRadius: '8px', background: 'rgba(255,77,109,0.12)', border: '1px solid rgba(255,77,109,0.25)', color: '#ff4d6d', fontWeight: 600, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' },
  burger: { display: 'flex', flexDirection: 'column', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' },
  bar: { width: '22px', height: '2px', background: '#e8e8f0', borderRadius: '2px', transition: 'all 0.3s', display: 'block' },
  mobileMenu: { background: 'rgba(10,10,15,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: '2px' },
  mobileLink: { padding: '12px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#888', textDecoration: 'none' },
  mobileLinkActive: { background: 'rgba(100,255,218,0.08)', color: '#64ffda' },
  mobileDivider: { height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' },
  mobileBtnLogin: { padding: '13px', borderRadius: '10px', background: 'linear-gradient(135deg,#64ffda,#00b4d8)', color: '#0a0a0f', fontWeight: 700, fontSize: '14px', textDecoration: 'none', textAlign: 'center' },
  mobileBtnLogout: { padding: '13px', borderRadius: '10px', background: 'rgba(255,77,109,0.12)', border: '1px solid rgba(255,77,109,0.25)', color: '#ff4d6d', fontWeight: 600, fontSize: '14px', cursor: 'pointer' },
};

export default Navbar;
