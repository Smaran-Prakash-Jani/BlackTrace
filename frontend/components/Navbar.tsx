'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './Logo'

const NAV_LINKS = [
  { href: '/scan', label: 'Scanner' },
  { href: '/history', label: 'History' },
  { href: '/dashboard', label: 'Analytics' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      zIndex: 200,
      padding: '0 24px',
    }}>
      <header style={{
        width: '100%',
        maxWidth: 1040,
        height: 56,
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(20, 20, 20, 0.3)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo showText={false} />
        </Link>

        {/* Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || (pathname?.startsWith(href + '/') ?? false)
            return (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: 13, fontWeight: 500,
                  textDecoration: 'none',
                  color: active ? 'var(--color-primary)' : 'var(--color-muted)',
                  transition: 'color 0.2s',
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-secondary)', textDecoration: 'none' }}>Log in</Link>
          <Link href="/signup" className="btn-primary" style={{ padding: '8px 16px', fontSize: 13, borderRadius: 8 }}>Sign up</Link>
        </div>
      </header>
    </div>
  )
}
