import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import socket from '../socket.js';
import API_URL from '../config.js';
import ClaimModal from './ClaimModal.jsx';

const ItemFeed = ({ currentUser }) => {
  const [foundItems, setFoundItems] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [tab, setTab] = useState('found');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [claimTarget, setClaimTarget] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    fetchItems();
    socket.on('foundItem:new', item => { setFoundItems(p => [item, ...p]); toast('New found item posted!', { icon: 'U+1F4E6' }); });
    socket.on('lostItem:new', item => { setLostItems(p => [item, ...p]); toast('New lost item reported!', { icon: 'U+1F514' }); });
    socket.on('foundItem:deleted', ({ id }) => setFoundItems(p => p.filter(i => i._id !== id)));
    socket.on('lostItem:deleted', ({ id }) => setLostItems(p => p.filter(i => i._id !== id)));
    socket.on('foundItem:updated', ({ id, status }) => setFoundItems(p => p.map(i => i._id === id ? { ...i, status } : i)));
    return () => {
      socket.off('foundItem:new'); socket.off('lostItem:new');
      socket.off('foundItem:deleted'); socket.off('lostItem:deleted'); socket.off('foundItem:updated');
    };
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const [fr, lr] = await Promise.all([fetch(API_URL + '/api/found-items'), fetch(API_URL + '/api/lost-items')]);
      const [fd, ld] = await Promise.all([fr.json(), lr.json()]);
      if (fd.success) setFoundItems(fd.data);
      if (ld.success) setLostItems(ld.data);
    } catch { toast.error('Failed to load items'); }
    finally { setLoading(false); }
  };

  const q = search.toLowerCase();
  const filtered = items => !q ? items : items.filter(i =>
    i.name?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q) || i.location?.toLowerCase().includes(q)
  );

  const handleClaim = item => {
    if (!currentUser) { toast.error('Please login to claim an item'); return; }
    const uid = currentUser.id || currentUser._id;
    const iid = item.user?._id || item.user;
    if (uid === iid) { toast.error('You cannot claim your own item'); return; }
    setClaimTarget(item);
  };

  const items = tab === 'found' ? filtered(foundItems) : filtered(lostItems);

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Inter, sans-serif', color: '#e8e8f0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px' }}>Community Board</h1>
          <p style={{ color: '#555', fontSize: '15px', margin: '0 0 16px' }}>Real-time feed of lost and found items</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(100,255,218,0.07)', border: '1px solid rgba(100,255,218,0.15)', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', color: '#64ffda' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#64ffda', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            Live — {foundItems.length + lostItems.length} items
          </div>
        </div>

        <input
          style={{ width: '100%', padding: '13px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e8e8f0', fontSize: '14px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
          placeholder="Search by name, description, location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '5px' }}>
          <button onClick={() => setTab('found')} style={{ flex: 1, padding: '10px 16px', border: 'none', borderRadius: '8px', background: tab === 'found' ? 'rgba(100,255,218,0.1)' : 'transparent', color: tab === 'found' ? '#64ffda' : '#555', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            Found Items ({foundItems.length})
          </button>
          <button onClick={() => setTab('lost')} style={{ flex: 1, padding: '10px 16px', border: 'none', borderRadius: '8px', background: tab === 'lost' ? 'rgba(255,77,109,0.1)' : 'transparent', color: tab === 'lost' ? '#ff4d6d' : '#555', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            Lost Items ({lostItems.length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#555' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid rgba(100,255,218,0.1)', borderTop: '3px solid #64ffda', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            Loading items...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#555' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>{tab === 'found' ? 'U+1F4E6' : 'U+1F50D'}</div>
            <p>{search ? 'No results found' : 'No ' + tab + ' items yet'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {items.map(item => tab === 'found'
              ? <FoundCard key={item._id} item={item} currentUser={currentUser} onClaim={handleClaim} onImage={setModalImage} />
              : <LostCard key={item._id} item={item} />
            )}
          </div>
        )}
      </div>

      {claimTarget && <ClaimModal item={claimTarget} currentUser={currentUser} onClose={() => setClaimTarget(null)} />}
      {modalImage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer' }} onClick={() => setModalImage(null)}>
          <img src={modalImage} alt="" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '12px' }} />
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
};

const FoundCard = ({ item, currentUser, onClaim, onImage }) => {
  const uid = currentUser?.id || currentUser?._id;
  const iid = item.user?._id || item.user;
  const isOwn = uid && uid === iid;
  const sc = { available: { color: '#64ffda', bg: 'rgba(100,255,218,0.1)' }, claimed: { color: '#ff9800', bg: 'rgba(255,152,0,0.1)' }, returned: { color: '#888', bg: 'rgba(136,136,136,0.1)' } }[item.status] || { color: '#888', bg: 'rgba(136,136,136,0.1)' };
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
      {item.image?.url
        ? <img src={item.image.url} alt={item.name} style={{ width: '100%', height: '200px', objectFit: 'cover', cursor: 'pointer', display: 'block' }} onClick={() => onImage(item.image.url)} />
        : <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', background: 'rgba(255,255,255,0.02)' }}>U+1F4E6</div>
      }
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#e8e8f0', flex: 1 }}>{item.name}</h3>
          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: sc.color, background: sc.bg, flexShrink: 0 }}>{item.status}</span>
        </div>
        <p style={{ margin: '4px 0', fontSize: '12px', color: '#555' }}>Found at: {item.location}</p>
        <p style={{ margin: '4px 0', fontSize: '12px', color: '#555' }}>{new Date(item.date).toLocaleDateString('en-IN')}</p>
        {item.dropLocation && <p style={{ margin: '4px 0', fontSize: '12px', color: '#555' }}>Collect: {item.dropLocation}</p>}
        <p style={{ margin: '10px 0', fontSize: '13px', color: '#888', lineHeight: 1.5 }}>{item.description?.slice(0, 90)}{item.description?.length > 90 ? '...' : ''}</p>
        {item.verificationQuestion && <div style={{ display: 'inline-block', fontSize: '11px', color: '#64ffda', background: 'rgba(100,255,218,0.07)', border: '1px solid rgba(100,255,218,0.15)', borderRadius: '6px', padding: '3px 8px', marginBottom: '6px' }}>Verification required</div>}
        <div style={{ fontSize: '11px', color: '#444', fontStyle: 'italic', marginBottom: '10px' }}>Contact hidden until verified</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '11px', color: '#444' }}>by {item.user?.name || item.reporterName || 'Anonymous'}</span>
          {!isOwn && item.status === 'available' && (
            <button onClick={() => onClaim(item)} style={{ padding: '7px 14px', background: 'linear-gradient(135deg,#64ffda,#00b4d8)', color: '#0a0a0f', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>This is Mine</button>
          )}
          {isOwn && <span style={{ fontSize: '11px', color: '#64ffda', fontStyle: 'italic' }}>Your post</span>}
        </div>
      </div>
    </div>
  );
};

const LostCard = ({ item }) => {
  const sc = item.status === 'active' ? { color: '#ff4d6d', bg: 'rgba(255,77,109,0.1)' } : { color: '#888', bg: 'rgba(136,136,136,0.1)' };
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', background: 'rgba(255,255,255,0.02)' }}>U+1F50D</div>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#e8e8f0', flex: 1 }}>{item.name}</h3>
          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: sc.color, background: sc.bg, flexShrink: 0 }}>{item.status}</span>
        </div>
        <p style={{ margin: '4px 0', fontSize: '12px', color: '#555' }}>Lost at: {item.location}</p>
        <p style={{ margin: '4px 0', fontSize: '12px', color: '#555' }}>{new Date(item.date).toLocaleDateString('en-IN')}</p>
        <p style={{ margin: '10px 0', fontSize: '13px', color: '#888', lineHeight: 1.5 }}>{item.description?.slice(0, 90)}{item.description?.length > 90 ? '...' : ''}</p>
        <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '11px', color: '#444' }}>by {item.user?.name || item.reporterName || 'Anonymous'}</span>
        </div>
      </div>
    </div>
  );
};

export default ItemFeed;
