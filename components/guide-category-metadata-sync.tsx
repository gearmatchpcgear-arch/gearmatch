"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import type { CategoryId } from "@/lib/gadgets"
import {
  buildGuideCategoryTabCanonical,
  getGuideCategoryTabSeo,
  isGuideTabSeoCategory,
  resolveGuideCategoryActiveTab,
  type GuideTabSeoCategory,
} from "@/lib/guide-tab-seo"
import { isGuideTabbedCategory } from "@/lib/guide-tab-config"
import { guideCategoryPath } from "@/lib/guide-routes"
import { absoluteSiteUrl, normalizeSitePath } from "@/lib/site-metadata"

function applyDocumentMetadata(title: string, description: string, canonical: string) {
  if (document.title !== title) document.title = title

  let descriptionEl = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (!descriptionEl) {
    descriptionEl = document.createElement("meta")
    descriptionEl.name = "description"
    document.head.appendChild(descriptionEl)
  }
  descriptionEl.content = description

  const setProp = (selector: string, value: string) => {
    const node = document.querySelector<HTMLMetaElement>(selector)
    if (node) node.content = value
  }
  setProp('meta[property="og:title"]', title)
  setProp('meta[property="og:description"]', description)
  setProp('meta[property="og:url"]', canonical)
  setProp('meta[name="twitter:title"]', title)
  setProp('meta[name="twitter:description"]', description)

  let canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonicalEl) {
    canonicalEl = document.createElement("link")
    canonicalEl.rel = "canonical"
    document.head.appendChild(canonicalEl)
  }
  if (canonicalEl.getAttribute("href") !== canonical) {
    canonicalEl.setAttribute("href", canonical)
  }
}

type GuideCategoryMetadataSyncProps = {
  category: CategoryId
}

export function GuideCategoryMetadataSync({ category }: GuideCategoryMetadataSyncProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const guidePath = guideCategoryPath(category)

  useEffect(() => {
    if (normalizeSitePath(pathname ?? "") !== guidePath) return
    if (!isGuideTabSeoCategory(category)) return

    const seoCategory = category as GuideTabSeoCategory
    const tabId = resolveGuideCategoryActiveTab(seoCategory, searchParams.get("tab"))
    const tabSeo = getGuideCategoryTabSeo(seoCategory, tabId)
    const title = tabSeo.title
    const description = tabSeo.description
    let canonical = absoluteSiteUrl(guidePath)
    if (isGuideTabbedCategory(category)) {
      canonical = absoluteSiteUrl(buildGuideCategoryTabCanonical(seoCategory, tabId))
    }

    applyDocumentMetadata(title, description, canonical)
  }, [pathname, searchParams, category, guidePath])

  return null
}