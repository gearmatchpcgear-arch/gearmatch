import { cn } from "@/lib/utils"

export const guideCardBadgeClassName =
  "absolute top-3 left-3 z-10 rounded-md border border-white/20 bg-black/75 px-3 py-1 text-xs font-bold tracking-wide text-white shadow-md"

type GuideCardBadgeProps = {
  children: React.ReactNode
  className?: string
}

export function GuideCardBadge({ children, className }: GuideCardBadgeProps) {
  return <span className={cn(guideCardBadgeClassName, className)}>{children}</span>
}
