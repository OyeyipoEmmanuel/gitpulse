import { ArrowLeft, SearchX } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

const NotFoundPage = () => (
    <main className="flex min-h-screen items-center justify-center bg-[#0D1117] px-4 py-12 text-white">
        <section aria-labelledby="not-found-title" className="w-full max-w-xl rounded-xl border border-[#30363D] bg-[#161B22] p-8 text-center shadow-2xl shadow-black/30 sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#21262D] text-[#8B949E]">
                <SearchX aria-hidden="true" className="h-8 w-8" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3FB950]">404</p>
            <h1 id="not-found-title" className="mt-3 text-3xl font-bold sm:text-4xl">Page not found</h1>
            <p className="mt-4 leading-7 text-[#8B949E]">The page may have moved, or the address may be incorrect.</p>
            <Button asChild size="lg" className="mt-8"><Link to="/"><ArrowLeft aria-hidden="true" />Return home</Link></Button>
        </section>
    </main>
)

export default NotFoundPage
