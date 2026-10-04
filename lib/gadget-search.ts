import type { Gadget } from "@/lib/gadgets"
import { withGamingChairCsvOverlay } from "@/lib/gadgets"
import { getGamingChairCsvRow } from "@/lib/gaming-chairs-csv-data"

/** 検索用：全半角・大小文字・連続空白を揃える */
export function normalizeSearchText(raw: string): string {
  return raw
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\u3000/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** 一覧検索の対象文字列（CSV B列名称など表示用データを含む） */
export function getGadgetSearchHaystack(gadget: Gadget): string {
  const display = withGamingChairCsvOverlay(gadget)
  const chunks: string[] = [
    gadget.name,
    display.name,
    gadget.brand,
    display.brand,
    gadget.tagline,
    display.tagline,
    gadget.connection ?? "",
  ]

  if (gadget.category === "gaming-chair") {
    const row = getGamingChairCsvRow(gadget.id)
    if (row) {
      chunks.push(row.name, row.description, row.material, row.shape, row.brand)
    }
  }

  for (const highlight of gadget.highlights) {
    chunks.push(highlight.label, highlight.value)
  }

  return normalizeSearchText(chunks.filter(Boolean).join(" "))
}

/** スペース区切り AND 検索（各キーワードが haystack に含まれるか） */
export function gadgetMatchesSearchQuery(haystack: string, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true
  const keywords = normalizedQuery.split(/\s+/).filter(Boolean)
  return keywords.every((keyword) => haystack.includes(keyword))
}
