import type { Metadata } from "next"
import { GuideCategoryDedicatedPage } from "@/components/guide-category-dedicated-page"
import { buildGuideCategoryPageMetadata } from "@/lib/guide-category-page-metadata"

export function generateMetadata(): Metadata {
  return buildGuideCategoryPageMetadata("gaming-chair")
}

export default function GuideGamingChairPage() {
  return <GuideCategoryDedicatedPage category="gaming-chair" guideActiveTab="overview" />
}