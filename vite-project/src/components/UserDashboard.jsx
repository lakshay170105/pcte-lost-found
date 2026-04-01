import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import socket from '../socket.js';
import API_URL from '../config.js';
import ClaimModal from './ClaimModal.jsx';

const statusColor = { active: '#64ffda', available: '#64ffda', found: '#ff9800', claimed: '#ff9800', closed: '#666', returned: '#666' };

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [incomingClaims, setIncomingClaims] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [tab, setTab] = useState('overview');
  const [modalImage, setModalImage] = useState(null);
  const [openClaim, setOpenClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [lr, fr, ir, mr] = await Promise.all([
        fetch(`${API_URL}/api/lost-items/my-items`, auth),
        fetch(`${API_URL}/api/found-items/my-items`, auth),
        fetch(`${API_URL}/api/claims/incoming`, auth),
        fetch(`${API_URL}/api/claims/my-claims`, auth),
      ]);
      const [ld, fd, id, md] = await Promise.all([lr.json(), fr.json(), ir.json(), mr.json()]);
      if (ld.success) setLostItems(ld.data);
      if (fd.success) setFoundItems(fd.data);
      if (id.success) setIncomingClaims(id.data);
      if (md.success) setMyClaims(md.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('loggedInUser'));
    setUser(u);
    fetchAll();

    socket.on('lostItem:new', () => fetchAll());
    socket.on('foundItem:new', () => fetchAll());
    socket.on('lostItem:deleted', ({ id }) => setLostItems(p => p.filter(i => i._id !== id)));
    socket.on('foundItem:deleted', ({ id }) => setFoundItems(p => p.filter(i => i._id !== id)));
    socket.on('claim:new', ({ itemName, claimantName }) => {
      toast(`✋ ${claimantName} claimed "${itemName}"`, { icon: '🔔', duration: 6000 });
      fetchAll();
    });
    socket.on('claim:verified', ({ claimantName, itemName }) => {
      toast.success(`✅ ${claimantName} verified ownership of "${itemName}"`);
      fetchAll();
    });

    return () => { socket.off('lostItem:new'); socket.off('foundItem:new'); socket.off('lostItem:deleted'); socket.off('foundItem:deleted'); socket.off('claim:new'); socket.off('claim:verified'); };
  }, [fetchAll]);

  const deleteItem = async (type, id) => {
    if (!confirm('Delete this item?')) return;
    try {
      const res = await fetch(`${API_URL}/api/${type}-items/${id}`, { method: 'DELETE', ...auth });
      const data = await res.json();
      if (data.success) {
        toast.success('Deleted');
        if (type === 'lost') setLostItems(p => p.filter(i => i._id !== id));
        else setFoundItems(p => p.filter(i => i._id !== id));
      } else toast.error(data.message);
    } catch { toast.error('Failed'); }
  };

  const totalClaims = incomingClaims.length + myClaims.length;

  if (loading) return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', color: '#555', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid rgba(100,255,218,0.1)', borderTop: '3px solid #64ffda', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p>Loading dashboard...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Profile header */}
        <div style={s.profileCard}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div style={s.profileInfo}>
            <h1 style={s.profileName}>{user?.name || 'User'}</h1>
            <p style={s.profileEmail}>{user?.email}</p>
          </div>
          <div style={s.liveBadge}>
            <span style={s.liveDot} />
            Live
          </div>
          <button onClick={fetchAll} style={s.refreshBtn} title="Refresh">↻</button>
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          {[
            { label: 'Lost Reports', value: lostItems.length, icon: '🔍', color: '#ff4d6d' },
            { label: 'Found Reports', value: foundItems.length, icon: '📦', color: '#64ffda' },
            { label: 'Claims', value: totalClaims, icon: '✋', color: '#ff9800' },
            { label: 'Resolved', value: [...lostItems, ...foundItems].filter(i => ['found', 'returned', 'claimed'].includes(i.status)).length, icon: '✅', color: '#4caf50' },
          ].map(st => (
            <div key={st.label} style={{ ...s.statCard, borderColor: st.color + '22' }}>
              <span style={{ fontSize: '24px' }}>{st.icon}</span>
              <span style={{ fontSize: '28px', fontWeight: 800, color: st.color }}>{st.value}</span>
              <span style={{ fontSize: '11px', color: '#555' }}>{st.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'lost', label: `🔍 Lost (${lostItems.length})` },
            { id: 'found', label: `📦 Found (${foundItems.length})` },
            { id: 'claims', label: `✋ Claims ${totalClaims > 0 ? `(${totalClaims})` : ''}` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ ...s.tab, ...(tab === t.id ? s.tabActive : {}) }}>{t.label}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div style={s.overviewGrid}>
            <MiniList title="Recent Lost Reports" items={lostItems.slice(0, 5)} emptyText="No lost items yet" />
            <MiniList title="Recent Found Reports" items={foundItems.slice(0, 5)} emptyText="No found items yet" />
          </div>
        )}

        {/* Lost Items */}
        {tab === 'lost' && (
          <ItemGrid items={lostItems} type="lost" onDelete={deleteItem} onImage={setModalImage} emptyIcon="🔍" />
        )}

        {/* Found Items */}
        {tab === 'found' && (
          <ItemGrid items={foundItems} type="found" onDelete={deleteItem} onImage={setModalImage} emptyIcon="📦" />
        )}

        {/* Claims */}
        {tab === 'claims' && (
          <ClaimsSection
            incoming={incomingClaims}
            mine={myClaims}
            currentUser={user}
            onOpen={setOpenClaim}
            onRefresh={fetchAll}
          />
        )}
      </div>

      {modalImage && <div style={s.modal} onClick={() => setModalImage(null)}><img src={modalImage} alt="" style={s.modalImg} /></div>}
      {openClaim && openClaim.foundItem && (
        <ClaimModal
          item={{ ...openClaim.foundItem, _id: openClaim.foundItem._id || openClaim.foundItem }}
          currentUser={user}
          onClose={() => { setOpenClaim(null); fetchAll(); }}
          existingClaimId={openClaim._id}
        />
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
};

const MiniList = ({ title, items, emptyText }) => (
  <div style={ml.card}>
    <h3 style={ml.title}>{title}</h3>
    {items.length === 0
      ? <p style={ml.empty}>{emptyText}</p>
      : items.map(item => (
        <div key={item._id} style={ml.row}>
          <span style={ml.name}>{item.name}</span>
          <span style={{ ...ml.badge, background: (statusColor[item.status] || '#555') + '22', color: statusColor[item.status] || '#555' }}>{item.status}</span>
        </div>
      ))
    }
  </div>
);

const ItemGrid = ({ items, type, onDelete, onImage, emptyIcon }) => (
  items.length === 0
    ? <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}><div style={{ fontSize: '48px' }}>{emptyIcon}</div><p style={{ marginTop: '12px' }}>No {type} items yet</p></div>
    : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
      {items.map(item => (
        <div key={item._id} style={ic.card}>
          {item.image?.url && <img src={item.image.url} alt={item.name} style={ic.img} onClick={() => onImage(item.image.url)} />}
          <div style={ic.body}>
            <div style={ic.topRow}>
              <h3 style={ic.name}>{item.name}</h3>
              <span style={{ ...ic.badge, background: (statusColor[item.status] || '#555') + '22', color: statusColor[item.status] || '#555' }}>{item.status}</span>
            </div>
            <p style={ic.detail}>📍 {item.location}</p>
            <p style={ic.detail}>📅 {new Date(item.date).toLocaleDateString('en-IN')}</p>
            <p style={ic.desc}>{item.description?.slice(0, 80)}...</p>
            <div style={ic.footer}>
              <span style={ic.time}>{new Date(item.createdAt).toLocaleDateString('en-IN')}</span>
              <button onClick={() => onDelete(type, item._id)} style={ic.delBtn}>🗑 Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
);

const ClaimsSection = ({ incoming, mine, currentUser, onOpen, onRefresh }) => {
  const [sub, setSub] = useState('incoming');
  const claims = sub === 'incoming' ? incoming : mine;
  const vColor = { pending: '#ff9800', verified: '#4caf50', rejected: '#ff4d6d' };

  return (
    <div>
      <div style={cs.subTabs}>
        <button onClick={() => setSub('incoming')} style={{ ...cs.subTab, ...(sub === 'incoming' ? cs.subTabActive : {}) }}>📥 Incoming ({incoming.length})</button>
        <button onClick={() => setSub('mine')} style={{ ...cs.subTab, ...(sub === 'mine' ? cs.subTabActive : {}) }}>📤 My Claims ({mine.length})</button>
      </div>
      {claims.length === 0
        ? <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}><div style={{ fontSize: '40px' }}>✋</div><p style={{ marginTop: '12px' }}>No {sub === 'incoming' ? 'incoming claims' : 'claims made'} yet</p></div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {claims.map(claim => (
            <div key={claim._id} style={cs.card}>
              <div style={cs.cardLeft}>
                {claim.foundItem?.image?.url && <img src={claim.foundItem.image.url} alt="" style={cs.thumb} />}
                <div>
                  <div style={cs.itemName}>{claim.foundItem?.name || 'Unknown item'}</div>
                  <div style={cs.meta}>{sub === 'incoming' ? `Claimed by: ${claim.claimant?.name}` : `Finder: ${claim.finder?.name}`}</div>
                  <div style={cs.meta}>📅 {new Date(claim.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
              <div style={cs.cardRight}>
                <span style={{ ...cs.badge, background: (vColor[claim.verificationStatus] || '#555') + '22', color: vColor[claim.verificationStatus] || '#555' }}>{claim.verificationStatus}</span>
                <button onClick={() => onOpen(claim)} style={cs.openBtn}>
                  {claim.verificationStatus === 'verified' ? '💬 Chat' : '👁 View'}
                </button>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

const s = {
  page: { background: '#0a0a0f', minHeight: '100vh', padding: '30px 20px', fontFamily: 'Inter, sans-serif', color: '#e8e8f0' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  profileCard: { display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px', marginBottom: '20px', flexWrap: 'wrap' },
  avatar: { width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#64ffda,#00b4d8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 800, color: '#0a0a0f', flexShrink: 0 },
  profileInfo: { flex: 1 },
  profileName: { margin: 0, fontSize: '20px', fontWeight: 700 },
  profileEmail: { margin: '3px 0 0', fontSize: '13px', color: '#555' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64ffda', background: 'rgba(100,255,218,0.07)', border: '1px solid rgba(100,255,218,0.15)', borderRadius: '20px', padding: '5px 12px' },
  liveDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#64ffda', display: 'inline-block', animation: 'pulse 1.5s infinite' },
  refreshBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid', borderRadius: '14px', padding: '18px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  tabs: { display: 'flex', gap: '6px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '5px', flexWrap: 'wrap' },
  tab: { flex: 1, padding: '9px 12px', border: 'none', borderRadius: '8px', background: 'transparent', color: '#555', cursor: 'pointer', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' },
  tabActive: { background: 'rgba(100,255,218,0.1)', color: '#64ffda' },
  overviewGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer' },
  modalImg: { maxWidth: '90%', maxHeight: '90%', borderRadius: '12px' },
};

const ml = {
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px' },
  title: { fontSize: '14px', fontWeight: 700, color: '#64ffda', margin: '0 0 14px' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  name: { fontSize: '13px', color: '#e8e8f0' },
  badge: { padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 },
  empty: { fontSize: '13px', color: '#444', textAlign: 'center', padding: '20px 0' },
};

const ic = {
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' },
  img: { width: '100%', height: '160px', objectFit: 'cover', cursor: 'pointer', display: 'block' },
  body: { padding: '14px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' },
  name: { margin: 0, fontSize: '15px', fontWeight: 700, color: '#e8e8f0', flex: 1 },
  badge: { padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, flexShrink: 0 },
  detail: { margin: '3px 0', fontSize: '12px', color: '#555' },
  desc: { margin: '8px 0', fontSize: '12px', color: '#666', lineHeight: 1.5 },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)' },
  time: { fontSize: '11px', color: '#444' },
  delBtn: { background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.2)', color: '#ff4d6d', padding: '4px 10px', borderRadius: '7px', cursor: 'pointer', fontSize: '11px' },
};

const cs = {
  subTabs: { display: 'flex', gap: '8px', marginBottom: '16px' },
  subTab: { flex: 1, padding: '9px', border: 'none', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', color: '#555', cursor: 'pointer', fontSize: '13px', fontWeight: 600 },
  subTabActive: { background: 'rgba(100,255,218,0.1)', color: '#64ffda' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  cardLeft: { display: 'flex', gap: '12px', alignItems: 'center', flex: 1 },
  thumb: { width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 },
  itemName: { fontSize: '14px', fontWeight: 700, color: '#e8e8f0', marginBottom: '3px' },
  meta: { fontSize: '12px', color: '#555' },
  cardRight: { display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 },
  badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 },
  openBtn: { background: 'rgba(100,255,218,0.1)', border: '1px solid rgba(100,255,218,0.2)', color: '#64ffda', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' },
};

export default UserDashboard;
