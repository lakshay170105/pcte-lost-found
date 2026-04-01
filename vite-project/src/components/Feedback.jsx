import { useState } from "react";
import toast from "react-hot-toast";
import API_URL from "../config.js";

const Feedback = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "", rating: 5 });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.message.trim() || form.message.trim().length < 10) e.message = "Min 10 characters";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Feedback submitted! Thank you.");
        setDone(true);
        setForm({ name: "", email: "", message: "", rating: 5 });
        setErrors({});
        setTimeout(() => setDone(false), 5000);
      } else {
        toast.error(data.message || "Failed to submit");
      }
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: "" })); };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.hero}>
          <span style={s.icon}>💬</span>
          <h1 style={s.title}>Send Feedback</h1>
          <p style={s.sub}>Help us improve the PCTE Lost & Found Portal</p>
        </div>

        <div style={s.layout}>
          <div style={s.info}>
            {[
              { icon: "⭐", title: "Rate Experience", text: "Tell us how we are doing" },
              { icon: "💡", title: "Suggest Features", text: "Ideas for new features are welcome" },
              { icon: "🐛", title: "Report Issues", text: "Found a bug? Let us know" },
              { icon: "📧", title: "Direct Contact", text: "developbylshay@gmail.com" },
            ].map(item => (
              <div key={item.title} style={s.infoCard}>
                <span style={{ fontSize: "24px" }}>{item.icon}</span>
                <div>
                  <div style={s.infoTitle}>{item.title}</div>
                  <div style={s.infoText}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>

          <form style={s.form} onSubmit={handleSubmit}>
            {done && (
              <div style={s.successBanner}>
                ✅ Thank you for your feedback! It has been saved and our team will review it.
              </div>
            )}

            <div style={s.row}>
              <Field label="Your Name *" error={errors.name}>
                <input style={inp(errors.name)} placeholder="Full name" value={form.name} onChange={e => set("name", e.target.value)} />
              </Field>
              <Field label="Email *" error={errors.email}>
                <input type="email" style={inp(errors.email)} placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
              </Field>
            </div>

            <div>
              <label style={s.ratingLabel}>Your Rating</label>
              <div style={s.stars}>
                {[1,2,3,4,5].map(star => (
                  <span key={star} onClick={() => set("rating", star)}
                    style={{ fontSize: "32px", cursor: "pointer", opacity: form.rating >= star ? 1 : 0.2, transition: "opacity .15s" }}>
                    ⭐
                  </span>
                ))}
                <span style={s.ratingVal}>{form.rating} / 5</span>
              </div>
            </div>

            <Field label="Your Feedback *" error={errors.message}>
              <textarea
                style={{ ...inp(errors.message), minHeight: "130px", resize: "none", fontFamily: "Inter, sans-serif" }}
                placeholder="Share your experience, suggestions, or report an issue..."
                value={form.message}
                onChange={e => set("message", e.target.value)}
              />
            </Field>

            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
              {loading ? "⏳ Submitting..." : "📤 Submit Feedback"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, error, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1, minWidth: "180px" }}>
    <label style={{ fontSize: "12px", color: "#888", fontWeight: 500 }}>{label}</label>
    {children}
    {error && <span style={{ color: "#ff4d6d", fontSize: "11px" }}>{error}</span>}
  </div>
);

const inp = err => ({
  padding: "11px 14px", borderRadius: "10px", width: "100%", boxSizing: "border-box",
  border: `1px solid ${err ? "#ff4d6d55" : "rgba(255,255,255,0.08)"}`,
  background: "rgba(255,255,255,0.04)", color: "#e8e8f0", fontSize: "14px", outline: "none",
  fontFamily: "Inter, sans-serif",
});

const s = {
  page: { background: "#0a0a0f", minHeight: "100vh", padding: "40px 20px", fontFamily: "Inter, sans-serif", color: "#e8e8f0" },
  container: { maxWidth: "900px", margin: "0 auto" },
  hero: { textAlign: "center", marginBottom: "40px" },
  icon: { fontSize: "48px", display: "block", marginBottom: "12px" },
  title: { fontSize: "32px", fontWeight: 800, margin: "0 0 8px", background: "linear-gradient(135deg,#64ffda,#00b4d8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  sub: { color: "#555", fontSize: "15px" },
  layout: { display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "24px", alignItems: "start" },
  info: { display: "flex", flexDirection: "column", gap: "12px" },
  infoCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", display: "flex", gap: "14px", alignItems: "flex-start" },
  infoTitle: { fontSize: "14px", fontWeight: 700, color: "#64ffda", marginBottom: "3px" },
  infoText: { fontSize: "12px", color: "#666" },
  form: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "28px", display: "flex", flexDirection: "column", gap: "16px" },
  successBanner: { background: "rgba(100,255,218,0.08)", border: "1px solid rgba(100,255,218,0.2)", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", color: "#64ffda", textAlign: "center" },
  row: { display: "flex", gap: "14px", flexWrap: "wrap" },
  ratingLabel: { fontSize: "12px", color: "#888", fontWeight: 500, display: "block", marginBottom: "8px" },
  stars: { display: "flex", gap: "4px", alignItems: "center" },
  ratingVal: { fontSize: "13px", color: "#64ffda", fontWeight: 700, marginLeft: "10px" },
  btn: { padding: "13px", fontSize: "15px", fontWeight: 700, background: "linear-gradient(135deg,#64ffda,#00b4d8)", color: "#0a0a0f", border: "none", borderRadius: "12px", cursor: "pointer" },
};

export default Feedback;
