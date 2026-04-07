
import PriceCard from "./components/PriceCard";

export default function LandingPage() {
  console.log(import.meta.env.VITE_APP_URL)
  return (
    <main className="max-w-sm md:max-w-7xl mx-auto text-white"> 
      <section className="pt-32">
        <h1 className="font-extrabold text-4xl md:text-7xl text-center tracking-wide leading-tight">Understand GitHub Productivity with <span className='text-secondaryTextColor'>Real Data</span></h1>
        <p className="text-[rgb(139,148,158)] pt-5 text-xl md:text-2xl text-center md:w-3xl md:mx-auto">Unlock actionable insights from your repositories with our advanced analytics platform built for modern engineering teams.</p>
      </section>

      <section className="flex items-center justify-center w-full pt-6">
        <img src="/images/heroImg2.svg" alt="GitPulse hero" width={700} height={500} />
      </section>

      {/* Pricing Section */}
      <section className="py-24 ">
        <PriceCard/>
      </section>
    </main>
  )
}