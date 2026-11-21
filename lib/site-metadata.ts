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
  /** ガイド用途タブ等、意図的にクエリ付き canonical にする場合 */
  searchParams?: Record<string, string>
  extra?: Metadata
}

function canonicalUrlFromPath(path: string, searchParams?: Record<string, string>): string {
  const canonicalPath = normalizeSitePath(path)
  const base = absoluteSiteUrl(canonicalPath)
  if (!searchParams || Object.keys(searchParams).length === 0) return base
  const qs = new URLSearchParams(searchParams).toString()
  return qs ? `${base}?${qs}` : base
}

/**
 * 各ページ用 metadata。
 * 既定の canonical はクエリなしパス。`searchParams` 指定時のみクエリ付き絶対URL。
 */
export function sitePageMetadata({
  path,
  title,
  description,
  searchParams,
  extra,
}: SitePageMetadataInput): Metadata {
  const url = canonicalUrlFromPath(path, searchParams)
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
