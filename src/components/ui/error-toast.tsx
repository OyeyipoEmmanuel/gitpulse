import { AlertCircle } from "lucide-react"

interface ErrorToastProps {
  message?: string
}

const ErrorToast = ({ message = "Something went wrong. Please try again." }: ErrorToastProps) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#1A0E0E] border border-red-900/60 text-red-400 px-5 py-3.5 rounded-lg shadow-xl z-50 max-w-sm w-full">
      <AlertCircle size={18} className="shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

export default ErrorToast
