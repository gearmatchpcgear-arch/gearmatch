"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { type ReactNode } from "react"
import { buildGuideRecommendationTabHref } from "@/lib/guide-recommendation-tab-url"
import {
  guideRecommendationsCardItemClassName,
  guideRecommendationsContentShellClassName,
  guideRecommendationsEmptyStateClassName,
  guideRecommendationsImageAreaClassName,
  guideRecommendationsInnerInsetClassName,
  guideRecommendationsHeroImageClassName,
  guideRecommendationsCardImageClassName,
  guideRecommendationsMidGridInnerClassName,
  guideRecommendationsProductColumnClassName,
  guideRecommendationsProductSummaryClassName,
  guideRecommendationsReasonColumnClassName,
  guideRecommendationsSectionClassName,
} from "@/lib/guide-recommendation-shell"
import { cn } from "@/lib/utils"

export {
  guideRecommendationsCardItemClassName,
  guideRecommendationsContentShellClassName,
  guideRecommendationsEmptyStateClassName,
  guideRecommendationsImageAreaClassName,
  guideRecommendationsInnerInsetClassName,
  guideRecommendationsHeroImageClassName,
  guideRecommendationsCardImageClassName,
  guideRecommendationsMidGridInnerClassName,
  guideRecommendationsProductColumnClassName,
  guideRecommendationsProductSummaryClassName,
  guideRecommendationsReasonColumnClassName,
  guideRecommendationsSectionClassName,
}

/** @deprecated {@link guideRecommendationsContentShellClassName} を使用 */
export const guideRecommendationsMidPanelClassName = guideRecommendationsContentShellClassName

/** @deprecated 白中枠内で {@link guideRecommendationsMidGridInnerClassName} を使用 */
export const guideRecommendationsMidGridClassName = cn(
  guideRecommendationsContentShellClassName,
  guideRecommendationsMidGridInnerClassName,
)

/** @deprecated {@link guideRecommendationsImageAreaClassName} を使用 */
export const guideRecommendationsInnerPanelClassName = guideRecommendationsImageAreaClassName

export const guideRecommendationsDefaultSubtitle =
  "用途ボタンを選択すると、最適なおすすめモデルと選定理由が表示されます。"

/** タイプ切替なし（おすすめ一覧のみ）のカテゴリ向け */
export const guideRecommendationsListOnlySubtitle =
  "用途や予算に合わせたおすすめモデルと選定理由を紹介します。"

export function guideRecommendationsHeading(categoryLabel: string): string {
  return `あなたに合うおすすめの${categoryLabel}を選ぶ`
}

export function guideRecommendationsTabButtonClass(active: boolean): string {
  return cn(
    "rounded-lg border px-3 py-2 text-center text-xs font-semibold transition-all sm:px-4 sm:py-2.5 sm:text-sm",
    active
      ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
      : "border-slate-200 bg-white text-foreground hover:border-slate-400 hover:bg-slate-50",
  )
}

type GuideRecommendationsSectionProps = {
  children: React.ReactNode
  className?: string
}

export function GuideRecommendationsSection({ children, className }: GuideRecommendationsSectionProps) {
  return <section className={cn(guideRecommendationsSectionClassName, className)}>{children}</section>
}

export function GuideRecommendationsContentShell({ children }: { children: React.ReactNode }) {
  return <div className={guideRecommendationsContentShellClassName}>{children}</div>
}

type GuideRecommendationsHeaderProps = {
  categoryLabel: string
  compareHref?: string
  subtitle?: string
}

export function GuideRecommendationsHeader({
  categoryLabel,
  compareHref = "/",
  subtitle = guideRecommendationsDefaultSubtitle,
}: GuideRecommendationsHeaderProps) {
  return (
    <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-3">
      <div className="min-w-0 max-w-full">
        <h2 className="flex min-w-0 items-start gap-1.5 text-base font-bold leading-snug text-foreground sm:items-center sm:gap-2 sm:text-lg md:text-xl">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary sm:mt-0 sm:size-5" aria-hidden />
          <span className="min-w-0 break-words">{guideRecommendationsHeading(categoryLabel)}</span>
        </h2>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">{subtitle}</p>
      </div>
      <Link
        href={compareHref}
        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
      >
        トップの一覧で比較する →
      </Link>
    </div>
  )
}

type GuideRecommendationsTab = {
  id: string
  label: string
}

export const GUIDE_RECOMMENDATIONS_PANEL_ID = "guide-recommendations-panel"

type GuideRecommendationsPanelProps = {
  children: ReactNode
  className?: string
  /** 現在選択中のタブ ID（スクリーンリーダー向け） */
  tabId?: string
}

export function GuideRecommendationsPanel({
  children,
  className,
  tabId,
}: GuideRecommendationsPanelProps) {
  return (
    <div
      id={GUIDE_RECOMMENDATIONS_PANEL_ID}
      role="tabpanel"
      tabIndex={-1}
      aria-live="polite"
      aria-labelledby={tabId ? `guide-tab-${tabId}` : undefined}
      className={cn("scroll-mt-20 outline-none sm:scroll-mt-24", className)}
    >
      {children}
    </div>
  )
}

type GuideRecommendationsTabsProps = {
  tabs: readonly GuideRecommendationsTab[]
  selectedId: string
  /** 例: `/guide/mouse` — 各タブは `?tab=` 付き URL へ遷移 */
  tabHrefBase: string
}

export function GuideRecommendationsTabs({
  tabs,
  selectedId,
  tabHrefBase,
}: GuideRecommendationsTabsProps) {
  return (
    <div
      className="mb-6 flex w-full min-w-0 max-w-full flex-col gap-2 sm:mb-8 sm:flex-row sm:flex-wrap sm:gap-2"
      role="tablist"
      aria-label="おすすめの用途"
    >
      {tabs.map((tab) => {
        const active = selectedId === tab.id
        return (
          <Link
            key={tab.id}
            id={`guide-tab-${tab.id}`}
            href={buildGuideRecommendationTabHref(tabHrefBase, tab.id)}
            scroll
            role="tab"
            aria-selected={active}
            aria-controls={GUIDE_RECOMMENDATIONS_PANEL_ID}
            aria-current={active ? "page" : undefined}
            className={cn(
              guideRecommendationsTabButtonClass(active),
              "w-full min-w-0 sm:w-auto sm:min-w-[8.5rem] md:min-w-[10rem]",
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}

export function GuideRecommendationsListTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-4 text-sm font-bold text-foreground sm:mb-6 sm:text-base">{children}</h3>
}

export function GuideRecommendationsCardStack({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6 sm:space-y-8">{children}</div>
}
