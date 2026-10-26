import { CircleHelp } from "lucide-react"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type MetricTooltipProps = {
  label: string
  children: string
}

export default function MetricTooltip({ label, children }: MetricTooltipProps) {
  const [open, setOpen] = useState(false)

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`About ${label}`}
          data-export-exclude="true"
          onClick={() => setOpen(current => !current)}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CircleHelp aria-hidden="true" className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent sideOffset={7} className="max-w-72 text-pretty leading-5">
        {children}
      </TooltipContent>
    </Tooltip>
  )
}
