import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import socket from '../socket.js';
import API_URL from '../config.js';

const Home = ({ isLoggedIn }) => {
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
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroContent}>
          <div style={s.livePill}>
            <span style={{ ...s.dot, background: live ? '#64ffda' : '#ff4d6d', animation: live ? 'pulse 1.5s infinite' : 'none' }} />
            {live ? 'Live — Real-time sync active' : 'Connecting...'}
          </div>
          <h1 style={s.heroTitle}>
            PCTE Lost &<br />
            <span style={s.heroGrad}>Found Portal</span>
          </h1>
          <p style={s.heroSub}>Reuniting students with their belongings through real-time community collaboration</p>

          <div style={s.heroBtns}>
            <button onClick={() => navigate('/feed')} style={s.btnPrimary}>📋 Browse Community Feed</button>
            <button onClick={() => navigate(isLoggedIn ? '/found' : '/login')} style={s.btnSecondary}>📦 Report Found Item</button>
            <button onClick={() => navigate(isLoggedIn ? '/lost' : '/login')} style={s.btnGhost}>🔍 Report Lost Item</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={s.statsSection}>
        <div style={s.statsGrid}>
          {[
            { icon: '🔍', label: 'Lost Reports', value: stats.lost, color: '#ff4d6d' },
            { icon: '📦', label: 'Found Reports', value: stats.found, color: '#64ffda' },
            { icon: '👥', label: 'Students', value: stats.users, color: '#00b4d8' },
          ].map(s2 => (
            <div key={s2.label} style={{ ...s.statCard, borderColor: s2.color + '22' }}>
              <span style={{ fontSize: '32px' }}>{s2.icon}</span>
              <span style={{ fontSize: '36px', fontWeight: 800, color: s2.color }}>{s2.value}</span>
              <span style={{ fontSize: '13px', color: '#666' }}>{s2.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>How It Works</h2>
        <div style={s.stepsGrid}>
          {[
            { n: '1', icon: '📦', title: 'Report Found', desc: 'Upload photo + set a secret verification question' },
            { n: '2', icon: '📋', title: 'Browse Feed', desc: 'All users see live community board of found items' },
            { n: '3', icon: '✋', title: 'Claim & Verify', desc: 'Answer the secret question to prove ownership' },
            { n: '4', icon: '💬', title: 'Chat & Collect', desc: 'Private chat opens — coordinate pickup securely' },
          ].map(step => (
            <div key={step.n} style={s.stepCard}>
              <div style={s.stepNum}>{step.n}</div>
              <span style={{ fontSize: '32px', margin: '12px 0 8px' }}>{step.icon}</span>
              <h3 style={s.stepTitle}>{step.title}</h3>
              <p style={s.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {recentItems.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Recent Activity</h2>
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
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button onClick={() => navigate('/feed')} style={s.btnPrimary}>View All Items →</button>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
};

const s = {
  page: { background: '#0a0a0f', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#e8e8f0' },
  hero: { position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroBg: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(100,255,218,0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(0,180,216,0.06) 0%, transparent 60%)' },
  heroContent: { position: 'relative', textAlign: 'center', padding: '60px 20px', maxWidth: '800px', animation: 'fadeUp 0.8s ease' },
  livePill: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(100,255,218,0.08)', border: '1px solid rgba(100,255,218,0.2)', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', color: '#64ffda', marginBottom: '28px' },
  dot: { width: '7px', height: '7px', borderRadius: '50%', display: 'inline-block' },
  heroTitle: { fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px', color: '#e8e8f0' },
  heroGrad: { background: 'linear-gradient(135deg, #64ffda, #00b4d8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  heroSub: { fontSize: '18px', color: '#666', margin: '0 0 40px', lineHeight: 1.6 },
  heroBtns: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary: { padding: '13px 28px', background: 'linear-gradient(135deg, #64ffda, #00b4d8)', color: '#0a0a0f', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'opacity .2s' },
  btnSecondary: { padding: '13px 28px', background: 'rgba(100,255,218,0.1)', border: '1px solid rgba(100,255,218,0.25)', color: '#64ffda', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' },
  btnGhost: { padding: '13px 28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' },
  statsSection: { padding: '0 20px 60px' },
  statsGrid: { maxWidth: '700px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  section: { padding: '60px 20px', maxWidth: '1100px', margin: '0 auto' },
  sectionTitle: { fontSize: '28px', fontWeight: 800, textAlign: 'center', marginBottom: '36px', color: '#e8e8f0' },
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  stepCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '28px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  stepNum: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#64ffda,#00b4d8)', color: '#0a0a0f', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  stepTitle: { fontSize: '16px', fontWeight: 700, color: '#e8e8f0', margin: '0 0 8px' },
  stepDesc: { fontSize: '13px', color: '#666', lineHeight: 1.6 },
  recentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
  recentCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color .2s' },
  recentImg: { width: '100%', height: '140px', objectFit: 'cover' },
  recentNoImg: { height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', background: 'rgba(255,255,255,0.02)' },
  recentBody: { padding: '12px' },
  recentName: { fontSize: '14px', fontWeight: 600, color: '#e8e8f0', marginBottom: '4px' },
  recentLoc: { fontSize: '12px', color: '#555' },
};

export default Home;
