"use client"

import { useEffect, useRef } from "react"

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    // fixar tipos
    const canvasEl = canvas
    const ctxEl = context

    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      canvas: HTMLCanvasElement
      ctx: CanvasRenderingContext2D

      constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas
        this.ctx = ctx
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 0.5
        this.speedX = Math.random() * 0.5 - 0.25
        this.speedY = Math.random() * 0.5 - 0.25
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x < 0 || this.x > this.canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > this.canvas.height) this.speedY *= -1
      }

      draw() {
        this.ctx.beginPath()
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        this.ctx.fillStyle = "rgba(0, 150, 255, 0.6)"
        this.ctx.fill()
      }
    }

    const particles: Particle[] = []
    const numParticles = 100

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle(canvasEl, ctxEl))
    }

    function animate() {
      ctxEl.clearRect(0, 0, canvasEl.width, canvasEl.height)
      particles.forEach((p) => {
        p.update()
        p.draw()
      })
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvasEl.width = window.innerWidth
      canvasEl.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full -z-10"
    />
  )
}
