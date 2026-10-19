import { cn } from "@/lib/utils"

export const guideCardBadgeClassName =
  "absolute top-2 left-2 z-10 max-w-[calc(100%-1rem)] truncate rounded-md border border-white/20 bg-black/75 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-md sm:top-3 sm:left-3 sm:max-w-none sm:px-3 sm:py-1 sm:text-xs"

type GuideCardBadgeProps = {
  children: React.ReactNode
  className?: string
}

export function GuideCardBadge({ children, className }: GuideCardBadgeProps) {
  return <span className={cn(guideCardBadgeClassName, className)}>{children}</span>
}
