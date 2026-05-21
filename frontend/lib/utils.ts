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

export function getRiskConfig(level: string) {
  return RISK_CONFIG[level as RiskLevel] ?? RISK_CONFIG.SUSPICIOUS
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function truncateUrl(url: string, maxLen = 60): string {
  if (url.length <= maxLen) return url
  return url.slice(0, maxLen) + '…'
}
