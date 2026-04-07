'use client';
import Link from 'next/link';
import { useState } from 'react';

const NAV_LINKS = [
    { href: '/contracts/analyze', label: '📄 Analyze Contract' },
    { href: '/generate', label: '✨ Generate Doc' },
    { href: '/cases/evaluate', label: '⚖️ Case Evaluation' },
    { href: '/learn', label: '📚 Learn' },
    { href: '/chat', label: '💬 Legal Chat' },
    { href: '/mock-court', label: '🏛️ Mock Court' },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);
    return (
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,26,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b', padding: '0 20px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
                <Link href="/" style={{ fontWeight: 900, fontSize: 22, background: 'linear-gradient(90deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>
                    Vidhi ⚖️
                </Link>
                {/* Desktop */}
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {NAV_LINKS.map(l => (
                        <Link key={l.href} href={l.href} style={{ padding: '6px 10px', borderRadius: 8, color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                            {l.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
