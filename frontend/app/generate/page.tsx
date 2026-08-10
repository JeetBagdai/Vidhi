'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vidhi-backend-4rfp.onrender.com';
const DOC_TYPES = [
  'Employment Agreement', 'Non-Disclosure Agreement (NDA)', 'Rental Agreement',
  'Service Agreement', 'Sale Deed', 'Partnership Agreement',
  'Freelance Contract', 'Loan Agreement', 'Power of Attorney', 'Settlement Agreement',
];
const STEPS = ['Doc Type', 'Parties', 'Terms', 'Result'];

export default function GeneratePage() {
  const [step, setStep] = useState(1);
  const [docType, setDocType] = useState('');
  const [partyA, setPartyA] = useState('');
  const [partyB, setPartyB] = useState('');
  const [terms, setTerms] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/generate/contract`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc_type: docType, party_a: partyA, party_b: partyB, key_terms: terms, additional_context: context }),
      });
      setResult(await res.json());
      setStep(4);
    } catch { alert('Generation failed. Check backend.'); }
    finally { setLoading(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(result?.document || '');
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { setStep(1); setResult(null); setDocType(''); setPartyA(''); setPartyB(''); setTerms(''); setContext(''); };

  return (
    <div className="page" style={{ height: '100vh', overflow: 'hidden' }}>
      <Navbar />

      <div style={{ display: 'grid', gridTemplateColumns: step === 4 ? 'minmax(280px,360px) 1fr' : '1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* Left: stepper + form */}
        <div style={{ overflowY: 'auto', background: 'var(--bg-1)', borderRight: step === 4 ? '1px solid var(--border)' : 'none', padding: 'clamp(20px,2vw,36px)', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Header */}
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
              <span className="grad-green">✨ Document Generator</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Generate legally worded documents with Indian Act citations.</p>
          </div>

          {/* Stepper */}
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((st, i) => (
              <div key={i} className={`step ${step === i + 1 ? 'step-active' : step > i + 1 ? 'step-done' : 'step-idle'}`} style={{ fontSize: 12 }}>
                {step > i + 1 ? '✓' : st}
              </div>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-purple)' }}>Select document type</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {DOC_TYPES.map(dt => (
                  <button key={dt} onClick={() => setDocType(dt)} style={{
                    padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${docType === dt ? 'var(--accent-purple)' : 'var(--border)'}`,
                    background: docType === dt ? 'rgba(109,40,217,0.12)' : 'var(--bg-card)',
                    color: docType === dt ? 'var(--accent-purple)' : 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: 12.5, textAlign: 'left', transition: 'var(--transition)', fontFamily: 'inherit', fontWeight: 500,
                  }}>{dt}</button>
                ))}
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label">Or type a custom type</label>
                <input className="input" value={docType} onChange={e => setDocType(e.target.value)} placeholder="e.g. Joint Venture Agreement" />
              </div>
              <button onClick={() => setStep(2)} disabled={!docType} className="btn btn-primary btn-full">Next →</button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-purple)' }}>Who are the parties?</div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label">Party A — Name & Role</label>
                <input className="input" value={partyA} onChange={e => setPartyA(e.target.value)} placeholder="e.g. Rohan Sharma, Software Engineer" />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label">Party B — Name & Role</label>
                <input className="input" value={partyB} onChange={e => setPartyB(e.target.value)} placeholder="e.g. TechCorp Pvt. Ltd., Employer" />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <button onClick={() => setStep(1)} className="btn btn-ghost">← Back</button>
                <button onClick={() => setStep(3)} disabled={!partyA || !partyB} className="btn btn-primary" style={{ flex: 1 }}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-purple)' }}>Key terms & requirements</div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label">Describe in plain language</label>
                <textarea className="textarea" value={terms} onChange={e => setTerms(e.target.value)}
                  placeholder="e.g. 6-month contract, salary ₹80,000/month, remote work, 30-day notice period, confidentiality clause…" rows={5} />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label">Additional context (optional)</label>
                <textarea className="textarea" value={context} onChange={e => setContext(e.target.value)}
                  placeholder="e.g. Based in Bangalore, renewal of previous contract…" rows={2} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setStep(2)} className="btn btn-ghost">← Back</button>
                <button onClick={generate} disabled={!terms || loading} className="btn btn-primary" style={{ flex: 1 }}>
                  {loading ? <><span className="pulse">⏳</span> Generating…</> : '✨ Generate'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4 sidebar summary */}
          {step === 4 && result && (
            <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div className="badge badge-green" style={{ marginBottom: 8 }}>✓ Generated</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{result.title}</div>
              </div>
              {result.applicable_acts?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {result.applicable_acts.map((a: string, i: number) => <span key={i} className="badge badge-blue" style={{ fontSize: 11 }}>📖 {a}</span>)}
                </div>
              )}
              {result.warnings?.length > 0 && (
                <div className="card" style={{ borderColor: 'rgba(180,83,9,0.3)', background: 'rgba(180,83,9,0.04)', padding: 14 }}>
                  {result.warnings.map((w: string, i: number) => <div key={i} style={{ color: 'var(--accent-gold)', fontSize: 13 }}>⚠️ {w}</div>)}
                </div>
              )}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={copy} className="btn btn-secondary btn-full">{copied ? '✓ Copied!' : '📋 Copy Document'}</button>
                <button onClick={reset} className="btn btn-ghost btn-full">New Document</button>
              </div>
            </div>
          )}
        </div>

        {/* Right: document preview (step 4 only) */}
        {step === 4 && result && (
          <div className="fade-in" style={{ overflowY: 'auto', padding: 'clamp(20px,2vw,36px)', background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ maxWidth: 860, margin: '0 auto', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-green)' }}>Document Preview</h2>
                <button onClick={copy} className="btn btn-secondary btn-sm">{copied ? '✓ Copied!' : 'Copy'}</button>
              </div>
              <div className="card" style={{ whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif', fontSize: 14, lineHeight: 2, color: 'var(--text-primary)', padding: 'clamp(24px,3vw,48px)' }}>
                {result.document}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
