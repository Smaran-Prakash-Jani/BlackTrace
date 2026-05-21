'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, AlertCircle, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ScanProgress, { SCAN_STEPS } from '@/components/ScanProgress'
import ThreatCard from '@/components/ThreatCard'
import { scanUrl } from '@/lib/api'
import type { ScanResult } from '@/lib/api'

type PageState = 'idle' | 'scanning' | 'result' | 'error'
const STEP_DURATIONS = [400, 600, 900, 700, 800, 1100, 500]

export default function ScanPage() {
  const [url, setUrl] = useState('')
  const [state, setState] = useState<PageState>('idle')
  const [currentStep, setCurrentStep] = useState(-1)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const isValidUrl = (s: string) => {
    try { new URL(s.startsWith('http') ? s : `https://${s}`); return s.length > 3 }
    catch { return false }
  }

  const handleScan = async () => {
    if (!url.trim() || !isValidUrl(url)) { setError('Please enter a valid URL.'); return }
    setError(''); setResult(null); setState('scanning'); setCurrentStep(0)

    const timers: ReturnType<typeof setTimeout>[] = []
    const advance = (i: number) => {
      const t = setTimeout(() => {
        if (i + 1 < SCAN_STEPS.length) { setCurrentStep(i + 1); advance(i + 1) }
      }, STEP_DURATIONS[i] ?? 500)
      timers.push(t)
    }
    advance(0)

    try {
      const data = await scanUrl(url)
      timers.forEach(clearTimeout)
      setCurrentStep(SCAN_STEPS.length)
      await new Promise(r => setTimeout(r, 300))
      setResult(data); setState('result')
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err: any) {
      timers.forEach(clearTimeout)
      setError(err.message || 'Scan failed. Please check the backend is running.')
      setState('error')
    }
  }

  const reset = () => { setState('idle'); setResult(null); setError(''); setCurrentStep(-1); setUrl(''); inputRef.current?.focus() }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-base)' }}>
      <Navbar />
      <main style={{ paddingTop: 96, paddingBottom: 96, paddingLeft: 24, paddingRight: 24 }}>

        {/* Header */}
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', marginBottom: 40 }}>
          <motion.h1
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ fontSize: 30, fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '-0.01em', marginBottom: 10 }}
          >URL Threat Scanner</motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            style={{ fontSize: 14, color: 'var(--color-secondary)', lineHeight: 1.7 }}
          >
            Paste any URL. BlackTrace will analyze it using layered heuristics, entropy analysis,
            brand impersonation detection, and live threat intelligence feeds.
          </motion.p>
        </div>

        {/* URL Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
          style={{ maxWidth: 640, margin: '0 auto 40px' }}
        >
          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            backgroundColor: 'var(--color-elevated)',
            border: `1px solid ${state === 'scanning' ? 'var(--color-accent)' : 'var(--color-border)'}`,
            borderRadius: 12,
            boxShadow: state === 'scanning' ? '0 0 0 1px var(--color-accent)' : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>
            <Search size={15} color="var(--color-muted)" style={{ position: 'absolute', left: 16, flexShrink: 0 }} />
            <input
              ref={inputRef}
              id="url-input"
              type="text"
              value={url}
              onChange={e => { setUrl(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="https://example.com or paste any URL…"
              disabled={state === 'scanning'}
              autoFocus
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13, color: 'var(--color-primary)', fontFamily: 'monospace',
                padding: '16px 16px 16px 44px',
              }}
            />
            {url && state !== 'scanning' && (
              <button onClick={() => { setUrl(''); setError('') }}
                style={{ padding: 8, marginRight: 4, color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6, display: 'flex' }}>
                <X size={13} />
              </button>
            )}
            <button
              id="scan-btn"
              onClick={handleScan}
              disabled={!url.trim() || state === 'scanning'}
              className="btn-primary"
              style={{ margin: 6, padding: '10px 18px', fontSize: 12 }}
            >
              {state === 'scanning' ? 'Scanning…' : <><span>Analyze</span><ArrowRight size={13} /></>}
            </button>
          </div>
          {error && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12, color: '#ef4444' }}>
              <AlertCircle size={13} />{error}
            </motion.div>
          )}
        </motion.div>

        {/* Scan Progress */}
        <AnimatePresence>
          {state === 'scanning' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }}
              style={{ maxWidth: 640, margin: '0 auto 40px' }}
            >
              <ScanProgress currentStep={currentStep} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {state === 'result' && result && (
            <div ref={resultRef} style={{ maxWidth: 640, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <p className="label">Scan Result</p>
                <button onClick={reset} className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>
                  Scan another URL
                </button>
              </div>
              <ThreatCard result={result} />
            </div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {state === 'error' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ maxWidth: 640, margin: '0 auto' }}>
              <div className="card" style={{ border: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.05)', textAlign: 'center', padding: 48 }}>
                <AlertCircle size={28} color="#ef4444" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-primary)', marginBottom: 8 }}>Scan Failed</p>
                <p style={{ fontSize: 12, color: 'var(--color-secondary)', marginBottom: 20 }}>{error}</p>
                <button onClick={reset} className="btn-primary" style={{ margin: '0 auto' }}>Try Again</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle hints */}
        {state === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 12 }}>Try an example</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
              {['paypa1-secure-login.xyz', 'google.com', 'secure-banking-update.top', 'bit.ly/3xMp1e'].map(ex => (
                <button key={ex} onClick={() => { setUrl(ex); inputRef.current?.focus() }}
                  style={{
                    fontSize: 11, color: 'var(--color-muted)', fontFamily: 'monospace',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                    transition: 'color 0.15s, border-color 0.15s, background-color 0.15s',
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--color-secondary)'; (e.target as HTMLElement).style.borderColor = 'var(--color-border)' }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--color-muted)'; (e.target as HTMLElement).style.borderColor = 'var(--color-border-subtle)' }}
                >{ex}</button>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
