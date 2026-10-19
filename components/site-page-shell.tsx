import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { SiteBrandHeader } from "@/components/site-brand-header"

type SitePageShellProps = {
  title: string
  description?: string
  children: React.ReactNode
  compact?: boolean
}

export function SitePageShell({ title, description, children, compact = false }: SitePageShellProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-100/70">
      <SiteBrandHeader
        className={compact ? "[&>div]:max-w-3xl [&>div]:py-2.5" : undefined}
        topSlot={
          <Link
            href="/"
            className={
              compact
                ? "mb-2 inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 transition-colors hover:text-zinc-900"
                : "mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-600 transition-colors hover:text-zinc-900"
            }
          >
            <ChevronLeft className={compact ? "size-3.5" : "size-4"} aria-hidden />
            トップへ戻る
          </Link>
        }
      />

      <main
        className={
          compact
              ? "mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-4 py-3 md:py-4"
              : "mx-auto min-w-0 max-w-4xl px-3 py-6 sm:px-4 sm:py-8 md:py-10"
        }
      >
        {!compact ? (
          <>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:mt-2 sm:text-sm">
                {description}
              </p>
            ) : null}
            <div className="mt-6 min-w-0 max-w-full sm:mt-8">{children}</div>
          </>
        ) : (
          children
        )}
      </main>
    </div>
  )
}
