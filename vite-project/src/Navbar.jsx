import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ isLoggedIn, isAdmin, onLogout }) => {
  const [open, setOpen] = useState(false);
  const [w, setW] = useState(window.innerWidth);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => { setW(window.innerWidth); if (window.innerWidth > 900) setOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const isMobile = w <= 900;
  const active = (p) => location.pathname === p;

  const lnk = (to, label) => (
    <Link
      key={to}
      to={to}
      style={{
        ...s.link,
        ...(active(to) ? s.linkActive : {}),
      }}
    >
      {label}
    </Link>
  );

  return (
    <div style={s.shell}>
      {/* ── TITLE BAR ── */}
      <div style={s.titleBar}>
        <div style={s.titleLeft}>
          <img
            src="https://career.webindia123.com/career/institutes/aspupload/Uploads/punjab/21714/logo.jpg"
            alt="PCTE Logo"
            style={s.logo}
          />
          <span style={s.titleText}>PCTE Lost &amp; Found Portal</span>
          <span style={s.titleSub}> — by L-SHAY</span>
        </div>
        <div style={s.titleBtns}>
          <button style={s.titleBtn}>_</button>
          <button style={s.titleBtn}>□</button>
          <button style={{ ...s.titleBtn, ...s.titleBtnClose }}>✕</button>
        </div>
      </div>

      {/* ── MENU BAR ── */}
      <div style={s.menuBar}>
        {isMobile ? (
          <button
            style={s.hamburgerBtn}
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            ☰ Menu
          </button>
        ) : (
          <div style={s.menuRow}>
            {lnk('/', 'Home')}
            {lnk('/feed', '📋 Feed')}
            {lnk('/about', 'About')}
            {lnk('/faq', 'FAQ')}
            {lnk('/contact', 'Contact')}
            {isLoggedIn && !isAdmin && (
              <>
                {lnk('/lost', '🔍 Report Lost')}
                {lnk('/found', '📦 Report Found')}
                {lnk('/dashboard', '📊 Dashboard')}
              </>
            )}
            {isAdmin && lnk('/admin', '🛡 Admin')}
            <div style={s.menuSep} />
            {!isLoggedIn ? (
              <Link to="/login" style={s.btnSignIn}>Sign In</Link>
            ) : (
              <button
                onClick={() => { onLogout(); navigate('/'); }}
                style={s.btnSignOut}
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── MOBILE DROPDOWN ── */}
      {isMobile && open && (
        <div style={s.mobileMenu}>
          {[
            ['/', 'Home'],
            ['/feed', '📋 Community Feed'],
            ['/about', 'About'],
            ['/faq', 'FAQ'],
            ['/contact', 'Contact'],
            ['/feedback', 'Feedback'],
            ['/support', 'Support'],
            ...(isLoggedIn && !isAdmin
              ? [['/lost', '🔍 Report Lost'], ['/found', '📦 Report Found'], ['/dashboard', '📊 Dashboard']]
              : []),
            ...(isAdmin ? [['/admin', '🛡 Admin Panel']] : []),
          ].map(([to, label]) => (
            <Link
              key={to}
              to={to}
              style={{ ...s.mobileLink, ...(active(to) ? s.mobileLinkActive : {}) }}
            >
              {label}
            </Link>
          ))}
          <div style={s.mobileSep} />
          {!isLoggedIn ? (
            <Link to="/login" style={s.mobileBtnSignIn}>Sign In</Link>
          ) : (
            <button onClick={() => { onLogout(); navigate('/'); setOpen(false); }} style={s.mobileBtnSignOut}>
              Sign Out
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const font = '"Tahoma", "MS Sans Serif", Arial, sans-serif';

const s = {
  shell: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    fontFamily: font,
    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
  },

  /* Title bar */
  titleBar: {
    background: 'linear-gradient(to right, #000080, #1084d0)',
    padding: '3px 6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    userSelect: 'none',
    cursor: 'default',
  },
  titleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 700,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  logo: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.5)',
    objectFit: 'cover',
    flexShrink: 0,
  },
  titleText: { color: '#fff', fontWeight: 700, fontSize: '13px' },
  titleSub: { color: 'rgba(255,255,255,0.65)', fontWeight: 400, fontSize: '12px' },
  titleBtns: { display: 'flex', gap: '2px', flexShrink: 0 },
  titleBtn: {
    width: '18px',
    height: '16px',
    fontSize: '9px',
    fontFamily: font,
    background: '#d4d0c8',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    boxShadow: '1px 1px 0 #fff, -1px -1px 0 #808080',
    color: '#000',
  },
  titleBtnClose: { background: '#d4d0c8' },

  /* Menu bar */
  menuBar: {
    background: '#d4d0c8',
    borderBottom: '2px solid',
    borderColor: '#808080',
    boxShadow: 'inset 0 -1px 0 #fff',
    padding: '0 4px',
  },
  menuRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    gap: '0',
    height: '28px',
  },
  link: {
    padding: '4px 8px',
    fontSize: '12px',
    fontFamily: font,
    color: '#000',
    textDecoration: 'none',
    borderRadius: '2px',
    whiteSpace: 'nowrap',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  linkActive: {
    background: '#000080',
    color: '#fff',
  },
  menuSep: {
    flex: 1,
  },
  btnSignIn: {
    padding: '3px 10px',
    fontSize: '12px',
    fontFamily: font,
    background: '#d4d0c8',
    color: '#000080',
    fontWeight: 700,
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '1px 1px 0 #fff, -1px -1px 0 #808080, 2px 2px 0 #dfdfdf, -2px -2px 0 #404040',
    marginLeft: '4px',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
  },
  btnSignOut: {
    padding: '3px 10px',
    fontSize: '12px',
    fontFamily: font,
    background: '#d4d0c8',
    color: '#800000',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '1px 1px 0 #fff, -1px -1px 0 #808080, 2px 2px 0 #dfdfdf, -2px -2px 0 #404040',
    marginLeft: '4px',
    whiteSpace: 'nowrap',
  },

  /* Hamburger */
  hamburgerBtn: {
    margin: '3px 4px',
    padding: '3px 10px',
    fontSize: '12px',
    fontFamily: font,
    background: '#d4d0c8',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '1px 1px 0 #fff, -1px -1px 0 #808080',
    color: '#000',
    display: 'block',
  },

  /* Mobile menu */
  mobileMenu: {
    background: '#d4d0c8',
    borderBottom: '2px solid #808080',
    display: 'flex',
    flexDirection: 'column',
    padding: '4px',
    gap: '1px',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  mobileLink: {
    padding: '7px 12px',
    fontSize: '13px',
    fontFamily: font,
    color: '#000',
    textDecoration: 'none',
  },
  mobileLinkActive: {
    background: '#000080',
    color: '#fff',
  },
  mobileSep: {
    height: '1px',
    background: '#808080',
    margin: '4px 0',
    boxShadow: '0 1px 0 #fff',
  },
  mobileBtnSignIn: {
    padding: '7px 12px',
    fontSize: '13px',
    fontFamily: font,
    color: '#000080',
    fontWeight: 700,
    textDecoration: 'none',
    textAlign: 'center',
    display: 'block',
    background: '#d4d0c8',
    border: 'none',
    boxShadow: '1px 1px 0 #fff, -1px -1px 0 #808080',
    margin: '2px 4px',
    cursor: 'pointer',
  },
  mobileBtnSignOut: {
    padding: '7px 12px',
    fontSize: '13px',
    fontFamily: font,
    color: '#800000',
    fontWeight: 700,
    background: '#d4d0c8',
    border: 'none',
    boxShadow: '1px 1px 0 #fff, -1px -1px 0 #808080',
    margin: '2px 4px',
    cursor: 'pointer',
    width: 'calc(100% - 8px)',
    textAlign: 'left',
  },
};

export default Navbar;
