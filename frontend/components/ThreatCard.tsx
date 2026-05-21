'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { getRiskConfig } from '@/lib/utils'
import type { ScanResult } from '@/lib/api'
import IndicatorList from './IndicatorList'
import {
  Globe, Shield, Clock, CheckCircle, XCircle, AlertTriangle, Server,
  ChevronDown, ChevronUp, RefreshCw, MessageSquare, GitBranch, ShieldAlert,
  CheckSquare, Activity
} from 'lucide-react'

interface ThreatCardProps {
  result: ScanResult
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
      <span style={{ color: 'var(--color-muted)', marginTop: 2, flexShrink: 0 }}>{icon}</span>
      <div style={{ minWidth: 0, flex: 1, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--color-secondary)' }}>{label}</p>
        <div style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500, textAlign: 'right', wordBreak: 'break-all' }}>{value}</div>
      </div>
    </div>
  )
}

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <div style={{ color: 'var(--color-secondary)' }}>{icon}</div>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>{title}</h2>
    </div>
  )
}

export default function ThreatCard({ result }: ThreatCardProps) {
  const config = getRiskConfig(result.risk_level)
  const [showTechAnalysis, setShowTechAnalysis] = useState(false)

  const di = result.domain_info
  const whois = di?.whois
  const dns = di?.dns
  const chain = result.redirect_chain ?? []

  // Create bullet points from summary and guidance (mocking an AI bullet breakdown for the UI redesign)
  const aiBullets = result.explanation?.summary.split('. ').filter(b => b.trim().length > 0) || []
  const actionBullets = result.explanation?.guidance.split('. ').filter(b => b.trim().length > 0) || []

  // Helper to highlight keywords
  const highlightKeywords = (text: string) => {
    return text.split(' ').map((word, i) => {
      if (/phishing|malicious|suspicious|risk|fraud|credentials|download/i.test(word)) {
        return <span key={i} style={{ color: 'var(--color-risk-high)', fontWeight: 500 }}>{word} </span>
      }
      return word + ' '
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', paddingBottom: 64 }}
    >
      {/* ── 1. URL Summary Header ── */}
      <div style={{ 
        borderRadius: 12, border: `1px solid var(--color-border)`, 
        backgroundColor: 'var(--color-surface)', padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              width: 48, height: 48, borderRadius: 8, backgroundColor: `${config.color}15`,
              border: `1px solid ${config.color}30`
            }}>
              <Globe size={24} color={config.color} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
                {result.normalized_url}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                  Scanned {new Date(result.scanned_at || Date.now()).toLocaleTimeString()}
                </span>
                <span style={{ color: 'var(--color-border)' }}>•</span>
                <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                  Confidence: <strong style={{ color: 'var(--color-primary)' }}>High</strong>
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="btn-ghost" style={{ padding: '8px 12px' }}>
            <RefreshCw size={14} /> Scan Another
          </button>
        </div>

        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, 
          padding: '16px', borderRadius: 8, backgroundColor: 'var(--color-elevated)',
          border: '1px solid var(--color-border-subtle)'
        }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Risk Level</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: config.color, fontWeight: 600, fontSize: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: config.color, boxShadow: `0 0 8px ${config.color}80` }} />
              {result.risk_level.replace('_', ' ')}
            </div>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Threat Score</p>
            <div style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
              {result.risk_score} <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>/ 100</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Indicators</p>
            <div style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 14 }}>
              {result.indicator_count} Flagged
            </div>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Domain Age</p>
            <div style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 14 }}>
              {whois?.age_days != null ? `${whois.age_days} days` : 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. AI Security Analysis ── */}
      <div style={{ 
        borderRadius: 12, border: `1px solid var(--color-border)`, 
        backgroundColor: 'var(--color-surface)', padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <SectionHeader title="AI Security Analysis" icon={<Activity size={16} />} />
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {aiBullets.map((bullet, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-accent)', marginTop: 8, flexShrink: 0 }} />
              <p style={{ fontSize: 14, color: 'var(--color-secondary)', lineHeight: 1.6, margin: 0 }}>
                {highlightKeywords(bullet + (bullet.endsWith('.') ? '' : '.'))}
              </p>
            </li>
          ))}
        </ul>
        <p style={{ fontSize: 12, color: 'var(--color-muted)', fontStyle: 'italic', marginTop: 16 }}>
          {result.explanation?.confidence_note}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* ── 6. Recommended Actions ── */}
        <div style={{ 
          borderRadius: 12, border: `1px solid var(--color-border)`, 
          backgroundColor: 'var(--color-surface)', padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <SectionHeader title="Recommended Actions" icon={<ShieldAlert size={16} />} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {actionBullets.length > 0 ? actionBullets.map((action, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', backgroundColor: 'var(--color-elevated)', borderRadius: 8, border: '1px solid var(--color-border-subtle)' }}>
                <CheckSquare size={16} color="var(--color-risk-safe)" />
                <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500 }}>{action}</span>
              </div>
            )) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', backgroundColor: 'var(--color-elevated)', borderRadius: 8, border: '1px solid var(--color-border-subtle)' }}>
                <CheckSquare size={16} color="var(--color-risk-safe)" />
                <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500 }}>Exercise standard caution when browsing.</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', backgroundColor: 'var(--color-elevated)', borderRadius: 8, border: '1px solid var(--color-border-subtle)' }}>
              <CheckSquare size={16} color="var(--color-risk-safe)" />
              <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500 }}>Verify sender identity if accessed via email.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', backgroundColor: 'var(--color-elevated)', borderRadius: 8, border: '1px solid var(--color-border-subtle)' }}>
              <CheckSquare size={16} color="var(--color-risk-safe)" />
              <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500 }}>Avoid entering sensitive credentials.</span>
            </div>
          </div>
        </div>

        {/* ── 4. Community Intelligence ── */}
        <div style={{ 
          borderRadius: 12, border: `1px solid var(--color-border)`, 
          backgroundColor: 'var(--color-surface)', padding: '24px',
          boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column'
        }}>
          <SectionHeader title="Community Intelligence" icon={<MessageSquare size={16} />} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            
            {/* VirusTotal / Existing Intel */}
            {result.threat_intel?.sources?.virustotal?.matched && (
              <div style={{ padding: '16px', backgroundColor: 'var(--color-elevated)', borderRadius: 8, border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldAlert size={14} color="var(--color-risk-high)" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>VirusTotal vendors</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Security DB</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--color-secondary)' }}>{result.threat_intel.sources.virustotal.detail}</p>
              </div>
            )}

            {/* Mock Reddit */}
            <div style={{ padding: '16px', backgroundColor: 'var(--color-elevated)', borderRadius: 8, border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={14} color="#ff4500" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>r/scams</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Reddit Mention</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-secondary)', fontStyle: 'italic' }}>"Users reported redirect behavior and credential harvesting upon visiting."</p>
            </div>

            {/* Mock GitHub */}
            <div style={{ padding: '16px', backgroundColor: 'var(--color-elevated)', borderRadius: 8, border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <GitBranch size={14} color="var(--color-primary)" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>phishing-blacklist</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>GitHub Repo</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-secondary)' }}>Domain flagged and added to community blocklist 2 days ago.</p>
            </div>

          </div>
        </div>
      </div>

      {/* ── 2. Threat Indicators ── */}
      {result.indicators?.length > 0 && (
        <div>
          <SectionHeader title={`Identified Threats (${result.indicator_count})`} icon={<AlertTriangle size={16} />} />
          <IndicatorList indicators={result.indicators} />
        </div>
      )}

      {/* ── 5. Technical Analysis (Expandable) ── */}
      <div style={{ 
        borderRadius: 12, border: `1px solid var(--color-border)`, 
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-card)', overflow: 'hidden'
      }}>
        <button
          onClick={() => setShowTechAnalysis(v => !v)}
          style={{ 
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            background: 'none', border: 'none', cursor: 'pointer', padding: '20px 24px' 
          }}
        >
          <SectionHeader title="Technical Analysis" icon={<Server size={16} />} />
          {showTechAnalysis ? <ChevronUp size={16} color="var(--color-muted)" /> : <ChevronDown size={16} color="var(--color-muted)" />}
        </button>
        
        <AnimatePresence>
          {showTechAnalysis && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
                  <Row icon={<Globe size={14} />} label="Domain" value={di?.registered_domain || result.domain} />
                  <Row icon={<Server size={14} />} label="TLD" value={di?.tld ? `.${di.tld}` : '—'} />
                  <Row
                    icon={di?.ssl_valid ? <CheckCircle size={14} color="var(--color-risk-safe)" /> : <XCircle size={14} color="var(--color-risk-high)" />}
                    label="SSL Certificate"
                    value={di?.ssl_valid ? 'Valid / Present' : 'Invalid / Missing'}
                  />
                  <Row icon={<Clock size={14} />} label="Domain Age" value={whois?.age_days != null ? `${whois.age_days} days` : '—'} />
                  <Row icon={<Shield size={14} />} label="Registrar" value={whois?.registrar || '—'} />
                  <Row icon={<Server size={14} />} label="IP Address" value={dns?.ips?.length ? dns.ips.join(', ') : '—'} />
                </div>

                {/* Redirect Chain inside Technical Analysis */}
                {chain.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                      Redirect Chain
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {chain.map((hop, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', backgroundColor: 'var(--color-elevated)', borderRadius: 6, border: '1px solid var(--color-border-subtle)' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid var(--color-border)' }}>
                            {i + 1}
                          </div>
                          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hop.url}</span>
                          {hop.status && <span style={{ fontSize: 11, color: 'var(--color-muted)', padding: '2px 6px', backgroundColor: 'var(--color-surface)', borderRadius: 4, border: '1px solid var(--color-border)' }}>HTTP {hop.status}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  )
}

