import { AlertTriangle, RotateCcw } from "lucide-react"
import { isRouteErrorResponse, useRouteError } from "react-router-dom"
import { Button } from "@/components/ui/button"

const RouteErrorPage = () => {
    const error = useRouteError()
    const title = isRouteErrorResponse(error) && error.status === 404 ? "Page not found" : "Something went wrong"
    const message = isRouteErrorResponse(error) && error.status === 404
        ? "The requested page could not be found."
        : "GitArc could not display this page. Reload it to try again."

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#0D1117] px-4 py-12 text-white">
            <section role="alert" aria-labelledby="route-error-title" className="w-full max-w-xl rounded-xl border border-[#30363D] bg-[#161B22] p-8 text-center shadow-2xl shadow-black/30 sm:p-12">
                <AlertTriangle aria-hidden="true" className="mx-auto h-12 w-12 text-[#F85149]" />
                <h1 id="route-error-title" className="mt-5 text-3xl font-bold">{title}</h1>
                <p className="mt-4 leading-7 text-[#8B949E]">{message}</p>
                <Button type="button" size="lg" onClick={() => window.location.reload()} className="mt-8">
                    <RotateCcw aria-hidden="true" className="h-4 w-4" />
                    Reload page
                </Button>
            </section>
        </main>
    )
}

export default RouteErrorPage
