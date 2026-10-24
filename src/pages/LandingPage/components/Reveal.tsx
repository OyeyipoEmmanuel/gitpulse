import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

type RevealProps = { children: ReactNode; className?: string; delay?: number }

export default function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    if (typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => setVisible(true))
      return () => window.cancelAnimationFrame(frame)
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.14, rootMargin: "0px 0px -40px" })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={elementRef} className={`landing-reveal ${className}`} data-visible={visible} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  )
}
