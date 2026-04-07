'use client';
import Link from 'next/link';
import Navbar from './components/Navbar';

const FEATURES = [
  { href: '/contracts/analyze', icon: '📄', title: 'Contract Analysis', desc: 'Upload any contract. Get AI-powered risk flags, suspicious clause detection, Indian Act citations, and negotiation counters.', color: '#ef4444' },
  { href: '/generate', icon: '✨', title: 'Legal Document Generator', desc: 'Generate professionally worded legal documents — NDAs, employment agreements, rental contracts — with proper Indian law citations.', color: '#34d399' },
  { href: '/cases/evaluate', icon: '⚖️', title: 'Case Evaluation', desc: 'File a case or defend against one. AI generates a personalised questionnaire, evaluates case strength, and gives actionable advice.', color: '#f472b6' },
  { href: '/learn', icon: '📚', title: 'Micro-Learning', desc: 'Learn Indian law in Duolingo-style micro-doses. Real scenarios, interactive quizzes, and XP rewards — from consumer rights to criminal law.', color: '#fbbf24' },
  { href: '/chat', icon: '💬', title: 'Legal Chat', desc: 'Ask any Indian law question. The AI answers with specific section citations from ICA, BNS, CPA, and other Acts in plain language.', color: '#fb923c' },
  { href: '/mock-court', icon: '🏛️', title: 'Mock Court', desc: 'Step into a virtual courtroom. Argue your case against an AI opposing counsel and judge — scored on citation accuracy and legal reasoning.', color: '#a78bfa' },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#050810 0%,#0a0d18 50%,#060d1a 100%)', color: '#e2e8f0', fontFamily: 'Inter,sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 20px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#1e293b', borderRadius: 20, padding: '6px 18px', fontSize: 13, color: '#a78bfa', fontWeight: 600, marginBottom: 20, border: '1px solid #334155' }}>
          AI-Powered Indian Legal Intelligence
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
          <span style={{ background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Vidhi</span>
          <br />
          <span style={{ color: '#94a3b8', fontSize: '0.7em', fontWeight: 600 }}>Know Your Rights. Build Your Case.</span>
        </h1>
        <p style={{ fontSize: 18, color: '#64748b', maxWidth: 600, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Every feature cites specific Indian Acts, sections and clauses — making Vidhi verifiable, professional, and credible.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/chat" style={{ padding: '14px 32px', borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>Ask Vidhi Now</Link>
          <Link href="/mock-court" style={{ padding: '14px 32px', borderRadius: 12, border: '1px solid #334155', color: '#e2e8f0', fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>Try Mock Court</Link>
        </div>
      </section>

      {/* Acts Banner */}
      <div style={{ borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b', padding: '16px 20px', overflow: 'hidden', background: '#050810' }}>
        <div style={{ display: 'flex', gap: 32, animation: 'scroll 30s linear infinite', whiteSpace: 'nowrap' }}>
          {['Indian Contract Act 1872', 'Consumer Protection Act 2019', 'Bharatiya Nyaya Sanhita 2023', 'Companies Act 2013', 'IT Act 2000', 'Transfer of Property Act 1882', 'Hindu Marriage Act 1955', 'Specific Relief Act 1963', 'Arbitration & Conciliation Act 1996', 'Copyright Act 1957', 'Trade Marks Act 1999', 'Code of Civil Procedure 1908'].map((act, i) => (
            <span key={i} style={{ color: '#334155', fontSize: 13, fontWeight: 600 }}>⚖️ {act}</span>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 8, color: '#e2e8f0' }}>7 Capabilities. One Platform.</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 40 }}>Every response cites the applicable Indian Act and section — non-negotiable.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURES.map(f => (
            <Link key={f.href} href={f.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 24, height: '100%', cursor: 'pointer', transition: 'all 0.2s', display: 'block' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = f.color + '60'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1e293b'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: f.color, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e293b', padding: '24px 20px', textAlign: 'center', color: '#334155', fontSize: 13 }}>
        Vidhi — AI Indian Legal Intelligence Platform. Not a substitute for professional legal advice.
      </footer>
    </div>
  );
}
