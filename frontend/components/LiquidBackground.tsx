'use client'
import DotField from './DotField'

export default function LiquidBackground() {
  return (
    <>
      {/* Base Black Background & Glows (Behind Everything) */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none',
        backgroundColor: '#000'
      }}>
        {/* Extremely subtle top glow a la Vercel/Linear */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100vw',
            height: '600px',
            background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.15) 0%, transparent 60%)',
          }}
        />
        {/* Minimal noise texture */}
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, mixBlendMode: 'overlay'
        }}>
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Interactive Dot Field (Behind main content) */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}>
        <DotField
          dotRadius={2.5}
          dotSpacing={22}
          cursorRadius={400}
          cursorForce={0.1}
          bulgeOnly={true}
          bulgeStrength={50}
          sparkle={false}
          waveAmplitude={0}
          gradientFrom="rgba(255, 255, 255, 0.6)"
          gradientTo="rgba(255, 255, 255, 0.3)"
          glowColor="transparent"
        />
      </div>

      {/* Interactive Dot Field (Front layer) 
          Masked to ONLY show at the top 150px. 
          This perfectly hides the fact that GradualBlur blackens the background dots,
          by painting sharp dots precisely over the blur area, while staying out of the way of the cards below!
      */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150, // Above GradualBlur (140), below Navbar (200)
        pointerEvents: 'none',
        maskImage: 'linear-gradient(to bottom, black 0%, black 140px, transparent 180px)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 140px, transparent 180px)',
      }}>
        <DotField
          dotRadius={2.5}
          dotSpacing={22}
          cursorRadius={400}
          cursorForce={0.1}
          bulgeOnly={true}
          bulgeStrength={50}
          sparkle={false}
          waveAmplitude={0}
          gradientFrom="rgba(255, 255, 255, 0.6)"
          gradientTo="rgba(255, 255, 255, 0.3)"
          glowColor="transparent"
        />
      </div>
    </>
  )
}


