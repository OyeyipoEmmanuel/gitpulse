import GitHubSignInButton from "@/components/auth/GitHubSignInButton"
import type { CSSProperties } from "react"
import { ArrowRight, ArrowUpRight, BarChart3, BrainCircuit, ChartNoAxesCombined, Check, Code2, GitBranch, Radar, ShieldCheck, Zap } from "lucide-react"
import HeroDashboard from "./components/HeroDashboard"
import InteractiveCard from "./components/InteractiveCard"
import Reveal from "./components/Reveal"
import DashboardShowcase from "./components/DashboardShowcase"

const features = [
  { icon: ChartNoAxesCombined, eyebrow: "Productivity", title: "See the rhythm behind the commits.", description: "Turn contribution history into clear patterns across active days, streaks, pull requests and reviews.", className: "md:col-span-2" },
  { icon: Radar, eyebrow: "Repository health", title: "Know what needs attention.", description: "Spot active repositories, stale projects, stars, forks and maintenance signals without digging through tabs.", className: "" },
  { icon: BrainCircuit, eyebrow: "Developer story", title: "Make your work easier to explain.", description: "Translate raw GitHub activity into a report card and career snapshot you can understand at a glance.", className: "" },
  { icon: GitBranch, eyebrow: "Open source", title: "Measure impact beyond your own repos.", description: "Surface merged pull requests, collaboration signals and the projects where your work is landing.", className: "md:col-span-2" },
]

const steps = [
  { number: "01", title: "Connect GitHub", description: "Sign in securely and choose the account you want to explore." },
  { number: "02", title: "GitArc maps the signal", description: "Your activity is organized into focused, useful analytics—not another data dump." },
  { number: "03", title: "Use the story", description: "Review your momentum, improve repository health and share a career-ready snapshot." },
]

export default function LandingPage() {
  return (
    <main className="landing-page overflow-hidden bg-[#0D1117] text-white">
      <section id="top" className="landing-hero relative isolate min-h-screen px-4 pb-20 pt-32 sm:px-6 lg:px-8 lg:pt-40">
        <div aria-hidden="true" className="landing-grid absolute inset-0 -z-20" />
        <div aria-hidden="true" className="landing-orb landing-orb-one -z-10" />
        <div aria-hidden="true" className="landing-orb landing-orb-two -z-10" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10">
          <div className="landing-hero-copy max-w-2xl">
            <h1 className="landing-hero-title max-w-4xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#f5f7fa] sm:text-6xl lg:text-7xl xl:text-[5.35rem]">
              Your GitHub activity finally tells a <span className="landing-gradient-text">story.</span>
            </h1>
            <p className="landing-hero-description mt-7 max-w-xl text-pretty text-lg leading-8 text-[#8B949E] sm:text-xl">
              GitArc turns repositories, contributions and collaboration into a clear view of how you build, grow and create impact.
            </p>
            <div className="landing-hero-actions mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <GitHubSignInButton label="Explore my GitHub" />
              <a href="#product" className="group inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-[#E6EDF3] transition-colors hover:text-white">
                See how it works <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
            <ul className="landing-trust-list mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[#8B949E]">
              {["Read-only GitHub scopes", "No manual data entry", "Built for public repositories"].map(point => (
                <li key={point} className="flex items-center gap-2"><Check aria-hidden="true" className="h-4 w-4 text-[#3FB950]" />{point}</li>
              ))}
            </ul>
          </div>
          <div className="landing-hero-panel relative">
            <div aria-hidden="true" className="landing-mobile-halo sm:hidden" />
            <HeroDashboard />
          </div>
        </div>

        <div className="landing-stat-strip mx-auto mt-20 grid max-w-7xl grid-cols-1 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025] sm:grid-cols-3">
          {[["06", "focused analytics views"], ["30D", "repository trend window"], ["01", "shareable career snapshot"]].map(([value, label], index) => (
            <div key={label} className={`landing-stat-item px-7 py-6 ${index > 0 ? "border-t border-white/8 sm:border-l sm:border-t-0" : ""}`}>
              <p className="numbersFont text-2xl font-semibold text-white">{value}</p><p className="mt-1 text-sm text-[#8B949E]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <DashboardShowcase />

      <section id="product" className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-3xl">
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">Less noise. More insight into the work you do.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#8B949E]">GitArc brings the important parts of your engineering activity together, then gives each signal the context it deserves.</p>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return <Reveal key={feature.title} delay={index * 80} className={feature.className}>
                <InteractiveCard className="landing-feature-card group h-full min-h-72 p-7 sm:p-8">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#238636]/40 bg-[#238636]/10 text-[#3FB950] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3"><Icon aria-hidden="true" className="h-5 w-5" /></div>
                  <p className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-[#3FB950]">{feature.eyebrow}</p>
                  <h3 className="mt-3 max-w-xl text-2xl font-semibold tracking-[-0.025em] text-[#f3f5f8]">{feature.title}</h3>
                  <p className="mt-4 max-w-xl leading-7 text-[#8B949E]">{feature.description}</p>
                  <div aria-hidden="true" className="landing-card-cue mt-7 flex items-center gap-2 text-sm font-semibold text-[#3FB950]">Live signal <ArrowUpRight className="h-4 w-4" /></div>
                </InteractiveCard>
              </Reveal>
            })}
          </div>
        </div>
      </section>

      <section id="insights" className="border-y border-white/6 bg-[#11151C] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Your progress deserves more than a contribution grid.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#8B949E]">Understand when you do your best work, which repositories are gaining traction and how consistently you are moving forward.</p>
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {[{ icon: Zap, title: "Momentum", copy: "See streaks and productive periods in context." }, { icon: ShieldCheck, title: "Repository health", copy: "Find maintenance gaps before they become clutter." }].map(({ icon: Icon, title, copy }) => (
                <InteractiveCard key={title} intensity={3} className="group rounded-2xl border border-white/8 bg-white/[0.025] p-5"><Icon aria-hidden="true" className="h-5 w-5 text-[#3FB950] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" /><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#8B949E]">{copy}</p></InteractiveCard>
              ))}
            </div>
          </Reveal>
          <Reveal delay={160} className="relative">
            <div className="landing-signal-card relative overflow-hidden rounded-[1.75rem] border border-white/10 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4"><div><p className="text-sm text-[#818b99]">Contribution momentum</p><p className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Strong upward signal</p></div><div className="rounded-full bg-[#238636]/20 px-3 py-1 text-sm font-semibold text-[#3FB950]">+18%</div></div>
              <div className="mt-10 flex h-48 items-end gap-2 sm:gap-3" aria-label="Illustrative contribution trend rising over twelve periods">
                {[28, 42, 35, 54, 46, 68, 58, 76, 70, 86, 80, 96].map((height, index) => <div key={index} className="flex h-full flex-1 items-end"><div className="landing-signal-bar w-full rounded-t-md bg-gradient-to-t from-[#1A4029] to-[#3FB950]" style={{ "--signal-height": `${height}%`, "--signal-delay": `${index * 55}ms` } as CSSProperties} /></div>)}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-5 text-xs uppercase tracking-[0.14em] text-[#7D8590]"><span>12 weeks ago</span><span>Today</span></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="workflow" className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal className="text-center"><h2 className="mx-auto mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Three steps. No spreadsheets. No setup maze.</h2></Reveal>
          <div className="landing-workflow-map mt-16">
            <svg aria-hidden="true" className="landing-connector landing-connector-desktop" viewBox="0 0 1000 430" preserveAspectRatio="none">
              <path className="landing-connector-base" d="M 145 140 C 265 25, 390 360, 500 285 S 700 35, 855 165" />
              <path className="landing-connector-flow" d="M 145 140 C 265 25, 390 360, 500 285 S 700 35, 855 165" />
            </svg>
            <svg aria-hidden="true" className="landing-connector landing-connector-mobile" viewBox="0 0 400 980" preserveAspectRatio="none">
              <path className="landing-connector-base" d="M 165 144 C 345 220, 45 340, 235 488 S 355 675, 170 832" />
              <path className="landing-connector-flow" d="M 165 144 C 345 220, 45 340, 235 488 S 355 675, 170 832" />
            </svg>
            {steps.map((step, index) => (
              <div key={step.number} className={`landing-workflow-position landing-workflow-position-${index + 1}`}>
                <Reveal delay={index * 100}>
                  <InteractiveCard className="landing-step-card group aspect-square rounded-full border border-white/10 bg-[#0c1118]/95 p-8">
                    <div className="landing-step-number numbersFont relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-[#111113] text-sm text-white">{step.number}</div>
                    <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                    <p className="mt-3 max-w-[14rem] text-sm leading-6 text-[#8B949E]">{step.description}</p>
                    <div aria-hidden="true" className="landing-step-progress mt-5 h-0.5 w-28 overflow-hidden rounded-full bg-white/5"><span className="block h-full bg-[#3FB950]" /></div>
                  </InteractiveCard>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}

      {/* <section id="pricing" className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal className="text-center"><p className="landing-kicker">Start with your own story</p><h2 className="mx-auto mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Powerful developer insight, free to explore.</h2><p className="mx-auto mt-5 max-w-2xl text-lg text-[#8B949E]">Connect your GitHub account and see what your activity has been saying all along.</p></Reveal>
          <Reveal delay={120} className="mt-14"><PriceCard /></Reveal>
        </div>
      </section> */}

      <section className="px-4 pb-10 pt-12 sm:px-6 lg:px-8">
        <Reveal><div className="landing-cta mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#238636]/40 px-6 py-14 text-center sm:px-12 sm:py-20"><Code2 aria-hidden="true" className="mx-auto h-9 w-9 text-[#3FB950]" /><h2 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">There is more in your GitHub history than green squares.</h2><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#8B949E]">Connect your account and turn the work you have already done into insight you can use.</p><div className="mt-8 flex justify-center"><GitHubSignInButton label="Build my GitArc" /></div></div></Reveal>
      </section>

      <footer className="px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-white/8 pt-8 text-sm text-[#7D8590] sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} GitArc. Developer insight, made useful.</p><div className="flex items-center gap-5"><BarChart3 aria-hidden="true" className="h-4 w-4 text-white" /><span>Built around real GitHub data</span></div></div></footer>
      <div aria-hidden="true" className="pb-12 landing-footer-wordmark numbersFont select-none overflow-hidden text-center font-black leading-[0.56] tracking-[0.06em]">GITARC</div>
    </main>
  )
}
