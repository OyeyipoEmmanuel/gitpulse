import { AlertCircle } from "lucide-react"
import { Button } from "./button"

interface ErrorToastProps {
  message?: string
  onRetry?: () => void
}

const ErrorToast = ({ message = "Something went wrong. Please try again.", onRetry }: ErrorToastProps) => {
  return (
    <div role="alert" aria-live="assertive" className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#1A0E0E] border border-red-900/60 text-red-400 px-5 py-3.5 rounded-lg shadow-xl z-50 max-w-sm w-[calc(100%-2rem)]">
      <AlertCircle size={18} className="shrink-0" />
      <p className="text-sm">{message}</p>
      {onRetry && <Button type="button" size="sm" variant="destructive" className="ml-auto" onClick={onRetry}>Retry</Button>}
    </div>
  )
}

export default ErrorToast
