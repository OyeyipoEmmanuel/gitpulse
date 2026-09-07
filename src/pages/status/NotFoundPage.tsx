import { ArrowLeft, SearchX } from "lucide-react"
import { Link } from "react-router-dom"

const NotFoundPage = () => (
    <main className="flex min-h-screen items-center justify-center bg-[#0D1117] px-4 py-12 text-white">
        <section aria-labelledby="not-found-title" className="w-full max-w-xl rounded-xl border border-[#30363D] bg-[#161B22] p-8 text-center shadow-2xl shadow-black/30 sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#21262D] text-[#8B949E]">
                <SearchX aria-hidden="true" className="h-8 w-8" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3FB950]">404</p>
            <h1 id="not-found-title" className="mt-3 text-3xl font-bold sm:text-4xl">Page not found</h1>
            <p className="mt-4 leading-7 text-[#8B949E]">The page may have moved, or the address may be incorrect.</p>
            <Link to="/" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#238636] px-5 py-2.5 font-semibold hover:bg-[#2EA043] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FB950] focus-visible:ring-offset-2 focus-visible:ring-offset-[#161B22]">
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                Return home
            </Link>
        </section>
    </main>
)

export default NotFoundPage
