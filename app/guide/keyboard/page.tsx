import type { Metadata } from "next"
import { GuideCategoryDedicatedPage } from "@/components/guide-category-dedicated-page"
import { buildGuideCategoryPageMetadata } from "@/lib/guide-category-page-metadata"

export function generateMetadata(): Metadata {
  return buildGuideCategoryPageMetadata("keyboard")
}

export default function GuideKeyboardPage() {
  return <GuideCategoryDedicatedPage category="keyboard" guideActiveTab="entry" />
}