import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import socket from "../socket.js";
import API_URL from "../config.js";

const AdminPanel = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [matches, setMatches] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);
  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sr, ur, lr, fr, fbr, cr, mr] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, auth),
        fetch(`${API_URL}/api/users`, auth),
        fetch(`${API_URL}/api/lost-items`, auth),
        fetch(`${API_URL}/api/found-items`, auth),
        fetch(`${API_URL}/api/feedback`, auth),
        fetch(`${API_URL}/api/contact`, auth),
        fetch(`${API_URL}/api/admin/matches`, auth),
      ]);
      const [sd, ud, ld, fd, fbd, cd, md] = await Promise.all([sr.json(), ur.json(), lr.json(), fr.json(), fbr.json(), cr.json(), mr.json()]);
      if (sd.success) setStats(sd.data.stats);
      if (ud.success) setUsers(ud.data);
      if (ld.success) setLostItems(ld.data);
      if (fd.success) setFoundItems(fd.data);
      if (fbd.success) setFeedbacks(fbd.data);
      if (cd.success) setContacts(cd.data);
      if (md.success) setMatches(md.data);
    } catch { toast.error("Failed to load data"); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    fetchAll();
    socket.on("lostItem:new", () => fetchAll());
    socket.on("foundItem:new", () => fetchAll());
    socket.on("lostItem:deleted", () => fetchAll());
    socket.on("foundItem:deleted", () => fetchAll());
    socket.on("foundItem:updated", () => fetchAll());
    return () => {
      socket.off("lostItem:new"); socket.off("foundItem:new");
      socket.off("lostItem:deleted"); socket.off("foundItem:deleted"); socket.off("foundItem:updated");
    };
  }, [fetchAll]);

  const deleteItem = async (type, id) => {
    if (!confirm("Delete this item?")) return;
    try {
      const res = await fetch(`${API_URL}/api/${type}-items/${id}`, { method: "DELETE", ...auth });
      const data = await res.json();
      if (data.success) { toast.success("Deleted"); fetchAll(); }
      else toast.error(data.message);
    } catch { toast.error("Failed"); }
  };

  const toggleUser = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}/toggle-status`, { method: "PUT", ...auth });
      const data = await res.json();
      if (data.success) { toast.success(data.message); fetchAll(); }
    } catch { toast.error("Failed"); }
  };

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "users", label: `👥 Users (${users.length})` },
    { id: "lost", label: `🔍 Lost (${lostItems.length})` },
    { id: "found", label: `📦 Found (${foundItems.length})` },
    { id: "matches", label: `🎯 Matches (${matches.length})` },
    { id: "feedback", label: `💬 Feedback (${feedbacks.length})` },
    { id: "contacts", label: `📧 Contacts (${contacts.length})` },
  ];

  if (loading) return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", color: "#555", fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: "36px", height: "36px", border: "3px solid rgba(100,255,218,0.1)", borderTop: "3px solid #64ffda", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p>Loading admin data...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Admin Dashboard</h1>
            <p style={s.sub}>Real-time analytics & management</p>
          </div>
          <div style={s.headerRight}>
            <div style={s.liveBadge}><span style={s.liveDot} />Live</div>
            <button onClick={fetchAll} style={s.refreshBtn} title="Refresh">↻ Refresh</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ ...s.tab, ...(tab === t.id ? s.tabActive : {}) }}>{t.label}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div>
            <div style={s.statsGrid}>
              {[
                { icon: "👥", label: "Total Users", value: stats.totalUsers || 0, color: "#00b4d8" },
                { icon: "🔍", label: "Lost Reports", value: stats.totalLostItems || 0, sub: `Active: ${stats.activeLostItems || 0}`, color: "#ff4d6d" },
                { icon: "📦", label: "Found Reports", value: stats.totalFoundItems || 0, sub: `Available: ${stats.availableFoundItems || 0}`, color: "#64ffda" },
                { icon: "🎯", label: "Matches", value: matches.length, color: "#ff9800" },
                { icon: "💬", label: "Feedbacks", value: stats.totalFeedbacks || 0, color: "#9c27b0" },
                { icon: "📧", label: "Contacts", value: stats.totalContacts || 0, color: "#4caf50" },
              ].map(st => (
                <div key={st.label} style={{ ...s.statCard, borderColor: st.color + "22" }}>
                  <span style={{ fontSize: "28px" }}>{st.icon}</span>
                  <span style={{ fontSize: "32px", fontWeight: 800, color: st.color }}>{st.value}</span>
                  <span style={{ fontSize: "12px", color: "#888" }}>{st.label}</span>
                  {st.sub && <span style={{ fontSize: "11px", color: "#555" }}>{st.sub}</span>}
                </div>
              ))}
            </div>
            {/* Recent activity */}
            <div style={s.recentGrid}>
              <div style={s.recentCard}>
                <h3 style={s.recentTitle}>Recent Lost Reports</h3>
                {lostItems.slice(0, 5).map(item => (
                  <div key={item._id} style={s.recentRow}>
                    <div>
                      <div style={s.recentName}>{item.name}</div>
                      <div style={s.recentMeta}>{item.location} · {new Date(item.createdAt).toLocaleDateString("en-IN")}</div>
                    </div>
                    <span style={{ ...s.badge, background: item.status === "active" ? "rgba(100,255,218,0.1)" : "rgba(136,136,136,0.1)", color: item.status === "active" ? "#64ffda" : "#888" }}>{item.status}</span>
                  </div>
                ))}
                {lostItems.length === 0 && <p style={s.empty}>No lost items yet</p>}
              </div>
              <div style={s.recentCard}>
                <h3 style={s.recentTitle}>Recent Found Reports</h3>
                {foundItems.slice(0, 5).map(item => (
                  <div key={item._id} style={s.recentRow}>
                    <div>
                      <div style={s.recentName}>{item.name}</div>
                      <div style={s.recentMeta}>{item.location} · {new Date(item.createdAt).toLocaleDateString("en-IN")}</div>
                    </div>
                    <span style={{ ...s.badge, background: item.status === "available" ? "rgba(100,255,218,0.1)" : "rgba(136,136,136,0.1)", color: item.status === "available" ? "#64ffda" : "#888" }}>{item.status}</span>
                  </div>
                ))}
                {foundItems.length === 0 && <p style={s.empty}>No found items yet</p>}
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div style={s.grid}>
            {users.length === 0 ? <Empty icon="👥" text="No users yet" /> :
              users.map(user => (
                <div key={user._id} style={s.card}>
                  <div style={s.userTop}>
                    <div style={s.userAvatar}>{(user.name || "U")[0].toUpperCase()}</div>
                    <div>
                      <div style={s.cardTitle}>{user.name}</div>
                      <div style={s.cardMeta}>{user.email}</div>
                    </div>
                    <span style={{ ...s.badge, background: user.isActive ? "rgba(76,175,80,0.1)" : "rgba(255,77,109,0.1)", color: user.isActive ? "#4caf50" : "#ff4d6d" }}>{user.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <div style={s.cardDetails}>
                    <div style={s.detail}>📅 Joined: {new Date(user.createdAt).toLocaleDateString("en-IN")}</div>
                    {user.lastLogin && <div style={s.detail}>🕐 Last login: {new Date(user.lastLogin).toLocaleDateString("en-IN")}</div>}
                  </div>
                  <button onClick={() => toggleUser(user._id)} style={{ ...s.actionBtn, color: user.isActive ? "#ff4d6d" : "#4caf50", borderColor: user.isActive ? "rgba(255,77,109,0.2)" : "rgba(76,175,80,0.2)" }}>
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))
            }
          </div>
        )}

        {/* Lost Items */}
        {tab === "lost" && (
          <div style={s.grid}>
            {lostItems.length === 0 ? <Empty icon="🔍" text="No lost items" /> :
              lostItems.map(item => (
                <ItemCard key={item._id} item={item} type="lost" onDelete={deleteItem} onImage={setModalImage} />
              ))
            }
          </div>
        )}

        {/* Found Items */}
        {tab === "found" && (
          <div style={s.grid}>
            {foundItems.length === 0 ? <Empty icon="📦" text="No found items" /> :
              foundItems.map(item => (
                <ItemCard key={item._id} item={item} type="found" onDelete={deleteItem} onImage={setModalImage} />
              ))
            }
          </div>
        )}

        {/* Matches */}
        {tab === "matches" && (
          <div style={s.grid}>
            {matches.length === 0 ? <Empty icon="🎯" text="No matches found yet" /> :
              matches.map((m, i) => (
                <div key={i} style={s.matchCard}>
                  <div style={s.matchScore}>Match Score: {m.matchScore}%</div>
                  <div style={s.matchSection}>
                    <div style={s.matchLabel}>🔍 Lost Item</div>
                    <div style={s.cardTitle}>{m.lost.name}</div>
                    <div style={s.cardMeta}>{m.lost.location}</div>
                    <div style={s.cardMeta}>📧 {m.lost.contact}</div>
                  </div>
                  <div style={s.matchArrow}>↕</div>
                  <div style={s.matchSection}>
                    <div style={s.matchLabel}>📦 Found Item</div>
                    <div style={s.cardTitle}>{m.found.name}</div>
                    <div style={s.cardMeta}>{m.found.location}</div>
                    <div style={s.cardMeta}>📧 {m.found.contact}</div>
                    {m.found.image?.url && <img src={m.found.image.url} alt="" style={s.matchImg} onClick={() => setModalImage(m.found.image.url)} />}
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Feedback */}
        {tab === "feedback" && (
          <div style={s.grid}>
            {feedbacks.length === 0 ? <Empty icon="💬" text="No feedbacks yet" /> :
              feedbacks.map((fb, i) => (
                <div key={i} style={s.card}>
                  <div style={s.cardTitle}>{fb.name}</div>
                  <div style={s.cardMeta}>{fb.email}</div>
                  <div style={{ fontSize: "18px", margin: "8px 0" }}>{"⭐".repeat(fb.rating || 0)}</div>
                  <p style={s.detail}>{fb.message}</p>
                  <div style={s.cardMeta}>{new Date(fb.createdAt).toLocaleDateString("en-IN")}</div>
                </div>
              ))
            }
          </div>
        )}

        {/* Contacts */}
        {tab === "contacts" && (
          <div style={s.grid}>
            {contacts.length === 0 ? <Empty icon="📧" text="No contact messages yet" /> :
              contacts.map((c, i) => (
                <div key={i} style={s.card}>
                  <div style={s.cardTitle}>{c.name}</div>
                  <div style={s.cardMeta}>{c.email}</div>
                  <div style={{ ...s.badge, background: "rgba(100,255,218,0.08)", color: "#64ffda", display: "inline-block", margin: "6px 0" }}>{c.subject}</div>
                  <p style={s.detail}>{c.message}</p>
                  <div style={s.cardMeta}>{new Date(c.createdAt).toLocaleDateString("en-IN")}</div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {modalImage && (
        <div style={s.modal} onClick={() => setModalImage(null)}>
          <img src={modalImage} alt="" style={s.modalImg} />
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
};

const ItemCard = ({ item, type, onDelete, onImage }) => {
  const sc = { available: "#64ffda", active: "#64ffda", claimed: "#ff9800", returned: "#888", found: "#ff9800", closed: "#888" };
  return (
    <div style={s.card}>
      {item.image?.url && <img src={item.image.url} alt={item.name} style={s.cardImg} onClick={() => onImage(item.image.url)} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div style={s.cardTitle}>{item.name}</div>
        <span style={{ ...s.badge, color: sc[item.status] || "#888", background: (sc[item.status] || "#888") + "18" }}>{item.status}</span>
      </div>
      <div style={s.detail}>📍 {item.location}</div>
      <div style={s.detail}>📅 {new Date(item.date).toLocaleDateString("en-IN")}</div>
      {item.reporterName && <div style={s.detail}>👤 {item.reporterName}</div>}
      {item.contact && <div style={s.detail}>📧 {item.contact}</div>}
      <div style={s.cardMeta}>{new Date(item.createdAt).toLocaleDateString("en-IN")}</div>
      <button onClick={() => onDelete(type, item._id)} style={s.delBtn}>🗑 Delete</button>
    </div>
  );
};

const Empty = ({ icon, text }) => (
  <div style={{ textAlign: "center", padding: "60px", color: "#555", width: "100%" }}>
    <div style={{ fontSize: "48px", marginBottom: "12px" }}>{icon}</div>
    <p>{text}</p>
  </div>
);

const s = {
  page: { background: "#0a0a0f", minHeight: "100vh", padding: "30px 20px", fontFamily: "Inter, sans-serif", color: "#e8e8f0" },
  container: { maxWidth: "1200px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" },
  title: { fontSize: "26px", fontWeight: 800, margin: "0 0 4px" },
  sub: { color: "#555", fontSize: "13px", margin: 0 },
  headerRight: { display: "flex", alignItems: "center", gap: "10px" },
  liveBadge: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64ffda", background: "rgba(100,255,218,0.07)", border: "1px solid rgba(100,255,218,0.15)", borderRadius: "20px", padding: "5px 12px" },
  liveDot: { width: "7px", height: "7px", borderRadius: "50%", background: "#64ffda", display: "inline-block", animation: "pulse 1.5s infinite" },
  refreshBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#888", padding: "7px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" },
  tabs: { display: "flex", gap: "6px", marginBottom: "24px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "5px", flexWrap: "wrap" },
  tab: { flex: 1, padding: "9px 12px", border: "none", borderRadius: "8px", background: "transparent", color: "#555", cursor: "pointer", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", minWidth: "80px" },
  tabActive: { background: "rgba(100,255,218,0.1)", color: "#64ffda" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px", marginBottom: "24px" },
  statCard: { background: "rgba(255,255,255,0.03)", border: "1px solid", borderRadius: "14px", padding: "20px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  recentGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  recentCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "18px" },
  recentTitle: { fontSize: "14px", fontWeight: 700, color: "#64ffda", margin: "0 0 14px" },
  recentRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", gap: "8px" },
  recentName: { fontSize: "13px", color: "#e8e8f0", fontWeight: 500 },
  recentMeta: { fontSize: "11px", color: "#555", marginTop: "2px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "16px", overflow: "hidden" },
  cardImg: { width: "100%", height: "160px", objectFit: "cover", borderRadius: "10px", marginBottom: "12px", cursor: "pointer", display: "block" },
  cardTitle: { fontSize: "15px", fontWeight: 700, color: "#e8e8f0", marginBottom: "4px" },
  cardMeta: { fontSize: "11px", color: "#555", marginTop: "4px" },
  cardDetails: { margin: "10px 0" },
  detail: { fontSize: "12px", color: "#888", margin: "3px 0" },
  badge: { padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 },
  userTop: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" },
  userAvatar: { width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg,#64ffda,#00b4d8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 800, color: "#0a0a0f", flexShrink: 0 },
  actionBtn: { marginTop: "10px", width: "100%", padding: "7px", background: "transparent", border: "1px solid", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600 },
  delBtn: { marginTop: "10px", width: "100%", padding: "7px", background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)", color: "#ff4d6d", borderRadius: "8px", cursor: "pointer", fontSize: "12px" },
  matchCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(100,255,218,0.12)", borderRadius: "14px", padding: "16px" },
  matchScore: { background: "linear-gradient(135deg,#64ffda,#00b4d8)", color: "#0a0a0f", padding: "8px", borderRadius: "8px", textAlign: "center", fontWeight: 700, fontSize: "13px", marginBottom: "12px" },
  matchSection: { background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "12px", margin: "8px 0" },
  matchLabel: { fontSize: "11px", color: "#64ffda", fontWeight: 700, marginBottom: "6px" },
  matchArrow: { textAlign: "center", fontSize: "20px", color: "#555", margin: "4px 0" },
  matchImg: { width: "100%", height: "100px", objectFit: "cover", borderRadius: "8px", marginTop: "8px", cursor: "pointer" },
  empty: { color: "#444", fontSize: "13px", textAlign: "center", padding: "20px 0" },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, cursor: "pointer" },
  modalImg: { maxWidth: "90%", maxHeight: "90%", borderRadius: "12px" },
};

export default AdminPanel;
