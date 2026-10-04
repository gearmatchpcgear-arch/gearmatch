import type { Gadget } from "@/lib/gadgets"
import { UNSPECIFIED_SPEC } from "@/lib/gadgets"
import { isFilterSpecFilled } from "@/lib/filter-match-utils"
import { normalizeGamingChairMaterialDisplay } from "@/lib/spec-display-normalize"
import {
  formatShapeLabel,
  GAMING_CHAIR_SHAPE_DEFINED_FILTER_LABELS,
  gamingChairShapeMatchesDefinedFilter,
} from "@/lib/gaming-chair-shape-display"
import {
  formatGamingChairCsvOttoman,
  getGamingChairCsvRow,
} from "@/lib/gaming-chairs-csv-data"
import { GAMING_CHAIRS_CSV_BY_ID } from "@/lib/gaming-chairs-csv-data.generated"

export type GamingChairMaterialTag = "mat-pu" | "mat-mesh" | "mat-fabric" | "mat-leather"
export type GamingChairAdjustmentTag =
  | "adj-height"
  | "adj-tilt"
  | "adj-recline"
  | "adj-headrest"
  | "adj-lumbar"
  | "adj-armrest"
export type GamingChairReclineTag =
  | "recline-180"
  | "recline-150-175"
  | "recline-130-145"
  | "recline-under-129"
export type GamingChairFrameTag = "frame-steel" | "frame-alloy" | "frame-plastic" | "frame-other"
export type GamingChairOttomanTag = "ottoman-yes" | "ottoman-no"
export type GamingChairStyleTag =
  | "style-bucket"
  | "style-queen"
  | "style-floor"
  | "style-other"

export type GamingChairFilterTag =
  | GamingChairMaterialTag
  | GamingChairAdjustmentTag
  | GamingChairReclineTag
  | GamingChairFrameTag
  | GamingChairOttomanTag
  | GamingChairStyleTag

export const GAMING_CHAIR_MATERIAL_LABELS: Record<GamingChairMaterialTag, string> = {
  "mat-pu": "PUレザー（合成皮革）",
  "mat-mesh": "メッシュ",
  "mat-fabric": "ファブリック（布地）",
  "mat-leather": "本革（レザー）",
}

export const GAMING_CHAIR_MATERIAL_FILTER_TAGS: GamingChairMaterialTag[] = [
  "mat-pu",
  "mat-mesh",
  "mat-fabric",
  "mat-leather",
]

const GAMING_CHAIR_MATERIAL_TAG_SET = new Set<GamingChairFilterTag>(GAMING_CHAIR_MATERIAL_FILTER_TAGS)

export const GAMING_CHAIR_ADJUSTMENT_LABELS: Record<GamingChairAdjustmentTag, string> = {
  "adj-height": "座面の高さ調整",
  "adj-tilt": "座面の傾き調整（座面ロッキング/チルト）",
  "adj-recline": "リクライニング調整",
  "adj-headrest": "ヘッドレスト調整",
  "adj-lumbar": "ランバーサポート調整",
  "adj-armrest": "アームレスト調整（可動肘）",
}

export const GAMING_CHAIR_RECLINE_LABELS: Record<GamingChairReclineTag, string> = {
  "recline-180": "180°（フルフラット）",
  "recline-150-175": "150°〜175°",
  "recline-130-145": "130°〜145°",
  "recline-under-129": "129°以下 / 非対応",
}

export const GAMING_CHAIR_FRAME_CARD_LABEL = "フレームの種類"
export const GAMING_CHAIR_OTTOMAN_CARD_LABEL = "オットマン"

export const GAMING_CHAIR_FRAME_LABELS: Record<GamingChairFrameTag, string> = {
  "frame-steel": "スチール（鋼鉄）",
  "frame-alloy": "合金鋼",
  "frame-plastic": "強化プラスチック / 樹脂",
  "frame-other": "その他 / 不明",
}

export const GAMING_CHAIR_OTTOMAN_LABELS: Record<GamingChairOttomanTag, string> = {
  "ottoman-yes": "オットマン付き（収納式・足置きあり）",
  "ottoman-no": "オットマンなし",
}

/** 形状フィルター選択肢（サイドバー4項目） */
export const GAMING_CHAIR_SHAPE_DEFINED_FILTERS = GAMING_CHAIR_SHAPE_DEFINED_FILTER_LABELS

export const GAMING_CHAIR_SHAPE_FILTER_OPTIONS = [
  ...GAMING_CHAIR_SHAPE_DEFINED_FILTERS,
  "その他",
] as const

export type GamingChairShapeFilterOption = (typeof GAMING_CHAIR_SHAPE_FILTER_OPTIONS)[number]

export const GAMING_CHAIR_STYLE_FILTER_TAGS: GamingChairStyleTag[] = [
  "style-bucket",
  "style-queen",
  "style-floor",
  "style-other",
]

export const GAMING_CHAIR_STYLE_LABELS: Record<GamingChairStyleTag, string> = {
  "style-bucket": GAMING_CHAIR_SHAPE_DEFINED_FILTERS[0],
  "style-queen": GAMING_CHAIR_SHAPE_DEFINED_FILTERS[1],
  "style-floor": GAMING_CHAIR_SHAPE_DEFINED_FILTERS[2],
  "style-other": "その他",
}

/** @deprecated 互換エイリアス */
export const SHAPE_FILTER_OPTIONS = GAMING_CHAIR_SHAPE_FILTER_OPTIONS

const EMPTY_SHAPE_MARKERS = new Set(["", "—", "-", "未記載", "不明"])

/** フィルター判定に使う形状（CSV `shape` を最優先） */
export function getGamingChairFilterShape(gadget: Gadget): string {
  const csv = getGamingChairCsvRow(gadget.id)
  const fromCsv = csv?.shape?.trim()
  if (fromCsv && !EMPTY_SHAPE_MARKERS.has(fromCsv)) return fromCsv

  const fromSpec = getLabeledValue(gadget, "形状")
  if (fromSpec && !EMPTY_SHAPE_MARKERS.has(fromSpec)) return fromSpec

  return ""
}

export function gamingChairMatchesShapeFilterOption(
  chairShape: string,
  selected: GamingChairShapeFilterOption | string,
): boolean {
  const shape = chairShape || ""

  if (selected === "その他") {
    return !GAMING_CHAIR_SHAPE_DEFINED_FILTERS.some((defined) =>
      gamingChairShapeMatchesDefinedFilter(shape, defined),
    )
  }

  if (selected === "ハイバック") {
    return gamingChairShapeMatchesDefinedFilter(shape, "ハイバック")
  }

  return gamingChairShapeMatchesDefinedFilter(shape, selected)
}

export function filterGadgetsByGamingChairShape<T extends Gadget>(
  chairs: T[],
  selectedShapes: string[],
): T[] {
  if (selectedShapes.length === 0) return chairs

  return chairs.filter((chair) => {
    const shape = getGamingChairFilterShape(chair)
    return selectedShapes.some((selected) => gamingChairMatchesShapeFilterOption(shape, selected))
  })
}

function getLabeledValue(gadget: Gadget, label: string): string | null {
  for (const h of gadget.highlights) {
    if (h.label === label && h.value !== UNSPECIFIED_SPEC) return h.value.trim()
  }
  for (const group of gadget.specGroups) {
    for (const row of group.rows) {
      if (row.label === label && row.value !== UNSPECIFIED_SPEC) return row.value.trim()
    }
  }
  return null
}

export function parseMaxReclineDegreesFromText(text: string): number | null {
  const hay = normalizeAsciiDigits(text)

  const angles: number[] = []

  for (const m of hay.matchAll(
    /(?:リクライニング|リクライナ|recline|reclining|可倒|最大)[^\d]{0,12}(\d{2,3})\s*(?:度|°)/gi,
  )) {
    const n = Number(m[1])
    if (n >= 100 && n <= 180) angles.push(n)
  }

  for (const m of hay.matchAll(
    /(\d{2,3})\s*(?:度|°)\s*(?:リクライ|recline|可倒)/gi,
  )) {
    const n = Number(m[1])
    if (n >= 100 && n <= 180) angles.push(n)
  }

  for (const m of hay.matchAll(/(\d{2,3})\s*度(?:\s*(?:リクライ|recline|可倒|まで))/gi)) {
    const n = Number(m[1])
    if (n >= 100 && n <= 180) angles.push(n)
  }

  for (const m of hay.matchAll(/(\d{2,3})\s*[-~〜～]\s*(\d{2,3})\s*(?:度|°)/gi)) {
    for (const raw of [Number(m[1]), Number(m[2])]) {
      if (raw >= 100 && raw <= 180) angles.push(raw)
    }
  }

  if (/フルフラット|180\s*度|180\s*°|完全(?:寝|なら)/i.test(hay)) {
    angles.push(180)
  }

  if (/リクライ|recline|可倒|フルフラット/i.test(hay)) {
    for (const m of hay.matchAll(/(\d{2,3})\s*(?:度|°)/gi)) {
      const n = Number(m[1])
      if (n >= 100 && n <= 180) angles.push(n)
    }
  }

  if (angles.length === 0) return null
  return Math.max(...angles)
}

function normalizeAsciiDigits(text: string): string {
  return text.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
}

export function parseMaxReclineDegrees(gadget: Gadget): number | null {
  if (gadget.maxRecliningAngle && gadget.maxRecliningAngle !== UNSPECIFIED_SPEC) {
    const fromProp = parseMaxReclineDegreesFromText(gadget.maxRecliningAngle)
    if (fromProp !== null) return fromProp
  }

  const fromLabel = getLabeledValue(gadget, "最大リクライニング角度")
  if (fromLabel) {
    const fromLabelDeg = parseMaxReclineDegreesFromText(fromLabel)
    if (fromLabelDeg !== null) return fromLabelDeg
  }

  return null
}

export function formatMaxRecliningAngleDisplay(degrees: number | null): string {
  if (degrees === null) return UNSPECIFIED_SPEC
  if (degrees >= 180) return "最大180°（フルフラット）"
  return `最大${degrees}°`
}

export function getGamingChairMaxRecliningAngle(gadget: Gadget): string {
  const fromLabel = getLabeledValue(gadget, "最大リクライニング角度")
  if (fromLabel) return fromLabel

  const degrees = parseMaxReclineDegrees(gadget)
  return formatMaxRecliningAngleDisplay(degrees)
}

export function normalizeFrameMaterialValue(raw: string): string | null {
  const t = raw.trim()
  if (!t || t === UNSPECIFIED_SPEC) return null

  if (/合金鋼|合成鋼|alloy\s*steel|合金/i.test(t)) return "合金鋼"
  if (
    /強化プラスチック|強化樹脂|樹脂|nylon|ナイロン|abs|plastic|プラスチック|ポリカーボネート/i.test(t) &&
    !/pu|レザー/i.test(t)
  ) {
    return "強化プラスチック"
  }
  if (/スチール|steel|鋼鉄|鉄骨|iron|メタル|metal/i.test(t) && !/合金|stainless|ステンレス|合成鋼/i.test(t)) {
    return "スチール（鋼鉄）"
  }
  if (/木製|wood|ウッド/i.test(t)) return null
  if (/アルミ|aluminum|aluminium|マグネシウム|magnesium/i.test(t)) return "アルミ合金"
  if (/^フレーム:\s*(.+)/.test(t)) return normalizeFrameMaterialValue(t.replace(/^フレーム:\s*/, ""))
  return null
}

const FRAME_MATERIAL_CARD_DISPLAY: Record<string, string> = {
  合金鋼: "合金鋼フレーム",
  "スチール（鋼鉄）": "スチールフレーム（鋼製）",
  強化プラスチック: "強化樹脂フレーム",
  アルミ合金: "アルミ合金フレーム",
}

export function formatFrameMaterialDisplay(raw: string | null): string {
  if (!raw) return UNSPECIFIED_SPEC
  const cleaned = raw.replace(/^フレーム:\s*/, "").trim()
  if (!cleaned || cleaned === UNSPECIFIED_SPEC) return UNSPECIFIED_SPEC
  return FRAME_MATERIAL_CARD_DISPLAY[cleaned] ?? `${cleaned}フレーム`
}

export function getGamingChairFrameMaterial(gadget: Gadget): string {
  if (gadget.frameMaterial && gadget.frameMaterial !== UNSPECIFIED_SPEC) {
    return formatFrameMaterialDisplay(gadget.frameMaterial)
  }

  const fromLabel = getLabeledValue(gadget, "フレームの種類")
  if (fromLabel) return formatFrameMaterialDisplay(fromLabel.replace(/^フレーム:\s*/, ""))

  const inferred = inferFrameMaterialValue(gadget)
  return inferred ? formatFrameMaterialDisplay(inferred) : UNSPECIFIED_SPEC
}

function inferFrameMaterialValue(gadget: Gadget): string | null {
  if (/^nionik$/i.test(gadget.brand.trim())) return "合金鋼"
  return null
}

function inferFrameTag(value: string | null): GamingChairFrameTag {
  if (!value) return "frame-other"
  if (value === "合金鋼") return "frame-alloy"
  if (value === "強化プラスチック") return "frame-plastic"
  if (value === "スチール（鋼鉄）") return "frame-steel"
  return "frame-other"
}

/** @deprecated 絞り込みには `getGamingChairOttomanFilterValue` を使用 */
export function inferHasOttomanFromText(text: string): boolean {
  const hay = text
  if (/オットマン(?:なし|無し|不要|非付|無)|(?:without|no)\s*ottoman/i.test(hay)) {
    return false
  }
  if (
    /オットマン|ottoman|収納式(?:の)?足置|足置き(?:付|あり|一体)|フットレスト|foot\s*rest|脚置き|leg\s*rest/i.test(
      hay,
    )
  ) {
    return true
  }
  return false
}

export type GamingChairOttomanFilterValue = "あり" | "なし"

function parseOttomanYesNo(raw: string): GamingChairOttomanFilterValue | null {
  const t = raw.trim()
  if (!t || t === UNSPECIFIED_SPEC) return null
  if (t === "あり" || /^付/i.test(t)) return "あり"
  if (t === "なし" || /^無/i.test(t)) return "なし"
  return null
}

/** 絞り込み・カード表示の正: CSV → hasOttoman → オットマンラベル（あり/なしのみ） */
export function getGamingChairOttomanFilterValue(
  gadget: Gadget,
): GamingChairOttomanFilterValue | null {
  if (gadget.category !== "gaming-chair") return null

  const csv = getGamingChairCsvRow(gadget.id)
  if (csv?.ottoman?.trim()) {
    const formatted = formatGamingChairCsvOttoman(csv.ottoman)
    const fromCsv = parseOttomanYesNo(formatted === UNSPECIFIED_SPEC ? csv.ottoman : formatted)
    if (fromCsv) return fromCsv
  }

  if (typeof gadget.hasOttoman === "boolean") {
    return gadget.hasOttoman ? "あり" : "なし"
  }

  const text = getLabeledValue(gadget, "オットマン")
  if (text) {
    const fromLabel = parseOttomanYesNo(text)
    if (fromLabel) return fromLabel
  }

  return null
}

export function gamingChairHasOttoman(gadget: Gadget): boolean {
  return getGamingChairOttomanFilterValue(gadget) === "あり"
}

function inferOttomanTags(gadget: Gadget): GamingChairOttomanTag[] {
  const value = getGamingChairOttomanFilterValue(gadget)
  if (value === "あり") return ["ottoman-yes"]
  if (value === "なし") return ["ottoman-no"]
  return []
}

function inferFrameTags(gadget: Gadget): GamingChairFrameTag[] {
  let value: string | null = null
  if (gadget.frameMaterial) {
    value = normalizeFrameMaterialValue(gadget.frameMaterial)
  }
  if (!value) {
    const label = getLabeledValue(gadget, "フレームの種類")
    if (label) value = normalizeFrameMaterialValue(label.replace(/^フレーム:\s*/, ""))
  }
  if (!value) value = inferFrameMaterialValue(gadget)
  return [inferFrameTag(value)]
}

function getGamingChairMaterialStructuredText(gadget: Gadget): string | null {
  const fromCsv = GAMING_CHAIRS_CSV_BY_ID[gadget.id]?.material?.trim()
  if (fromCsv) return fromCsv
  return getLabeledValue(gadget, "素材")
}

/** 素材文字列から絞り込み用素材タグを1つだけ決定（CSV・カード表示の素材が正） */
export function inferGamingChairMaterialTagFromText(material: string): GamingChairMaterialTag | null {
  const hay = material.trim()
  if (!hay) return null

  if (/本革|genuine leather|real leather|天然皮革/i.test(hay) && !/pu|合成|pvc/i.test(hay)) {
    return "mat-leather"
  }
  if (
    /メッシュ|\bmesh\b|通気性メッシュ|breathable mesh|フルメッシュ|メッシュ座面|メッシュチェア/i.test(
      hay,
    )
  ) {
    return "mat-mesh"
  }
  if (/ファブリック|布地|クロス|\bfabric\b|velvet|ベルベット|スエード/i.test(hay)) {
    return "mat-fabric"
  }
  if (
    /puレザー|pu皮革|合成皮革|pvc|フェイクレザー|pu\s*leather|レザー調|炭素繊維レザー|高級pu|上質pu|puレザ/i.test(
      hay,
    )
  ) {
    return "mat-pu"
  }
  if (/(?:^|[^本])レザー|\bleather\b/i.test(hay) && !/pu|合成|本革/i.test(hay)) {
    return "mat-pu"
  }
  return null
}

export function getCanonicalGamingChairMaterialTag(gadget: Gadget): GamingChairMaterialTag | null {
  if (gadget.category !== "gaming-chair") return null
  const text = getGamingChairMaterialStructuredText(gadget)
  if (!text) return null
  return inferGamingChairMaterialTagFromText(text)
}

function getGamingChairAdjustmentStructuredText(gadget: Gadget): string {
  const parts: string[] = []
  for (const label of [
    "座面昇降",
    "チルト",
    "リクライニング",
    "ヘッドレスト",
    "ランバー",
    "アームレスト",
    "調整機能",
  ]) {
    const value = getLabeledValue(gadget, label)
    if (value) parts.push(value)
  }

  for (const group of gadget.specGroups) {
    for (const row of group.rows) {
      if (/昇降|チルト|リクライ|ヘッド|ランバー|アーム|調整/i.test(row.label) && isFilterSpecFilled(row.value)) {
        parts.push(row.value.trim())
      }
    }
  }

  return parts.join(" ")
}

function inferMaterialTags(gadget: Gadget): GamingChairMaterialTag[] {
  const tag = getCanonicalGamingChairMaterialTag(gadget)
  return tag ? [tag] : []
}

function inferAdjustmentTagsFromText(hay: string): GamingChairAdjustmentTag[] {
  const tags: GamingChairAdjustmentTag[] = []
  if (/高さ調整|座面昇降|昇降式|ガスリフト|gas lift|height adjust/i.test(hay)) {
    tags.push("adj-height")
  }
  if (/座面.*傾|チルト|tilt|ロッキング|rocking|座面ロッキング/i.test(hay)) {
    tags.push("adj-tilt")
  }
  if (/リクライニング|リクライナ|recline|背もたれ.*角度|135°|160°|180°/i.test(hay)) {
    tags.push("adj-recline")
  }
  if (/ヘッドレスト|頭枕|headrest/i.test(hay)) tags.push("adj-headrest")
  if (/ランバー|腰当|lumbar/i.test(hay)) tags.push("adj-lumbar")
  if (/アームレスト|肘置|4d|3d|2d.*アーム|可動肘|armrest/i.test(hay)) {
    tags.push("adj-armrest")
  }
  return tags
}

function inferAdjustmentTags(gadget: Gadget): GamingChairAdjustmentTag[] {
  const text = getGamingChairAdjustmentStructuredText(gadget)
  if (!text.trim()) return []
  return inferAdjustmentTagsFromText(text)
}

function inferReclineTag(degrees: number | null): GamingChairReclineTag {
  if (degrees === null || degrees <= 129) return "recline-under-129"
  if (degrees >= 180) return "recline-180"
  if (degrees >= 150) return "recline-150-175"
  if (degrees >= 130) return "recline-130-145"
  return "recline-under-129"
}

function inferReclineTags(gadget: Gadget): GamingChairReclineTag[] {
  return [inferReclineTag(parseMaxReclineDegrees(gadget))]
}

function inferStyleTags(gadget: Gadget): GamingChairStyleTag[] {
  const shape = getGamingChairFilterShape(gadget)
  return GAMING_CHAIR_STYLE_FILTER_TAGS.filter((tag) =>
    gamingChairMatchesShapeFilterOption(shape, GAMING_CHAIR_STYLE_LABELS[tag]),
  )
}

function inferGamingChairFilterTags(gadget: Gadget): GamingChairFilterTag[] {
  if (gadget.category !== "gaming-chair") return []

  return [
    ...inferMaterialTags(gadget),
    ...inferAdjustmentTags(gadget),
    ...inferReclineTags(gadget),
    ...inferOttomanTags(gadget),
    ...inferStyleTags(gadget),
  ]
}

export function inferGamingChairFilterTagsMerged(gadget: Gadget): GamingChairFilterTag[] {
  if (gadget.category !== "gaming-chair") return []
  const explicit = gadget.gamingChairFilterTags ?? []
  const inferred = inferGamingChairFilterTags(gadget)
  let merged = [...new Set([...explicit, ...inferred])]

  if (typeof gadget.hasOttoman === "boolean") {
    merged = merged.filter((t) => t !== (gadget.hasOttoman ? "ottoman-no" : "ottoman-yes"))
  } else if (explicit.includes("ottoman-no")) {
    merged = merged.filter((t) => t !== "ottoman-yes")
  } else if (explicit.includes("ottoman-yes")) {
    merged = merged.filter((t) => t !== "ottoman-no")
  }

  const legacyStyleMap: Record<string, GamingChairStyleTag> = {
    "style-office": "style-queen",
  }
  merged = merged.map((t) => legacyStyleMap[t] ?? t)

  const canonicalMaterial = getCanonicalGamingChairMaterialTag(gadget)
  merged = merged.filter((t) => !GAMING_CHAIR_MATERIAL_TAG_SET.has(t))
  if (canonicalMaterial) {
    merged.push(canonicalMaterial)
  }

  return merged
}

export function hasGamingChairFilterTag(gadget: Gadget, tag: GamingChairFilterTag): boolean {
  if (tag === "ottoman-yes") {
    return getGamingChairOttomanFilterValue(gadget) === "あり"
  }
  if (tag === "ottoman-no") {
    return getGamingChairOttomanFilterValue(gadget) === "なし"
  }
  if ((GAMING_CHAIR_STYLE_FILTER_TAGS as readonly string[]).includes(tag)) {
    const shape = getGamingChairFilterShape(gadget)
    return gamingChairMatchesShapeFilterOption(
      shape,
      GAMING_CHAIR_STYLE_LABELS[tag as GamingChairStyleTag],
    )
  }
  return inferGamingChairFilterTagsMerged(gadget).includes(tag)
}

export function getGamingChairMaterial(gadget: Gadget): string {
  const fromLabel = getLabeledValue(gadget, "素材")
  if (fromLabel) return normalizeGamingChairMaterialDisplay(fromLabel)

  const tags = inferGamingChairFilterTagsMerged(gadget)
  if (tags.includes("mat-leather")) return GAMING_CHAIR_MATERIAL_LABELS["mat-leather"]
  if (tags.includes("mat-mesh")) return GAMING_CHAIR_MATERIAL_LABELS["mat-mesh"]
  if (tags.includes("mat-fabric")) return GAMING_CHAIR_MATERIAL_LABELS["mat-fabric"]
  if (tags.includes("mat-pu")) return GAMING_CHAIR_MATERIAL_LABELS["mat-pu"]
  return UNSPECIFIED_SPEC
}

export function getGamingChairStyle(gadget: Gadget): string {
  const fromShape = getGamingChairFilterShape(gadget)
  if (fromShape) return formatShapeLabel(fromShape)
  return UNSPECIFIED_SPEC
}

export { formatShapeLabel } from "@/lib/gaming-chair-shape-display"
