'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import Navbar from '@/components/Navbar'
import { getAnalytics } from '@/lib/api'
import type { AnalyticsResponse } from '@/lib/api'
import { getRiskConfig } from '@/lib/utils'
import { Shield, AlertTriangle, Activity, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const STAT_CARDS = (data: AnalyticsResponse) => [
  {
    label: 'Total Scans',
    value: data.total_scans,
    icon: Activity,
    color: '#6366f1',
    desc: 'URLs analyzed',
  },
  {
    label: 'Threat Rate',
    value: `${data.threat_rate}%`,
    icon: AlertTriangle,
    color: '#f97316',
    desc: 'Suspicious or worse',
  },
  {
    label: 'Avg Risk Score',
    value: data.average_score,
    icon: TrendingUp,
    color: '#f59e0b',
    desc: 'Out of 100',
  },
  {
    label: 'Malicious Found',
    value: (data.malicious_count ?? 0) + (data.critical_count ?? 0),
    icon: Shield,
    color: '#ef4444',
    desc: 'Malicious + Critical',
  },
]

const RISK_ORDER = ['SAFE', 'LOW_RISK', 'SUSPICIOUS', 'HIGH_RISK', 'MALICIOUS', 'CRITICAL']
const RISK_LABELS: Record<string, string> = {
  SAFE: 'Safe', LOW_RISK: 'Low Risk', SUSPICIOUS: 'Suspicious',
  HIGH_RISK: 'High Risk', MALICIOUS: 'Malicious', CRITICAL: 'Critical',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 text-xs shadow-card">
      <p className="text-muted mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnalytics().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <Navbar />
        <p className="text-muted text-sm">Loading analytics…</p>
      </div>
    )
  }

  if (!data || data.total_scans === 0) {
    return (
      <div className="min-h-screen bg-base">
        <Navbar />
        <div className="pt-32 text-center px-6">
          <Activity size={36} className="text-muted mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-primary mb-2">No data yet</h1>
          <p className="text-secondary text-sm mb-6">Run some scans first to see your analytics dashboard.</p>
          <Link href="/scan" className="btn-primary mx-auto inline-flex">Go to Scanner</Link>
        </div>
      </div>
    )
  }

  const statCards = STAT_CARDS(data)

  // Pie chart data
  const pieData = RISK_ORDER
    .filter(level => (data.risk_distribution[level] ?? 0) > 0)
    .map(level => ({
      name: RISK_LABELS[level],
      value: data.risk_distribution[level] ?? 0,
      color: getRiskConfig(level).color,
    }))

  // Line chart data (last 30 days)
  const lineData = data.daily_activity.slice(-30)

  return (
    <div className="min-h-screen bg-base">
      <Navbar />

      <main className="pt-24 pb-24 px-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary tracking-tight mb-1">Analytics Dashboard</h1>
          <p className="text-sm text-secondary">Aggregated threat intelligence across all scans</p>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.label}
                className="card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] text-muted uppercase tracking-widest">{card.label}</p>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${card.color}15` }}
                  >
                    <Icon size={13} style={{ color: card.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-primary tabular-nums" style={{ color: card.color }}>
                  {card.value}
                </p>
                <p className="text-[11px] text-muted mt-1">{card.desc}</p>
              </motion.div>
            )
          })}
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Activity Line Chart */}
          <motion.div
            className="card lg:col-span-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <p className="label mb-5">Scan Activity — Last 30 Days</p>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={d => d.slice(5)}
                    tick={{ fontSize: 10, fill: '#52525b' }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#52525b' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4, fill: '#6366f1' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="threats"
                    name="Threats"
                    stroke="#f97316"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4, fill: '#f97316' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted text-xs">
                Not enough activity data yet
              </div>
            )}
          </motion.div>

          {/* Risk Distribution Pie */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <p className="label mb-5">Risk Distribution</p>
            {pieData.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="space-y-1.5 mt-3">
                  {pieData.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs text-secondary">{entry.name}</span>
                      </div>
                      <span className="text-xs font-medium text-primary tabular-nums">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted text-xs">No data</div>
            )}
          </motion.div>
        </div>

        {/* ── Risk breakdown table ── */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <p className="label mb-5">Risk Breakdown</p>
          <div className="space-y-3">
            {RISK_ORDER.map(level => {
              const count = data.risk_distribution[level] ?? 0
              const pct = data.total_scans ? Math.round((count / data.total_scans) * 100) : 0
              const config = getRiskConfig(level)
              return (
                <div key={level} className="flex items-center gap-4">
                  <span className="text-xs text-secondary w-24 flex-shrink-0">{RISK_LABELS[level]}</span>
                  <div className="flex-1 bg-elevated rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: config.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 w-14 justify-end">
                    <span className="text-xs font-medium text-primary tabular-nums">{count}</span>
                    <span className="text-[10px] text-muted tabular-nums">({pct}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
