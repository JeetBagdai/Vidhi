'use client';
import { useState, useRef } from 'react';
import Navbar from '../../components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FlaggedClause {
    clause_title: string;
    clause_excerpt: string;
    risk_level: 'High' | 'Medium' | 'Low';
    issue: string;
    act_citation: string;
    counter_suggestion: string;
}

interface AnalysisResult {
    risk_score: number;
    summary: string;
    flagged_clauses: FlaggedClause[];
    missing_clauses: string[];
    overall_assessment: string;
    filename: string;
}

const riskColors = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };
const riskBg = { High: '#450a0a', Medium: '#451a03', Low: '#052e16' };

export default function ContractAnalyzePage() {
    const [file, setFile] = useState<File | null>(null);
    const [context, setContext] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [expanded, setExpanded] = useState<number | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        setResult(null);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('context', context);
        try {
            const res = await fetch(`${API}/contracts/analyze?context=${encodeURIComponent(context)}`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            alert('Analysis failed. Check backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const scoreColor = (s: number) => s > 70 ? '#ef4444' : s > 40 ? '#f59e0b' : '#22c55e';

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a1a 0%,#0d1117 100%)', color: '#e2e8f0', fontFamily: 'Inter,sans-serif' }}>
            <Navbar />
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(90deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
                    Contract Analysis
                </h1>
                <p style={{ color: '#94a3b8', marginBottom: 32 }}>Upload a contract. Get AI-powered risk flags, Indian law citations, and negotiation counters.</p>

                <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 28, marginBottom: 24 }}>
                    <div
                        onClick={() => fileRef.current?.click()}
                        style={{ border: '2px dashed #334155', borderRadius: 12, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 20, transition: 'border-color 0.2s', background: file ? '#0d1f0d' : 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#a78bfa')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#334155')}
                    >
                        <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
                        <div style={{ fontWeight: 600 }}>{file ? `✅ ${file.name}` : 'Click to upload PDF, DOCX, or image'}</div>
                        <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Supports PDF, DOCX, JPG, PNG</div>
                    </div>
                    <input ref={fileRef} type="file" accept=".pdf,.docx,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />

                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#94a3b8' }}>Contract Context (optional but recommended)</label>
                    <textarea
                        value={context}
                        onChange={e => setContext(e.target.value)}
                        placeholder="e.g. Employment contract between startup and senior engineer in Bangalore..."
                        rows={3}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
                    />

                    <button
                        onClick={handleAnalyze}
                        disabled={!file || loading}
                        style={{ marginTop: 16, width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: file && !loading ? 'linear-gradient(90deg,#7c3aed,#2563eb)' : '#1e293b', color: '#fff', fontWeight: 700, fontSize: 16, cursor: file && !loading ? 'pointer' : 'not-allowed', transition: 'opacity 0.2s' }}
                    >
                        {loading ? '🔍 Analyzing with Gemini AI...' : '⚡ Analyze Contract'}
                    </button>
                </div>

                {result && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                                <div style={{ fontSize: 48, fontWeight: 900, color: scoreColor(result.risk_score) }}>{result.risk_score}</div>
                                <div style={{ color: '#94a3b8', fontSize: 13 }}>Risk Score / 100</div>
                            </div>
                            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                                <div style={{ fontSize: 48, fontWeight: 900, color: '#a78bfa' }}>{result.flagged_clauses?.length || 0}</div>
                                <div style={{ color: '#94a3b8', fontSize: 13 }}>Flagged Clauses</div>
                            </div>
                            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                                <div style={{ fontSize: 48, fontWeight: 900, color: '#f59e0b' }}>{result.missing_clauses?.length || 0}</div>
                                <div style={{ color: '#94a3b8', fontSize: 13 }}>Missing Clauses</div>
                            </div>
                        </div>

                        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                            <h3 style={{ color: '#60a5fa', marginBottom: 8 }}>📋 Document Summary</h3>
                            <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>{result.summary}</p>
                        </div>

                        {result.flagged_clauses?.length > 0 && (
                            <div style={{ marginBottom: 20 }}>
                                <h3 style={{ color: '#ef4444', marginBottom: 12 }}>🚩 Flagged Clauses</h3>
                                {result.flagged_clauses.map((c, i) => (
                                    <div key={i} style={{ border: `1px solid ${riskColors[c.risk_level]}40`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
                                        <div
                                            onClick={() => setExpanded(expanded === i ? null : i)}
                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: riskBg[c.risk_level], cursor: 'pointer' }}
                                        >
                                            <div>
                                                <span style={{ fontWeight: 700, marginRight: 10 }}>{c.clause_title}</span>
                                                <span style={{ background: riskColors[c.risk_level], color: '#000', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{c.risk_level}</span>
                                            </div>
                                            <span style={{ color: '#64748b' }}>{expanded === i ? '▲' : '▼'}</span>
                                        </div>
                                        {expanded === i && (
                                            <div style={{ padding: '16px 20px', background: '#0a0f1a' }}>
                                                <div style={{ background: '#1e293b', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontStyle: 'italic', color: '#94a3b8', fontSize: 13 }}>"{c.clause_excerpt}"</div>
                                                <div style={{ marginBottom: 10 }}><span style={{ color: '#ef4444', fontWeight: 600 }}>⚠️ Issue: </span><span style={{ color: '#cbd5e1' }}>{c.issue}</span></div>
                                                <div style={{ marginBottom: 10 }}><span style={{ color: '#a78bfa', fontWeight: 600 }}>📖 Law: </span><span style={{ color: '#a78bfa', fontStyle: 'italic' }}>{c.act_citation}</span></div>
                                                <div style={{ background: '#052e16', border: '1px solid #22c55e40', borderRadius: 8, padding: 12 }}>
                                                    <div style={{ color: '#22c55e', fontWeight: 600, marginBottom: 4 }}>✅ Counter-Suggestion:</div>
                                                    <div style={{ color: '#cbd5e1', fontSize: 14 }}>{c.counter_suggestion}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {result.missing_clauses?.length > 0 && (
                            <div style={{ background: '#1a1400', border: '1px solid #f59e0b40', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                                <h3 style={{ color: '#f59e0b', marginBottom: 12 }}>⚠️ Missing Clauses</h3>
                                {result.missing_clauses.map((mc, i) => <div key={i} style={{ color: '#fcd34d', padding: '4px 0' }}>• {mc}</div>)}
                            </div>
                        )}

                        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
                            <h3 style={{ color: '#60a5fa', marginBottom: 8 }}>🧑‍⚖️ Overall Assessment</h3>
                            <p style={{ color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{result.overall_assessment}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
