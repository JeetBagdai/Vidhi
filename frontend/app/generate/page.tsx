'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const DOC_TYPES = ['Employment Agreement', 'Non-Disclosure Agreement (NDA)', 'Rental Agreement', 'Service Agreement', 'Sale Deed', 'Partnership Agreement', 'Freelance Contract', 'Loan Agreement', 'Power of Attorney', 'Settlement Agreement'];

export default function GeneratePage() {
    const [step, setStep] = useState(1);
    const [docType, setDocType] = useState('');
    const [partyA, setPartyA] = useState('');
    const [partyB, setPartyB] = useState('');
    const [terms, setTerms] = useState('');
    const [context, setContext] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const generate = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/generate/contract`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doc_type: docType, party_a: partyA, party_b: partyB, key_terms: terms, additional_context: context })
            });
            const data = await res.json();
            setResult(data);
            setStep(4);
        } catch { alert('Generation failed. Check backend.'); }
        finally { setLoading(false); }
    };

    const copyToClipboard = () => { navigator.clipboard.writeText(result?.document || ''); alert('Copied to clipboard!'); };

    const s: any = {
        page: { minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a1a,#0d1117)', color: '#e2e8f0', fontFamily: 'Inter,sans-serif' },
        inner: { maxWidth: 800, margin: '0 auto', padding: '40px 20px' },
        h1: { fontSize: 32, fontWeight: 800, background: 'linear-gradient(90deg,#34d399,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 },
        card: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 28, marginBottom: 20 },
        label: { display: 'block', marginBottom: 6, fontWeight: 600, color: '#94a3b8', fontSize: 14 },
        input: { width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' as const, marginBottom: 16 },
        btn: { padding: '12px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(90deg,#059669,#2563eb)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' },
        tag: { display: 'inline-block', background: '#1e3a5f', color: '#60a5fa', borderRadius: 20, padding: '3px 12px', fontSize: 12, marginRight: 6, marginBottom: 6 }
    };

    const steps = ['Doc Type', 'Parties', 'Terms', 'Result'];

    return (
        <div style={s.page}>
            <Navbar />
            <div style={s.inner}>
                <h1 style={s.h1}>Legal Document Generator</h1>
                <p style={{ color: '#94a3b8', marginBottom: 28 }}>Generate professionally worded legal documents with Indian Act citations in seconds.</p>

                {/* Stepper */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
                    {steps.map((st, i) => (
                        <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: step === i + 1 ? '#7c3aed' : step > i + 1 ? '#065f46' : '#1e293b', color: step === i + 1 ? '#fff' : step > i + 1 ? '#34d399' : '#64748b', fontWeight: 600, fontSize: 13, transition: 'all 0.2s' }}>
                            {step > i + 1 ? '✓ ' : ''}{st}
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div style={s.card}>
                        <h3 style={{ color: '#a78bfa', marginBottom: 16 }}>What type of document do you need?</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {DOC_TYPES.map(dt => (
                                <div key={dt} onClick={() => setDocType(dt)} style={{ padding: '12px 16px', borderRadius: 10, border: `1px solid ${docType === dt ? '#7c3aed' : '#334155'}`, background: docType === dt ? '#3b0764' : '#1e293b', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}>
                                    {dt}
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <label style={s.label}>Or type a custom document type</label>
                            <input value={docType} onChange={e => setDocType(e.target.value)} placeholder="e.g. Joint Venture Agreement" style={s.input} />
                        </div>
                        <button onClick={() => setStep(2)} disabled={!docType} style={{ ...s.btn, opacity: docType ? 1 : 0.5 }}>Next →</button>
                    </div>
                )}

                {step === 2 && (
                    <div style={s.card}>
                        <h3 style={{ color: '#a78bfa', marginBottom: 16 }}>Who are the parties?</h3>
                        <label style={s.label}>Party A (Name + Role)</label>
                        <input value={partyA} onChange={e => setPartyA(e.target.value)} placeholder="e.g. Rohan Sharma, Software Engineer" style={s.input} />
                        <label style={s.label}>Party B (Name + Role)</label>
                        <input value={partyB} onChange={e => setPartyB(e.target.value)} placeholder="e.g. TechCorp Pvt. Ltd., Employer" style={s.input} />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setStep(1)} style={{ ...s.btn, background: '#1e293b' }}>← Back</button>
                            <button onClick={() => setStep(3)} disabled={!partyA || !partyB} style={{ ...s.btn, opacity: partyA && partyB ? 1 : 0.5 }}>Next →</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={s.card}>
                        <h3 style={{ color: '#a78bfa', marginBottom: 16 }}>Key Terms & Requirements</h3>
                        <label style={s.label}>Describe the key terms in plain language</label>
                        <textarea value={terms} onChange={e => setTerms(e.target.value)} placeholder="e.g. 6-month contract, salary ₹80,000/month, remote work, 30-day notice period, confidentiality clause required..." rows={4} style={{ ...s.input, resize: 'vertical' }} />
                        <label style={s.label}>Additional context (optional)</label>
                        <textarea value={context} onChange={e => setContext(e.target.value)} placeholder="e.g. Based in Bangalore, this is a renewal of a previous contract..." rows={2} style={{ ...s.input, resize: 'vertical' }} />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setStep(2)} style={{ ...s.btn, background: '#1e293b' }}>← Back</button>
                            <button onClick={generate} disabled={!terms || loading} style={{ ...s.btn, opacity: terms && !loading ? 1 : 0.5 }}>
                                {loading ? '⏳ Generating…' : '✨ Generate Document'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && result && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 style={{ color: '#34d399', fontSize: 22, fontWeight: 700 }}>✅ {result.title}</h2>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={copyToClipboard} style={{ ...s.btn, padding: '8px 16px', fontSize: 13, background: '#1e293b' }}>Copy</button>
                                <button onClick={() => { setStep(1); setResult(null); }} style={{ ...s.btn, padding: '8px 16px', fontSize: 13, background: '#1e293b' }}>New Doc</button>
                            </div>
                        </div>

                        {result.applicable_acts?.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                {result.applicable_acts.map((a: string, i: number) => <span key={i} style={s.tag}>📖 {a}</span>)}
                            </div>
                        )}

                        <div style={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 12, padding: 24, whiteSpace: 'pre-wrap', fontFamily: 'Georgia,serif', fontSize: 14, lineHeight: 1.8, color: '#cbd5e1', maxHeight: 600, overflowY: 'auto' }}>
                            {result.document}
                        </div>

                        {result.warnings?.length > 0 && (
                            <div style={{ marginTop: 12, background: '#1a1400', borderRadius: 10, padding: 14, border: '1px solid #f59e0b40' }}>
                                {result.warnings.map((w: string, i: number) => <div key={i} style={{ color: '#fcd34d', fontSize: 13 }}>⚠️ {w}</div>)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
