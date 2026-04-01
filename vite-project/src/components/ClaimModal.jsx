import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import socket from "../socket.js";
import API_URL from "../config.js";

// FLOW: init -> verify -> chat
// On verify success: finder auto-sends first message to owner
const ClaimModal = ({ item, currentUser, onClose, existingClaimId }) => {
  const [step, setStep] = useState("init");
  const [claim, setClaim] = useState(null);
  const [answer, setAnswer] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [loading, setLoading] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const endRef = useRef(null);
  const typingTimer = useRef(null);
  const token = localStorage.getItem("token");
  const myId = currentUser?.id || currentUser?._id;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (existingClaimId) loadClaim(existingClaimId);
  }, [existingClaimId]);

  useEffect(() => {
    if (step !== "chat" || !claim) return;
    socket.emit("join:claim", claim._id);

    socket.on("chat:message", ({ claimId, message }) => {
      if (claimId !== claim._id) return;
      setMessages(prev => prev.find(m => m._id === message._id) ? prev : [...prev, message]);
      markRead(claim._id);
    });
    socket.on("chat:delivered", ({ claimId, messageId }) => {
      if (claimId === claim._id) setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status: "delivered" } : m));
    });
    socket.on("chat:read", ({ claimId, readBy }) => {
      if (claimId === claim._id && readBy !== myId)
        setMessages(prev => prev.map(m => (m.sender?._id === myId || m.sender === myId) ? { ...m, status: "read" } : m));
    });
    socket.on("chat:typing", ({ claimId, userId }) => {
      if (claimId === claim._id && userId !== myId) { setOtherTyping(true); setTimeout(() => setOtherTyping(false), 2000); }
    });
    socket.on("claim:resolved", ({ claimId }) => { if (claimId === claim._id) { toast.success("Item collected!"); onClose(); } });

    return () => {
      socket.emit("leave:claim", claim._id);
      ["chat:message","chat:delivered","chat:read","chat:typing","claim:resolved"].forEach(e => socket.off(e));
    };
  }, [step, claim]);

  const markRead = (claimId) => {
    fetch(`${API_URL}/api/claims/${claimId}/messages/read`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  };

  const loadClaim = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/claims/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!data.success) { toast.error("Failed to load claim"); return; }
      const c = data.data;
      setClaim(c); setMessages(c.messages || []);
      if (c.verificationStatus === "verified") setStep("chat");
      else if (c.verificationStatus === "rejected") { toast.error("Claim was rejected"); onClose(); }
      else if (item?.verificationQuestion) setStep("verify");
      else setStep("init");
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  const initiateClaim = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ foundItemId: item._id }),
      });
      const data = await res.json();
      if (!data.success) { toast.error(data.message); return; }
      const c = data.data;
      setClaim(c);
      if (c.verificationStatus === "verified") { setMessages(c.messages || []); setStep("chat"); }
      else if (c.verificationStatus === "rejected") { toast.error("Claim rejected"); onClose(); }
      else if (item.verificationQuestion) setStep("verify");
      else await doVerify(c._id, "");
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  const doVerify = async (claimId, ans) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/claims/${claimId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answer: ans }),
      });
      const data = await res.json();
      if (data.verified) {
        toast.success("Ownership verified! Chat is now open.");
        await loadClaim(claimId);
      } else if (data.message?.includes("rejected")) {
        toast.error(data.message); onClose();
      } else {
        setAttemptsLeft(data.attemptsLeft || 0);
        toast.error(data.message || "Wrong answer");
        setAnswer("");
      }
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  const submitAnswer = () => {
    if (!answer.trim()) { toast.error("Enter your answer"); return; }
    doVerify(claim._id, answer);
  };

  const sendMessage = async () => {
    if (!msgText.trim()) return;
    const text = msgText.trim();
    setMsgText("");
    clearTimeout(typingTimer.current);
    try {
      await fetch(`${API_URL}/api/claims/${claim._id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
    } catch { toast.error("Failed to send"); }
  };

  const handleTyping = (val) => {
    setMsgText(val);
    socket.emit("chat:typing", { claimId: claim?._id, userId: myId });
  };

  const markCollected = async () => {
    try {
      const res = await fetch(`${API_URL}/api/claims/${claim._id}/resolve`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { toast.success("Marked as collected!"); onClose(); }
      else toast.error(data.message);
    } catch { toast.error("Failed"); }
  };

  const isFinder = claim && (claim.finder?._id === myId || claim.finder?._id?.toString() === myId || claim.finder === myId);
  const otherPerson = isFinder ? claim?.claimant : claim?.finder;

  const statusIcon = (msg) => {
    const isMe = msg.sender?._id === myId || msg.sender?._id?.toString() === myId || msg.sender === myId;
    if (!isMe || msg.isSystem) return null;
    if (msg.status === "read") return <span style={{ color: "#64ffda", fontSize: "11px" }} title="Read">✓✓</span>;
    if (msg.status === "delivered") return <span style={{ color: "#888", fontSize: "11px" }} title="Delivered">✓✓</span>;
    return <span style={{ color: "#555", fontSize: "11px" }} title="Sent">✓</span>;
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.thumb}>
              {item?.image?.url ? <img src={item.image.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>��</span>}
            </div>
            <div>
              <div style={s.headerTitle}>{step === "init" ? "✋ Claim Item" : step === "verify" ? "🔐 Verify Ownership" : "💬 Private Chat"}</div>
              <div style={s.headerSub}>{item?.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        {/* INIT */}
        {step === "init" && (
          <div style={s.body}>
            {item?.image?.url && <img src={item.image.url} alt="" style={s.bigImg} />}
            <div style={s.infoBox}>
              <Row label="📍 Found at" value={item?.location} />
              <Row label="📅 Date" value={item?.date && new Date(item.date).toLocaleDateString("en-IN")} />
              {item?.dropLocation && <Row label="🏠 Collect from" value={item.dropLocation} />}
              {item?.reporterName && <Row label="👤 Found by" value={item.reporterName} />}
            </div>
            {item?.verificationQuestion
              ? <div style={s.noticeYellow}>🔐 This item has a verification question. Only the real owner can answer it to unlock the chat.</div>
              : <div style={s.noticeGreen}>✅ No verification needed. You will be connected directly with the finder.</div>
            }
            <button onClick={initiateClaim} disabled={loading} style={s.primaryBtn}>
              {loading ? "⏳ Processing..." : "✋ Yes, This is My Item"}
            </button>
          </div>
        )}

        {/* VERIFY */}
        {step === "verify" && (
          <div style={s.body}>
            <div style={s.verifyHeader}>
              <div style={s.verifyIcon}>🔐</div>
              <div>
                <div style={s.verifyTitle}>Ownership Verification</div>
                <div style={s.verifySub}>Answer the question set by the finder to prove this is your item</div>
              </div>
            </div>
            <div style={s.questionBox}>
              <div style={s.questionLabel}>QUESTION FROM FINDER</div>
              <div style={s.questionText}>{item?.verificationQuestion}</div>
            </div>
            <div style={s.attemptsRow}>
              <span style={{ color: "#888", fontSize: "13px" }}>Attempts remaining:</span>
              <span style={{ color: attemptsLeft <= 1 ? "#ff4d6d" : "#64ffda", fontWeight: 700, fontSize: "14px" }}>{attemptsLeft}</span>
            </div>
            <input
              style={s.input}
              placeholder="Type your answer here..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitAnswer()}
              autoFocus
            />
            <button onClick={submitAnswer} disabled={loading || !answer.trim()} style={s.primaryBtn}>
              {loading ? "⏳ Checking..." : "✅ Submit Answer"}
            </button>
            <p style={s.verifyHint}>💡 Think about unique details only you would know — color, brand, what was inside, etc.</p>
          </div>
        )}

        {/* CHAT */}
        {step === "chat" && (
          <div style={s.chatWrap}>
            {/* Verified */}
            <div style={s.verifiedBar}>
              <span style={s.verifiedDot} />
              Ownership verified — chatting with <strong>{otherPerson?.name || "other user"}</strong>
              <span style={{ marginLeft: "auto", fontSize: "11px", color: "#555" }}>{isFinder ? "You: Finder" : "You: Owner"}</span>
            </div>

            {/* Contact card */}
            <div style={s.contactCard}>
              <div style={s.contactLeft}>
                <div style={s.contactAvatar}>{(otherPerson?.name || "U")[0].toUpperCase()}</div>
                <div>
                  <div style={s.contactName}>{otherPerson?.name}</div>
                  <div style={s.contactRole}>{isFinder ? "Owner (Claimant)" : "Finder"}</div>
                </div>
              </div>
              <div style={s.contactRight}>
                {otherPerson?.email && <div style={s.contactDetail}>📧 {otherPerson.email}</div>}
                {otherPerson?.phone && <div style={s.contactDetail}>📞 {otherPerson.phone}</div>}
              </div>
            </div>

            {/* Messages */}
            <div style={s.messages}>
              {messages.length === 0 && <div style={s.noMsg}>No messages yet</div>}
              {messages.map((msg, i) => {
                const isMe = msg.sender?._id === myId || msg.sender?._id?.toString() === myId || msg.sender === myId;
                const showDate = i === 0 || new Date(messages[i-1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
                return (
                  <div key={msg._id || i}>
                    {showDate && <div style={s.dateDivider}>{new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>}
                    {msg.isSystem ? (
                      <div style={s.systemMsg}>
                        <div style={s.systemMsgInner}>
                          <span style={s.systemIcon}>📦</span>
                          <div>
                            <div style={s.systemLabel}>{msg.senderName} (Finder)</div>
                            <div style={s.systemText}>{msg.text}</div>
                            <div style={s.systemTime}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: "8px", gap: "8px" }}>
                        {!isMe && <div style={s.avatarSm}>{(msg.senderName || "U")[0].toUpperCase()}</div>}
                        <div style={{ maxWidth: "72%" }}>
                          {!isMe && <div style={s.senderLabel}>{msg.senderName} · {msg.senderRole === "finder" ? "Finder" : "Owner"}</div>}
                          <div style={{ ...s.bubble, ...(isMe ? s.bubbleMe : s.bubbleThem) }}>{msg.text}</div>
                          <div style={{ display: "flex", gap: "4px", justifyContent: isMe ? "flex-end" : "flex-start", marginTop: "3px", padding: "0 4px" }}>
                            <span style={{ fontSize: "10px", color: "#444" }}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            {statusIcon(msg)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {otherTyping && (
                <div style={{ display: "flex", gap: "8px", alignItems: "center", padding: "4px 0" }}>
                  <div style={s.avatarSm}>{(otherPerson?.name || "U")[0].toUpperCase()}</div>
                  <div style={{ ...s.bubbleThem, padding: "10px 14px", display: "flex", gap: "4px" }}>
                    {[0, 0.2, 0.4].map((d, i) => <span key={i} style={{ ...s.typingDot, animationDelay: `${d}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div style={s.inputRow}>
              <input style={s.chatInput} placeholder="Type a message..." value={msgText}
                onChange={e => handleTyping(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()} />
              <button onClick={sendMessage} disabled={!msgText.trim()} style={s.sendBtn}>➤</button>
            </div>

            {isFinder && claim?.status !== "collected" && (
              <button onClick={markCollected} style={s.resolveBtn}>✅ Mark Item as Collected</button>
            )}
            {claim?.status === "collected" && <div style={s.collectedBanner}>✅ Item has been collected</div>}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
    <span style={{ color: "#555" }}>{label}</span>
    <span style={{ color: "#ccc" }}>{value}</span>
  </div>
);

const s = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px", fontFamily: "Inter, sans-serif" },
  modal: { background: "#111118", border: "1px solid rgba(100,255,218,0.15)", borderRadius: "20px", width: "100%", maxWidth: "500px", maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  thumb: { width: "44px", height: "44px", borderRadius: "10px", overflow: "hidden", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "20px" },
  headerTitle: { fontSize: "16px", fontWeight: 700, color: "#e8e8f0" },
  headerSub: { fontSize: "12px", color: "#64ffda", marginTop: "2px" },
  closeBtn: { background: "rgba(255,255,255,0.06)", border: "none", color: "#888", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontSize: "14px" },
  body: { padding: "20px", display: "flex", flexDirection: "column", gap: "14px", overflowY: "auto" },
  bigImg: { width: "100%", height: "160px", objectFit: "cover", borderRadius: "12px" },
  infoBox: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "2px" },
  noticeYellow: { background: "rgba(255,152,0,0.07)", border: "1px solid rgba(255,152,0,0.2)", borderRadius: "10px", padding: "12px", fontSize: "13px", color: "#ff9800" },
  noticeGreen: { background: "rgba(76,175,80,0.07)", border: "1px solid rgba(76,175,80,0.2)", borderRadius: "10px", padding: "12px", fontSize: "13px", color: "#4caf50" },
  primaryBtn: { padding: "13px", background: "linear-gradient(135deg,#64ffda,#00b4d8)", color: "#0a0a0f", border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "15px", fontWeight: 700 },
  verifyHeader: { display: "flex", gap: "14px", alignItems: "flex-start" },
  verifyIcon: { fontSize: "36px", flexShrink: 0 },
  verifyTitle: { fontSize: "18px", fontWeight: 700, color: "#e8e8f0", marginBottom: "4px" },
  verifySub: { fontSize: "13px", color: "#666" },
  questionBox: { background: "rgba(100,255,218,0.05)", border: "1px solid rgba(100,255,218,0.2)", borderRadius: "14px", padding: "18px" },
  questionLabel: { fontSize: "10px", color: "#64ffda", fontWeight: 700, letterSpacing: "1px", marginBottom: "10px" },
  questionText: { fontSize: "18px", color: "#e8e8f0", fontWeight: 700, lineHeight: 1.4 },
  attemptsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "10px 14px" },
  input: { padding: "13px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#e8e8f0", fontSize: "15px", outline: "none", width: "100%", boxSizing: "border-box" },
  verifyHint: { fontSize: "12px", color: "#555", textAlign: "center", margin: 0 },
  chatWrap: { display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minHeight: 0 },
  verifiedBar: { display: "flex", alignItems: "center", gap: "8px", background: "rgba(76,175,80,0.08)", borderBottom: "1px solid rgba(76,175,80,0.15)", padding: "10px 16px", fontSize: "13px", color: "#4caf50", flexShrink: 0 },
  verifiedDot: { width: "8px", height: "8px", borderRadius: "50%", background: "#4caf50", display: "inline-block", flexShrink: 0 },
  contactCard: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(100,255,218,0.04)", borderBottom: "1px solid rgba(100,255,218,0.08)", padding: "12px 16px", flexShrink: 0, flexWrap: "wrap", gap: "8px" },
  contactLeft: { display: "flex", alignItems: "center", gap: "10px" },
  contactAvatar: { width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#64ffda,#00b4d8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 700, color: "#0a0a0f", flexShrink: 0 },
  contactName: { fontSize: "14px", fontWeight: 700, color: "#e8e8f0" },
  contactRole: { fontSize: "11px", color: "#64ffda" },
  contactRight: { display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end" },
  contactDetail: { fontSize: "12px", color: "#888" },
  messages: { flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "2px" },
  noMsg: { textAlign: "center", color: "#444", fontSize: "13px", padding: "40px 0" },
  dateDivider: { textAlign: "center", fontSize: "11px", color: "#444", margin: "12px 0" },
  systemMsg: { margin: "12px 0", display: "flex", justifyContent: "center" },
  systemMsgInner: { background: "linear-gradient(135deg,rgba(100,255,218,0.08),rgba(0,180,216,0.08))", border: "1px solid rgba(100,255,218,0.2)", borderRadius: "14px", padding: "14px 16px", maxWidth: "90%", display: "flex", gap: "12px", alignItems: "flex-start" },
  systemIcon: { fontSize: "24px", flexShrink: 0 },
  systemLabel: { fontSize: "11px", color: "#64ffda", fontWeight: 700, marginBottom: "6px" },
  systemText: { fontSize: "14px", color: "#e8e8f0", lineHeight: 1.5 },
  systemTime: { fontSize: "10px", color: "#555", marginTop: "6px" },
  avatarSm: { width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#888", flexShrink: 0, alignSelf: "flex-end" },
  senderLabel: { fontSize: "11px", color: "#555", marginBottom: "3px", marginLeft: "4px" },
  bubble: { padding: "10px 14px", borderRadius: "14px", fontSize: "14px", lineHeight: 1.5, wordBreak: "break-word" },
  bubbleMe: { background: "linear-gradient(135deg,rgba(100,255,218,0.15),rgba(0,180,216,0.15))", border: "1px solid rgba(100,255,218,0.2)", color: "#e8e8f0", borderBottomRightRadius: "4px" },
  bubbleThem: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#e8e8f0", borderBottomLeftRadius: "4px" },
  typingDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#555", display: "inline-block", animation: "bounce 1.2s infinite" },
  inputRow: { display: "flex", gap: "8px", padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 },
  chatInput: { flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#e8e8f0", fontSize: "14px", outline: "none" },
  sendBtn: { background: "linear-gradient(135deg,#64ffda,#00b4d8)", color: "#0a0a0f", border: "none", borderRadius: "10px", padding: "10px 16px", cursor: "pointer", fontSize: "16px", fontWeight: 700 },
  resolveBtn: { margin: "0 16px 12px", padding: "10px", background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.25)", color: "#4caf50", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 600, flexShrink: 0 },
  collectedBanner: { margin: "0 16px 12px", padding: "10px", background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.15)", color: "#4caf50", borderRadius: "10px", fontSize: "13px", textAlign: "center", flexShrink: 0 },
};

export default ClaimModal;
