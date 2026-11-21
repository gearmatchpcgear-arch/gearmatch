import type { Metadata } from "next"
import { GuideCategoryDedicatedPage } from "@/components/guide-category-dedicated-page"
import { buildGuideCategoryPageMetadata } from "@/lib/guide-category-page-metadata"

export function generateMetadata(): Metadata {
  return buildGuideCategoryPageMetadata("camera")
}

export default function GuideCameraPage() {
  return <GuideCategoryDedicatedPage category="camera" guideActiveTab="overview" />
}