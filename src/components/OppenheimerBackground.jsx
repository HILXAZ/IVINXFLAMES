import React, { useEffect, useRef } from 'react'

// Oppenheimer-style monochrome background: atomic orbits, scanlines, grain, and subtle wave interference
const OppenheimerBackground = ({ children }) => {
  const orbitsRef = useRef(null)
  const wavesRef = useRef(null)
  const rootRef = useRef(null)

  useEffect(() => {
    const orbitsCanvas = orbitsRef.current
    const wavesCanvas = wavesRef.current
    if (!orbitsCanvas || !wavesCanvas) return

    const octx = orbitsCanvas.getContext('2d')
    const wctx = wavesCanvas.getContext('2d')

    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      orbitsCanvas.width = width
      orbitsCanvas.height = height
      wavesCanvas.width = width
      wavesCanvas.height = height
    }
    resize()

    // Atomic orbit params
    const R = Math.min(width, height) * 0.28
    const orbitCount = 5
    const particles = Array.from({ length: orbitCount }, (_, i) => ({
      a: (i + 1) * (Math.PI / (orbitCount + 1)), // ellipse tilt
      rx: R * (0.45 + i * 0.12),
      ry: R * (0.30 + i * 0.10),
      t: Math.random() * Math.PI * 2,
      speed: 0.003 + i * 0.0015,
    }))

    // Waves params (subtle moving rings)
    let tick = 0

    // Pointer parallax (updates CSS vars on root)
    const handlePointer = (e) => {
      const el = rootRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const mx = (e.clientX - rect.left) / rect.width
      const my = (e.clientY - rect.top) / rect.height
      el.style.setProperty('--mx', mx.toFixed(3))
      el.style.setProperty('--my', my.toFixed(3))
    }
    window.addEventListener('pointermove', handlePointer)

    function drawOrbits() {
      octx.clearRect(0, 0, width, height)
      octx.save()
      octx.translate(width / 2, height / 2)

      // nucleus glow
      const nucleusGrad = octx.createRadialGradient(0, 0, 0, 0, 0, R * 0.35)
      nucleusGrad.addColorStop(0, 'rgba(255,255,255,0.12)')
      nucleusGrad.addColorStop(1, 'rgba(255,255,255,0)')
      octx.fillStyle = nucleusGrad
      octx.beginPath()
      octx.arc(0, 0, R * 0.4, 0, Math.PI * 2)
      octx.fill()

      // Rings and particles
      particles.forEach((p, idx) => {
        // ring
        octx.save()
        octx.rotate(p.a)
        octx.strokeStyle = 'rgba(255,255,255,0.12)'
        octx.lineWidth = 1
        octx.beginPath()
        for (let angle = 0; angle <= Math.PI * 2 + 0.01; angle += 0.02) {
          const x = Math.cos(angle) * p.rx
          const y = Math.sin(angle) * p.ry
          angle === 0 ? octx.moveTo(x, y) : octx.lineTo(x, y)
        }
        octx.stroke()

        // moving electron
        p.t += p.speed
        const ex = Math.cos(p.t) * p.rx
        const ey = Math.sin(p.t) * p.ry
        octx.shadowBlur = 12
        octx.shadowColor = 'rgba(255,255,255,0.4)'
        octx.fillStyle = 'rgba(255,255,255,0.85)'
        octx.beginPath()
        octx.arc(ex, ey, 2.3 + idx * 0.2, 0, Math.PI * 2)
        octx.fill()
        octx.shadowBlur = 0
        octx.restore()
      })

      octx.restore()
    }

    function drawWaves() {
      wctx.clearRect(0, 0, width, height)
      // subtle radial rings drifting from a parallaxed center
      const cx = width * (0.5 + (parseFloat(getComputedStyle(rootRef.current).getPropertyValue('--mx')) - 0.5) * 0.05 || 0)
      const cy = height * (0.5 + (parseFloat(getComputedStyle(rootRef.current).getPropertyValue('--my')) - 0.5) * 0.05 || 0)

      wctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < 6; i++) {
        const r = (tick * 0.8 + i * 70) % (Math.max(width, height))
        const alpha = 0.035 * (1 - r / Math.max(width, height))
        wctx.beginPath()
        wctx.strokeStyle = `rgba(255,255,255,${Math.max(alpha, 0)})`
        wctx.lineWidth = 1
        wctx.arc(cx, cy, r, 0, Math.PI * 2)
        wctx.stroke()
      }
      wctx.globalCompositeOperation = 'source-over'
      tick += 0.6
    }

    let raf
    const animate = () => {
      drawOrbits()
      drawWaves()
      raf = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => resize()
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', handlePointer)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div ref={rootRef} className="relative min-h-screen overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Soft vignette */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.6) 70%)',
        mixBlendMode: 'screen', zIndex: -5
      }} />

      {/* Subtle conic sweep */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.06), transparent 40deg, rgba(255,255,255,0.06) 80deg, transparent 120deg)',
        filter: 'blur(60px)', opacity: 0.2, animation: 'sweep 14s linear infinite', zIndex: -4
      }} />

      {/* Atomic orbits */}
      <canvas ref={orbitsRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: -3 }} />

      {/* Waves / interference rings */}
      <canvas ref={wavesRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: -2 }} />

      {/* Film grain */}
      <div className="fixed inset-0 pointer-events-none" style={{
        zIndex: -1, opacity: 0.1, mixBlendMode: 'overlay',
        backgroundImage:
          'url("data:image/svg+xml;utf8,\
          <svg xmlns=\'http://www.w3.org/2000/svg\' width=\'180\' height=\'180\' viewBox=\'0 0 180 180\'>\
          <filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'2\' stitchTiles=\'stitch\'/></filter>\
          <rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.4\'/></svg>")'
      }} />

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px)',
        opacity: 0.16, mixBlendMode: 'multiply', zIndex: -1
      }} />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      <style jsx>{`
        @keyframes sweep { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default OppenheimerBackground
