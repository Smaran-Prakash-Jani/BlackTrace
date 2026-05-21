'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function IntroLoader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Hide the loader after 2.8 seconds
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Shield Logo Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <svg width="48" height="48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="topSilverIntro" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#9ca3af" />
                  </linearGradient>
                  <linearGradient id="botPurpleIntro" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#4c1d95" />
                  </linearGradient>
                  <clipPath id="slashClipIntro">
                    <polygon points="0,0 200,0 200,85 0,145" />
                    <polygon points="0,160 200,100 200,200 0,200" />
                  </clipPath>
                </defs>
                <g clipPath="url(#slashClipIntro)">
                  <path d="M 100 20 C 150 20 170 30 170 40 V 100 C 170 140 130 170 100 180 C 80 173 60 160 50 140 L 70 130 C 75 145 85 155 100 160 C 120 150 150 125 150 100 V 45 C 150 45 130 40 100 40 Z" fill="url(#botPurpleIntro)" />
                  <path d="M 40 40 H 100 C 130 40 140 55 140 70 C 140 85 130 100 100 100 H 40 Z" fill="url(#topSilverIntro)" />
                  <path d="M 65 60 H 100 C 110 60 115 65 115 70 C 115 75 110 80 100 80 H 65 Z" fill="#0a0a0a" />
                  <path d="M 40 100 H 110 C 145 100 155 115 155 130 C 155 145 145 160 110 160 H 40 Z" fill="url(#botPurpleIntro)" />
                  <path d="M 65 120 H 110 C 125 120 130 125 130 130 C 130 135 125 140 110 140 H 65 Z" fill="#0a0a0a" />
                </g>
              </svg>
            </motion.div>

            {/* Text Animation */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: 28, 
              fontWeight: 700, 
              letterSpacing: '0.1em',
              fontFamily: 'Inter, system-ui, sans-serif',
              overflow: 'hidden'
            }}>
              <motion.span 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                style={{ 
                  color: 'transparent', 
                  WebkitTextStroke: '1px rgba(255, 255, 255, 0.9)',
                }}
              >
                BLACK
              </motion.span>
              <motion.span 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                style={{ color: '#a855f7' }}
              >
                TRACE
              </motion.span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
