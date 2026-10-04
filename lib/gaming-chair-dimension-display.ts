import type { Gadget } from "@/lib/gadgets"

const UNSPECIFIED_SPEC = "—" as const

const EMPTY_DIMENSION_MARKERS = new Set(["", "—", "-", "未記載", "不明"])

function cmUnit(n: string): string {
  const t = n.trim()
  return /cm/i.test(t) ? t.replace(/\s*cm/i, "cm") : `${t}cm`
}

function stripLeadingDimLabel(part: string): string {
  return part
    .replace(/^[WDHwdh][：:]?\s*/, "")
    .replace(/^幅[：:]?\s*/, "")
    .replace(/^奥行[き]?[：:]?\s*/, "")
    .replace(/^高[さ]?[：:]?\s*/, "")
    .replace(/^全長[：:]?\s*/, "")
    .trim()
}

/** `W: … × D: … × H: …` 表記のスペース・区切りを統一 */
function normalizeWdhSpacing(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, " ")
    .replace(/\s*×\s*/g, " × ")
    .replace(/×\s*([WDH]:)/gi, " × $1")
    .replace(/\s+/g, " ")
    .trim()
}

/** 寸法データを `W: XXcm × D: YYcm × H: ZZcm` 形式にフォーマット（未記載は `-`） */
export function formatDimensions(rawDimension?: string): string {
  const raw = String(rawDimension ?? "")
    .replace(/\\n/g, "\n")
    .trim()
  if (!raw || EMPTY_DIMENSION_MARKERS.has(raw)) return "-"

  if (/W:\s*/i.test(raw) && /D:\s*/i.test(raw) && /H:\s*/i.test(raw)) {
    return normalizeWdhSpacing(raw)
  }

  const jpXTriple = raw.match(
    /([\d.]+)\s*幅\s*[x×]\s*([\d.]+)\s*奥行[き]?\s*[x×]\s*([\d.]+)\s*高[さ]?/i,
  )
  if (jpXTriple) {
    return `W: ${cmUnit(jpXTriple[1])} × D: ${cmUnit(jpXTriple[2])} × H: ${cmUnit(jpXTriple[3])}`
  }

  const suffixWdh = raw.match(
    /([\d.]+)\s*W:\s*[x×]\s*([\d.]+)\s*D:\s*[x×]\s*([\d.]+)\s*H:/i,
  )
  if (suffixWdh) {
    return `W: ${cmUnit(suffixWdh[1])} × D: ${cmUnit(suffixWdh[2])} × H: ${cmUnit(suffixWdh[3])}`
  }

  const wMatch = raw.match(/(?:^|[\s•×]|(?<=[\d.]))幅[：:\s]*([\d.]+)\s*cm?/im)
  const dMatch = raw.match(/(?:^|[\s•×]|(?<=[\d.]))奥行[き]?[：:\s]*([\d.]+)\s*cm?/im)
  const hMatch = raw.match(/(?:^|[\s•×]|(?<=[\d.]))高[さ]?[：:\s]*([\d.]+)\s*cm?/im)
  const lenMatch = raw.match(/(?:^|[\s•×])全長[：:\s]*([\d.]+)\s*cm?/im)

  if (wMatch && dMatch && hMatch) {
    return `W: ${cmUnit(wMatch[1])} × D: ${cmUnit(dMatch[1])} × H: ${cmUnit(hMatch[1])}`
  }

  if (wMatch && dMatch && !hMatch) {
    return `W: ${cmUnit(wMatch[1])} × D: ${cmUnit(dMatch[1])}`
  }

  if (wMatch && lenMatch && !dMatch && !hMatch) {
    return `W: ${cmUnit(wMatch[1])} × H: ${cmUnit(lenMatch[1])}`
  }

  if (/W:\s*/i.test(raw) && /D:\s*/i.test(raw) && !/H:\s*/i.test(raw)) {
    return normalizeWdhSpacing(raw)
  }

  if (/W:\s*/i.test(raw) && /H:\s*/i.test(raw) && !/D:\s*/i.test(raw)) {
    return normalizeWdhSpacing(raw)
  }

  const triple = raw.match(/([\d.]+)\s*×\s*([\d.]+)\s*×\s*([\d.]+)\s*cm?/i)
  if (triple) {
    return `W: ${cmUnit(triple[1])} × D: ${cmUnit(triple[2])} × H: ${cmUnit(triple[3])}`
  }

  let formatted = raw.replace(/\r\n/g, "\n").replace(/\n+/g, " ").trim()
  formatted = formatted
    .replace(/•?\s*幅[：:]?\s*/gi, "W: ")
    .replace(/•?\s*奥行[き]?[：:]?\s*/gi, "D: ")
    .replace(/•?\s*高[さ]?[：:]?\s*/gi, "H: ")
    .replace(/•?\s*全長[：:]?\s*/gi, "H: ")
  if (/W:\s*/i.test(formatted) && /D:\s*/i.test(formatted) && /H:\s*/i.test(formatted)) {
    return normalizeWdhSpacing(formatted)
  }
  if (/W:\s*/i.test(formatted) && (/D:\s*/i.test(formatted) || /H:\s*/i.test(formatted))) {
    return normalizeWdhSpacing(formatted)
  }

  const parts = raw.split(/[×xX]/).map((p) => p.trim()).filter(Boolean)
  if (parts.length === 3) {
    const labels = ["W:", "D:", "H:"] as const
    return parts
      .map((part, idx) => `${labels[idx]} ${cmUnit(stripLeadingDimLabel(part))}`)
      .join(" × ")
  }

  return normalizeWdhSpacing(formatted) || "-"
}

/** @deprecated alias — 表示・CSV 正規化は `formatDimensions` を使用 */
export const formatDimensionsWithWDH = formatDimensions

function extractDimensionNumberParts(raw: string): string[] {
  const w = raw.match(/W:\s*([\d.]+)/i)
  const d = raw.match(/D:\s*([\d.]+)/i)
  const h = raw.match(/H:\s*([\d.]+)/i)
  if (w || d || h) {
    return [w?.[1], d?.[1], h?.[1]].filter((n): n is string => Boolean(n))
  }

  return raw
    .replace(/[WDHwdh][：:]?/g, "")
    .replace(/cm|mm|m/gi, "")
    .replace(/約/g, "")
    .split(/[×xX]/)
    .map((s) => s.trim())
    .map((s) => s.match(/[\d.]+/)?.[0] ?? "")
    .filter(Boolean)
}

/** 一覧カード用: `W: 70cm × …` → `70×70×133`（数値と × のみ） */
export function formatDimensionsNumbersOnly(rawDimension?: string): string {
  const raw = String(rawDimension ?? "")
    .replace(/\\n/g, "\n")
    .trim()
  if (!raw || EMPTY_DIMENSION_MARKERS.has(raw)) return "-"

  const normalized = formatDimensions(raw)
  if (normalized === "-") return "-"

  const parts = extractDimensionNumberParts(normalized)
  if (parts.length >= 3) {
    return `${parts[0]}×${parts[1]}×${parts[2]}`
  }
  if (parts.length === 2) {
    return `${parts[0]}×${parts[1]}`
  }

  const fallback = normalized
    .replace(/[WDHwdh][：:]?\s*/gi, "")
    .replace(/\s*cm\s*/gi, "")
    .replace(/\s+/g, "")
    .trim()
  return fallback || "-"
}

/** 一覧カード・詳細モーダル共通の寸法ラベル */
export const GAMING_CHAIR_DIMENSION_CARD_LABEL = "寸法（W×D×H）"

const LEGACY_DIMENSION_CARD_LABELS = [
  "寸法/重量",
  "寸法（サイズ）",
  "寸法（D x W x H）",
] as const

export function isGamingChairDimensionCardLabel(label: string): boolean {
  return (
    label === GAMING_CHAIR_DIMENSION_CARD_LABEL ||
    LEGACY_DIMENSION_CARD_LABELS.includes(label as (typeof LEGACY_DIMENSION_CARD_LABELS)[number])
  )
}

export function parseDimensionTripleCm(raw: string): [number, number, number] | null {
  const m = String(raw).match(/([\d.]+)\s*×\s*([\d.]+)\s*×\s*([\d.]+)\s*cm/i)
  if (!m) return null
  return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]
}

function formatNum(n: number): string {
  return Number.isInteger(n) ? String(Math.round(n)) : String(n)
}

export function formatDimensionTripleDWH(d: number, w: number, h: number): string {
  return `${formatNum(d)} × ${formatNum(w)} × ${formatNum(h)} cm`
}

function parseCmNum(raw?: string): number | null {
  if (!raw || raw === UNSPECIFIED_SPEC) return null
  const m = raw.match(/([\d.]+)/)
  return m ? parseFloat(m[1]) : null
}

function approx(a: number, b: number, tol = 0.75): boolean {
  return Math.abs(a - b) <= tol
}

type DimensionHints = {
  seatDepth?: string
  seatWidth?: string
  name?: string
  tagline?: string
}

/** 寸法文字列を奥行(D) × 幅(W) × 高さ(H) に正規化 */
export function normalizeDimensionStringToDWH(
  raw: string,
  hints: DimensionHints = {},
): string | null {
  const base = String(raw).split(/\s*\/\s*/)[0]?.trim() ?? ""
  const triple = parseDimensionTripleCm(base)
  if (!triple) return null

  let [d, w, h] = triple
  const seatDepth = parseCmNum(hints.seatDepth)
  const seatWidth = parseCmNum(hints.seatWidth)
  const hay = `${hints.name ?? ""} ${hints.tagline ?? ""}`

  if (seatDepth != null && seatWidth != null) {
    if (approx(d, seatWidth) && approx(w, seatDepth)) {
      d = seatDepth
      w = seatWidth
    } else if (approx(d, seatDepth) && approx(w, seatWidth)) {
      // already D × W
    }
  }

  const depthFirst = hay.match(/奥行(?:き|)?\s*([\d.]+)(?:\s*cm)?[^×]{0,24}幅\s*([\d.]+)/i)
  const widthFirst = hay.match(/幅\s*([\d.]+)(?:\s*cm)?[^×]{0,24}奥行(?:き|)?\s*([\d.]+)/i)
  if (depthFirst) {
    const hintD = parseFloat(depthFirst[1])
    const hintW = parseFloat(depthFirst[2])
    if (approx(d, hintW) && approx(w, hintD)) {
      d = hintD
      w = hintW
    }
  } else if (widthFirst) {
    const hintW = parseFloat(widthFirst[1])
    const hintD = parseFloat(widthFirst[2])
    if (approx(d, hintW) && approx(w, hintD)) {
      d = hintD
      w = hintW
    } else if (seatDepth == null && seatWidth == null) {
      d = hintD
      w = hintW
    }
  }

  return formatDimensionTripleDWH(d, w, h)
}

function formatNormalizedDwhAsWdhLabels(normalized: string): string | null {
  const triple = parseDimensionTripleCm(normalized)
  if (!triple) return null
  const [d, w, h] = triple
  return `W: ${cmUnit(String(w))} × D: ${cmUnit(String(d))} × H: ${cmUnit(String(h))}`
}

function readRawBodyDimensions(gadget: Gadget): string | null {
  if (gadget.dimensions && gadget.dimensions !== UNSPECIFIED_SPEC) {
    return gadget.dimensions
  }
  const sizeGroup = gadget.specGroups.find((g) => /サイズ|寸法/i.test(g.title))
  const row = sizeGroup?.rows.find((r) => r.label === "本体寸法" || r.label === "寸法")
  return row?.value && row.value !== UNSPECIFIED_SPEC ? row.value : null
}

/** カード・詳細上部の寸法表示（W: × D: × H:） */
export function getGamingChairDimensionCardDisplay(gadget: Gadget): string {
  const raw = readRawBodyDimensions(gadget)
  if (!raw) return UNSPECIFIED_SPEC

  const normalized = normalizeDimensionStringToDWH(raw, {
    seatDepth: gadget.seatDepth,
    seatWidth: gadget.seatWidth,
    name: gadget.name,
    tagline: gadget.tagline,
  })

  if (normalized) {
    const labeled = formatNormalizedDwhAsWdhLabels(normalized)
    if (labeled) return labeled
  }

  const base = raw.split(/\s*\/\s*/)[0]?.trim() ?? ""
  const formatted = formatDimensions(base)
  return formatted === "-" ? UNSPECIFIED_SPEC : formatted
}
