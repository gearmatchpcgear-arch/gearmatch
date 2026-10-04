import type { Gadget } from "@/lib/gadgets"

/** メーカー絞り込み filter ID（chair-brand-{key}） */
export type GamingChairBrandFilterId = `chair-brand-${string}`

export const GAMING_CHAIR_MAJOR_BRAND_MIN_COUNT = 10

const UNSPECIFIED = new Set(["—", "-", ""])

type BrandDefinition = {
  key: string
  label: string
  patterns: RegExp[]
}

/** 名称・ブランド欄から優先マッチする主要メーカー */
const KNOWN_BRANDS: BrandDefinition[] = [
  { key: "akracing", label: "AKRacing", patterns: [/akracing/i, /エーケーレーシング/i] },
  { key: "gtplayer", label: "GTPLAYER", patterns: [/gtplayer/i, /gt[\s-]?player/i] },
  { key: "dowinx", label: "Dowinx", patterns: [/dowinx/i] },
  { key: "gxtrace", label: "GXTRACE", patterns: [/gxtrace/i, /gx[\s-]?trace/i] },
  { key: "autofull", label: "AutoFull", patterns: [/autofull/i, /オートフル/i] },
  { key: "corsair", label: "CORSAIR", patterns: [/corsair/i, /コルセア/i] },
  { key: "razer", label: "Razer", patterns: [/razer/i, /レイザー/i] },
  { key: "dxracer", label: "DXRacer", patterns: [/dxracer/i, /dx[\s-]?racer/i, /デラックスレーサー/i] },
]

const KNOWN_LABEL_BY_KEY = new Map(KNOWN_BRANDS.map((b) => [b.key, b.label]))

function slugifyBrand(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function brandHaystack(gadget: Gadget): string {
  return `${gadget.brand} ${gadget.name} ${gadget.tagline}`
}

function displayBrandFromField(gadget: Gadget): string | null {
  const brand = gadget.brand?.trim()
  if (!brand || UNSPECIFIED.has(brand)) return null
  return brand
}

/** ゲーミングチェアの正規化ブランドキー（フィルター ID 用） */
export function resolveGamingChairBrandKey(gadget: Gadget): string | null {
  if (gadget.category !== "gaming-chair") return null
  const hay = brandHaystack(gadget)
  for (const def of KNOWN_BRANDS) {
    if (def.patterns.some((re) => re.test(hay))) return def.key
  }
  const fromField = displayBrandFromField(gadget)
  if (!fromField) return null
  const slug = slugifyBrand(fromField)
  return slug || null
}

function resolveGamingChairBrandLabel(gadget: Gadget, key: string): string {
  const fromField = displayBrandFromField(gadget)
  if (fromField) return fromField
  return KNOWN_LABEL_BY_KEY.get(key) ?? key
}

export function gamingChairBrandFilterId(key: string): GamingChairBrandFilterId {
  return `chair-brand-${key}`
}

export function isGamingChairBrandFilterId(id: string): id is GamingChairBrandFilterId {
  return id.startsWith("chair-brand-") && id.length > "chair-brand-".length
}

export function brandKeyFromGamingChairBrandFilterId(id: GamingChairBrandFilterId): string {
  return id.slice("chair-brand-".length)
}

export function matchesGamingChairBrandFilterId(
  gadget: Gadget,
  filterId: GamingChairBrandFilterId,
): boolean {
  const key = brandKeyFromGamingChairBrandFilterId(filterId)
  return resolveGamingChairBrandKey(gadget) === key
}

export type GamingChairBrandFilterOption = {
  id: GamingChairBrandFilterId
  label: string
  count: number
  match: (gadget: Gadget) => boolean
}

/** 登録数が minCount 以上の主要メーカー選択肢を生成 */
export function buildMajorGamingChairBrandFilters(
  gadgets: Gadget[],
  minCount = GAMING_CHAIR_MAJOR_BRAND_MIN_COUNT,
): GamingChairBrandFilterOption[] {
  const counts = new Map<string, number>()
  const labelVotes = new Map<string, Map<string, number>>()

  for (const gadget of gadgets) {
    if (gadget.category !== "gaming-chair") continue
    const key = resolveGamingChairBrandKey(gadget)
    if (!key) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
    const label = resolveGamingChairBrandLabel(gadget, key)
    const votes = labelVotes.get(key) ?? new Map<string, number>()
    votes.set(label, (votes.get(label) ?? 0) + 1)
    labelVotes.set(key, votes)
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"))
    .map(([key, count]) => {
      const votes = labelVotes.get(key)!
      const label = [...votes.entries()].sort((a, b) => b[1] - a[1])[0][0]
      const id = gamingChairBrandFilterId(key)
      return {
        id,
        label,
        count,
        match: (gadget: Gadget) => resolveGamingChairBrandKey(gadget) === key,
      }
    })
}

/** @deprecated resolveGamingChairBrandKey を使用 */
export function matchesGamingChairBrand(
  gadget: Gadget,
  slug: string,
): boolean {
  return resolveGamingChairBrandKey(gadget) === slug
}
