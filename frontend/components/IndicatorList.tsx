'use client'
import { motion } from 'framer-motion'
import type { ScanIndicator } from '@/lib/api'
import { AlertTriangle, Info, AlertOctagon, Zap } from 'lucide-react'

const SEV = {
  critical: { Icon: AlertOctagon, color: '#ef4444', label: 'Critical' },
  high:     { Icon: AlertTriangle, color: '#f97316', label: 'High' },
  medium:   { Icon: Zap,           color: '#eab308', label: 'Medium' },
  low:      { Icon: Info,          color: '#a3a3a3', label: 'Low' },
}

interface IndicatorListProps {
  indicators: ScanIndicator[]
}

export default function IndicatorList({ indicators }: IndicatorListProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
      {indicators.map((ind, i) => {
        const sev = SEV[ind.severity] ?? SEV.low
        const { Icon } = sev

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 16,
              padding: '16px', borderRadius: 8,
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border-subtle)',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 6, flexShrink: 0,
              backgroundColor: `${sev.color}15`,
              border: `1px solid ${sev.color}30`
            }}>
              <Icon size={16} color={sev.color} />
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-primary)' }}>{ind.label}</p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 10, fontWeight: 600, padding: '2px 6px',
                  borderRadius: 4, backgroundColor: 'var(--color-elevated)',
                  border: '1px solid var(--color-border)',
                  color: sev.color, textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>
                  {sev.label} Severity
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-secondary)', lineHeight: 1.6 }}>
                {ind.detail}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
