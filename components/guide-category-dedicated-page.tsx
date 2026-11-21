import { Suspense } from "react"
import { GuideCategoryMetadataSync } from "@/components/guide-category-metadata-sync"
import { GuideCategoryPageContent } from "@/components/guide-category-page-content"
import { SitePageShell } from "@/components/site-page-shell"
import type { CategoryId } from "@/lib/gadgets"
import { isGuideTabbedCategory } from "@/lib/guide-tab-config"
import { getGuideCategoryLabel } from "@/lib/guide-routes"
import { getGuideCategoryDefaultTab, isGuideTabSeoCategory } from "@/lib/guide-tab-seo"

type GuideCategoryDedicatedPageProps = {
  category: CategoryId
  guideActiveTab?: string
}

export function GuideCategoryDedicatedPage({
  category,
  guideActiveTab,
}: GuideCategoryDedicatedPageProps) {
  const label = getGuideCategoryLabel(category)
  const activeTab =
    guideActiveTab ??
    (isGuideTabSeoCategory(category) && isGuideTabbedCategory(category)
      ? getGuideCategoryDefaultTab(category)
      : undefined)

  return (
    <SitePageShell
      wide
      title={`${label}の選び方`}
      description={`${label}を選ぶときのポイントと、用途別のおすすめモデルを紹介します。`}
    >
      {isGuideTabSeoCategory(category) ? (
        <Suspense fallback={null}>
          <GuideCategoryMetadataSync category={category} />
        </Suspense>
      ) : null}
      <Suspense fallback={null}>
        <GuideCategoryPageContent category={category} guideActiveTab={activeTab} />
      </Suspense>
    </SitePageShell>
  )
}