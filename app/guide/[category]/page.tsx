import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { GuideCategoryPageContent } from "@/components/guide-category-page-content"
import { SitePageShell } from "@/components/site-page-shell"
import {
  GUIDE_CATEGORY_IDS,
  getGuideCategoryLabel,
  isGuideCategorySlug,
  type GuideCategorySlug,
} from "@/lib/guide-routes"
import { SITE_NAME } from "@/lib/site-config"

type GuideCategoryPageProps = {
  params: Promise<{ category: string }>
}

export function generateStaticParams() {
  return GUIDE_CATEGORY_IDS.map((category) => ({ category }))
}

export async function generateMetadata({ params }: GuideCategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params
  if (!isGuideCategorySlug(slug)) {
    return { title: `ガイド | ${SITE_NAME}` }
  }
  const label = getGuideCategoryLabel(slug)
  return {
    title: `${label}の選び方 | デバイス購入のポイント | ${SITE_NAME}`,
    description: `${label}の失敗しない選び方とおすすめモデルを${SITE_NAME}が解説します。`,
  }
}

export default async function GuideCategoryPage({ params }: GuideCategoryPageProps) {
  const { category: slug } = await params
  if (!isGuideCategorySlug(slug)) {
    notFound()
  }
  const category = slug as GuideCategorySlug
  const label = getGuideCategoryLabel(category)

  return (
    <SitePageShell
      title={`${label}の選び方`}
      description={`${label}を選ぶときのポイントと、用途別のおすすめモデルを紹介します。`}
    >
      <Suspense fallback={null}>
        <GuideCategoryPageContent category={category} />
      </Suspense>
    </SitePageShell>
  )
}
