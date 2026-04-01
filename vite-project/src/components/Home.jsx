import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import socket from '../socket.js';
import API_URL from '../config.js';
import useSEO from '../useSEO.js';

const Home = ({ isLoggedIn }) => {
  useSEO(
    'Home — Report Lost & Found Items at PCTE Ludhiana',
    'PCTE Lost & Found Portal — Report lost items, find what was found, verify ownership and chat securely. Real-time sync across all devices. PCTE Group of Institutes, Ludhiana.'
  );
  const navigate = useNavigate();
  const [stats, setStats] = useState({ lost: 0, found: 0, users: 0 });
  const [live, setLive] = useState(false);
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/stats`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStats({ lost: d.data.stats.totalLostItems, found: d.data.stats.totalFoundItems, users: d.data.stats.totalUsers });
          const recent = [...(d.data.recent?.foundItems || []), ...(d.data.recent?.lostItems || [])];
          setRecentItems(recent.slice(0, 4));
        }
      }).catch(() => {});

    socket.on('connect', () => setLive(true));
    socket.on('disconnect', () => setLive(false));
    socket.on('lostItem:new', () => setStats(p => ({ ...p, lost: p.lost + 1 })));
    socket.on('foundItem:new', () => setStats(p => ({ ...p, found: p.found + 1 })));
    setLive(socket.connected);

    return () => { socket.off('connect'); socket.off('disconnect'); socket.off('lostItem:new'); socket.off('foundItem:new'); };
  }, []);

  return (
    <div style={s.page}>

      {/* ── STATUS BAR ── */}
      <div style={s.statusBar}>
        <div style={s.statusItem}>
          <span style={{ ...s.statusDot, background: live ? '#00aa00' : '#aa0000' }} />
          {live ? 'Connected' : 'Connecting...'}
        </div>
        <div style={s.statusItem}>Lost Items: {stats.lost}</div>
        <div style={s.statusItem}>Found Items: {stats.found}</div>
        <div style={s.statusItem}>Users: {stats.users}</div>
      </div>

      {/* ── HERO WINDOW ── */}
      <div style={s.win}>
        <div style={s.winTitleBar}>
          <div style={s.winTitleLeft}>
            <span style={s.winIcon}>🔍</span>
            <span style={s.winTitleText}>PCTE Lost &amp; Found Portal — Welcome</span>
          </div>
          <div style={s.winBtns}>
            <button style={s.winBtn}>_</button>
            <button style={s.winBtn}>□</button>
            <button style={{ ...s.winBtn, background: '#c0392b' }}>✕</button>
          </div>
        </div>
        <div style={s.winMenuBar}>
          {['File', 'Edit', 'View', 'Help'].map(m => (
            <span key={m} style={s.menuItem}>{m}</span>
          ))}
        </div>
        <div style={s.winBody}>
          <div style={s.heroContent}>
            <img
              src="https://career.webindia123.com/career/institutes/aspupload/Uploads/punjab/21714/logo.jpg"
              alt="PCTE Logo"
              style={s.heroLogo}
            />
            <h1 style={s.heroTitle}>PCTE Lost &amp; Found Portal</h1>
            <p style={s.heroSub}>Reuniting students with their belongings through real-time community collaboration</p>

            <div style={s.separator} />

            <div style={s.heroBtns}>
              <Win2kButton onClick={() => navigate('/feed')} icon="📋">Browse Community Feed</Win2kButton>
              <Win2kButton onClick={() => navigate(isLoggedIn ? '/found' : '/login')} icon="📦">Report Found Item</Win2kButton>
              <Win2kButton onClick={() => navigate(isLoggedIn ? '/lost' : '/login')} icon="🔍">Report Lost Item</Win2kButton>
            </div>
          </div>
        </div>
        <div style={s.winStatusBar}>
          <span style={s.statusBarItem}>{live ? '✓ Real-time sync active' : '⌛ Connecting...'}</span>
          <span style={s.statusBarItem}>PCTE Group of Institutes, Ludhiana</span>
        </div>
      </div>

      {/* ── STATS PANEL ── */}
      <div style={s.statsRow}>
        {[
          { icon: '🔍', label: 'Lost Reports', value: stats.lost },
          { icon: '📦', label: 'Found Reports', value: stats.found },
          { icon: '👥', label: 'Registered Students', value: stats.users },
        ].map(item => (
          <div key={item.label} style={s.statBox}>
            <div style={s.statBoxTitle}>
              <span>{item.icon}</span> {item.label}
            </div>
            <div style={s.statBoxBody}>
              <span style={s.statValue}>{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={s.win}>
        <div style={s.winTitleBar}>
          <div style={s.winTitleLeft}>
            <span style={s.winIcon}>❓</span>
            <span style={s.winTitleText}>How It Works — Help &amp; Information</span>
          </div>
          <div style={s.winBtns}>
            <button style={s.winBtn}>_</button>
            <button style={s.winBtn}>□</button>
          </div>
        </div>
        <div style={s.winBody}>
          <div style={s.stepsGrid}>
            {[
              { n: '1', icon: '📦', title: 'Report Found Item', desc: 'Upload a photo and set a secret verification question so only the real owner can claim it.' },
              { n: '2', icon: '📋', title: 'Browse Community Feed', desc: 'All registered users can see the live board of found items in real time.' },
              { n: '3', icon: '✋', title: 'Claim & Verify', desc: 'Answer the secret question correctly to prove ownership of the item.' },
              { n: '4', icon: '💬', title: 'Chat & Collect', desc: 'A private chat window opens so you can coordinate a safe pickup on campus.' },
            ].map(step => (
              <div key={step.n} style={s.stepCard}>
                <div style={s.stepCardTitle}>
                  <div style={s.stepNum}>{step.n}</div>
                  <span style={s.stepIcon}>{step.icon}</span>
                  <strong style={s.stepTitle}>{step.title}</strong>
                </div>
                <div style={s.stepDesc}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RECENT ACTIVITY ── */}
      {recentItems.length > 0 && (
        <div style={s.win}>
          <div style={s.winTitleBar}>
            <div style={s.winTitleLeft}>
              <span style={s.winIcon}>📂</span>
              <span style={s.winTitleText}>Recent Activity — C:\PCTE\LostFound\Recent</span>
            </div>
            <div style={s.winBtns}>
              <button style={s.winBtn}>_</button>
              <button style={s.winBtn}>□</button>
            </div>
          </div>
          <div style={s.winMenuBar}>
            <span style={s.menuItem}>File</span>
            <span style={s.menuItem}>Edit</span>
            <span style={s.menuItem}>View</span>
            <span style={s.menuItem}>Favorites</span>
            <span style={s.menuItem}>Tools</span>
            <span style={s.menuItem}>Help</span>
          </div>
          {/* Explorer-style toolbar */}
          <div style={s.explorerToolbar}>
            <Win2kButton small onClick={() => navigate('/feed')} icon="⬅">Back</Win2kButton>
            <Win2kButton small onClick={() => navigate('/feed')} icon="➡">Forward</Win2kButton>
            <div style={s.toolbarSep} />
            <Win2kButton small onClick={() => navigate('/feed')} icon="🏠">Home</Win2kButton>
            <Win2kButton small onClick={() => navigate('/feed')} icon="🔄">Refresh</Win2kButton>
          </div>
          <div style={s.winBody}>
            <div style={s.recentGrid}>
              {recentItems.map((item, i) => (
                <div key={i} style={s.recentCard} onClick={() => navigate('/feed')}>
                  {item.image?.url
                    ? <img src={item.image.url} alt={item.name} style={s.recentImg} />
                    : <div style={s.recentNoImg}>📦</div>
                  }
                  <div style={s.recentBody}>
                    <div style={s.recentName}>{item.name}</div>
                    <div style={s.recentLoc}>📍 {item.location}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '14px', textAlign: 'right' }}>
              <Win2kButton onClick={() => navigate('/feed')} icon="📋">View All Items in Feed</Win2kButton>
            </div>
          </div>
          <div style={s.winStatusBar}>
            <span style={s.statusBarItem}>{recentItems.length} object(s)</span>
            <span style={s.statusBarItem}>Double-click to open</span>
          </div>
        </div>
      )}

      {/* ── FOOTER NOTE ── */}
      <div style={s.footerNote}>
        © 2026 PCTE Lost &amp; Found Portal — by L-SHAY. All rights reserved. &nbsp;|&nbsp; PCTE Group of Institutes, Ludhiana
      </div>

      <style>{`
        @keyframes blink { 0%,49%{opacity:1}50%,100%{opacity:0} }
        @media(max-width:768px){
          .win2k-steps { grid-template-columns: 1fr !important; }
          .win2k-stats { flex-direction: column !important; }
          .win2k-hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .win2k-recent { grid-template-columns: 1fr 1fr !important; }
        }
        @media(max-width:480px){
          .win2k-recent { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

/* ─── Win2k Button Component ─── */
const Win2kButton = ({ children, onClick, icon, small }) => {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: small ? '3px 8px' : '6px 14px',
        fontSize: small ? '12px' : '13px',
        fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
        fontWeight: 400,
        color: '#000',
        background: pressed ? '#bdbdbd' : '#d4d0c8',
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
        minWidth: small ? 'auto' : '120px',
        justifyContent: 'center',
        boxShadow: pressed
          ? 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #ffffff, inset 2px 2px 0 #808080, inset -2px -2px 0 #dfdfdf'
          : '1px 1px 0 #ffffff, -1px -1px 0 #808080, 2px 2px 0 #dfdfdf, -2px -2px 0 #404040',
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

const s = {
  page: {
    background: '#008080',
    minHeight: '100vh',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
    fontSize: '13px',
    color: '#000',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  /* Status bar at top */
  statusBar: {
    background: '#d4d0c8',
    border: '1px solid #808080',
    padding: '3px 10px',
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    fontSize: '11px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
    boxShadow: 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080',
  },
  statusItem: { display: 'flex', alignItems: 'center', gap: '5px' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', border: '1px solid #444' },

  /* Window chrome */
  win: {
    background: '#d4d0c8',
    border: '2px solid',
    borderColor: '#ffffff #808080 #808080 #ffffff',
    boxShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
  },
  winTitleBar: {
    background: 'linear-gradient(to right, #000080, #1084d0)',
    padding: '3px 6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    userSelect: 'none',
    cursor: 'default',
  },
  winTitleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  winIcon: { fontSize: '14px', flexShrink: 0 },
  winTitleText: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  winBtns: { display: 'flex', gap: '2px', flexShrink: 0 },
  winBtn: {
    width: '18px',
    height: '16px',
    fontSize: '9px',
    fontFamily: '"Tahoma", Arial, sans-serif',
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
  winMenuBar: {
    background: '#d4d0c8',
    borderBottom: '1px solid #a0a0a0',
    padding: '2px 4px',
    display: 'flex',
    gap: '0',
    fontSize: '12px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  },
  menuItem: {
    padding: '2px 8px',
    cursor: 'pointer',
    borderRadius: '2px',
  },
  winBody: {
    background: '#ffffff',
    padding: '16px',
    flex: 1,
  },
  winStatusBar: {
    background: '#d4d0c8',
    borderTop: '1px solid #a0a0a0',
    padding: '2px 8px',
    display: 'flex',
    gap: '0',
    fontSize: '11px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  },
  statusBarItem: {
    borderRight: '1px solid #808080',
    paddingRight: '12px',
    marginRight: '12px',
    color: '#333',
  },

  /* Hero */
  heroContent: { textAlign: 'center', padding: '10px 0 4px' },
  heroLogo: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    margin: '0 auto 10px',
    border: '2px solid #000080',
    display: 'block',
    objectFit: 'cover',
  },
  heroTitle: {
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
    fontSize: '22px',
    fontWeight: 700,
    color: '#000080',
    margin: '0 0 8px',
    textShadow: '1px 1px 0 #c0c0c0',
  },
  heroSub: {
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
    fontSize: '13px',
    color: '#444',
    margin: '0 0 12px',
  },
  separator: {
    height: '2px',
    background: 'linear-gradient(to right, transparent, #808080, transparent)',
    margin: '12px auto',
    maxWidth: '400px',
  },
  heroBtns: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    className: 'win2k-hero-btns',
  },

  /* Stats */
  statsRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  statBox: {
    flex: '1 1 180px',
    border: '2px solid',
    borderColor: '#ffffff #808080 #808080 #ffffff',
    background: '#d4d0c8',
    boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
  },
  statBoxTitle: {
    background: 'linear-gradient(to right, #000080, #1084d0)',
    color: '#fff',
    padding: '3px 8px',
    fontSize: '12px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  },
  statBoxBody: {
    background: '#fff',
    padding: '16px',
    textAlign: 'center',
    boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.15)',
  },
  statValue: {
    fontSize: '36px',
    fontWeight: 700,
    color: '#000080',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
    display: 'block',
  },

  /* Steps */
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    className: 'win2k-steps',
  },
  stepCard: {
    border: '2px solid',
    borderColor: '#ffffff #808080 #808080 #ffffff',
    background: '#d4d0c8',
    padding: '0',
    boxShadow: '1px 1px 3px rgba(0,0,0,0.3)',
  },
  stepCardTitle: {
    background: '#d4d0c8',
    borderBottom: '1px solid #a0a0a0',
    padding: '6px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stepNum: {
    width: '20px',
    height: '20px',
    background: '#000080',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    flexShrink: 0,
    fontFamily: '"Tahoma", Arial, sans-serif',
    boxShadow: '1px 1px 0 #fff, -1px -1px 0 #808080',
  },
  stepIcon: { fontSize: '18px' },
  stepTitle: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#000',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  },
  stepDesc: {
    padding: '8px 10px',
    fontSize: '12px',
    color: '#333',
    background: '#fff',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
    lineHeight: 1.5,
    boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)',
  },

  /* Explorer toolbar */
  explorerToolbar: {
    background: '#d4d0c8',
    borderBottom: '1px solid #a0a0a0',
    padding: '3px 6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  toolbarSep: {
    width: '2px',
    height: '22px',
    background: '#a0a0a0',
    margin: '0 3px',
    boxShadow: '1px 0 0 #fff',
  },

  /* Recent */
  recentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '10px',
    className: 'win2k-recent',
  },
  recentCard: {
    border: '2px solid',
    borderColor: '#ffffff #808080 #808080 #ffffff',
    background: '#d4d0c8',
    cursor: 'pointer',
    boxShadow: '1px 1px 2px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    transition: 'box-shadow 0.1s',
  },
  recentImg: { width: '100%', height: '120px', objectFit: 'cover', display: 'block' },
  recentNoImg: {
    height: '90px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    background: '#fff',
    boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.15)',
  },
  recentBody: { padding: '6px 8px' },
  recentName: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#000',
    marginBottom: '2px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  recentLoc: {
    fontSize: '11px',
    color: '#555',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  },

  /* Footer note */
  footerNote: {
    background: '#d4d0c8',
    border: '2px solid',
    borderColor: '#ffffff #808080 #808080 #ffffff',
    padding: '5px 12px',
    fontSize: '11px',
    color: '#333',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
    textAlign: 'center',
    boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  },
};

export default Home;
