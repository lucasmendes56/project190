import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const canvasRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const chars = '0123456789'.split('')
    const fontSize = 14
    const colWidth = 18
    const trailLen = 12

    const randChar = () => chars[Math.floor(Math.random() * chars.length)]

    let cols, drops, colChars, rafId, frame = 0

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      cols = Math.floor(canvas.width / colWidth)
      drops = Array(cols).fill(1)
      // each column holds a fixed-length array of characters
      colChars = Array.from({ length: cols }, () =>
        Array.from({ length: trailLen }, randChar)
      )
    }

    function draw() {
      rafId = requestAnimationFrame(draw)
      frame++
      if (frame % 3 !== 0) return

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < cols; i++) {
        const x = i * colWidth
        const headRow = drops[i]

        // Randomly mutate a couple of chars in this column's trail each tick
        for (let m = 0; m < 2; m++) {
          const slot = Math.floor(Math.random() * trailLen)
          colChars[i][slot] = randChar()
        }

        // Leading character (bright)
        ctx.globalAlpha = 1
        ctx.fillStyle = '#FF4444'
        ctx.font = `bold ${fontSize}px monospace`
        ctx.fillText(colChars[i][0], x, headRow * fontSize)

        // Trail (fades with distance from head)
        ctx.font = `${fontSize}px monospace`
        ctx.fillStyle = '#DC2626'
        for (let j = 1; j < trailLen; j++) {
          const row = headRow - j
          if (row < 0) continue
          ctx.globalAlpha = 1 - j / trailLen
          ctx.fillText(colChars[i][j % trailLen], x, row * fontSize)
        }
        ctx.globalAlpha = 1

        if (headRow * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    resize()
    window.addEventListener('resize', resize)
    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Center overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-none">
        <button
          className="pointer-events-auto px-12 py-5 text-2xl font-black tracking-widest uppercase text-white rounded-2xl border-2 transition-all active:scale-95"
          style={{
            borderColor: '#DC2626',
            boxShadow: '0 0 24px #DC262680, 0 0 8px #DC262640',
            background: 'rgba(0,0,0,0.6)',
          }}
          onClick={() => navigate('/home')}
        >
          BEGIN PROJECT 190
        </button>
      </div>
    </div>
  )
}
