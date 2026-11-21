import type { Metadata } from "next"
import { buildGuideCategoryPageMetadata } from "@/lib/guide-category-page-metadata"

type SearchParamsInput = {
  [key: string]: string | string[] | undefined
}

export function buildGuideMousePageMetadata(searchParams?: SearchParamsInput): Metadata {
  return buildGuideCategoryPageMetadata("mouse", searchParams)
}