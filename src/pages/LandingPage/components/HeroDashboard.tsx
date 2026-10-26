import { useRef, useState, type CSSProperties, type PointerEvent } from "react"
import { Activity, ArrowUpRight, GitFork, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const views = {
  Activity: { value: "184", label: "contributions this month", change: "+24%", bars: [32, 44, 36, 57, 48, 69, 62, 82, 72, 91, 78, 96] },
  Repositories: { value: "12", label: "active repositories", change: "+3", bars: [62, 38, 55, 70, 44, 76, 58, 84, 64, 77, 88, 92] },
} as const

type ViewName = keyof typeof views

export default function HeroDashboard() {
  const [activeView, setActiveView] = useState<ViewName>("Activity")
  const panelRef = useRef<HTMLDivElement>(null)
  const view = views[activeView]

  const updateTilt = (event: PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const panel = panelRef.current
    if (!panel) return
    const bounds = panel.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    panel.style.setProperty("--panel-ry", `${(x - 0.5) * 6}deg`)
    panel.style.setProperty("--panel-rx", `${(0.5 - y) * 6}deg`)
    panel.style.setProperty("--glow-x", `${x * 100}%`)
    panel.style.setProperty("--glow-y", `${y * 100}%`)
  }

  const resetTilt = () => {
    const panel = panelRef.current
    if (!panel) return
    panel.style.setProperty("--panel-rx", "0deg")
    panel.style.setProperty("--panel-ry", "0deg")
  }

  return (
    <div className="landing-panel-wrap" onPointerMove={updateTilt} onPointerLeave={resetTilt}>
      <div ref={panelRef} className="landing-dashboard-panel relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0d1219]/95 p-4 shadow-2xl shadow-black/50 sm:p-6">
        <div aria-hidden="true" className="landing-panel-glow absolute inset-0" />
        <div className="relative">
          <div className="flex items-center justify-between border-b border-white/8 pb-5">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#238636]/20 text-[#3FB950]"><Activity aria-hidden="true" className="h-5 w-5" /></div><div><p className="text-sm font-semibold text-white">Developer momentum</p><p className="mt-0.5 text-xs text-[#737e8c]">Live profile preview</p></div></div>
          </div>
          <div className="mt-5 flex gap-1 overflow-x-auto rounded-xl border border-white/8 bg-black/20 p-1" aria-label="Preview analytics view">
            {(Object.keys(views) as ViewName[]).map(name => <Button key={name} type="button" size="sm" variant="ghost" aria-pressed={activeView === name} onClick={() => setActiveView(name)} className={`min-w-max flex-1 ${activeView === name ? "bg-[#238636]/20 text-[#3FB950] shadow-sm" : "text-muted-foreground"}`}>{name}</Button>)}
          </div>
          <div className="mt-7 flex items-end justify-between gap-4"><div><p className="numbersFont text-4xl font-semibold tracking-tight text-white sm:text-5xl">{view.value}</p><p className="mt-2 text-sm text-[#7d8795]">{view.label}</p></div><span className="mb-1 inline-flex items-center gap-1 rounded-full bg-[#238636]/20 px-3 py-1.5 text-sm font-semibold text-[#3FB950]">{view.change}<ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></span></div>
          <div key={activeView} className="landing-hero-chart mt-8 flex h-40 items-end gap-1.5 sm:gap-2" aria-label={`${activeView} trend chart`}>
            {view.bars.map((height, index) => <div key={index} className="flex h-full flex-1 items-end"><div className="landing-hero-bar w-full rounded-t-sm bg-gradient-to-t from-[#1A4029] to-[#3FB950]" style={{ "--hero-bar-height": `${height}%`, "--hero-bar-delay": `${index * 45}ms` } as CSSProperties} /></div>)}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/8 pt-5">
              <div className="rounded-xl bg-white/[0.035] p-3"><div className="flex items-center gap-2 text-xs text-[#77818f]"><Star aria-hidden="true" className="h-3.5 w-3.5 text-amber-300" /> Stars earned</div><p className="numbersFont mt-2 text-xl font-semibold">327</p></div>
              <div className="rounded-xl bg-white/[0.035] p-3"><div className="flex items-center gap-2 text-xs text-[#77818f]"><GitFork aria-hidden="true" className="h-3.5 w-3.5 text-[#3FB950]" /> Pull requests</div><p className="numbersFont mt-2 text-xl font-semibold">46</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}
