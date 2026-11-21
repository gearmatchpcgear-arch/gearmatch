"use client"

import Script from "next/script"
import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import type { CategoryId } from "@/lib/gadgets"
import {
  getGuideCategoryDefaultTab,
  getGuideCategoryTabSeo,
  isGuideTabSeoCategory,
  resolveGuideCategoryActiveTab,
  type GuideTabSeoCategory,
} from "@/lib/guide-tab-seo"
import { cn } from "@/lib/utils"

const guideJapaneseBodyClassName =
  "w-full min-w-0 whitespace-normal break-normal leading-relaxed text-muted-foreground [line-break:strict] [overflow-wrap:break-word] [word-break:auto-phrase] [text-wrap:wrap]"

const guidePointProseClassName = cn(guideJapaneseBodyClassName, "text-sm")
const guidePointBulletProseClassName = cn(guideJapaneseBodyClassName, "text-xs sm:text-sm")

type GuideCategoryTabSeoArticlesProps = {
  category: CategoryId
  initialTab?: string
}

function buildFaqJsonLd(category: GuideTabSeoCategory, tabId: string): string {
  const seo = getGuideCategoryTabSeo(category, tabId)
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seo.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  })
}

export function GuideCategoryTabSeoArticles({ category, initialTab }: GuideCategoryTabSeoArticlesProps) {
  if (!isGuideTabSeoCategory(category)) return null

  const defaultTab = initialTab ?? getGuideCategoryDefaultTab(category)
  const searchParams = useSearchParams()
  const tabId = useMemo(() => {
    const fromQuery = searchParams.get("tab")
    if (fromQuery != null && fromQuery.trim() !== "") {
      return resolveGuideCategoryActiveTab(category, fromQuery)
    }
    return defaultTab
  }, [searchParams, defaultTab, category])

  const seo = getGuideCategoryTabSeo(category, tabId)

  return (
    <div className="mb-4 w-full min-w-0 max-w-full sm:mb-5" id={`guide-${category}-seo-root`}>
      <article
        id={`guide-${category}-seo-${tabId}`}
        lang="ja"
        data-guide-mouse-seo-tab={tabId}
        className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3.5 sm:px-6 sm:py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/80">用途別の選び方</p>
          <h2 className="mt-0.5 text-base font-bold leading-snug text-foreground sm:text-lg md:text-xl">
            {seo.h2}
          </h2>
          <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-800 sm:text-base">{seo.h3}</p>
        </div>

        <div className="min-w-0 space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-5">
          <p className={guidePointProseClassName}>{seo.intro}</p>

          <section aria-labelledby={`guide-${category}-faq-heading-${tabId}`}>
            <h3
              id={`guide-${category}-faq-heading-${tabId}`}
              className="text-sm font-bold text-foreground sm:text-base"
            >
              よくある質問
            </h3>
            <ul className="mt-2.5 space-y-2 sm:mt-3 sm:space-y-2.5">
              {seo.faq.map((item) => (
                <li
                  key={item.question}
                  className="flex flex-col gap-1 border-l-2 border-primary/25 pl-3 sm:pl-3.5"
                >
                  <strong className="text-xs font-bold leading-snug text-foreground sm:text-sm">
                    {item.question}
                  </strong>
                  <span className={guidePointBulletProseClassName}>{item.answer}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>

      <Script
        key={`${category}-${tabId}`}
        id={`guide-${category}-faq-jsonld`}
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {buildFaqJsonLd(category, tabId)}
      </Script>
    </div>
  )
}