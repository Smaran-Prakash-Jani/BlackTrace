/**
 * BlackTrace API client.
 * All fetch calls to the FastAPI backend are centralized here.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/_backend/api' : 'http://localhost:8000/api')

export interface ScanIndicator {
  type: string
  label: string
  detail: string
  weight: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  meta?: Record<string, unknown>
}

export interface DomainInfo {
  registered_domain: string
  domain_label: string
  tld: string
  subdomain: string
  is_ip_address: boolean
  ssl_valid: boolean
  dns: { resolves: boolean | null; ips: string[] }
  whois: { available: boolean; age_days: number | null; registrar: string | null; creation_date?: string }
  ip_addresses: string[]
}

export interface RedirectHop {
  url: string
  status: number | null
  note?: string
}

export interface ThreatIntel {
  sources: {
    openphish?: { source: string; matched: boolean; score: number; detail: string }
    virustotal?: { source: string; available: boolean; matched?: boolean; malicious_engines?: number; total_engines?: number; detail: string }
    google_safe_browsing?: { source: string; available: boolean; matched?: boolean; detail: string }
  }
}

export interface ScanResult {
  scan_id: number
  url: string
  normalized_url: string
  domain: string
  risk_score: number
  risk_level: 'SAFE' | 'LOW_RISK' | 'SUSPICIOUS' | 'HIGH_RISK' | 'MALICIOUS' | 'CRITICAL'
  risk_description: string
  indicators: ScanIndicator[]
  indicator_count: number
  domain_info: DomainInfo
  redirect_chain: RedirectHop[]
  redirect_depth: number
  threat_intel: ThreatIntel
  ssl_valid: boolean
  scanned_at: string
  explanation: {
    summary: string
    guidance: string
    confidence_note: string
    indicator_count: number
  }
}

export interface HistoryItem {
  scan_id: number
  url: string
  domain: string
  risk_score: number
  risk_level: string
  summary: string
  scanned_at: string
}

export interface HistoryResponse {
  total: number
  page: number
  limit: number
  pages: number
  items: HistoryItem[]
}

export interface AnalyticsResponse {
  total_scans: number
  risk_distribution: Record<string, number>
  daily_activity: { date: string; total: number; threats: number }[]
  average_score: number
  threat_rate: number
  safe_count: number
  low_risk_count: number
  suspicious_count: number
  high_risk_count: number
  malicious_count: number
  critical_count: number
}

export async function scanUrl(url: string): Promise<ScanResult> {
  const res = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Scan failed' }))
    throw new Error(err.detail || 'Scan request failed')
  }
  return res.json()
}

export async function getHistory(params?: {
  page?: number
  limit?: number
  search?: string
  risk_level?: string
}): Promise<HistoryResponse> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.search) query.set('search', params.search)
  if (params?.risk_level) query.set('risk_level', params.risk_level)

  const res = await fetch(`${API_BASE}/history?${query}`)
  if (!res.ok) throw new Error('Failed to fetch history')
  return res.json()
}

export async function getAnalytics(): Promise<AnalyticsResponse> {
  const res = await fetch(`${API_BASE}/analytics`)
  if (!res.ok) throw new Error('Failed to fetch analytics')
  return res.json()
}

export async function deleteScan(scanId: number): Promise<void> {
  await fetch(`${API_BASE}/history/${scanId}`, { method: 'DELETE' })
}
