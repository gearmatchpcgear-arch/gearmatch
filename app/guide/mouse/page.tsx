import type { Metadata } from "next"
import { GuideCategoryDedicatedPage } from "@/components/guide-category-dedicated-page"
import { buildGuideCategoryPageMetadata } from "@/lib/guide-category-page-metadata"

export function generateMetadata(): Metadata {
  return buildGuideCategoryPageMetadata("mouse")
}

export default function GuideMousePage() {
  return <GuideCategoryDedicatedPage category="mouse" guideActiveTab="beginner" />
}