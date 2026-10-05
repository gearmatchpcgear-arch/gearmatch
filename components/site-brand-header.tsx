import Link from "next/link"
import { Boxes } from "lucide-react"
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site-config"
import { cn } from "@/lib/utils"

const headerShellClassName =
  "relative w-full overflow-hidden bg-zinc-200/90 text-zinc-900 shadow-sm backdrop-blur-md"

type SiteBrandHeaderProps = {
  children?: React.ReactNode
  className?: string
  /** サブページ用：ロゴ行の上に表示 */
  topSlot?: React.ReactNode
}

export function SiteBrandHeader({ children, className, topSlot }: SiteBrandHeaderProps) {
  return (
    <header className={cn(headerShellClassName, className)}>
      <div className={headerDotOverlayClassName} aria-hidden />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-4 sm:py-5">
        {topSlot}
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 p-1.5 text-white shadow-sm sm:size-11"
              aria-hidden
            >
              <Boxes className="size-5" />
            </div>
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <Link
                  href="/"
                  className="text-lg font-extrabold tracking-tight text-zinc-900 sm:text-xl"
                >
                  {SITE_NAME}
                </Link>
                <span className="hidden border-l border-zinc-400/60 pl-3 text-xs font-semibold text-zinc-600 sm:inline">
                  {SITE_TAGLINE}
                </span>
              </h1>
              <p className="mt-0.5 text-xs font-semibold text-zinc-600 sm:hidden">{SITE_TAGLINE}</p>
            </div>
          </div>
          <a
            href="https://v0.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden shrink-0 rounded-md border border-zinc-400/50 bg-zinc-300/80 px-2.5 py-1 font-mono text-xs font-bold text-zinc-800 shadow-inner transition-colors hover:bg-zinc-300 sm:inline"
          >
            v0.app
          </a>
        </div>
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </header>
  )
}

const headerDotOverlayClassName =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(#a1a1aa_1px,transparent_1px)] opacity-25 [background-size:16px_16px]"

export { headerDotOverlayClassName, headerShellClassName }
