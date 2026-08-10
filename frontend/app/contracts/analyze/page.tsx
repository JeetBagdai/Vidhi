'use client';
import { useState, useRef } from 'react';
import Navbar from '../../components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vidhi-backend-4rfp.onrender.com';

interface FlaggedClause {
  clause_title: string; clause_excerpt: string;
  risk_level: 'High' | 'Medium' | 'Low';
  issue: string; act_citation: string; counter_suggestion: string;
}
interface AnalysisResult {
  risk_score: number; summary: string;
  flagged_clauses: FlaggedClause[]; missing_clauses: string[];
  overall_assessment: string; filename: string;
}

const RISK_COLOR  = { High: 'var(--accent-red)',   Medium: 'var(--accent-gold)',   Low: 'var(--accent-green)' };
const RISK_BADGE  = { High: 'badge-red',            Medium: 'badge-gold',           Low: 'badge-green' };
const RISK_BG     = { High: 'rgba(185,28,28,0.06)', Medium: 'rgba(180,83,9,0.06)',  Low: 'rgba(4,120,87,0.06)' };
const RISK_BORDER = { High: 'rgba(185,28,28,0.22)', Medium: 'rgba(180,83,9,0.22)',  Low: 'rgba(4,120,87,0.22)' };

export default function ContractAnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true); setResult(null);
    const fd = new FormData();
    fd.append('file', file); fd.append('context', context);
    try {
      const res = await fetch(`${API}/contracts/analyze?context=${encodeURIComponent(context)}`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        alert(`Analysis failed: ${data.detail || 'Server error'}`);
        return;
      }
      setResult(data);
    } catch { alert('Analysis failed. Check backend is running.'); }
    finally { setLoading(false); }
  };

  const scoreColor = (s: number) => s > 70 ? 'var(--accent-red)' : s > 40 ? 'var(--accent-gold)' : 'var(--accent-green)';

  return (
    <div className="page" style={{ overflow: 'hidden', height: '100vh' }}>
      <Navbar />

      {/* Page header */}
      <div style={{ padding: '16px clamp(16px,3vw,48px)', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>
            <span className="grad-text">Contract Analysis</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Upload a contract for AI risk flags, Indian law citations, and negotiation counters.</p>
        </div>
        {result && (
          <button onClick={() => { setResult(null); setFile(null); }} className="btn btn-ghost btn-sm">Upload New</button>
        )}
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: result ? 'minmax(300px,380px) 1fr' : '1fr', gap: 0, flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* Left panel: upload form — hidden after result on narrow screens */}
        <div style={{
          borderRight: result ? '1px solid var(--border)' : 'none',
          background: 'var(--bg-1)',
          padding: 'clamp(16px,2vw,28px)',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {!result && (
            <div style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)' }}>Upload Document</h2>
            </div>
          )}

          <div style={{ maxWidth: result ? '100%' : 560, margin: result ? 0 : '0 auto', width: '100%' }}>
            <div
              className={`dropzone${dragOver ? ' drag-over' : ''}${file ? ' has-file' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
              style={{ padding: result ? '28px 20px' : '48px 24px', marginBottom: 14 }}
            >
              <div style={{ fontSize: result ? 32 : 44, marginBottom: 8 }}>📄</div>
              {file ? (
                <>
                  <div style={{ fontWeight: 700, color: 'var(--accent-green)', marginBottom: 4, fontSize: 14 }}>✓ {file.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(0)} KB · Click to change</div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Drop contract here or click to browse</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>PDF, DOCX, JPG, PNG</div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />

            <div className="field">
              <label className="field-label">Context (optional)</label>
              <textarea className="textarea" value={context} onChange={e => setContext(e.target.value)}
                placeholder="e.g. Employment contract between startup and senior engineer in Bangalore…" rows={result ? 2 : 3} />
            </div>

            <button onClick={handleAnalyze} disabled={!file || loading} className="btn btn-primary btn-full btn-lg">
              {loading ? <><span className="pulse">🔍</span> Analyzing…</> : '⚡ Analyze Contract'}
            </button>
          </div>
        </div>

        {/* Right panel: results */}
        {result && (
          <div style={{ overflowY: 'auto', padding: 'clamp(16px,2vw,28px)', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }} className="fade-in">

            {/* Score row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <div className="stat-card">
                <div className="stat-number" style={{ color: scoreColor(result.risk_score) }}>{result.risk_score}</div>
                <div className="stat-label">Risk Score / 100</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: 'var(--accent-purple)' }}>{result.flagged_clauses?.length || 0}</div>
                <div className="stat-label">Flagged Clauses</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: 'var(--accent-gold)' }}>{result.missing_clauses?.length || 0}</div>
                <div className="stat-label">Missing Clauses</div>
              </div>
            </div>

            {/* Two-column detail grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
              {/* Summary */}
              <div className="card">
                <div style={{ color: 'var(--accent-blue)', fontWeight: 700, marginBottom: 10, fontSize: 14 }}>📋 Summary</div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>{result.summary}</p>
              </div>

              {/* Assessment */}
              <div className="card">
                <div style={{ color: 'var(--accent-blue)', fontWeight: 700, marginBottom: 10, fontSize: 14 }}>🧑‍⚖️ Overall Assessment</div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: 14 }}>{result.overall_assessment}</p>
              </div>
            </div>

            {/* Flagged clauses */}
            {result.flagged_clauses?.length > 0 && (
              <div>
                <h3 style={{ color: 'var(--accent-red)', marginBottom: 12, fontSize: 15, fontWeight: 700 }}>🚩 Flagged Clauses</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.flagged_clauses.map((c, i) => (
                    <div key={i} style={{ background: RISK_BG[c.risk_level], border: `1px solid ${RISK_BORDER[c.risk_level]}`, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <div className="accordion-header" onClick={() => setExpanded(expanded === i ? null : i)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{c.clause_title}</span>
                          <span className={`badge ${RISK_BADGE[c.risk_level]}`}>{c.risk_level}</span>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{expanded === i ? '▲' : '▼'}</span>
                      </div>
                      {expanded === i && (
                        <div className="accordion-body fade-in">
                          <div style={{ background: 'var(--bg-2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 10, fontStyle: 'italic', color: 'var(--text-muted)', fontSize: 13 }}>"{c.clause_excerpt}"</div>
                          <div style={{ marginBottom: 8, fontSize: 14 }}><span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>⚠ Issue: </span><span style={{ color: 'var(--text-secondary)' }}>{c.issue}</span></div>
                          <div style={{ marginBottom: 10, fontSize: 14 }}><span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>📖 Law: </span><span style={{ color: 'var(--accent-purple)', fontStyle: 'italic' }}>{c.act_citation}</span></div>
                          <div style={{ background: 'rgba(4,120,87,0.07)', border: '1px solid rgba(4,120,87,0.2)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                            <div style={{ color: 'var(--accent-green)', fontWeight: 700, marginBottom: 4, fontSize: 13 }}>✓ Counter-Suggestion</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{c.counter_suggestion}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing clauses */}
            {Array.isArray(result.missing_clauses) && result.missing_clauses.filter(Boolean).length > 0 && (
              <div className="card" style={{ borderColor: 'rgba(180,83,9,0.3)', background: 'rgba(180,83,9,0.04)', flexShrink: 0 }}>
                <h3 style={{ color: 'var(--accent-gold)', marginBottom: 12, fontSize: 15 }}>⚠️ Missing Clauses</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 8 }}>
                  {result.missing_clauses.filter(Boolean).map((mc, i) => (
                    <div key={i} style={{ color: 'var(--accent-gold)', fontSize: 13, display: 'flex', gap: 6 }}>
                      <span>·</span><span>{String(mc)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Scroll spacer to prevent bottom clipping */}
            <div style={{ height: 24, flexShrink: 0 }} />
          </div>
        )}

        {/* Center placeholder when no result */}
        {!result && !loading && (
          <div style={{ display: 'none' }} />
        )}
      </div>
    </div>
  );
}
