'use client'

export type RiskLevel = 'SAFE' | 'LOW_RISK' | 'SUSPICIOUS' | 'HIGH_RISK' | 'MALICIOUS' | 'CRITICAL'

export const RISK_CONFIG: Record<RiskLevel, {
  label: string
  color: string
  bg: string
  border: string
}> = {
  SAFE:      { label: 'Safe',      color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.25)' },
  LOW_RISK:  { label: 'Low Risk',  color: '#84cc16', bg: 'rgba(132,204,22,0.10)',  border: 'rgba(132,204,22,0.25)' },
  SUSPICIOUS:{ label: 'Suspicious',color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.25)' },
  HIGH_RISK: { label: 'High Risk', color: '#f97316', bg: 'rgba(249,115,22,0.10)',  border: 'rgba(249,115,22,0.25)' },
  MALICIOUS: { label: 'Malicious', color: '#ef4444', bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.25)' },
  CRITICAL:  { label: 'Critical',  color: '#dc2626', bg: 'rgba(220,38,38,0.12)',   border: 'rgba(220,38,38,0.30)' },
}

interface RiskBadgeProps {
  level: string
  size?: 'sm' | 'md' | 'lg'
  showDot?: boolean
}

export default function RiskBadge({ level, size = 'md', showDot = true }: RiskBadgeProps) {
  const config = RISK_CONFIG[level as RiskLevel] ?? RISK_CONFIG.SUSPICIOUS

  const padding = size === 'sm' ? '2px 8px' : size === 'lg' ? '6px 12px' : '4px 10px'
  const fontSize = size === 'sm' ? 10 : size === 'lg' ? 13 : 11
  const dotSize = size === 'sm' ? 5 : 6

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding, fontSize, fontWeight: 600,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      borderRadius: 9999,
      color: config.color,
      backgroundColor: config.bg,
      border: `1px solid ${config.border}`,
    }}>
      {showDot && (
        <span style={{
          width: dotSize, height: dotSize,
          borderRadius: '50%',
          backgroundColor: config.color,
          flexShrink: 0,
        }} />
      )}
      {config.label}
    </span>
  )
}
