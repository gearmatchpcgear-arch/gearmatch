"use client"

import { Search, UserRound, X } from "lucide-react"
import { SiteDisclaimer } from "@/components/site-disclaimer"
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site-config"
import { cn } from "@/lib/utils"

type SiteHeaderProps = {
  query: string
  onQueryChange: (value: string) => void
  className?: string
}

function GearMatchEmblem({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" className="size-7 text-white" fill="none">
        <rect x="5" y="9" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.35" />
        <rect x="16" y="12" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.35" />
        <path
          d="M11.5 14.5h4M16 19.5h4"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
        />
        <circle cx="24" cy="8" r="1.5" fill="currentColor" opacity="0.85" />
      </svg>
    </div>
  )
}

export function SiteHeader({ query, onQueryChange, className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden border-b border-zinc-300/80 bg-zinc-200/90 text-zinc-900 shadow-sm backdrop-blur-md",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#a1a1aa_1px,transparent_1px)] opacity-25 [background-size:16px_16px]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:py-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <GearMatchEmblem />
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span className="cursor-default select-none font-serif-jp text-[1.65rem] font-extrabold leading-none tracking-wide text-primary sm:text-[1.85rem]">
                  {SITE_NAME}
                </span>
                <span className="hidden border-l border-zinc-400/60 pl-3 text-xs font-semibold text-zinc-600 sm:inline sm:text-sm">
                  {SITE_TAGLINE}
                </span>
              </h1>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-zinc-600 sm:hidden">
                {SITE_TAGLINE}
              </p>
            </div>
          </div>

          <nav
            className="flex shrink-0 items-center gap-1 sm:gap-2"
            aria-label="サイトメニュー"
          >
            <a
              href="https://v0.app"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-zinc-400/50 bg-zinc-300/80 px-2.5 py-1 font-mono text-xs font-bold text-zinc-800 shadow-inner transition-colors hover:bg-zinc-300"
            >
              v0.app
            </a>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-300/80 hover:text-zinc-900"
              aria-label="マイアカウント（準備中）"
            >
              <UserRound className="size-4 opacity-90" />
              <span className="hidden sm:inline">マイアカウント</span>
            </button>
          </nav>
        </div>

        <div className="relative mt-5 sm:mt-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="メーカー名・特徴等の調べたい情報で検索"
            aria-label="ガジェットを検索"
            className="w-full rounded-xl border border-zinc-400/60 bg-white/70 py-3.5 pl-11 pr-11 text-sm text-zinc-900 shadow-inner placeholder:text-zinc-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="検索をクリア"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-300/80 hover:text-zinc-900"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <SiteDisclaimer className="mt-4 border-zinc-300/80 bg-white/55 text-zinc-700" />
      </div>
    </header>
  )
}
