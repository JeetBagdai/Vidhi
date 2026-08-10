'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vidhi-backend-4rfp.onrender.com';
interface Turn { speaker: string; text: string; score?: number; }

const DIFF_BADGE: Record<string, string> = { Beginner: 'badge-green', Intermediate: 'badge-gold', Advanced: 'badge-red' };
const GRADE_COLOR: Record<string, string> = { A: 'var(--accent-green)', B: 'var(--accent-blue)', C: 'var(--accent-gold)', D: 'var(--accent-red)' };

export default function MockCourtPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [argument, setArgument] = useState('');
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState<any>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [shouldConclude, setShouldConclude] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API}/mock-court/cases`).then(r => r.json()).then(d => setCases(d.cases || [])).catch(() => {});
  }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [turns]);

  const startCase = async (caseId: string, role: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/mock-court/start`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId, user_role: role }),
      });
      const data = await res.json();
      setSession(data);
      setTurns([{ speaker: 'Judge', text: data.judge_opening }]);
      setVerdict(null); setTotalScore(0); setShouldConclude(false);
    } catch { alert('Failed to start case.'); }
    finally { setLoading(false); }
  };

  const submitArgument = async () => {
    if (!argument.trim() || !session || loading) return;
    const arg = argument.trim(); setArgument('');
    setTurns(prev => [...prev, { speaker: 'You', text: arg }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/mock-court/argue`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.session_id, argument: arg }),
      });
      const data = await res.json();
      setTotalScore(data.cumulative_score || 0);
      setTurns(prev => [
        ...prev,
        { speaker: 'Judge', text: `Score: ${data.argument_score}/10 — ${data.judge_comment}`, score: data.argument_score },
        { speaker: 'Opponent', text: data.opponent_argument },
      ]);
      if (data.should_conclude) setShouldConclude(true);
    } catch { alert('Error submitting argument.'); }
    finally { setLoading(false); }
  };

  const getVerdict = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/mock-court/verdict/${session.session_id}`, { method: 'POST' });
      setVerdict(await res.json());
    } catch { alert('Error getting verdict.'); }
    finally { setLoading(false); }
  };

  /* ── Case selection screen ── */
  if (!session) return (
    <div className="page" style={{ height: '100vh', overflow: 'hidden' }}>
      <Navbar />
      <div className="page-inner" style={{ overflowY: 'auto' }}>
        <div style={{ marginBottom: 36 }}>
          <h1 className="h2 grad-gold" style={{ marginBottom: 8 }}>🏛️ Mock Court</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Step into the courtroom. Argue your case against an AI judge and opposing counsel citing Indian law.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {cases.map(c => (
            <div key={c.id} className="card slide-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="badge badge-grey">{c.category}</span>
                <span className={`badge ${DIFF_BADGE[c.difficulty] || 'badge-grey'}`}>{c.difficulty}</span>
              </div>
              <h3 className="h4" style={{ marginBottom: 10, fontSize: 18 }}>{c.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{c.summary}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {c.key_acts.map((a: string, i: number) => (
                  <span key={i} className="badge badge-blue" style={{ fontSize: 11 }}>{a}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => startCase(c.id, 'prosecution')} className="btn btn-danger btn-full" style={{ flex: 1 }}>
                  ⚔️ Prosecute
                </button>
                <button onClick={() => startCase(c.id, 'defence')} className="btn btn-secondary btn-full" style={{ flex: 1, borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' }}>
                  🛡️ Defend
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── Active court session ── */
  return (
    <div className="page" style={{ height: '100vh', overflow: 'hidden' }}>
      <Navbar />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        
        {/* Left: Session details */}
        <div style={{ background: 'var(--bg-1)', borderRight: '1px solid var(--border)', padding: 'clamp(20px,2vw,36px)', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
          <button onClick={() => setSession(null)} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>← Exit Court</button>
          
          <div>
            <div className="badge badge-blue" style={{ marginBottom: 12 }}>You: {session.user_role}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-gold)', marginBottom: 8 }}>{session.case.title}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{session.case.summary}</p>
          </div>

          <div className="card" style={{ padding: 16, borderColor: 'var(--accent-gold)' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: 8 }}>Your Score</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent-gold)' }}>⚡ {totalScore}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Cite valid Acts & sections to score points.</div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Relevant Acts:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {session.case.key_acts.map((a: string, i: number) => (
                <div key={i} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>
                  📖 {a}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Transcript & input area */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          
          {/* Transcript */}
          <div className="chat-messages" style={{ flex: 1, padding: 'clamp(20px,2vw,36px)' }}>
            {turns.map((t, i) => (
              <div key={i} className={`turn-card fade-in ${t.speaker === 'Judge' ? 'turn-judge' : t.speaker === 'You' ? 'turn-user' : 'turn-opponent'}`} style={{ maxWidth: 860, width: '100%', margin: '0 auto', alignSelf: 'center' }}>
                <div className="turn-speaker" style={{ color: t.speaker === 'Judge' ? 'var(--accent-gold)' : t.speaker === 'You' ? 'var(--accent-blue)' : 'var(--accent-red)' }}>
                  {t.speaker === 'Judge' ? '⚖️ Judge' : t.speaker === 'You' ? `🗣 You (${session.user_role})` : `🎭 ${session.opponent_role} (AI)`}
                </div>
                <div className="turn-text">{t.text}</div>
              </div>
            ))}
            {loading && (
              <div className="turn-card turn-judge fade-in" style={{ maxWidth: 860, width: '100%', margin: '0 auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input footer */}
          <div style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '16px clamp(20px,2vw,36px)' }}>
            <div style={{ maxWidth: 860, margin: '0 auto', width: '100%' }}>
              {verdict ? (
                <div className="card fade-in" style={{ marginBottom: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--accent-gold)', marginBottom: 12 }}>⚖️ Final Verdict: {verdict.verdict}</div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14, whiteSpace: 'pre-wrap', fontSize: 14 }}>{verdict.reasoning}</p>
                  {verdict.user_performance && (
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, marginBottom: 14 }}>
                      <div className="stat-card">
                        <div className="grade" style={{ color: GRADE_COLOR[verdict.user_performance.grade] || '#94a3b8' }}>{verdict.user_performance.grade}</div>
                        <div className="stat-label">{verdict.user_performance.score_percentage}%</div>
                      </div>
                      <div className="card" style={{ margin: 0 }}>
                        <div style={{ color: 'var(--accent-green)', fontSize: 13, marginBottom: 6 }}>✅ {verdict.user_performance.strongest_argument}</div>
                        <div style={{ color: 'var(--accent-red)', fontSize: 13 }}>⚠️ {verdict.user_performance.weakest_point}</div>
                      </div>
                    </div>
                  )}
                  {verdict.final_message && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 14, marginBottom: 14 }}>{verdict.final_message}</p>}
                  <button onClick={() => setSession(null)} className="btn btn-primary">Play Again</button>
                </div>
              ) : (
                <>
                  {shouldConclude && (
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <button onClick={getVerdict} className="btn btn-gold btn-lg">🔨 Request Verdict</button>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <textarea
                      value={argument}
                      onChange={e => setArgument(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submitArgument())}
                      className="textarea"
                      rows={2}
                      placeholder={`Make your ${session.user_role} argument. Cite Indian Acts and sections for higher scores. (Enter to submit)`}
                      style={{ flex: 1, resize: 'none' }}
                    />
                    <button onClick={submitArgument} disabled={!argument.trim() || loading} className="btn btn-primary btn-lg" style={{ alignSelf: 'flex-end', padding: '12px 28px' }}>
                      Argue
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
