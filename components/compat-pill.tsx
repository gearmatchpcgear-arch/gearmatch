import { Check, Minus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CompatTag } from "@/lib/gadgets"

const styles = {
  ok: {
    wrap: "bg-primary/10 text-primary ring-1 ring-primary/15",
    Icon: Check,
  },
  warn: {
    wrap: "bg-chart-3/10 text-chart-3 ring-1 ring-chart-3/20",
    Icon: Minus,
  },
  none: {
    wrap: "bg-muted text-muted-foreground/70 line-through decoration-muted-foreground/40 ring-1 ring-border/50",
    Icon: X,
  },
} as const

export function CompatPill({ tag, className }: { tag: CompatTag; className?: string }) {
  const { wrap, Icon } = styles[tag.status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        wrap,
        tag.filterLinked &&
          tag.status === "ok" &&
          "bg-primary/12 font-semibold text-primary shadow-sm ring-primary/25",
        tag.filterLinked && tag.status === "none" && "opacity-80",
        className,
      )}
    >
      <Icon className="size-3 shrink-0" aria-hidden="true" />
      {tag.label}
    </span>
  )
}
