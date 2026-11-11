"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { absoluteSiteUrl, normalizeSitePath } from "@/lib/site-metadata"

/**
 * クエリ付きURL（?tab= や ?product= 等）でも正規URLをパスだけに固定する。
 * 静的エクスポート＋クライアントタブ切替時の重複インデックス対策。
 */
export function CanonicalFromPathname() {
  const pathname = usePathname()

  useEffect(() => {
    const path = normalizeSitePath(pathname ?? "/")
    const href = absoluteSiteUrl(path)

    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement("link")
      link.rel = "canonical"
      document.head.appendChild(link)
    }
    if (link.getAttribute("href") !== href) {
      link.setAttribute("href", href)
    }
  }, [pathname])

  return null
}
