"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import {
  guideRecommendationsCardItemClassName,
  guideRecommendationsContentShellClassName,
  guideRecommendationsEmptyStateClassName,
  guideRecommendationsImageAreaClassName,
  guideRecommendationsInnerInsetClassName,
  guideRecommendationsMidGridInnerClassName,
  guideRecommendationsProductSummaryClassName,
  guideRecommendationsSectionClassName,
} from "@/lib/guide-recommendation-shell"
import { cn } from "@/lib/utils"

export {
  guideRecommendationsCardItemClassName,
  guideRecommendationsContentShellClassName,
  guideRecommendationsEmptyStateClassName,
  guideRecommendationsImageAreaClassName,
  guideRecommendationsInnerInsetClassName,
  guideRecommendationsMidGridInnerClassName,
  guideRecommendationsProductSummaryClassName,
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
    "rounded-lg border px-4 py-3 text-center text-sm font-semibold transition-all",
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
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Sparkles className="size-5 shrink-0 text-primary" aria-hidden />
          {guideRecommendationsHeading(categoryLabel)}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
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

type GuideRecommendationsTabsProps = {
  tabs: readonly GuideRecommendationsTab[]
  selectedId: string
  onSelect: (id: string) => void
}

export function GuideRecommendationsTabs({ tabs, selectedId, onSelect }: GuideRecommendationsTabsProps) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          aria-pressed={selectedId === tab.id}
          className={cn(
            guideRecommendationsTabButtonClass(selectedId === tab.id),
            "min-w-[8.5rem] flex-1 sm:flex-none sm:min-w-[10rem]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function GuideRecommendationsListTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-6 text-base font-bold text-foreground">{children}</h3>
}

export function GuideRecommendationsCardStack({ children }: { children: React.ReactNode }) {
  return <div className="space-y-8">{children}</div>
}
