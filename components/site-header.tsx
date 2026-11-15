"use client"

import { Search, UserRound, X } from "lucide-react"
import { SiteBrandLogo } from "@/components/site-brand-logo"
import { SiteDisclaimer } from "@/components/site-disclaimer"
import { SITE_HEADER_SUBLINE, SITE_NAME, SITE_NAME_JA, SITE_TAGLINE } from "@/lib/site-config"
import { cn } from "@/lib/utils"

type SiteHeaderProps = {
  query: string
  onQueryChange: (value: string) => void
  className?: string
}

export function SiteHeader({ query, onQueryChange, className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "relative bg-background text-foreground",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <SiteBrandLogo className="size-12" markClassName="size-7" />
            <div className="min-w-0">
              <h1 className="min-w-0">
                <span className="cursor-default select-none font-serif-jp text-[1.65rem] font-extrabold leading-none tracking-wide text-primary sm:text-[1.85rem]">
                  {SITE_NAME}
                  <span className="font-extrabold">（{SITE_NAME_JA}）</span>
                </span>
                <span className="mt-1 block text-xs font-semibold leading-snug text-zinc-700 sm:text-sm">
                  {SITE_TAGLINE}
                </span>
              </h1>
              <p className="mt-1 text-[11px] leading-snug text-zinc-600 sm:text-xs">{SITE_HEADER_SUBLINE}</p>
            </div>
          </div>

          <nav
            className="flex shrink-0 items-center gap-1 sm:gap-2"
            aria-label="サイトメニュー"
          >
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
