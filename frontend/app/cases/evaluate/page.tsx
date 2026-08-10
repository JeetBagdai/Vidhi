'use client';
import { useState } from 'react';
import Navbar from '../../components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const DOMAINS = ['consumer', 'employment', 'criminal', 'family', 'contract', 'property', 'cyber', 'civil'];

export default function CasePage() {
  const [role, setRole] = useState<'plaintiff' | 'defendant'>('plaintiff');
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('');
  const [facts, setFacts] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [questionnaire, setQuestionnaire] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [observation, setObservation] = useState('');
  const [applicableActs, setApplicableActs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const startIntake = async () => {
    if (!title || !domain || !facts) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/cases/intake`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, role, domain, facts }),
      });
      const data = await res.json();
      setSessionId(data.session_id);
      setQuestionnaire(data.questionnaire || []);
      setObservation(data.preliminary_observation || '');
      setApplicableActs(data.applicable_acts || []);
      setStep(2);
    } catch { alert('Error. Check backend.'); }
    finally { setLoading(false); }
  };

  const evaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/cases/evaluate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, answers }),
      });
      setResult(await res.json()); setStep(3);
    } catch { alert('Evaluation error.'); }
    finally { setLoading(false); }
  };

  const scoreColor = (s: number) => s >= 70 ? 'var(--accent-green)' : s >= 40 ? 'var(--accent-gold)' : 'var(--accent-red)';
  const verdictColor = (v: string) => v === 'Strong' ? 'var(--accent-green)' : v === 'Moderate' ? 'var(--accent-gold)' : 'var(--accent-red)';

  const reset = () => { setStep(1); setResult(null); setAnswers({}); setQuestionnaire([]); setTitle(''); setFacts(''); setDomain(''); };

  return (
    <div className="page" style={{ height: '100vh', overflow: 'hidden' }}>
      <Navbar />

      <div style={{ display: 'grid', gridTemplateColumns: result ? 'minmax(300px,380px) 1fr' : 'minmax(300px,640px) 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* Left: intake form */}
        <div style={{ overflowY: 'auto', background: 'var(--bg-1)', borderRight: '1px solid var(--border)', padding: 'clamp(20px,2vw,36px)', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
              <span style={{ background: 'linear-gradient(90deg, var(--accent-pink), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ⚖️ Case Evaluation
              </span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Get professional legal evaluation with Indian Act citations and strength analysis.</p>
          </div>

          {/* Role toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-2)', borderRadius: 'var(--radius-md)', padding: 4, border: '1px solid var(--border)' }}>
            {(['plaintiff', 'defendant'] as const).map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                flex: 1, padding: '9px 8px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, transition: 'var(--transition)',
                background: role === r ? 'var(--grad-primary)' : 'transparent',
                color: role === r ? '#fff' : 'var(--text-muted)',
              }}>
                {r === 'plaintiff' ? '⚔️ Filing a Case' : '🛡️ Case Against Me'}
              </button>
            ))}
          </div>

          {step === 1 && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label">Case Title</label>
                <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Wrongful termination by employer" />
              </div>
              <div>
                <label className="field-label" style={{ marginBottom: 8 }}>Legal Domain</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {DOMAINS.map(d => (
                    <button key={d} onClick={() => setDomain(d)} className={`tag${domain === d ? ' active' : ''}`} style={{ textTransform: 'capitalize' }}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label">Describe the facts</label>
                <textarea className="textarea" value={facts} onChange={e => setFacts(e.target.value)}
                  placeholder="Be specific: dates, amounts, party names, what happened, documents you have…" rows={6} />
              </div>
              <button onClick={startIntake} disabled={!title || !domain || !facts || loading} className="btn btn-primary btn-full">
                {loading ? <><span className="pulse">⏳</span> Analyzing…</> : '🔍 Generate Questionnaire →'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {observation && (
                <div className="card" style={{ borderColor: 'rgba(29,78,216,0.25)', background: 'rgba(29,78,216,0.05)', padding: '12px 16px' }}>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 600, fontSize: 13 }}>🔎 Initial Observation: </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{observation}</span>
                </div>
              )}
              {applicableActs.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {applicableActs.map((a, i) => <span key={i} className="badge badge-blue" style={{ fontSize: 11 }}>📖 {a}</span>)}
                </div>
              )}
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-purple)' }}>Answer these questions for accurate evaluation</div>
              {questionnaire.map((q: any) => (
                <div key={q.id}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>{q.question}</label>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Why: {q.why_important}</div>
                  {q.type === 'yesno' ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['Yes', 'No'].map(opt => (
                        <button key={opt} onClick={() => setAnswers({ ...answers, [q.id]: opt })} style={{
                          flex: 1, padding: '9px', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${answers[q.id] === opt ? 'var(--accent-purple)' : 'var(--border)'}`,
                          background: answers[q.id] === opt ? 'rgba(109,40,217,0.12)' : 'var(--bg-card)',
                          color: answers[q.id] === opt ? 'var(--accent-purple)' : 'var(--text-secondary)',
                          cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', transition: 'var(--transition)',
                        }}>{opt}</button>
                      ))}
                    </div>
                  ) : q.type === 'select' ? (
                    <select className="input" value={answers[q.id] || ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}>
                      <option value="">Select an option</option>
                      {q.options?.map((opt: string, i: number) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <textarea className="textarea" value={answers[q.id] || ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} rows={2} placeholder="Your answer…" />
                  )}
                </div>
              ))}
              <button onClick={evaluate} disabled={loading} className="btn btn-primary btn-full">
                {loading ? <><span className="pulse">⏳</span> Evaluating…</> : '⚖️ Evaluate My Case'}
              </button>
            </div>
          )}

          {step === 3 && (
            <div style={{ marginTop: 'auto' }}>
              <button onClick={reset} className="btn btn-ghost btn-full">← New Case</button>
            </div>
          )}
        </div>

        {/* Right: results or empty state */}
        <div style={{ overflowY: 'auto', padding: 'clamp(20px,2vw,36px)', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {step < 3 && !result && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>⚖️</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>Your evaluation will appear here</div>
              <div style={{ fontSize: 14 }}>Fill in the details on the left to begin.</div>
            </div>
          )}

          {step === 3 && result && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Score + verdict */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: scoreColor(result.strength_score || 0) }}>{result.strength_score || 0}<span style={{ fontSize: 20 }}>%</span></div>
                  <div className="stat-label">Case Strength</div>
                </div>
                <div className="stat-card">
                  <div className="grade" style={{ color: verdictColor(result.verdict || '') }}>{result.verdict || 'N/A'}</div>
                  <div className="stat-label">Assessment</div>
                </div>
              </div>

              {/* Legal summary */}
              <div className="card">
                <div style={{ color: 'var(--accent-blue)', fontWeight: 700, marginBottom: 10, fontSize: 14 }}>📋 Legal Summary</div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>{result.legal_summary}</p>
              </div>

              {/* Applicable sections */}
              {result.applicable_sections?.length > 0 && (
                <div className="card">
                  <div style={{ color: 'var(--accent-purple)', fontWeight: 700, marginBottom: 12, fontSize: 14 }}>📖 Applicable Laws</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {result.applicable_sections.map((sec: any, i: number) => (
                      <div key={i} style={{ background: 'var(--bg-2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--accent-purple)', fontSize: 13 }}>{sec.act} — §{sec.section}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{sec.relevance}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths + Weaknesses */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                {result.key_strengths?.length > 0 && (
                  <div className="card" style={{ borderColor: 'rgba(4,120,87,0.25)', background: 'rgba(4,120,87,0.04)' }}>
                    <div style={{ color: 'var(--accent-green)', fontWeight: 700, marginBottom: 10, fontSize: 14 }}>✅ Strengths</div>
                    {result.key_strengths.map((s: string, i: number) => (
                      <div key={i} style={{ color: 'var(--accent-green)', fontSize: 13, padding: '3px 0' }}>· {s}</div>
                    ))}
                  </div>
                )}
                {result.key_weaknesses?.length > 0 && (
                  <div className="card" style={{ borderColor: 'rgba(185,28,28,0.25)', background: 'rgba(185,28,28,0.04)' }}>
                    <div style={{ color: 'var(--accent-red)', fontWeight: 700, marginBottom: 10, fontSize: 14 }}>⚠️ Weaknesses</div>
                    {result.key_weaknesses.map((w: string, i: number) => (
                      <div key={i} style={{ color: 'var(--accent-red)', fontSize: 13, padding: '3px 0' }}>· {w}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommended action */}
              {result.recommended_action && (
                <div className="card">
                  <div style={{ color: 'var(--accent-blue)', fontWeight: 700, marginBottom: 10, fontSize: 14 }}>🗺️ Recommended Action</div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: 14 }}>{result.recommended_action}</p>
                </div>
              )}

              {/* Time limitation */}
              {result.time_limitation && (
                <div className="card" style={{ borderColor: 'rgba(180,83,9,0.25)', background: 'rgba(180,83,9,0.04)' }}>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>⏰ Time Limitation: </span>
                  <span style={{ color: 'var(--accent-gold)' }}>{result.time_limitation}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
