import { useState, type PointerEvent } from "react"
import { Activity, ArrowUpRight, BriefcaseBusiness } from "lucide-react"
import Reveal from "./Reveal"

const views = [
  {
    id: "productivity",
    label: "Productivity",
    title: "Find the rhythm behind your best work.",
    description: "See when you are most productive, how consistently you contribute and whether your momentum is building over time.",
    image: "/media/productivity-dashboard.png",
    alt: "GitArc productivity dashboard showing streaks, consistency, growth and activity charts",
    icon: Activity,
    accent: "+629%",
    accentLabel: "yearly growth",
  },
  {
    id: "career",
    label: "Career snapshot",
    title: "Turn GitHub activity into a story people remember.",
    description: "Translate years of building into a focused view of your strongest technologies, open-source impact and developer growth.",
    image: "/media/career-snapshot-dashboard.png",
    alt: "GitArc career snapshot showing mastered languages, experience, contributions and open-source impact",
    icon: BriefcaseBusiness,
    accent: "Established",
    accentLabel: "developer tier",
  },
] as const

export default function DashboardShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeView = views[activeIndex]

  const updatePerspective = (event: PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    event.currentTarget.style.setProperty("--showcase-rx", `${(0.5 - y) * 3.5}deg`)
    event.currentTarget.style.setProperty("--showcase-ry", `${(x - 0.5) * 5}deg`)
    event.currentTarget.style.setProperty("--showcase-x", `${x * 100}%`)
    event.currentTarget.style.setProperty("--showcase-y", `${y * 100}%`)
  }

  const resetPerspective = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--showcase-rx", "0deg")
    event.currentTarget.style.setProperty("--showcase-ry", "0deg")
  }

  return (
    <section id="showcase" className="landing-showcase relative isolate px-4 py-24 sm:px-6 lg:px-8 lg:py-32" aria-labelledby="showcase-title">
      <div aria-hidden="true" className="landing-showcase-orbit" />
      <div className="mx-auto max-w-[90rem]">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 id="showcase-title" className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
            Your engineering activity, finally in focus.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#8B949E]">
            Move beyond raw contribution counts with views designed to reveal how you work and how far you have come.
          </p>
        </Reveal>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12 xl:gap-16">
          <Reveal className="order-2 lg:order-1">
            <div className="landing-showcase-copy" key={activeView.id}>
              <h3 className="mt-6 text-balance text-3xl font-semibold tracking-[-0.035em] text-[#F0F6FC] sm:text-4xl">{activeView.title}</h3>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#8B949E] sm:text-lg sm:leading-8">{activeView.description}</p>

              <div className="mt-9 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" role="tablist" aria-label="Dashboard preview">
                {views.map((view, index) => {
                  const Icon = view.icon
                  const selected = activeIndex === index
                  return (
                    <button
                      key={view.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls="dashboard-showcase-panel"
                      onClick={() => setActiveIndex(index)}
                      className="landing-showcase-tab group flex min-h-16 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
                      data-active={selected}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.035] text-[#8B949E] transition-all group-hover:text-white"><Icon aria-hidden="true" className="h-4 w-4" /></span>
                      <span className="min-w-0"><span className="block text-sm font-semibold text-[#E6EDF3]">{view.label}</span><span className="mt-0.5 block text-xs text-[#7D8590]">Explore view 0{index + 1}</span></span>
                      <ArrowUpRight aria-hidden="true" className="ml-auto h-4 w-4 text-[#3FB950] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </button>
                  )
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="order-1 lg:order-2">
            <div
              id="dashboard-showcase-panel"
              role="tabpanel"
              onPointerMove={updatePerspective}
              onPointerLeave={resetPerspective}
              className="landing-showcase-stage relative"
            >
              <div aria-hidden="true" className="landing-showcase-glow" />
              <div className="landing-showcase-window relative overflow-hidden rounded-2xl border border-white/12 bg-[#090D12] shadow-[0_35px_100px_rgba(0,0,0,.55)] sm:rounded-[1.4rem]">
                <div className="flex h-9 items-center gap-1.5 border-b border-white/8 bg-[#151A21] px-4 sm:h-11">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                  <div className="mx-auto hidden rounded-md border border-white/6 bg-black/20 px-12 py-1 text-[0.65rem] text-[#7D8590] sm:block">gitarc.app / dashboard</div>
                </div>
                <img key={activeView.image} src={activeView.image} alt={activeView.alt} className="landing-showcase-image block h-auto w-full" loading="lazy" decoding="async" />
                <div aria-hidden="true" className="absolute left-0 top-9 z-10 flex h-[9.7%] w-[15%] items-center gap-[3%] border-b border-r border-white/10 bg-[#161B22] px-[1.2%] sm:top-11">
                  <img src="/images/logo.svg" alt="" className="h-[58%] w-auto" />
                  <span className="whitespace-nowrap text-[clamp(.34rem,1vw,.82rem)] font-semibold tracking-[-0.04em] text-white">Git<span className="text-[#3FB950]">Arc</span></span>
                </div>
                <div aria-hidden="true" className="landing-showcase-sheen absolute inset-0" />
              </div>

              <div className="landing-showcase-badge absolute -bottom-5 right-2 rounded-2xl border border-[#3FB950]/25 bg-[#0D1513]/90 px-4 py-3 shadow-[0_18px_45px_rgba(0,0,0,.4)] backdrop-blur-xl sm:-bottom-7 sm:right-6 sm:px-5 sm:py-4">
                <p className="numbersFont text-base font-semibold text-[#3FB950] sm:text-xl">{activeView.accent}</p>
                <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.12em] text-[#8B949E] sm:text-xs">{activeView.accentLabel}</p>
              </div>
              <div aria-hidden="true" className="landing-showcase-status absolute -left-2 top-14 hidden items-center gap-2 rounded-full border border-white/10 bg-[#0B1016]/85 px-3 py-2 text-xs text-[#C9D1D9] shadow-xl backdrop-blur-xl sm:flex">
                <span className="h-2 w-2 rounded-full bg-[#3FB950] shadow-[0_0_12px_rgba(63,185,80,.8)]" /> Live insight
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
