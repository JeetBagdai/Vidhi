'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Message { role: 'user' | 'model'; content: string; }

const DOMAINS = ['general', 'criminal', 'civil', 'consumer', 'family', 'contract', 'property', 'business', 'cyber'];

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [domain, setDomain] = useState('general');
    const [loading, setLoading] = useState(false);
    const [suggested, setSuggested] = useState<string[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`${API}/chat/suggested-questions`).then(r => r.json()).then(d => setSuggested(d.questions || [])).catch(() => { });
    }, []);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = async (text?: string) => {
        const msg = text || input.trim();
        if (!msg) return;
        const newMessages: Message[] = [...messages, { role: 'user', content: msg }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);
        try {
            const res = await fetch(`${API}/chat/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, history: newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content })), domain })
            });
            const data = await res.json();
            setMessages([...newMessages, { role: 'model', content: data.response }]);
        } catch { setMessages([...newMessages, { role: 'model', content: 'Sorry, an error occurred. Please try again.' }]); }
        finally { setLoading(false); }
    };

    const s: any = {
        page: { minHeight: '100vh', background: 'linear-gradient(135deg,#050810,#0d1117)', color: '#e2e8f0', fontFamily: 'Inter,sans-serif', display: 'flex', flexDirection: 'column' as const },
        userBubble: { maxWidth: '75%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', padding: '12px 16px', borderRadius: '18px 18px 4px 18px', marginLeft: 'auto', lineHeight: 1.6 },
        aiBubble: { maxWidth: '80%', background: '#0f172a', border: '1px solid #1e293b', padding: '14px 18px', borderRadius: '4px 18px 18px 18px', lineHeight: 1.7, whiteSpace: 'pre-wrap' as const, fontSize: 14 },
        tag: { display: 'inline-block', padding: '4px 12px', borderRadius: 20, border: '1px solid #334155', fontSize: 12, cursor: 'pointer', margin: '0 4px 6px 0', transition: 'all 0.2s' }
    };

    return (
        <div style={s.page}>
            <Navbar />
            <div style={{ maxWidth: 800, width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px 20px' }}>
                <div style={{ padding: '24px 0 16px' }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg,#fb923c,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>Legal Chat</h1>
                    <p style={{ color: '#64748b', fontSize: 14 }}>Ask any Indian law question. All answers cite specific Acts and sections.</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                        {DOMAINS.map(d => (
                            <span key={d} onClick={() => setDomain(d)} style={{ ...s.tag, background: domain === d ? '#7c3aed' : '#1e293b', color: domain === d ? '#fff' : '#94a3b8', borderColor: domain === d ? '#7c3aed' : '#334155' }}>
                                {d}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 16, minHeight: 300 }}>
                    {messages.length === 0 && (
                        <div>
                            <div style={{ color: '#475569', textAlign: 'center', padding: '40px 0 20px', fontSize: 14 }}>Vidhi knows Indian law. Ask anything.</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                                {suggested.map((q, i) => (
                                    <div key={i} onClick={() => send(q)} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 20, padding: '8px 14px', fontSize: 13, cursor: 'pointer', color: '#94a3b8', maxWidth: 260, textAlign: 'center', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.color = '#a78bfa'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#94a3b8'; }}>
                                        {q}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages.map((m, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                            {m.role === 'model' && <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0, marginTop: 2 }}>⚖️</div>}
                            <div style={m.role === 'user' ? s.userBubble : s.aiBubble}>{m.content}</div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ display: 'flex' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>⚖️</div>
                            <div style={{ ...s.aiBubble, color: '#64748b' }}>Thinking…</div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                <div style={{ display: 'flex', gap: 10, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: 8 }}>
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} placeholder="Ask about Indian law..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 15, padding: '6px 10px' }} />
                    <button onClick={() => send()} disabled={!input.trim() || loading} style={{ background: input.trim() && !loading ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : '#1e293b', border: 'none', borderRadius: 10, padding: '8px 18px', color: '#fff', fontWeight: 700, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
