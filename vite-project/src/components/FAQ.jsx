import { useState } from 'react';

const faqs = [
  { q: 'How do I report a lost item?', a: 'Login to your account, click "Report Lost" in the navbar, fill in the item details including name, description, location, and date. Submit the form and we\'ll notify you if a match is found.' },
  { q: 'How do I report a found item?', a: 'Login, click "Report Found", upload a photo of the item, fill in details, and optionally set a verification question. This question helps ensure only the real owner can claim it.' },
  { q: 'What is the verification question?', a: 'When you post a found item, you can set a secret question that only the real owner would know — like "What color is the zipper?" or "What sticker is on the back?". The claimant must answer correctly to unlock the chat.' },
  { q: 'How does the claim process work?', a: 'Browse the Community Feed, find your item, click "This is Mine", answer the verification question (if set), and once verified a private chat opens between you and the finder to arrange pickup.' },
  { q: 'Is my contact information safe?', a: 'Yes. Your email and phone number are never shown publicly. They are only revealed inside the private chat after ownership is verified.' },
  { q: 'Can I use this on multiple devices?', a: 'Yes. Login with the same email and password on any device. All your data, notifications, and chats sync in real-time across all devices.' },
  { q: 'What if someone gives the wrong answer?', a: 'Each claim allows 3 attempts. After 3 wrong answers, the claim is automatically rejected to protect the real owner.' },
  { q: 'How do I know when my item is found?', a: 'You\'ll receive a real-time notification in your dashboard when someone posts a found item that matches yours, or when someone claims your found item.' },
  { q: 'Who can see my lost/found reports?', a: 'Found items are visible to all users in the Community Feed (without contact details). Lost items are also visible. Contact info is only revealed after verified claim.' },
  { q: 'How do I mark an item as collected?', a: 'Once the item is handed over, the finder can click "Mark as Collected" in the chat to close the claim and update the item status.' },
];

const FAQ = () => {
  const [open, setOpen] = useState(null);
  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.hero}>
          <span style={s.heroIcon}>❓</span>
          <h1 style={s.title}>Frequently Asked Questions</h1>
          <p style={s.sub}>Everything you need to know about PCTE Lost & Found</p>
        </div>
        <div style={s.list}>
          {faqs.map((faq, i) => (
            <div key={i} style={s.item}>
              <button style={s.question} onClick={() => setOpen(open === i ? null : i)}>
                <span>{faq.q}</span>
                <span style={{ ...s.arrow, transform: open === i ? 'rotate(180deg)' : 'none' }}>▼</span>
              </button>
              {open === i && <div style={s.answer}>{faq.a}</div>}
            </div>
          ))}
        </div>
        <div style={s.still}>
          <p>Still have questions?</p>
          <a href="/contact" style={s.contactLink}>Contact Support →</a>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: { background: '#0a0a0f', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Inter, sans-serif', color: '#e8e8f0' },
  container: { maxWidth: '760px', margin: '0 auto' },
  hero: { textAlign: 'center', marginBottom: '40px' },
  heroIcon: { fontSize: '48px', display: 'block', marginBottom: '12px' },
  title: { fontSize: '32px', fontWeight: 800, margin: '0 0 8px', background: 'linear-gradient(135deg,#64ffda,#00b4d8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  sub: { color: '#555', fontSize: '15px' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  item: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' },
  question: { width: '100%', padding: '18px 20px', background: 'none', border: 'none', color: '#e8e8f0', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', textAlign: 'left', fontFamily: 'Inter, sans-serif' },
  arrow: { color: '#64ffda', fontSize: '12px', flexShrink: 0, transition: 'transform 0.2s' },
  answer: { padding: '0 20px 18px', fontSize: '14px', color: '#888', lineHeight: 1.7, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px' },
  still: { textAlign: 'center', marginTop: '40px', color: '#555', fontSize: '14px' },
  contactLink: { color: '#64ffda', textDecoration: 'none', fontWeight: 600, fontSize: '15px' },
};

export default FAQ;
