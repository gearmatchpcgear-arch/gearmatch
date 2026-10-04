import type { Gadget } from "@/lib/gadgets"
import { hasMonitorVesaFilterTag, type MonitorVesaFilterTag } from "@/lib/monitor-vesa-standard"
import { isFilterSpecFilled } from "@/lib/filter-match-utils"

/** モニター解像度タグ */
export type MonitorResolutionTag =
  | "res-fhd"
  | "res-wqhd"
  | "res-uwqhd"
  | "res-4k"
  | "res-6k"
  | "res-5k2k"
  | "res-dqhd"

/** モニター絞り込み用タグ（フィルターIDと1:1対応） */
export type MonitorFilterTag =
  | "size-238"
  | "size-24"
  | "size-27"
  | "size-315-plus"
  | MonitorResolutionTag
  | "refresh-60"
  | "refresh-75"
  | "refresh-100"
  | "refresh-144-plus"
  | "refresh-240-plus"
  | "port-hdmi"
  | "port-dp"
  | "port-usb-c"
  | "port-usb-c-pd"
  | "panel-ips"
  | "panel-ips-matte"
  | "panel-fast-ips"
  | "panel-fast-ips-matte"
  | "panel-va"
  | "panel-va-matte"
  | "panel-tn"
  | "panel-oled"
  | "panel-ads"
  | "vesa-100"
  | "vesa-75"
  | "vesa-200-plus"
  | "vesa-none"

export const MONITOR_RESOLUTIONS: Record<
  MonitorResolutionTag,
  { short: string; pixels: string }
> = {
  "res-fhd": { short: "FHD", pixels: "1920×1080" },
  "res-wqhd": { short: "WQHD", pixels: "2560 x 1440" },
  "res-uwqhd": { short: "UWQHD", pixels: "3440×1440" },
  "res-4k": { short: "4K", pixels: "3840×2160" },
  "res-5k2k": { short: "5K2K", pixels: "5120×2160" },
  "res-dqhd": { short: "5K DQHD", pixels: "5120×1440" },
  "res-6k": { short: "6K", pixels: "6016 x 3384" },
}

/** 解像度フィルター UI 表示順（低解像度→高解像度） */
export const MONITOR_RESOLUTION_FILTER_ORDER: MonitorResolutionTag[] = [
  "res-fhd",
  "res-wqhd",
  "res-uwqhd",
  "res-4k",
  "res-5k2k",
  "res-dqhd",
  "res-6k",
]

const MONITOR_RESOLUTION_FILTER_TAG_SET = new Set<MonitorResolutionTag>(
  MONITOR_RESOLUTION_FILTER_ORDER,
)

/** 解像度タグ → 「FHD (1920×1080)」形式の表示ラベル */
export function formatMonitorResolutionLabel(tag: MonitorResolutionTag): string {
  const { short, pixels } = MONITOR_RESOLUTIONS[tag]
  return `${short} (${pixels})`
}

export const MONITOR_FILTER_TAG_LABELS: Record<MonitorFilterTag, string> = {
  "size-238": "23.8インチ以下",
  "size-24": "24インチ",
  "size-27": "27インチ",
  "size-315-plus": "31.5インチ以上",
  "res-fhd": formatMonitorResolutionLabel("res-fhd"),
  "res-wqhd": formatMonitorResolutionLabel("res-wqhd"),
  "res-uwqhd": formatMonitorResolutionLabel("res-uwqhd"),
  "res-4k": formatMonitorResolutionLabel("res-4k"),
  "res-6k": formatMonitorResolutionLabel("res-6k"),
  "res-5k2k": formatMonitorResolutionLabel("res-5k2k"),
  "res-dqhd": formatMonitorResolutionLabel("res-dqhd"),
  "refresh-60": "60Hz",
  "refresh-75": "75Hz",
  "refresh-100": "100Hz",
  "refresh-144-plus": "144Hz以上",
  "refresh-240-plus": "240Hz以上",
  "port-hdmi": "HDMI",
  "port-dp": "DisplayPort",
  "port-usb-c": "USB Type-C",
  "port-usb-c-pd": "USB-C給電対応",
  "panel-ips": "IPS",
  "panel-ips-matte": "IPS非光沢",
  "panel-fast-ips": "Fast IPS",
  "panel-fast-ips-matte": "Fast IPS非光沢",
  "panel-va": "VA",
  "panel-va-matte": "VA非光沢",
  "panel-tn": "TN",
  "panel-oled": "有機EL",
  "panel-ads": "ADS",
  "vesa-100": "100 × 100 mm",
  "vesa-75": "75 × 75 mm",
  "vesa-200-plus": "200 × 200 mm（200mm以上）",
  "vesa-none": "非対応",
}

function monitorHaystack(gadget: Gadget) {
  return [
    gadget.name,
    gadget.tagline,
    gadget.connection,
    ...gadget.highlights.flatMap((h) => [h.label, h.value]),
    ...gadget.specGroups.flatMap((g) =>
      g.rows.flatMap((r) => (r.label === "Amazon検索" ? [] : [r.label, r.value])),
    ),
  ]
    .join(" ")
    .toLowerCase()
}

function portHaystack(gadget: Gadget) {
  const portGroup = gadget.specGroups.find((g) => /接続端子|端子|ポート/i.test(g.title))
  const rows = portGroup?.rows.flatMap((r) => [r.label, r.value]) ?? []
  return [gadget.connection, ...rows].join(" ").toLowerCase()
}

export function getMonitorScreenInches(gadget: Gadget): number | null {
  const texts: string[] = []
  const fromHighlight = gadget.highlights.find((h) => h.label === "画面サイズ")?.value
  if (fromHighlight && fromHighlight !== "—") texts.push(fromHighlight)

  const displayGroup = gadget.specGroups.find((g) => /ディスプレイ|画面/i.test(g.title))
  const sizeRow = displayGroup?.rows.find((r) => r.label === "画面サイズ")
  if (sizeRow?.value) texts.push(sizeRow.value)

  for (const text of texts) {
    const m = text.match(/([\d.]+)\s*(?:インチ|"|型|inch)/i)
    if (m) return Number(m[1])
  }

  const hay = monitorHaystack(gadget)
  const fallback = hay.match(/([\d.]+)\s*(?:インチ|"|型|inch)/i)
  if (!fallback) return null
  const n = Number(fallback[1])
  // Ignore Amazon search rank pollution (PCモニター #83) and other absurd values.
  if (n >= 60) return null
  return n
}

export function getMonitorMaxRefreshHz(gadget: Gadget): number {
  const texts: string[] = []
  const fromHighlight = gadget.highlights.find((h) => /リフレッシュ/i.test(h.label))?.value
  if (fromHighlight && fromHighlight !== "—") texts.push(fromHighlight)

  for (const group of gadget.specGroups) {
    for (const row of group.rows) {
      if (/リフレッシュ|refresh/i.test(row.label)) texts.push(row.value)
    }
  }

  const hay = `${texts.join(" ")} ${monitorHaystack(gadget)}`
  const rates = [...hay.matchAll(/(\d{2,3})\s*hz(?![a-z0-9])/gi)].map((m) => Number(m[1]))
  return rates.length > 0 ? Math.max(...rates) : 0
}

function getMonitorStructuredScreenInches(gadget: Gadget): number | null {
  const texts: string[] = []
  const fromHighlight = gadget.highlights.find((h) => h.label === "画面サイズ")?.value
  if (isFilterSpecFilled(fromHighlight)) texts.push(fromHighlight!)

  const displayGroup = gadget.specGroups.find((g) => /ディスプレイ|画面/i.test(g.title))
  const sizeRow = displayGroup?.rows.find((r) => r.label === "画面サイズ")
  if (isFilterSpecFilled(sizeRow?.value)) texts.push(sizeRow!.value)

  for (const text of texts) {
    const m = text.match(/([\d.]+)\s*(?:インチ|"|型|inch)/i)
    if (m) return Number(m[1])
  }
  return null
}

function inferSizeTags(gadget: Gadget): MonitorFilterTag[] {
  const inches = getMonitorStructuredScreenInches(gadget)
  if (inches == null) return []

  const tags: MonitorFilterTag[] = []
  if (inches <= 23.8) tags.push("size-238")
  else if (inches >= 24 && inches < 26.5) tags.push("size-24")
  else if (inches >= 26.5 && inches < 30) tags.push("size-27")
  if (inches >= 31.5) tags.push("size-315-plus")

  return tags
}

function isUnsetResolution(value: string | undefined | null): boolean {
  if (!value) return true
  const t = value.trim()
  return !t || t === "—" || t === "-"
}

function getMonitorResolutionSourceTexts(gadget: Gadget): string[] {
  const texts: string[] = []
  const fromHighlight = gadget.highlights.find((h) => h.label === "解像度")?.value
  if (!isUnsetResolution(fromHighlight)) texts.push(fromHighlight!)

  for (const group of gadget.specGroups) {
    if (!/ディスプレイ|画面/i.test(group.title)) continue
    const resRow = group.rows.find((r) => r.label === "解像度")
    if (resRow?.value && !isUnsetResolution(resRow.value)) {
      texts.push(resRow.value)
    }
  }

  return texts
}

function normalizeResolutionText(raw: string): string {
  return raw.normalize("NFKC").replace(/\s+/g, " ").trim()
}

function parseResolutionDimensions(text: string): { w: number; h: number } | null {
  const normalized = normalizeResolutionText(text).toLowerCase()
  const match = normalized.match(/(\d{3,4})\s*[x×]\s*(\d{3,4})/)
  if (!match) return null
  return { w: Number(match[1]), h: Number(match[2]) }
}

function classifyResolutionFromDimensions(w: number, h: number): MonitorResolutionTag | null {
  const width = Math.max(w, h)
  const height = Math.min(w, h)

  if (width === 6016 && height === 3384) return "res-6k"
  if (width === 5120 && height === 2160) return "res-5k2k"
  if (width === 5120 && height === 1440) return "res-dqhd"
  if (width === 3840 && height === 2160) return "res-4k"
  if (width === 3440 && height === 1440) return "res-uwqhd"
  if (width === 2560 && (height === 1440 || height === 1600)) return "res-wqhd"
  if (width === 1920 && (height === 1080 || height === 1200)) return "res-fhd"

  return null
}

function classifyResolutionFromKeywords(text: string): MonitorResolutionTag | null {
  const normalized = normalizeResolutionText(text)
  if (isUnsetResolution(normalized)) return null

  const dims = parseResolutionDimensions(normalized)
  if (dims) {
    const fromDims = classifyResolutionFromDimensions(dims.w, dims.h)
    if (fromDims) return fromDims
  }

  const t = normalized.toLowerCase()
  if (/6016\s*[x×]\s*3384|\b6k\b/i.test(t)) return "res-6k"
  if (/5120\s*[x×]\s*2160|5k2k|5k\s*2k/i.test(t)) return "res-5k2k"
  if (/5120\s*[x×]\s*1440|5k\s*dqhd|\bdqhd\b/i.test(t)) return "res-dqhd"
  if (/3840\s*[x×]\s*2160|4k\s*uhd|\b4k\b|\buhd\b/i.test(t)) return "res-4k"
  if (/3440\s*[x×]\s*1440|uw[- ]?qhd|ultrawide\s*qhd/i.test(t)) return "res-uwqhd"
  if (/2560\s*[x×]\s*1600|2\.5\s*k/i.test(t)) return "res-wqhd"
  if (/2560\s*[x×]\s*1440|wqhd|1440p|(?<![uw-])qhd\b/i.test(t)) return "res-wqhd"
  if (/1920\s*[x×]\s*1200|\bwuxga\b/i.test(t)) return "res-fhd"
  if (/1920\s*[x×]\s*1080|\bfhd\b|1080p|full\s*hd|フルhd/i.test(t)) return "res-fhd"

  return null
}

function inferResolutionTags(gadget: Gadget): MonitorFilterTag[] {
  const tag = inferMonitorResolutionTag(gadget)
  return tag ? [tag] : []
}

/** 名称・スペックから解像度タグを推論（ハイライト/スペック解像度を優先） */
export function inferMonitorResolutionTag(gadget: Gadget): MonitorResolutionTag | null {
  if (gadget.category !== "monitor") return null

  for (const text of getMonitorResolutionSourceTexts(gadget)) {
    const fromText = classifyResolutionFromKeywords(text)
    if (fromText) return fromText
  }

  const fallbackText = [gadget.name, gadget.tagline].join(" ")
  return classifyResolutionFromKeywords(fallbackText)
}

/** 生の解像度文字列を「WQHD (2560 x 1440)」等形式に正規化 */
export function formatMonitorResolutionRaw(raw: string): string {
  const text = raw.trim()
  if (isUnsetResolution(text)) return text

  const tag = classifyResolutionFromKeywords(text)
  if (tag) return formatMonitorResolutionLabel(tag)

  return text
}

/** 一覧カード・詳細・比較向けの解像度表示 */
export function getMonitorResolutionDisplay(gadget: Gadget): string {
  if (gadget.category !== "monitor") return "—"

  const tag = inferMonitorResolutionTag(gadget)
  if (tag) return formatMonitorResolutionLabel(tag)

  const fromHighlight = gadget.highlights.find((h) => h.label === "解像度")?.value
  if (fromHighlight && fromHighlight !== "—") return formatMonitorResolutionRaw(fromHighlight)

  const displayGroup = gadget.specGroups.find((g) => /ディスプレイ|画面/i.test(g.title))
  const resRow = displayGroup?.rows.find((r) => r.label === "解像度")
  if (resRow?.value) return formatMonitorResolutionRaw(resRow.value)

  return "—"
}

function getMonitorStructuredRefreshHz(gadget: Gadget): number | null {
  const texts: string[] = []
  const fromHighlight = gadget.highlights.find((h) => /リフレッシュ/i.test(h.label))?.value
  if (isFilterSpecFilled(fromHighlight)) texts.push(fromHighlight!)

  for (const group of gadget.specGroups) {
    for (const row of group.rows) {
      if (/リフレッシュ|refresh/i.test(row.label) && isFilterSpecFilled(row.value)) {
        texts.push(row.value)
      }
    }
  }

  if (texts.length === 0) return null
  const rates = [...texts.join(" ").matchAll(/(\d{2,3})\s*hz(?![a-z0-9])/gi)].map((m) =>
    Number(m[1]),
  )
  return rates.length > 0 ? Math.max(...rates) : null
}

function inferRefreshTags(gadget: Gadget): MonitorFilterTag[] {
  const hz = getMonitorStructuredRefreshHz(gadget)
  if (hz == null || hz <= 0) return []

  const tags: MonitorFilterTag[] = []
  if (hz <= 60) tags.push("refresh-60")
  else if (hz === 75) tags.push("refresh-75")
  else if (hz < 144) tags.push("refresh-100")
  if (hz >= 144) tags.push("refresh-144-plus")
  if (hz >= 240) tags.push("refresh-240-plus")

  return tags
}

function getMonitorPortSpecText(gadget: Gadget): string | null {
  const portGroup = gadget.specGroups.find((g) => /接続端子|端子|ポート/i.test(g.title))
  if (portGroup) {
    const parts = portGroup.rows
      .filter((row) => isFilterSpecFilled(row.value))
      .flatMap((row) => [row.label, row.value])
    if (parts.length > 0) return parts.join(" ")
  }

  if (isFilterSpecFilled(gadget.connection)) return gadget.connection!.trim()
  return null
}

function inferPortTags(gadget: Gadget): MonitorFilterTag[] {
  const hay = getMonitorPortSpecText(gadget)
  if (!hay) return []
  const portText = hay.toLowerCase()
  const tags: MonitorFilterTag[] = []

  if (/hdmi/i.test(portText)) tags.push("port-hdmi")
  if (/displayport|\bdp\b|display port/i.test(portText)) tags.push("port-dp")
  if (/usb[\s-]?type[\s-]?c|usb-c|type-c|thunderbolt/i.test(portText)) tags.push("port-usb-c")
  if (
    /usb[\s-]?c|type[\s-]?c|thunderbolt/i.test(portText) &&
    /給電|pd|power delivery|65w|90w|100w|140w/i.test(portText)
  ) {
    tags.push("port-usb-c-pd")
  }

  return tags
}

export const MONITOR_PANEL_FILTER_TAGS = [
  "panel-ips",
  "panel-ips-matte",
  "panel-fast-ips",
  "panel-fast-ips-matte",
  "panel-va",
  "panel-va-matte",
  "panel-tn",
  "panel-oled",
  "panel-ads",
] as const satisfies readonly MonitorFilterTag[]

export type MonitorPanelFilterTag = (typeof MONITOR_PANEL_FILTER_TAGS)[number]

const MONITOR_PANEL_FILTER_TAG_SET = new Set<string>(MONITOR_PANEL_FILTER_TAGS)

/** パネルタグ推論時の優先順（より具体的内容を先に判定） */
const MONITOR_PANEL_INFER_ORDER: MonitorPanelFilterTag[] = [
  "panel-fast-ips-matte",
  "panel-fast-ips",
  "panel-ips-matte",
  "panel-ips",
  "panel-va-matte",
  "panel-va",
  "panel-oled",
  "panel-ads",
  "panel-tn",
]

export type MonitorPanelDisplay =
  | "IPS"
  | "IPS非光沢"
  | "Fast IPS"
  | "Fast IPS非光沢"
  | "VA"
  | "VA非光沢"
  | "TN"
  | "有機EL"
  | "ADS"
  | "Mini LED"

function normalizePanelFilterText(raw: string): string {
  return raw.replace(/\u3000/g, " ").replace(/\s+/g, " ").trim()
}

/** パネル表示文字列を正規表記へ変換（カード表示・フィルター共通） */
export function normalizeMonitorPanelDisplay(raw: string): string {
  if (!raw || raw === "—") return raw

  let s = normalizePanelFilterText(raw)
  if (/\bAHVA\b/i.test(s)) s = s.replace(/\bAHVA\b/gi, "IPS")

  const matte = /非光沢|ノングレア|non-?glossy|matte|matt/i.test(s)

  if (/miniled|mini\s*led|ミニ\s*led/i.test(s)) return "Mini LED"
  if (/有機EL|\boled\b|w?oled|qd-oled|woled/i.test(s)) return "有機EL"
  if (/\bads\b/i.test(s)) return "ADS"
  if (/fast\s*ips|rapid\s*ips/i.test(s)) return matte ? "Fast IPS非光沢" : "Fast IPS"
  if (/\bva\b|mva|sva/i.test(s)) return matte ? "VA非光沢" : "VA"
  if (/\btn\b|tn非光沢|tnパネル/i.test(s)) return "TN"
  if (/\bips\b/i.test(s)) return matte ? "IPS非光沢" : "IPS"

  return s
}

/** フィルタータグごとの包含判定（構造化スペックのみ。未設定は false） */
export function matchesMonitorPanelFilterTag(
  gadget: Gadget,
  tag: MonitorPanelFilterTag,
): boolean {
  if (gadget.category !== "monitor") return false

  const raw = getMonitorPanelDisplayRaw(gadget)
  if (!isFilterSpecFilled(raw)) return false

  const text = normalizePanelFilterText(raw)
  const display = normalizeMonitorPanelDisplay(raw)

  switch (tag) {
    case "panel-ips":
      return display === "IPS"
    case "panel-ips-matte":
      return display === "IPS非光沢"
    case "panel-fast-ips":
      return display === "Fast IPS"
    case "panel-fast-ips-matte":
      return display === "Fast IPS非光沢"
    case "panel-va":
      return display === "VA"
    case "panel-va-matte":
      return display === "VA非光沢"
    case "panel-tn":
      return /\btn\b|tn非光沢|tnパネル/i.test(text)
    case "panel-oled":
      return /有機EL|\boled\b|w?oled|qd-oled|woled/i.test(text)
    case "panel-ads":
      return /\bads\b/i.test(text)
    default:
      return false
  }
}

/** @deprecated matchesMonitorPanelFilterTag を使用 */
export function panelDisplayToFilterTag(display: string): MonitorPanelFilterTag | null {
  if (!isFilterSpecFilled(display)) return null
  for (const tag of MONITOR_PANEL_INFER_ORDER) {
    if (matchesMonitorPanelFilterTag({ category: "monitor", highlights: [{ label: "パネル", value: display }] } as Gadget, tag)) {
      return tag
    }
  }
  return null
}

function inferPanelTags(gadget: Gadget): MonitorFilterTag[] {
  if (gadget.category !== "monitor") return []

  const raw = getMonitorPanelDisplayRaw(gadget)
  if (!isFilterSpecFilled(raw)) return []

  for (const tag of MONITOR_PANEL_INFER_ORDER) {
    if (matchesMonitorPanelFilterTag(gadget, tag)) return [tag]
  }
  return []
}

/** 明示タグ + データから推論したタグをマージ（重複除去） */
export function inferMonitorFilterTags(gadget: Gadget): MonitorFilterTag[] {
  if (gadget.category !== "monitor") return []

  const inferred: MonitorFilterTag[] = [
    ...inferSizeTags(gadget),
    ...inferResolutionTags(gadget),
    ...inferRefreshTags(gadget),
    ...inferPortTags(gadget),
    ...inferPanelTags(gadget),
  ]
  const explicit = (gadget.monitorFilterTags ?? []).filter((t) => {
    const id = String(t)
    return (
      !id.startsWith("panel-") &&
      !id.startsWith("res-") &&
      !id.startsWith("port-") &&
      !id.startsWith("refresh-") &&
      !id.startsWith("size-") &&
      !id.startsWith("vesa-")
    )
  })
  return [...new Set([...explicit, ...inferred])]
}

/** 23.8インチ以下フィルター用の上限（インチ） */
export const MONITOR_SIZE_238_MAX_INCHES = 23.8

export function matchesMonitorSize238OrBelow(gadget: Gadget): boolean {
  const inches = getMonitorStructuredScreenInches(gadget)
  return inches != null && inches <= MONITOR_SIZE_238_MAX_INCHES
}

function getMonitorPanelDisplayRaw(gadget: Gadget): string {
  if (gadget.category !== "monitor") return "—"

  const fromHighlight = gadget.highlights.find((h) => h.label === "パネル")?.value
  if (fromHighlight && fromHighlight !== "—") return fromHighlight

  for (const group of gadget.specGroups) {
    const row = group.rows.find((r) => r.label === "パネル" || r.label === "パネル種類")
    if (row?.value && row.value !== "—") return row.value
  }

  return "—"
}

/** 一覧カード・詳細・比較向けのパネル種類表示 */
export function getMonitorPanelDisplay(gadget: Gadget): string {
  const raw = getMonitorPanelDisplayRaw(gadget)
  if (raw === "—") return raw
  return normalizeMonitorPanelDisplay(raw)
}

export function hasMonitorFilterTag(gadget: Gadget, tag: MonitorFilterTag): boolean {
  if (MONITOR_RESOLUTION_FILTER_TAG_SET.has(tag as MonitorResolutionTag)) {
    return inferMonitorResolutionTag(gadget) === tag
  }
  if (tag === "size-238") return matchesMonitorSize238OrBelow(gadget)
  if (
    tag === "vesa-100" ||
    tag === "vesa-75" ||
    tag === "vesa-200-plus" ||
    tag === "vesa-none"
  ) {
    return hasMonitorVesaFilterTag(gadget, tag as MonitorVesaFilterTag)
  }
  if (MONITOR_PANEL_FILTER_TAG_SET.has(tag)) {
    return matchesMonitorPanelFilterTag(gadget, tag as MonitorPanelFilterTag)
  }
  return inferMonitorFilterTags(gadget).includes(tag)
}
