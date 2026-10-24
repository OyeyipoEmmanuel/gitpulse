import { Check } from "lucide-react"
import GitHubSignInButton from "@/components/auth/GitHubSignInButton"
import InteractiveCard from "./InteractiveCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const plans = [
  { name: "Individual", description: "For developers who want a sharper view of their work.", price: "Free", suffix: "forever", available: true, featured: true, features: ["Personal dashboard and insights", "Unlimited public repository analysis", "Contribution and commit trends", "Pull request performance", "Shareable career snapshot"] },
  { name: "Organization", description: "For teams that want a shared view of engineering momentum.", price: "$6.50", suffix: "per member / month", available: false, featured: false, features: ["Team-wide productivity signals", "Private repository deep-dives", "Contributor insights", "Team health reporting", "Priority support"] },
]

export default function PriceCard() {
  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-2">
      {plans.map(plan => (
        <InteractiveCard key={plan.name} intensity={3} glow="35, 134, 54" className={`landing-price-card relative flex flex-col overflow-hidden rounded-[1.75rem] border p-5 ${plan.featured ? "border-[#238636]/60 bg-gradient-to-b from-[#238636]/15 to-white/[0.025]" : "border-white/8 bg-white/[0.025]"}`}>
          {/* {!plan.available && <span className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#929ba7]">Coming soon</span>} */}
          <Badge variant={plan.featured ? "default" : "outline"}>{plan.name}</Badge>
          <h3 className="mt-4 max-w-sm text-2xl font-semibold tracking-tight">{plan.description}</h3>
          <div className="mt-8 flex items-end gap-3"><span className="numbersFont text-5xl font-semibold tracking-tight">{plan.price}</span><span className="mb-1 text-sm text-[#77818f]">{plan.suffix}</span></div>
          <ul className="my-9 flex flex-1 flex-col gap-4">
            {plan.features.map(feature => <li key={feature} className="flex items-start gap-3 text-[#8B949E]"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#238636]/20 text-[#3FB950]"><Check aria-hidden="true" className="h-3 w-3" /></span><span>{feature}</span></li>)}
          </ul>
          {plan.available ? <GitHubSignInButton label="Start with GitHub" /> : <Button type="button" variant="outline" size="lg" disabled className="w-full">Organization access coming soon</Button>}
        </InteractiveCard>
      ))}
    </div>
  )
}
