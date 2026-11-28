"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { resolvePageCanonicalUrl } from "@/lib/page-canonical-url"

/**
 * クエリ付きURLでも正規URLを head に反映する。
 * 一覧の category/product は正規化しない。ガイド用途タブのみ ?tab= 付き canonical。
 */
export function CanonicalFromPathname() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const href = resolvePageCanonicalUrl(pathname, searchParams)

    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement("link")
      link.rel = "canonical"
      document.head.appendChild(link)
    }
    if (link.getAttribute("href") !== href) {
      link.setAttribute("href", href)
    }

    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]')
    if (ogUrl && ogUrl.content !== href) {
      ogUrl.content = href
    }
  }, [pathname, searchParams])

  return null
}