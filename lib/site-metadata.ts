import type { Metadata } from "next"
import { getSiteOrigin } from "@/lib/site-config"

/** サイト内パス（先頭 `/`、末尾スラッシュなし。ルートのみ `/`） */
export function normalizeSitePath(path: string): string {
  const trimmed = path.trim()
  if (!trimmed || trimmed === "/") return "/"
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  return withSlash.replace(/\/+$/, "") || "/"
}

export function absoluteSiteUrl(path: string): string {
  return `${getSiteOrigin()}${normalizeSitePath(path)}`
}

type SitePageMetadataInput = {
  path: string
  title: string
  description: string
  extra?: Metadata
}

/**
 * 各ページ用 metadata。
 * canonical はクエリを含めないパスの絶対URL（?tab= / ?product= 等の重複は正規ページへ集約）。
 */
export function sitePageMetadata({
  path,
  title,
  description,
  extra,
}: SitePageMetadataInput): Metadata {
  const canonicalPath = normalizeSitePath(path)
  const url = absoluteSiteUrl(canonicalPath)
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
    },
    twitter: {
      title,
      description,
    },
    ...extra,
  }
}
