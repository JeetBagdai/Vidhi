'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const LEVEL_BADGE: Record<string, string> = { Beginner: 'badge-green', Intermediate: 'badge-gold', Advanced: 'badge-red' };

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
    fetch(`${API}/learn/modules`).then(r => r.json()).then(d => setModules(d.modules || [])).catch(() => {});
  }, []);

  const loadLesson = async (mod: any, num: number) => {
    setLoading(true); setLesson(null); setSelectedAnswer(''); setFeedback(null);
    try {
      const res = await fetch(`${API}/learn/lesson`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_id: mod.id, lesson_number: num }),
      });
      setLesson(await res.json());
    } catch { alert('Failed to load lesson.'); }
    finally { setLoading(false); }
  };

  const checkAnswer = async () => {
    if (!selectedAnswer || !lesson) return;
    try {
      const res = await fetch(`${API}/learn/check-answer`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_id: selected.id, lesson_number: lessonNum, question_id: 'q1', user_answer: selectedAnswer, correct_answer: lesson.interactive_question?.correct_answer }),
      });
      const data = await res.json();
      setFeedback(data);
      setXp(prev => prev + (data.xp_earned || 0));
    } catch { alert('Error checking answer.'); }
  };

  /* ── Module Selection ── */
  if (!selected) return (
    <div className="page" style={{ height: '100vh', overflow: 'hidden' }}>
      <Navbar />
      <div className="page-inner" style={{ overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h1 className="h2 grad-gold" style={{ marginBottom: 0 }}>📚 Legal Learning</h1>
          <div className="badge badge-gold" style={{ fontSize: 14, padding: '6px 16px' }}>⚡ {xp} XP</div>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: 36, fontSize: 15 }}>Learn Indian law in micro-doses. Real examples, real cases, real citations.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {modules.map((m, i) => (
            <div
              key={m.id}
              className="feature-card fade-in"
              onClick={() => { setSelected(m); setLessonNum(1); loadLesson(m, 1); }}
              style={{ cursor: 'pointer', animationDelay: `${i * 0.06}s` }}
            >
              <div className="feature-icon">{m.icon}</div>
              <h3 className="feature-title">{m.title}</h3>
              <p className="feature-desc" style={{ marginBottom: 16 }}>{m.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${LEVEL_BADGE[m.level] || 'badge-grey'}`}>{m.level}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{m.lessons} lessons</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── Lesson View ── */
  return (
    <div className="page" style={{ height: '100vh', overflow: 'hidden' }}>
      <Navbar />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        
        {/* Left: Progress Sidebar */}
        <div style={{ background: 'var(--bg-1)', borderRight: '1px solid var(--border)', padding: 'clamp(20px,2vw,36px)', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
          <button onClick={() => { setSelected(null); setLesson(null); }} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>← Back to Modules</button>
          
          <div>
            <div className="badge badge-gold" style={{ fontSize: 14, padding: '6px 16px', marginBottom: 24 }}>⚡ {xp} XP Earned</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-purple)', marginBottom: 8 }}>{selected.icon} {selected.title}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>Module Progress: Lesson {lessonNum} / {selected.lessons}</div>
            
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(lessonNum / selected.lessons) * 100}%` }} />
            </div>
          </div>
          
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lessonNum > 1 && (
              <button onClick={() => { const n = lessonNum - 1; setLessonNum(n); loadLesson(selected, n); }} className="btn btn-secondary btn-full">
                ← Previous Lesson
              </button>
            )}
            {lessonNum < selected.lessons ? (
              <button onClick={() => { const n = lessonNum + 1; setLessonNum(n); loadLesson(selected, n); }} className="btn btn-primary btn-full">
                Next Lesson →
              </button>
            ) : (
              <button onClick={() => setSelected(null)} className="btn btn-success btn-full">
                ✅ Complete Module
              </button>
            )}
          </div>
        </div>

        {/* Right: Lesson Content */}
        <div style={{ padding: 'clamp(24px,3vw,48px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: 860 }}>
            
            {loading && (
              <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }} className="pulse">📚</div>
                <div style={{ fontSize: 16 }}>Loading lesson…</div>
              </div>
            )}

            {lesson && !loading && (
              <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Concept card */}
                <div className="card">
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-purple)', marginBottom: 14 }}>{lesson.lesson_title}</h2>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 15, marginBottom: lesson.act_citation ? 16 : 0 }}>{lesson.concept}</p>
                  {lesson.act_citation && (
                    <span className="badge badge-blue" style={{ fontSize: 13 }}>📖 {lesson.act_citation}</span>
                  )}
                </div>

                {/* Grid for Example and Quick Fact */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
                  {/* Real example */}
                  {lesson.real_example && (
                    <div className="card" style={{ borderColor: 'rgba(4,120,87,0.25)', background: 'rgba(4,120,87,0.04)' }}>
                      <div style={{ color: 'var(--accent-green)', fontWeight: 700, marginBottom: 12, fontSize: 15 }}>🔍 Real Example</div>
                      <div style={{ background: 'var(--bg-2)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: 'var(--text-muted)' }}>SCENARIO</div>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>{lesson.real_example.scenario}</div>
                      </div>
                      <div style={{ color: 'var(--accent-gold)', marginBottom: 8, fontSize: 14 }}>⚖️ <strong>What the law says:</strong> {lesson.real_example.what_the_law_says}</div>
                      <div style={{ color: 'var(--accent-green)', fontSize: 14 }}>✅ <strong>Outcome:</strong> {lesson.real_example.outcome}</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Quick fact */}
                    {lesson.quick_fact && (
                      <div className="card" style={{ borderColor: 'rgba(109,40,217,0.25)', background: 'rgba(109,40,217,0.05)' }}>
                        <span style={{ color: 'var(--accent-purple)', fontWeight: 700, fontSize: 15 }}>💡 Did you know? </span>
                        <div style={{ color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>{lesson.quick_fact}</div>
                      </div>
                    )}
                    
                    {/* Key takeaway */}
                    {lesson.key_takeaway && (
                      <div className="card" style={{ borderColor: 'rgba(29,78,216,0.25)', background: 'rgba(29,78,216,0.05)' }}>
                        <span style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: 15 }}>🎯 Key Takeaway </span>
                        <div style={{ color: 'var(--text-primary)', marginTop: 8, lineHeight: 1.6 }}>{lesson.key_takeaway}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quiz */}
                {lesson.interactive_question && (
                  <div className="card">
                    <div style={{ color: 'var(--accent-blue)', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🧠 Quick Check</div>
                    <div style={{ fontWeight: 600, marginBottom: 20, lineHeight: 1.6, fontSize: 16 }}>{lesson.interactive_question.question}</div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                      {lesson.interactive_question.options?.map((opt: string, i: number) => {
                        const val = opt.split(':')[0].trim();
                        const isSelected = selectedAnswer === val;
                        return (
                          <div
                            key={i}
                            onClick={() => !feedback && setSelectedAnswer(val)}
                            style={{
                              padding: '14px 18px', borderRadius: 'var(--radius-md)', fontSize: 14,
                              border: `1.5px solid ${isSelected ? 'var(--accent-purple)' : 'var(--border)'}`,
                              background: isSelected ? 'rgba(109,40,217,0.08)' : 'var(--bg-2)',
                              color: isSelected ? 'var(--accent-purple)' : 'var(--text-secondary)',
                              cursor: feedback ? 'default' : 'pointer', transition: 'var(--transition)',
                              fontWeight: isSelected ? 600 : 400
                            }}
                          >
                            {opt}
                          </div>
                        );
                      })}
                    </div>

                    {!feedback && selectedAnswer && (
                      <div style={{ marginTop: 20, textAlign: 'right' }}>
                        <button onClick={checkAnswer} className="btn btn-primary btn-lg">Check Answer</button>
                      </div>
                    )}

                    {feedback && (
                      <div className="card fade-in" style={{ marginTop: 20, borderColor: feedback.is_correct ? 'rgba(4,120,87,0.3)' : 'rgba(185,28,28,0.3)', background: feedback.is_correct ? 'rgba(4,120,87,0.06)' : 'rgba(185,28,28,0.06)' }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: feedback.is_correct ? 'var(--accent-green)' : 'var(--accent-red)', marginBottom: 8 }}>
                          {feedback.is_correct ? '🎉 Correct!' : '❌ Not quite'} &nbsp;+{feedback.xp_earned} XP
                        </div>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: 15, marginBottom: feedback.bonus_fact ? 12 : 0 }}>{feedback.feedback}</div>
                        {feedback.bonus_fact && <div style={{ color: 'var(--text-muted)', fontSize: 14, fontStyle: 'italic' }}>💡 {feedback.bonus_fact}</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
