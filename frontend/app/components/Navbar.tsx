'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';

const NAV_LINKS = [
  { href: '/contracts/analyze', label: 'Analyze Contract' },
  { href: '/generate',          label: 'Generate Doc'     },
  { href: '/cases/evaluate',    label: 'Case Eval'        },
  { href: '/learn',             label: 'Learn'            },
  { href: '/chat',              label: 'Legal Chat'       },
  { href: '/mock-court',        label: 'Mock Court'       },
];

export default function Navbar() {
  const path = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <span style={{ fontSize: 22 }}>⚖️</span> Vidhi
        </Link>

        <div className="navbar-links">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`navbar-link${path === l.href ? ' active' : ''}`}
            >
              {l.label}
            </Link>
          ))}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="theme-toggle"
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            style={{ marginLeft: 8 }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
}
