'use client';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
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
    fetch(`${API}/chat/suggested-questions`)
      .then(r => r.json()).then(d => setSuggested(d.questions || [])).catch(() => {});
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
        body: JSON.stringify({ message: msg, history: newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content })), domain }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'model', content: data.response }]);
    } catch {
      setMessages([...newMessages, { role: 'model', content: 'Sorry, an error occurred. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ height: '100vh', overflow: 'hidden' }}>
      <Navbar />

      <div className="chat-layout">
        {/* Sidebar: domain + info */}
        <aside className="chat-sidebar">
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Legal Domain
          </div>
          {DOMAINS.map(d => (
            <button
              key={d}
              onClick={() => setDomain(d)}
              style={{
                width: '100%', textAlign: 'left', padding: '8px 12px',
                borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                background: domain === d ? 'rgba(109,40,217,0.12)' : 'transparent',
                color: domain === d ? 'var(--accent-purple)' : 'var(--text-secondary)',
                fontWeight: domain === d ? 700 : 500, fontSize: 14,
                fontFamily: 'Inter, sans-serif', transition: 'var(--transition)',
                textTransform: 'capitalize',
              }}
            >
              {d}
            </button>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              All answers cite specific Indian Acts and sections.
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 10, width: '100%' }}
              >
                Clear Chat
              </button>
            )}
          </div>
        </aside>

        {/* Main chat area */}
        <div className="chat-main">
          {/* Header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 16 }}>💬 Legal Chat</span>
              <span className="badge badge-purple" style={{ marginLeft: 10, textTransform: 'capitalize' }}>{domain}</span>
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{messages.length > 0 ? `${Math.ceil(messages.filter(m => m.role === 'user').length)} question${messages.filter(m => m.role === 'user').length !== 1 ? 's' : ''}` : 'Ask anything about Indian law'}</span>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
                <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Ask Vidhi anything</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32, textAlign: 'center', maxWidth: 400 }}>
                  Get answers backed by specific Indian Acts, sections, and real case precedents.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, width: '100%', maxWidth: 700 }}>
                  {suggested.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => send(q)}
                      className="card"
                      style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'left', cursor: 'pointer', border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontFamily: 'inherit', lineHeight: 1.5 }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className="fade-in" style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start', gap: 10 }}>
                {m.role === 'model' && <div className="bubble-avatar">⚖️</div>}
                <div className={m.role === 'user' ? 'bubble-user' : 'bubble-ai'}>
                  {m.role === 'model' ? (
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="fade-in" style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div className="bubble-avatar">⚖️</div>
                <div className="bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '16px 18px' }}>
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input footer */}
          <div className="chat-footer">
            <div className="chat-input-bar">
              <input
                className="chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask about Indian law… e.g. Can my employer withhold my salary?"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="btn btn-primary"
                style={{ borderRadius: 14, padding: '8px 22px' }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
