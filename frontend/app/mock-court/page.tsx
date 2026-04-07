'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Turn { speaker: string; text: string; score?: number; }

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
        fetch(`${API}/mock-court/cases`).then(r => r.json()).then(d => setCases(d.cases || [])).catch(() => { });
    }, []);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [turns]);

    const startCase = async (caseId: string, role: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/mock-court/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ case_id: caseId, user_role: role }) });
            const data = await res.json();
            setSession(data);
            setTurns([{ speaker: '⚖️ Judge', text: data.judge_opening }]);
            setVerdict(null); setTotalScore(0); setShouldConclude(false);
        } catch { alert('Failed to start case.'); }
        finally { setLoading(false); }
    };

    const submitArgument = async () => {
        if (!argument.trim() || !session || loading) return;
        const arg = argument.trim();
        setArgument('');
        setTurns(prev => [...prev, { speaker: `You (${session.user_role})`, text: arg }]);
        setLoading(true);
        try {
            const res = await fetch(`${API}/mock-court/argue`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: session.session_id, argument: arg }) });
            const data = await res.json();
            setTotalScore(data.cumulative_score || 0);
            setTurns(prev => [
                ...prev,
                { speaker: '⚖️ Judge', text: `[Score: ${data.argument_score}/10] ${data.judge_comment}`, score: data.argument_score },
                { speaker: `🎭 ${session.opponent_role.charAt(0).toUpperCase() + session.opponent_role.slice(1)} (AI)`, text: data.opponent_argument }
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

    const gradeColor = (g: string) => ({ A: '#22c55e', B: '#60a5fa', C: '#f59e0b', D: '#ef4444' }[g] || '#94a3b8');
    const diffColor = (d: string) => d === 'Beginner' ? '#22c55e' : d === 'Intermediate' ? '#f59e0b' : '#ef4444';

    if (!session) return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#050810,#0d1117)', color: '#e2e8f0', fontFamily: 'Inter,sans-serif' }}>
            <Navbar />
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(90deg,#fbbf24,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>⚖️ Mock Court</h1>
                <p style={{ color: '#94a3b8', marginBottom: 28 }}>Step into the courtroom. Argue your case. Face an AI judge and opposing counsel citing Indian law.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {cases.map(c => (
                        <div key={c.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 12, color: '#64748b', background: '#1e293b', borderRadius: 20, padding: '2px 10px' }}>{c.category}</span>
                                <span style={{ fontSize: 12, color: diffColor(c.difficulty), fontWeight: 700 }}>{c.difficulty}</span>
                            </div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{c.title}</h3>
                            <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>{c.summary}</p>
                            <div style={{ marginBottom: 14 }}>
                                {c.key_acts.map((a: string, i: number) => <span key={i} style={{ display: 'inline-block', background: '#1e3a5f', color: '#60a5fa', borderRadius: 12, padding: '2px 8px', fontSize: 11, marginRight: 4, marginBottom: 4 }}>{a}</span>)}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => startCase(c.id, 'prosecution')} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#7c1d1d', color: '#fca5a5', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>⚔️ Prosecute</button>
                                <button onClick={() => startCase(c.id, 'defence')} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#1e3a5f', color: '#60a5fa', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>🛡️ Defend</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#050810', color: '#e2e8f0', fontFamily: 'Inter,sans-serif', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ background: '#0a0f1a', borderBottom: '1px solid #1e293b', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{session.case.title}</span>
                    <span style={{ marginLeft: 12, background: '#1e293b', borderRadius: 20, padding: '2px 10px', fontSize: 12, color: '#94a3b8' }}>You: {session.user_role}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>Score: {totalScore}</span>
                    <button onClick={() => setSession(null)} style={{ background: 'transparent', border: '1px solid #334155', borderRadius: 8, padding: '4px 12px', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>Exit</button>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 800, width: '100%', margin: '0 auto' }}>
                {turns.map((t, i) => (
                    <div key={i} style={{ background: t.speaker.includes('You') ? '#0d1f3c' : '#0f172a', border: `1px solid ${t.speaker.includes('Judge') ? '#f59e0b30' : t.speaker.includes('You') ? '#2563eb40' : '#ef444430'}`, borderRadius: 12, padding: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: t.speaker.includes('Judge') ? '#fbbf24' : t.speaker.includes('You') ? '#60a5fa' : '#f87171' }}>{t.speaker}</div>
                        <div style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: 14, whiteSpace: 'pre-wrap' }}>{t.text}</div>
                    </div>
                ))}
                {loading && <div style={{ color: '#64748b', textAlign: 'center', padding: '10px 0' }}>⏳ Thinking…</div>}
                <div ref={bottomRef} />
            </div>

            {verdict ? (
                <div style={{ padding: 20, borderTop: '1px solid #1e293b', background: '#0a0f1a', maxWidth: 800, width: '100%', margin: '0 auto' }}>
                    <div style={{ background: '#0f172a', borderRadius: 14, padding: 20 }}>
                        <div style={{ fontWeight: 800, fontSize: 20, color: '#fbbf24', marginBottom: 8 }}>⚖️ Final Verdict: {verdict.verdict}</div>
                        <p style={{ color: '#cbd5e1', lineHeight: 1.7, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{verdict.reasoning}</p>
                        {verdict.user_performance && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                                    <div style={{ fontSize: 40, fontWeight: 900, color: gradeColor(verdict.user_performance.grade) }}>{verdict.user_performance.grade}</div>
                                    <div style={{ color: '#94a3b8', fontSize: 13 }}>Grade ({verdict.user_performance.score_percentage}%)</div>
                                </div>
                                <div style={{ background: '#1e293b', borderRadius: 10, padding: 14 }}>
                                    <div style={{ color: '#22c55e', fontSize: 13, marginBottom: 6 }}>✅ {verdict.user_performance.strongest_argument}</div>
                                    <div style={{ color: '#f87171', fontSize: 13 }}>⚠️ {verdict.user_performance.weakest_point}</div>
                                </div>
                            </div>
                        )}
                        {verdict.final_message && <div style={{ marginTop: 12, color: '#94a3b8', fontStyle: 'italic', fontSize: 14 }}>{verdict.final_message}</div>}
                        <button onClick={() => setSession(null)} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(90deg,#7c3aed,#2563eb)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Play Again</button>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '12px 20px', borderTop: '1px solid #1e293b', background: '#0a0f1a', maxWidth: 800, width: '100%', margin: '0 auto', boxSizing: 'border-box' as const }}>
                    {shouldConclude && !verdict && (
                        <div style={{ marginBottom: 10, textAlign: 'center' }}>
                            <button onClick={getVerdict} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(90deg,#f59e0b,#ef4444)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>🔨 Request Verdict</button>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <textarea value={argument} onChange={e => setArgument(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submitArgument())} placeholder={`Make your ${session.user_role} argument. Cite Indian Acts and sections for higher scores. (Enter to submit)`} rows={2} style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px', color: '#e2e8f0', resize: 'none', outline: 'none', fontSize: 14 }} />
                        <button onClick={submitArgument} disabled={!argument.trim() || loading} style={{ padding: '0 20px', borderRadius: 10, border: 'none', background: argument.trim() && !loading ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : '#1e293b', color: '#fff', fontWeight: 700, cursor: argument.trim() && !loading ? 'pointer' : 'not-allowed' }}>Argue</button>
                    </div>
                </div>
            )}
        </div>
    );
}
