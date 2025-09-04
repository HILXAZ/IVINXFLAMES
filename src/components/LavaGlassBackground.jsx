import React, { useEffect, useRef } from 'react'

// "Lavazeed Lavender" – richer, dynamic lavender lava background
const LavaGlassBackground = ({
  children,
  palette = { color1: '#C4B5FD', color2: '#A78BFA', color3: '#E879F9', color4: '#E9D5FF' },
}) => {
  const meshCanvasRef = useRef(null)
  const particlesCanvasRef = useRef(null)
  const rootRef = useRef(null)

  useEffect(() => {
    // Initialize Neural Mesh Canvas
    const meshCanvas = meshCanvasRef.current
    const meshCtx = meshCanvas.getContext('2d')
    let meshNodes = []
    const MESH_COUNT = 48

    function resizeMesh() {
      meshCanvas.width = window.innerWidth
      meshCanvas.height = window.innerHeight
    }

    function initMesh() {
      meshNodes = Array.from({ length: MESH_COUNT }, (_, i) => ({
        x: Math.random() * meshCanvas.width,
        y: Math.random() * meshCanvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: 1.5 + Math.random() * 2,
        hue: i % 2 ? palette.color1 : palette.color2
      }))
    }

    function drawMesh() {
      meshCtx.clearRect(0, 0, meshCanvas.width, meshCanvas.height)
      
      // Draw connections
      for (let i = 0; i < meshNodes.length; i++) {
        const ni = meshNodes[i]
        for (let j = i + 1; j < meshNodes.length; j++) {
          const nj = meshNodes[j]
          const dx = ni.x - nj.x
          const dy = ni.y - nj.y
          const d2 = dx * dx + dy * dy
          const maxD = 160 * 160
          if (d2 < maxD) {
            const alpha = 1 - (d2 / maxD)
            meshCtx.strokeStyle = `rgba(42, 250, 223, ${0.08 + 0.4 * alpha})`
            meshCtx.lineWidth = 1
            meshCtx.beginPath()
            meshCtx.moveTo(ni.x, ni.y)
            meshCtx.lineTo(nj.x, nj.y)
            meshCtx.stroke()
          }
        }
      }
      
      // Draw nodes
      for (const n of meshNodes) {
        meshCtx.beginPath()
        meshCtx.fillStyle = "rgba(42, 250, 223, 0.95)"
        meshCtx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        meshCtx.fill()
      }
    }

    function stepMesh() {
      for (const n of meshNodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > meshCanvas.width) n.vx *= -1
        if (n.y < 0 || n.y > meshCanvas.height) n.vy *= -1
      }
    }

    // Initialize Particles Canvas
    const pCanvas = particlesCanvasRef.current
    const pCtx = pCanvas.getContext('2d')
    let particles = []
    const P_COUNT = 40

    function resizeParticles() {
      pCanvas.width = window.innerWidth
      pCanvas.height = window.innerHeight
    }

    function initParticles() {
      particles = Array.from({ length: P_COUNT }, () => ({
        x: Math.random() * pCanvas.width,
        y: pCanvas.height + Math.random() * pCanvas.height * 0.6,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(0.3 + Math.random() * 0.9),
        size: 1 + Math.random() * 4,
        alpha: 0.1 + Math.random() * 0.9
      }))
    }

    function drawParticles() {
      pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height)
      for (const pt of particles) {
        pCtx.beginPath()
        pCtx.fillStyle = `rgba(255, 255, 255, ${Math.min(pt.alpha, 0.9)})`
        pCtx.shadowBlur = 12
        pCtx.shadowColor = "rgba(255, 255, 255, 0.25)"
        pCtx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2)
        pCtx.fill()
        pCtx.shadowBlur = 0
      }
    }

    function stepParticles() {
      for (const pt of particles) {
        pt.x += pt.vx
        pt.y += pt.vy
        if (pt.y < -50) {
          pt.x = Math.random() * pCanvas.width
          pt.y = pCanvas.height + 30 + Math.random() * 100
        }
      }
    }

    // Setup and start animations
    resizeMesh()
    resizeParticles()
    initMesh()
    initParticles()

    let animationId
    function animate() {
      stepMesh()
      drawMesh()
      stepParticles()
      drawParticles()
      animationId = requestAnimationFrame(animate)
    }
    animate()

    // Pointer parallax (subtle)
    const handlePointer = (e) => {
      const el = rootRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const mx = (e.clientX - rect.left) / rect.width
      const my = (e.clientY - rect.top) / rect.height
      el.style.setProperty('--mx', mx.toFixed(3))
      el.style.setProperty('--my', my.toFixed(3))
    }

    // Resize handlers
    const handleResize = () => {
      resizeMesh()
      resizeParticles()
      initMesh()
      initParticles()
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('pointermove', handlePointer)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointer)
    }
  }, [palette])

  return (
    <div ref={rootRef} className="relative min-h-screen overflow-hidden" style={{ background: '#0A0A0B' }}>
      {/* Lava Layer - CSS-based for React compatibility */}
      <div 
        className="fixed inset-0 opacity-80"
        style={{
          background: `
            radial-gradient(circle at calc(20% + (var(--mx, .5) * 6%)) calc(30% + (var(--my, .5) * 6%)), ${palette.color1} 0%, transparent 55%),
            radial-gradient(circle at calc(80% - (var(--mx, .5) * 6%)) calc(70% - (var(--my, .5) * 6%)), ${palette.color2} 0%, transparent 55%),
            radial-gradient(circle at calc(50% + (var(--mx, .5) * 4%)) calc(50% - (var(--my, .5) * 4%)), ${palette.color3} 0%, transparent 55%),
            radial-gradient(circle at 30% 80%, ${palette.color4} 0%, transparent 55%)
          `,
          backgroundSize: '200% 200%',
          animation: 'lavaShift 12s ease-in-out infinite alternate',
          filter: 'blur(90px) brightness(1.1) saturate(1.15)',
          zIndex: -5
        }}
      />

      {/* Extra floating lavender blobs */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -4 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${140 + i * 20}px`,
              height: `${140 + i * 20}px`,
              left: `${10 + i * 12}%`,
              top: `${(i % 2 === 0 ? 15 : 55) + i * 5}%`,
              background: `radial-gradient(circle, ${i % 2 ? palette.color2 : palette.color1} 0%, transparent 70%)`,
              filter: 'blur(30px) opacity(0.5)',
              animation: `blobFloat ${8 + i * 1.2}s ease-in-out ${i * 0.6}s infinite`,
              mixBlendMode: 'screen',
            }}
          />
        ))}
      </div>

      {/* Pulsating Light Overlay */}
      <div 
        className="fixed inset-0"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 80%)',
          animation: 'pulseMove 7s ease-in-out infinite',
          zIndex: -4
        }}
      />

  {/* Data Stream */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-12"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
    rgba(167,139,250,0.04) 0px,
    rgba(167,139,250,0.04) 2px,
            transparent 2px,
            transparent 26px
          )`,
          mixBlendMode: 'screen',
          zIndex: -4
        }}
      />

    {/* Radar Sweep */}
      <div 
        className="fixed pointer-events-none"
        style={{
          width: '260%',
          height: '260%',
          top: '-80%',
          left: '-80%',
      background: 'conic-gradient(from 0deg, rgba(167,139,250,0.1) 0deg, transparent 50deg)',
      animation: 'radarRotate 11s linear infinite',
          mixBlendMode: 'screen',
      opacity: 0.16,
      filter: 'blur(42px)',
          zIndex: -3
        }}
      />

      {/* Neural Mesh Canvas */}
      <canvas
        ref={meshCanvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -2 }}
      />

      {/* Particles Canvas */}
      <canvas
        ref={particlesCanvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -1 }}
      />

      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: -1,
          opacity: 0.08,
          backgroundImage:
            'url("data:image/svg+xml;utf8,\
            <svg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\' viewBox=\'0 0 160 160\'>\
            <filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\' stitchTiles=\'stitch\'/></filter>\
            <rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.4\'/></svg>")',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      <style jsx>{`
        @keyframes lavaShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes pulseMove {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.3); opacity: 0.4; }
        }
        @keyframes radarRotate {
          to { transform: rotate(360deg); }
        }
        @keyframes blobFloat {
          0% { transform: translate3d(-10px, 0, 0) scale(1); }
          50% { transform: translate3d(10px, -10px, 0) scale(1.08); }
          100% { transform: translate3d(-10px, 0, 0) scale(1); }
        }
      `}</style>
    </div>
  )
}

export default LavaGlassBackground
