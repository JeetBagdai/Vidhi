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
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, role, domain, facts })
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
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, answers })
            });
            setResult(await res.json());
            setStep(3);
        } catch { alert('Evaluation error.'); }
        finally { setLoading(false); }
    };

    const scoreColor = (s: number) => s >= 70 ? '#22c55e' : s >= 40 ? '#f59e0b' : '#ef4444';
    const verdictColor = (v: string) => v === 'Strong' ? '#22c55e' : v === 'Moderate' ? '#f59e0b' : '#ef4444';

    const s: any = {
        page: { minHeight: '100vh', background: 'linear-gradient(135deg,#050810,#0d1117)', color: '#e2e8f0', fontFamily: 'Inter,sans-serif' },
        inner: { maxWidth: 800, margin: '0 auto', padding: '40px 20px' },
        card: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 28, marginBottom: 20 },
        label: { display: 'block', marginBottom: 6, fontWeight: 600, color: '#94a3b8', fontSize: 14 },
        input: { width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' as const, marginBottom: 16 },
        btn: { padding: '12px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(90deg,#7c3aed,#2563eb)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' },
    };

    return (
        <div style={s.page}>
            <Navbar />
            <div style={s.inner}>
                <h1 style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(90deg,#f472b6,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
                    Case Evaluation
                </h1>
                <p style={{ color: '#94a3b8', marginBottom: 24 }}>Get professional legal evaluation of your case with Indian Act citations and strength analysis.</p>

                {/* Role Toggle */}
                <div style={{ display: 'flex', background: '#0f172a', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid #1e293b' }}>
                    {(['plaintiff', 'defendant'] as const).map(r => (
                        <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: role === r ? 'linear-gradient(90deg,#7c3aed,#2563eb)' : 'transparent', color: role === r ? '#fff' : '#64748b', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s' }}>
                            {r === 'plaintiff' ? '⚔️ I am Filing a Case' : '🛡️ A Case is Filed Against Me'}
                        </button>
                    ))}
                </div>

                {step === 1 && (
                    <div style={s.card}>
                        <h3 style={{ color: '#a78bfa', marginBottom: 16 }}>Describe Your Situation</h3>
                        <label style={s.label}>Case Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Wrongful termination by employer" style={s.input} />
                        <label style={s.label}>Legal Domain</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                            {DOMAINS.map(d => (
                                <div key={d} onClick={() => setDomain(d)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${domain === d ? '#7c3aed' : '#334155'}`, background: domain === d ? '#3b0764' : '#1e293b', cursor: 'pointer', fontSize: 13, textTransform: 'capitalize' }}>{d}</div>
                            ))}
                        </div>
                        <label style={s.label}>Describe the facts of your case</label>
                        <textarea value={facts} onChange={e => setFacts(e.target.value)} placeholder="Be as specific as possible: dates, amounts, names of parties, what happened, any documents you have..." rows={5} style={{ ...s.input, resize: 'vertical' }} />
                        <button onClick={startIntake} disabled={!title || !domain || !facts || loading} style={{ ...s.btn, opacity: title && domain && facts && !loading ? 1 : 0.5 }}>
                            {loading ? '⏳ Analyzing…' : '🔍 Generate Questionnaire →'}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div style={s.card}>
                        {observation && (
                            <div style={{ background: '#0d1f3c', border: '1px solid #2563eb40', borderRadius: 10, padding: 14, marginBottom: 20 }}>
                                <span style={{ color: '#60a5fa', fontWeight: 600 }}>🔎 Initial Observation: </span>
                                <span style={{ color: '#cbd5e1' }}>{observation}</span>
                            </div>
                        )}
                        {applicableActs.length > 0 && (
                            <div style={{ marginBottom: 20 }}>
                                {applicableActs.map((a, i) => <span key={i} style={{ display: 'inline-block', background: '#1e3a5f', color: '#60a5fa', borderRadius: 20, padding: '3px 12px', fontSize: 12, marginRight: 6, marginBottom: 6 }}>📖 {a}</span>)}
                            </div>
                        )}
                        <h3 style={{ color: '#a78bfa', marginBottom: 16 }}>Answer these questions for an accurate evaluation</h3>
                        {questionnaire.map((q: any) => (
                            <div key={q.id} style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#e2e8f0' }}>{q.question}</label>
                                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Why this matters: {q.why_important}</div>
                                {q.type === 'yesno' ? (
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        {['Yes', 'No'].map(opt => (
                                            <button key={opt} onClick={() => setAnswers({ ...answers, [q.id]: opt })} style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${answers[q.id] === opt ? '#7c3aed' : '#334155'}`, background: answers[q.id] === opt ? '#3b0764' : '#1e293b', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>{opt}</button>
                                        ))}
                                    </div>
                                ) : q.type === 'select' ? (
                                    <select value={answers[q.id] || ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} style={{ ...s.input, marginBottom: 0 }}>
                                        <option value="">Select an option</option>
                                        {q.options?.map((opt: string, i: number) => <option key={i} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <textarea value={answers[q.id] || ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} rows={2} style={{ ...s.input, resize: 'vertical', marginBottom: 0 }} placeholder="Your answer..." />
                                )}
                            </div>
                        ))}
                        <button onClick={evaluate} disabled={loading} style={{ ...s.btn, opacity: !loading ? 1 : 0.5 }}>
                            {loading ? '⏳ Evaluating…' : '⚖️ Evaluate My Case'}
                        </button>
                    </div>
                )}

                {step === 3 && result && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div style={{ background: '#0f172a', border: `1px solid ${scoreColor(result.strength_score || 0)}40`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
                                <div style={{ fontSize: 56, fontWeight: 900, color: scoreColor(result.strength_score || 0) }}>{result.strength_score || 0}<span style={{ fontSize: 20 }}>%</span></div>
                                <div style={{ color: '#94a3b8' }}>Case Strength</div>
                            </div>
                            <div style={{ background: '#0f172a', border: `1px solid ${verdictColor(result.verdict || '')}40`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
                                <div style={{ fontSize: 36, fontWeight: 900, color: verdictColor(result.verdict || '') }}>{result.verdict || 'N/A'}</div>
                                <div style={{ color: '#94a3b8' }}>Assessment</div>
                            </div>
                        </div>

                        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                            <h3 style={{ color: '#60a5fa', marginBottom: 8 }}>Legal Summary</h3>
                            <p style={{ color: '#cbd5e1', lineHeight: 1.7 }}>{result.legal_summary}</p>
                        </div>

                        {result.applicable_sections?.length > 0 && (
                            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                                <h3 style={{ color: '#a78bfa', marginBottom: 12 }}>📖 Applicable Laws</h3>
                                {result.applicable_sections.map((sec: any, i: number) => (
                                    <div key={i} style={{ background: '#1e293b', borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
                                        <div style={{ fontWeight: 700, color: '#a78bfa' }}>{sec.act} — §{sec.section}</div>
                                        <div style={{ color: '#cbd5e1', fontSize: 13, marginTop: 4 }}>{sec.relevance}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            {result.key_strengths?.length > 0 && (
                                <div style={{ background: '#052e16', border: '1px solid #22c55e30', borderRadius: 12, padding: 16 }}>
                                    <h3 style={{ color: '#22c55e', marginBottom: 8 }}>✅ Strengths</h3>
                                    {result.key_strengths.map((s: string, i: number) => <div key={i} style={{ color: '#86efac', fontSize: 13, padding: '4px 0' }}>• {s}</div>)}
                                </div>
                            )}
                            {result.key_weaknesses?.length > 0 && (
                                <div style={{ background: '#450a0a', border: '1px solid #ef444430', borderRadius: 12, padding: 16 }}>
                                    <h3 style={{ color: '#ef4444', marginBottom: 8 }}>⚠️ Weaknesses</h3>
                                    {result.key_weaknesses.map((w: string, i: number) => <div key={i} style={{ color: '#fca5a5', fontSize: 13, padding: '4px 0' }}>• {w}</div>)}
                                </div>
                            )}
                        </div>

                        {result.recommended_action && (
                            <div style={{ background: '#0f172a', border: '1px solid #2563eb40', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                                <h3 style={{ color: '#60a5fa', marginBottom: 8 }}>🗺️ Recommended Action</h3>
                                <p style={{ color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{result.recommended_action}</p>
                            </div>
                        )}

                        {result.time_limitation && (
                            <div style={{ background: '#1a1400', border: '1px solid #f59e0b40', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                                <span style={{ color: '#f59e0b', fontWeight: 600 }}>⏰ Time Limitation: </span>
                                <span style={{ color: '#fcd34d' }}>{result.time_limitation}</span>
                            </div>
                        )}

                        <button onClick={() => { setStep(1); setResult(null); setAnswers({}); setQuestionnaire([]); }} style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}>
                            ← New Case
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
