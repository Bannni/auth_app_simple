import { useEffect, useRef } from "react"

export default function AuroraParticles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const particleCount = 50

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.opacity = Math.random() * 0.5 + 0.2
        this.color = this.getAuroraColor()
        this.wobble = Math.random() * Math.PI * 2
        this.wobbleSpeed = (Math.random() - 0.5) * 0.02
      }

      getAuroraColor() {
        const colors = [
          `rgba(100, 200, 255, ${this.opacity})`, // Blue
          `rgba(100, 255, 200, ${this.opacity})`, // Cyan
          `rgba(200, 100, 255, ${this.opacity})`, // Purple
          `rgba(100, 255, 150, ${this.opacity})`, // Green
          `rgba(150, 200, 255, ${this.opacity})`, // Light blue
        ]
        return colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY + Math.sin(this.wobble) * 0.3
        this.wobble += this.wobbleSpeed

        // Wrap around screen
        if (this.x < -10) this.x = canvas.width + 10
        if (this.x > canvas.width + 10) this.x = -10
        if (this.y < -10) this.y = canvas.height + 10
        if (this.y > canvas.height + 10) this.y = -10

        // Fade in and out
        this.opacity += (Math.random() - 0.5) * 0.02
        this.opacity = Math.max(0.1, Math.min(0.6, this.opacity))
      }

      draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 0.8})`)
        gradient.addColorStop(1, `rgba(100, 150, 255, ${this.opacity * 0.3})`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()

        // Add glow effect
        ctx.strokeStyle = `rgba(150, 200, 255, ${this.opacity * 0.4})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    let animationId

    const animate = () => {
      // Clear canvas with slight transparency for trail effect
      ctx.fillStyle = "rgba(5, 10, 25, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw background aurora glow
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "rgba(50, 100, 200, 0.02)")
      gradient.addColorStop(0.5, "rgba(100, 150, 255, 0.03)")
      gradient.addColorStop(1, "rgba(150, 100, 200, 0.02)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-40 z-0"
      style={{ background: "transparent" }}
    />
  )
}
