const AskBob = () => {
    return (
        <main
            aria-labelledby="ask-bob-title"
            className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-[#0D1117] px-4 py-10 text-white sm:px-6 lg:px-8"
        >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#238636]/15 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#1F6FEB]/10 blur-3xl" />
            </div>

            <h1 id="ask-bob-title" className="text-3xl">Coming Soon</h1>
        </main>
    )
}

export default AskBob
