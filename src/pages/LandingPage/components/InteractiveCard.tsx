import type { CSSProperties, ComponentProps, PointerEvent } from "react"

type InteractiveCardProps = ComponentProps<"article"> & {
  intensity?: number
  glow?: string
}

export default function InteractiveCard({ children, className = "", intensity = 4, glow = "35, 134, 54", style, ...props }: InteractiveCardProps) {
  const updateCard = (event: PointerEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const card = event.currentTarget
    const bounds = card.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    card.style.setProperty("--card-ry", `${(x - 0.5) * intensity}deg`)
    card.style.setProperty("--card-rx", `${(0.5 - y) * intensity}deg`)
    card.style.setProperty("--card-x", `${x * 100}%`)
    card.style.setProperty("--card-y", `${y * 100}%`)
  }

  const resetCard = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--card-rx", "0deg")
    event.currentTarget.style.setProperty("--card-ry", "0deg")
  }

  return (
    <article
      {...props}
      className={`landing-interactive-card ${className}`}
      onPointerMove={updateCard}
      onPointerLeave={resetCard}
      style={{ "--card-glow": glow, ...style } as CSSProperties}
    >
      <div className="landing-card-content">{children}</div>
    </article>
  )
}
