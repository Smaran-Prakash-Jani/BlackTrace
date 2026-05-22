'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Shield, ArrowRight, Activity, Search, ShieldCheck, Zap, Lock, Database } from 'lucide-react'
import Navbar from '@/components/Navbar'
import LiquidBackground from '@/components/LiquidBackground'
import BorderGlow from '@/components/BorderGlow'
import GradualBlur from '@/components/GradualBlur'
import Logo from '@/components/Logo'
import IntroLoader from '@/components/IntroLoader'

export default function LandingPage() {
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('24h')

  return (
    <>
      <IntroLoader />
      <LiquidBackground />
      <Navbar />

      {/* Subtle top blur that fades out scrolling content smoothly */}
      <GradualBlur preset="page-header" zIndex={40} strength={4} animated={false} />
        
      <main style={{ paddingTop: 180, paddingBottom: 160, paddingLeft: 24, paddingRight: 24, position: 'relative', zIndex: 10 }}>
        
        {/* ── Hero ── */}
        <section style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center', marginBottom: 160 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', marginBottom: 32 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-secondary)', letterSpacing: '0.02em' }}>Announcing BlackTrace Enterprise 2.0</span>
              <ArrowRight size={12} color="var(--color-muted)" />
            </div>

            <h1 style={{
              fontSize: 'clamp(3rem, 7vw, 5.5rem)',
              fontWeight: 600, lineHeight: 1.05,
              letterSpacing: '-0.04em',
              marginBottom: 32,
              color: 'var(--color-primary)'
            }}>
              The intelligent standard for<br />
              <span className="text-gradient">URL threat analysis.</span>
            </h1>
            
            <p style={{
              fontSize: 18, color: 'var(--color-secondary)', lineHeight: 1.6,
              maxWidth: 600, margin: '0 auto 48px',
              fontWeight: 400
            }}>
              BlackTrace combines deep heuristics, live threat feeds, and ML models 
              into a single, high-performance cybersecurity API.
            </p>

            {/* URL Threat Scanner Input */}
            <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative' }}>
              <BorderGlow
                glowColor="0 0 100"
                backgroundColor="#0a0a0a"
                borderRadius={8}
                colors={['#555', '#333', '#777']}
                glowRadius={20}
                glowIntensity={0.5}
                edgeSensitivity={20}
                className="w-full"
              >
                <form 
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: 8, 
                    padding: '6px 6px 6px 20px'
                  }}
                  onSubmit={(e) => { e.preventDefault(); window.location.href='/scan' }}
                >
                  <Search size={18} color="var(--color-muted)" />
                  <input 
                    type="text" 
                    placeholder="Analyze any URL, IP, or domain..." 
                    style={{ 
                      flex: 1, background: 'transparent', border: 'none', outline: 'none', 
                      color: '#fff', fontSize: 15, padding: '10px 0' 
                    }} 
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
                    Scan URL
                  </button>
                </form>
              </BorderGlow>
            </div>
          </motion.div>
        </section>

        {/* ── Minimal Dashboard Mockup ── */}
        <section style={{ maxWidth: 1040, margin: '0 auto 160px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ 
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              borderRadius: 12
            }}
          >
            <BorderGlow
              className="backdrop-blur-xl"
              glowColor="0 0 100"
              backgroundColor="rgba(15, 15, 15, 0.3)"
              borderRadius={12}
              colors={['#444', '#111', '#666']}
              glowRadius={40}
              glowIntensity={0.5}
              animated={true}
            >
              {/* Window header */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
              </div>

              <div style={{ 
                padding: '48px',
                display: 'grid', gridTemplateColumns: '1fr 300px', gap: 64
              }}>
                {/* Main Chart Area */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 500, color: '#fff', marginBottom: 4 }}>Threat Detection Velocity</h3>
                      <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>Requests per minute across all endpoints</p>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => setTimeframe('1h')} style={{ padding: '4px 10px', borderRadius: 4, background: timeframe === '1h' ? '#1a1a1a' : 'transparent', fontSize: 12, color: timeframe === '1h' ? '#fff' : 'var(--color-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>1h</button>
                      <button onClick={() => setTimeframe('24h')} style={{ padding: '4px 10px', borderRadius: 4, background: timeframe === '24h' ? '#1a1a1a' : 'transparent', fontSize: 12, color: timeframe === '24h' ? '#fff' : 'var(--color-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>1 Day</button>
                      <button onClick={() => setTimeframe('7d')} style={{ padding: '4px 10px', borderRadius: 4, background: timeframe === '7d' ? '#1a1a1a' : 'transparent', fontSize: 12, color: timeframe === '7d' ? '#fff' : 'var(--color-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>7 Days</button>
                    </div>
                  </div>
                  
                  {/* Minimal SVG Chart representation */}
                  <div style={{ flex: 1, position: 'relative', minHeight: 200 }}>
                    {/* Chart Grid */}
                    <div style={{ position: 'absolute', inset: 0, borderTop: '1px solid var(--color-border-subtle)', borderBottom: '1px solid var(--color-border-subtle)' }} />
                    {/* Line Chart */}
                    <svg viewBox="0 0 100 30" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </linearGradient>
                      </defs>
                      <path 
                        d={
                          timeframe === '1h' ? "M0,20 L10,15 L20,25 L30,10 L40,15 L50,5 L60,20 L70,10 L80,15 L90,2 L100,8 L100,30 L0,30 Z" :
                          timeframe === '7d' ? "M0,28 L10,26 L20,27 L30,22 L40,24 L50,18 L60,20 L70,15 L80,12 L90,8 L100,10 L100,30 L0,30 Z" :
                          "M0,25 L10,22 L20,24 L30,15 L40,18 L50,8 L60,12 L70,5 L80,10 L90,2 L100,6 L100,30 L0,30 Z"
                        } 
                        fill="url(#chartGrad)" 
                        style={{ transition: 'd 0.5s ease' }}
                      />
                      <path 
                        d={
                          timeframe === '1h' ? "M0,20 L10,15 L20,25 L30,10 L40,15 L50,5 L60,20 L70,10 L80,15 L90,2 L100,8" :
                          timeframe === '7d' ? "M0,28 L10,26 L20,27 L30,22 L40,24 L50,18 L60,20 L70,15 L80,12 L90,8 L100,10" :
                          "M0,25 L10,22 L20,24 L30,15 L40,18 L50,8 L60,12 L70,5 L80,10 L90,2 L100,6"
                        } 
                        fill="none" stroke="#fff" strokeWidth="0.5" 
                        style={{ transition: 'd 0.5s ease' }}
                      />
                    </svg>
                  </div>
                </div>

                {/* Side Panel / Donut */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                  <div>
                    <h4 style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>Risk Distribution</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                      {/* Donut Chart Mock */}
                      <div style={{ 
                        width: 64, height: 64, borderRadius: '50%', 
                        background: 'conic-gradient(var(--color-border) 0% 15%, #333 15% 45%, #fff 45% 100%)',
                        position: 'relative'
                      }}>
                        <div style={{ position: 'absolute', inset: 6, background: '#0a0a0a', borderRadius: '50%' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} /> <span style={{ fontSize: 13, color: 'var(--color-secondary)' }}>Safe</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#333' }} /> <span style={{ fontSize: 13, color: 'var(--color-secondary)' }}>Suspicious</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-border)' }} /> <span style={{ fontSize: 13, color: 'var(--color-secondary)' }}>Critical</span></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>System Status</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #222' }}>
                        <ShieldCheck size={16} color="#fff" />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>All Systems Operational</div>
                        <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Latency: 12ms</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </BorderGlow>
          </motion.div>
        </section>

        {/* ── Features ── */}
        <section style={{ maxWidth: 1040, margin: '0 auto 120px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, marginBottom: 16, letterSpacing: '-0.02em', color: '#fff' }}>
              Built for performance
            </h2>
            <p style={{ color: 'var(--color-secondary)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
              Advanced heuristics and real-time ML analysis without compromising speed.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: Database, title: 'Live Feeds', desc: 'Real-time sync with OpenPhish and global threat databases.' },
              { icon: Activity, title: 'Heuristics', desc: 'Detect zero-day obfuscation patterns instantly.' },
              { icon: Lock, title: 'Enterprise', desc: 'Bank-grade encryption and SOC2 compliant infrastructure.' },
              { icon: Zap, title: 'Low Latency', desc: 'Sub-50ms response times globally via edge deployment.' },
              { icon: Search, title: 'Deep Analysis', desc: 'Multi-layered scanning covering redirects and entropy.' },
              { icon: Shield, title: 'Brand Protection', desc: 'Identify impersonation attempts against your domains.' }
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
              >
                <BorderGlow
                  className="backdrop-blur-xl w-full h-full"
                  glowColor="0 0 100"
                  backgroundColor="rgba(15, 15, 15, 0.3)"
                  borderRadius={8}
                  colors={['#444', '#111', '#666']}
                  glowRadius={30}
                  glowIntensity={0.4}
                >
                  <div style={{ padding: '32px 24px', height: '100%' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: '#111',
                      border: '1px solid #222',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 24,
                    }}>
                      <feat.icon size={18} color="#fff" />
                    </div>
                    
                    <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8, color: '#fff' }}>{feat.title}</h3>
                    <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6 }}>{feat.desc}</p>
                  </div>
                </BorderGlow>
              </motion.div>
            ))}
          </div>
        </section>

      </main>

      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '64px 24px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <Logo showText={false} />
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
          © 2026 BlackTrace Intelligence.
        </p>
      </footer>
    </>
  )
}
