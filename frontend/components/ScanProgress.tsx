'use client'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2, Circle } from 'lucide-react'

export const SCAN_STEPS = [
  { id: 'parse',     label: 'Parsing URL structure',       description: 'Decomposing scheme, domain, path, and parameters' },
  { id: 'heuristics',label: 'Analyzing domain heuristics', description: 'Checking keywords, encoding, subdomain depth' },
  { id: 'entropy',   label: 'Running entropy analysis',    description: 'Computing domain randomness and DGA signatures' },
  { id: 'brand',     label: 'Checking brand impersonation',description: 'Running Levenshtein analysis against 40+ known brands' },
  { id: 'intel',     label: 'Querying threat intelligence',description: 'Checking OpenPhish live feed and WHOIS records' },
  { id: 'redirect',  label: 'Tracing redirect chain',      description: 'Following HTTP redirects to detect obfuscation' },
  { id: 'score',     label: 'Computing risk score',        description: 'Aggregating weighted signals into final assessment' },
]

interface ScanProgressProps {
  currentStep: number
}

export default function ScanProgress({ currentStep }: ScanProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}
    >
      <div className="card" style={{ padding: '1.25rem' }}>
        <p className="label" style={{ marginBottom: '1rem' }}>Analysis in progress</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SCAN_STEPS.map((step, index) => {
            const isDone = index < currentStep
            const isActive = index === currentStep
            const isPending = index > currentStep

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: isPending ? 0.35 : 1, x: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 12px', borderRadius: 8,
                  backgroundColor: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                }}
              >
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  {isDone   && <CheckCircle size={15} color="var(--color-accent)" />}
                  {isActive && <Loader2 size={15} color="var(--color-accent)" style={{ animation: 'spin 1s linear infinite' }} />}
                  {isPending && <Circle size={15} color="var(--color-muted)" />}
                </div>
                <div>
                  <p style={{
                    fontSize: 13, fontWeight: 500, lineHeight: '1.2',
                    color: isDone ? 'var(--color-secondary)' : isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                    marginBottom: isActive ? 4 : 0,
                  }}>
                    {step.label}
                  </p>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.5 }}
                    >
                      {step.description}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
