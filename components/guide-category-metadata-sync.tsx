"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import type { CategoryId } from "@/lib/gadgets"
import {
  buildGuideCategoryTabCanonical,
  getGuideCategoryTabSeoFromQuery,
  isGuideTabSeoCategory,
  type GuideTabSeoCategory,
} from "@/lib/guide-tab-seo"
import { isGuideTabbedCategory } from "@/lib/guide-tab-config"
import { guideCategoryPath, getGuideCategoryLabel } from "@/lib/guide-routes"
import { absoluteSiteUrl, normalizeSitePath } from "@/lib/site-metadata"
import { SITE_NAME } from "@/lib/site-config"

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

    const label = getGuideCategoryLabel(category)
    const defaultTitle = `${label}の選び方 | デバイス購入のポイント | ${SITE_NAME}`
    const defaultDescription = `${label}の失敗しない選び方とおすすめモデルを${SITE_NAME}が解説します。`

    const tabSeo = getGuideCategoryTabSeoFromQuery(category as GuideTabSeoCategory, searchParams.get("tab"))
    const title = tabSeo?.title ?? defaultTitle
    const description = tabSeo?.description ?? defaultDescription
    let canonical = absoluteSiteUrl(guidePath)
    if (tabSeo && isGuideTabbedCategory(category)) {
      canonical = absoluteSiteUrl(buildGuideCategoryTabCanonical(category as GuideTabSeoCategory, tabSeo.tabId))
    }

    applyDocumentMetadata(title, description, canonical)
  }, [pathname, searchParams, category, guidePath])

  return null
}