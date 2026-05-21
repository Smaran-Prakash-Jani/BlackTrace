'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ExternalLink, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import RiskBadge from '@/components/RiskBadge'
import { getHistory, deleteScan } from '@/lib/api'
import type { HistoryItem } from '@/lib/api'
import { formatDate, truncateUrl } from '@/lib/utils'
import Link from 'next/link'

const RISK_LEVELS = ['ALL', 'SAFE', 'LOW_RISK', 'SUSPICIOUS', 'HIGH_RISK', 'MALICIOUS', 'CRITICAL']

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await getHistory({
        page,
        limit: 15,
        search: search || undefined,
        risk_level: riskFilter !== 'ALL' ? riskFilter : undefined,
      })
      setItems(data.items)
      setTotal(data.total)
      setPages(data.pages)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, riskFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchData()
  }

  const handleDelete = async (id: number) => {
    setDeleting(id)
    await deleteScan(id)
    setItems(prev => prev.filter(i => i.scan_id !== id))
    setTotal(t => t - 1)
    setDeleting(null)
  }

  return (
    <div className="min-h-screen bg-base">
      <Navbar />

      <main className="pt-24 pb-24 px-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary tracking-tight mb-1">Scan History</h1>
          <p className="text-sm text-secondary">{total} scan{total !== 1 ? 's' : ''} recorded</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search URL or domain..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-base pl-9 pr-4 py-2.5"
            />
          </form>

          {/* Risk filter */}
          <div className="flex items-center gap-1 flex-wrap">
            {RISK_LEVELS.map(level => (
              <button
                key={level}
                onClick={() => { setRiskFilter(level); setPage(1) }}
                className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all duration-150 ${
                  riskFilter === level
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface border-border text-muted hover:text-secondary hover:border-muted'
                }`}
              >
                {level === 'ALL' ? 'All' : level.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-muted text-sm">Loading history…</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-secondary text-sm mb-2">No scans found</p>
              <p className="text-muted text-xs">
                {search || riskFilter !== 'ALL' ? 'Try adjusting your filters.' : (
                  <Link href="/scan" className="text-accent hover:underline">Run your first scan</Link>
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-[10px] text-muted uppercase tracking-widest font-medium">URL</th>
                    <th className="text-left px-4 py-3 text-[10px] text-muted uppercase tracking-widest font-medium">Risk</th>
                    <th className="text-left px-4 py-3 text-[10px] text-muted uppercase tracking-widest font-medium">Score</th>
                    <th className="text-left px-4 py-3 text-[10px] text-muted uppercase tracking-widest font-medium hidden md:table-cell">Scanned</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {items.map((item, i) => (
                    <motion.tr
                      key={item.scan_id}
                      className="hover:bg-elevated/50 transition-colors duration-100"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                    >
                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-xs font-mono text-primary truncate">{truncateUrl(item.url, 55)}</p>
                        <p className="text-[11px] text-muted mt-0.5">{item.domain}</p>
                      </td>
                      <td className="px-4 py-4">
                        <RiskBadge level={item.risk_level} size="sm" />
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold tabular-nums text-primary">{item.risk_score}</span>
                        <span className="text-xs text-muted">/100</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-xs text-muted">{formatDate(item.scanned_at)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleDelete(item.scan_id)}
                          disabled={deleting === item.scan_id}
                          className="text-muted hover:text-risk-malicious transition-colors duration-150"
                          aria-label="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost py-1.5 px-3 disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="btn-ghost py-1.5 px-3 disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
