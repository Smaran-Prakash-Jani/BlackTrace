'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import LiquidBackground from '@/components/LiquidBackground'
import BorderGlow from '@/components/BorderGlow'
import { Mail, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  return (
    <>
      <LiquidBackground />
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 600, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>Welcome back</h1>
            <p style={{ color: 'var(--color-secondary)', fontSize: 14 }}>Enter your credentials to access your dashboard</p>
          </div>

          <BorderGlow
            className="backdrop-blur-xl w-full"
            glowColor="0 0 100"
            backgroundColor="rgba(15, 15, 15, 0.5)"
            borderRadius={12}
            colors={['#444', '#111', '#666']}
            glowRadius={30}
            glowIntensity={0.4}
          >
            <form style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }} onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: 8 }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--color-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="email" className="input-base" placeholder="you@company.com" style={{ paddingLeft: 40 }} required />
                </div>
              </div>

              <div>
                <label className="label" style={{ display: 'block', marginBottom: 8 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--color-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="password" className="input-base" placeholder="••••••••" style={{ paddingLeft: 40 }} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link href="#" style={{ fontSize: 12, color: 'var(--color-secondary)', textDecoration: 'none' }}>Forgot password?</Link>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px 0', marginTop: 8 }}>
                Log in <ArrowRight size={16} />
              </button>
            </form>
          </BorderGlow>

          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: 'var(--color-secondary)' }}>
            Don't have an account? <Link href="/signup" style={{ color: '#fff', fontWeight: 500, textDecoration: 'none' }}>Sign up</Link>
          </p>
        </motion.div>
      </main>
    </>
  )
}
