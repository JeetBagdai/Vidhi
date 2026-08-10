'use client';
import Link from 'next/link';
import Navbar from './components/Navbar';

const FEATURES = [
  {
    href: '/contracts/analyze', icon: '📄', title: 'Contract Analysis',
    desc: 'Upload any contract. Get AI-powered risk flags, suspicious clause detection, Indian Act citations, and negotiation counters.',
    color: '#ef4444', grad: 'linear-gradient(135deg,#ef4444,#dc2626)',
  },
  {
    href: '/generate', icon: '✨', title: 'Document Generator',
    desc: 'Generate professionally worded NDAs, employment agreements, rental contracts with proper Indian law citations in seconds.',
    color: '#10b981', grad: 'linear-gradient(135deg,#10b981,#06b6d4)',
  },
  {
    href: '/cases/evaluate', icon: '⚖️', title: 'Case Evaluation',
    desc: 'File or defend a case. AI generates a personalised questionnaire, evaluates case strength, and gives actionable advice.',
    color: '#ec4899', grad: 'linear-gradient(135deg,#ec4899,#a855f7)',
  },
  {
    href: '/learn', icon: '📚', title: 'Micro-Learning',
    desc: 'Learn Indian law in Duolingo-style micro-doses. Real scenarios, interactive quizzes, and XP rewards.',
    color: '#f59e0b', grad: 'linear-gradient(135deg,#f59e0b,#ef4444)',
  },
  {
    href: '/chat', icon: '💬', title: 'Legal Chat',
    desc: 'Ask any Indian law question. Get answers with specific section citations from ICA, BNS, CPA, and other Acts.',
    color: '#fb923c', grad: 'linear-gradient(135deg,#fb923c,#f43f5e)',
  },
  {
    href: '/mock-court', icon: '🏛️', title: 'Mock Court',
    desc: 'Step into a virtual courtroom. Argue your case against an AI judge and opposing counsel — scored on citation accuracy.',
    color: '#a78bfa', grad: 'linear-gradient(135deg,#a78bfa,#60a5fa)',
  },
];

const ACTS = [
  'Indian Contract Act 1872', 'Consumer Protection Act 2019', 'Bharatiya Nyaya Sanhita 2023',
  'Companies Act 2013', 'IT Act 2000', 'Transfer of Property Act 1882',
  'Hindu Marriage Act 1955', 'Specific Relief Act 1963', 'Arbitration & Conciliation Act 1996',
  'Copyright Act 1957', 'Trade Marks Act 1999', 'Code of Civil Procedure 1908',
];

const STATS = [
  { value: '15+', label: 'Indian Acts Covered' },
  { value: '6', label: 'AI-Powered Features' },
  { value: '100%', label: 'Citation-Backed' },
  { value: 'Free', label: 'To Use' },
];

export default function HomePage() {
  return (
    <div className="page">
      <Navbar />

      {/* Hero */}
      <section className="hero" style={{ position: 'relative' }}>
        {/* Glow orbs */}
        <div className="glow-orb" style={{ width: 500, height: 500, background: 'var(--accent-purple)', top: -100, left: '10%', opacity: 0.07 }} />
        <div className="glow-orb" style={{ width: 400, height: 400, background: 'var(--accent-blue)', top: -50, right: '10%', opacity: 0.06 }} />

        <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto' }}>
          <div className="hero-pill slide-up">
            ✦ AI-Powered Indian Legal Intelligence
          </div>

          <h1 className="h1 grad-text fade-in" style={{ animationDelay: '0.1s', marginBottom: 12 }}>
            Vidhi
          </h1>
          <h2 className="fade-in" style={{ fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 20, animationDelay: '0.2s' }}>
            Know Your Rights. Build Your Case.
          </h2>
          <p className="fade-in" style={{ fontSize: 17, color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto', lineHeight: 1.75, animationDelay: '0.3s' }}>
            Every feature cites specific Indian Acts, sections and clauses —
            making Vidhi verifiable, professional, and credible.
          </p>

          <div className="hero-cta fade-in" style={{ animationDelay: '0.4s' }}>
            <Link href="/chat" className="btn btn-primary btn-lg">
              💬 Ask Vidhi Now
            </Link>
            <Link href="/mock-court" className="btn btn-secondary btn-lg">
              🏛️ Try Mock Court
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '8px 24px 40px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
            {STATS.map((s, i) => (
              <div key={i} className="stat-card fade-in" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                <div className="stat-number grad-text" style={{ fontSize: 40 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Acts ticker */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...ACTS, ...ACTS].map((act, i) => (
            <span key={i} className="ticker-item">⚖ {act}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="h2" style={{ marginBottom: 10 }}>6 Capabilities. One Platform.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              Every response cites the applicable Indian Act and section — non-negotiable.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <Link
                key={f.href}
                href={f.href}
                className="feature-card fade-in"
                style={{ '--accent-color': f.grad, animationDelay: `${i * 0.08}s` } as any}
              >
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title" style={{ color: f.color }}>{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        Vidhi — AI Indian Legal Intelligence Platform &nbsp;·&nbsp; Not a substitute for professional legal advice.
      </footer>
    </div>
  );
}
