'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function LearnPage() {
    const [modules, setModules] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [lesson, setLesson] = useState<any>(null);
    const [lessonNum, setLessonNum] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [feedback, setFeedback] = useState<any>(null);
    const [xp, setXp] = useState(0);

    useEffect(() => {
        fetch(`${API}/learn/modules`).then(r => r.json()).then(d => setModules(d.modules || [])).catch(() => { });
    }, []);

    const loadLesson = async (mod: any, num: number) => {
        setLoading(true); setLesson(null); setSelectedAnswer(''); setFeedback(null);
        try {
            const res = await fetch(`${API}/learn/lesson`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module_id: mod.id, lesson_number: num }) });
            setLesson(await res.json());
        } catch { alert('Failed to load lesson.'); }
        finally { setLoading(false); }
    };

    const checkAnswer = async () => {
        if (!selectedAnswer || !lesson) return;
        try {
            const res = await fetch(`${API}/learn/check-answer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module_id: selected.id, lesson_number: lessonNum, question_id: 'q1', user_answer: selectedAnswer, correct_answer: lesson.interactive_question?.correct_answer }) });
            const data = await res.json();
            setFeedback(data);
            setXp(prev => prev + (data.xp_earned || 0));
        } catch { alert('Error checking answer.'); }
    };

    const levelColor = (l: string) => l === 'Beginner' ? '#22c55e' : l === 'Intermediate' ? '#f59e0b' : '#ef4444';

    if (!selected) return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#050810,#0d1117)', color: '#e2e8f0', fontFamily: 'Inter,sans-serif' }}>
            <Navbar />
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(90deg,#fbbf24,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Legal Learning</h1>
                    <div style={{ background: '#1e293b', borderRadius: 20, padding: '6px 18px', fontWeight: 700, color: '#fbbf24' }}>⚡ {xp} XP</div>
                </div>
                <p style={{ color: '#94a3b8', marginBottom: 28 }}>Learn Indian law in micro-doses. Real examples, real cases, real citations.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    {modules.map(m => (
                        <div key={m.id} onClick={() => { setSelected(m); setLessonNum(1); loadLesson(m, 1); }}
                            style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 24, cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div style={{ fontSize: 36, marginBottom: 8 }}>{m.icon}</div>
                            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{m.title}</div>
                            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>{m.description}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: levelColor(m.level), fontSize: 12, fontWeight: 600 }}>{m.level}</span>
                                <span style={{ color: '#475569', fontSize: 12 }}>{m.lessons} lessons</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#050810,#0d1117)', color: '#e2e8f0', fontFamily: 'Inter,sans-serif' }}>
            <Navbar />
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <button onClick={() => { setSelected(null); setLesson(null); }} style={{ background: 'transparent', border: '1px solid #334155', borderRadius: 8, padding: '6px 14px', color: '#94a3b8', cursor: 'pointer' }}>← Back</button>
                    <div style={{ fontWeight: 700, color: '#fbbf24' }}>⚡ {xp} XP</div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ color: '#a78bfa', fontWeight: 700 }}>{selected.icon} {selected.title}</span>
                        <span style={{ color: '#64748b', fontSize: 13 }}>Lesson {lessonNum} / {selected.lessons}</span>
                    </div>
                    <div style={{ background: '#1e293b', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(90deg,#7c3aed,#2563eb)', height: '100%', width: `${(lessonNum / selected.lessons) * 100}%`, transition: 'width 0.3s' }} />
                    </div>
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
                        <div>Loading lesson…</div>
                    </div>
                )}

                {lesson && !loading && (
                    <div>
                        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 24, marginBottom: 16 }}>
                            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#a78bfa', marginBottom: 12 }}>{lesson.lesson_title}</h2>
                            <p style={{ color: '#cbd5e1', lineHeight: 1.7, marginBottom: 12 }}>{lesson.concept}</p>
                            {lesson.act_citation && <div style={{ display: 'inline-block', background: '#1e3a5f', color: '#60a5fa', borderRadius: 20, padding: '4px 14px', fontSize: 13 }}>📖 {lesson.act_citation}</div>}
                        </div>

                        {lesson.real_example && (
                            <div style={{ background: '#0d1f0d', border: '1px solid #22c55e30', borderRadius: 16, padding: 24, marginBottom: 16 }}>
                                <div style={{ color: '#22c55e', fontWeight: 700, marginBottom: 12 }}>🔍 Real Example</div>
                                <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Scenario</div>
                                    <div style={{ color: '#94a3b8', lineHeight: 1.6 }}>{lesson.real_example.scenario}</div>
                                </div>
                                <div style={{ color: '#fcd34d', marginBottom: 6 }}>⚖️ <strong>What the law says:</strong> {lesson.real_example.what_the_law_says}</div>
                                <div style={{ color: '#86efac' }}>✅ <strong>Outcome:</strong> {lesson.real_example.outcome}</div>
                            </div>
                        )}

                        {lesson.quick_fact && (
                            <div style={{ background: '#130d27', border: '1px solid #7c3aed40', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                                <span style={{ color: '#a78bfa', fontWeight: 600 }}>💡 Did you know? </span>
                                <span style={{ color: '#c4b5fd' }}>{lesson.quick_fact}</span>
                            </div>
                        )}

                        {lesson.interactive_question && (
                            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 24, marginBottom: 16 }}>
                                <div style={{ color: '#60a5fa', fontWeight: 700, marginBottom: 12 }}>🧠 Quick Check</div>
                                <div style={{ fontWeight: 600, marginBottom: 16, lineHeight: 1.5 }}>{lesson.interactive_question.question}</div>
                                {lesson.interactive_question.options?.map((opt: string, i: number) => (
                                    <div key={i} onClick={() => !feedback && setSelectedAnswer(opt.split(':')[0].trim())}
                                        style={{ padding: '12px 16px', borderRadius: 10, border: `1px solid ${selectedAnswer === opt.split(':')[0].trim() ? '#7c3aed' : '#334155'}`, background: selectedAnswer === opt.split(':')[0].trim() ? '#3b0764' : '#1e293b', cursor: feedback ? 'default' : 'pointer', marginBottom: 8, transition: 'all 0.2s' }}>
                                        {opt}
                                    </div>
                                ))}

                                {!feedback && selectedAnswer && (
                                    <button onClick={checkAnswer} style={{ marginTop: 8, padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(90deg,#7c3aed,#2563eb)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                                        Check Answer
                                    </button>
                                )}

                                {feedback && (
                                    <div style={{ marginTop: 12, background: feedback.is_correct ? '#052e16' : '#450a0a', border: `1px solid ${feedback.is_correct ? '#22c55e40' : '#ef444440'}`, borderRadius: 10, padding: 16 }}>
                                        <div style={{ fontWeight: 700, color: feedback.is_correct ? '#22c55e' : '#ef4444', marginBottom: 6 }}>{feedback.is_correct ? '🎉 Correct!' : '❌ Not quite'} +{feedback.xp_earned} XP</div>
                                        <div style={{ color: '#cbd5e1', lineHeight: 1.6, marginBottom: 8 }}>{feedback.feedback}</div>
                                        {feedback.bonus_fact && <div style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>💡 {feedback.bonus_fact}</div>}
                                    </div>
                                )}
                            </div>
                        )}

                        {lesson.key_takeaway && (
                            <div style={{ background: '#130d27', border: '1px solid #7c3aed40', borderRadius: 12, padding: 14, marginBottom: 20 }}>
                                <span style={{ color: '#a78bfa', fontWeight: 700 }}>Key Takeaway: </span>
                                <span style={{ color: '#e2e8f0' }}>{lesson.key_takeaway}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 10 }}>
                            {lessonNum > 1 && <button onClick={() => { const n = lessonNum - 1; setLessonNum(n); loadLesson(selected, n); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}>← Previous</button>}
                            {lessonNum < selected.lessons && <button onClick={() => { const n = lessonNum + 1; setLessonNum(n); loadLesson(selected, n); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: 'linear-gradient(90deg,#7c3aed,#2563eb)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Next Lesson →</button>}
                            {lessonNum === selected.lessons && <button onClick={() => setSelected(null)} style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: 'linear-gradient(90deg,#059669,#0ea5e9)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>✅ Module Complete!</button>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
