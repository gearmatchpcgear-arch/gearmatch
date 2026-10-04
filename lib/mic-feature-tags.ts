import type { Gadget } from "./gadgets"
import { inferMicFilterTagsMerged, type MicFilterTag } from "./mic-filter-tags"
import {
  hasMicSpreadsheetJTag,
  hasMicSpreadsheetKTag,
  micFeatureTagsFromSpreadsheet,
} from "./mic-spreadsheet-tags"

/** マイク機能別タグ（絞り込み UI 表示ラベルと同一） */
export type MicFeatureTag =
  | "ミュートボタン（タッチミュート）"
  | "イヤホンジャック（ダイレクトモニタリング）"
  | "ゲインノブ（音量調節ノブ）"
  | "ノイズキャンセリング"
  | "ASMR"

/** テキスト推論・micFeatureTags から判定する機能タグ（J欄タグは除外） */
export type MicCoreFeatureTag =
  | "ミュートボタン（タッチミュート）"
  | "イヤホンジャック（ダイレクトモニタリング）"
  | "ゲインノブ（音量調節ノブ）"

export const MIC_FEATURE_TAGS: MicFeatureTag[] = [
  "ミュートボタン（タッチミュート）",
  "イヤホンジャック（ダイレクトモニタリング）",
  "ゲインノブ（音量調節ノブ）",
  "ノイズキャンセリング",
  "ASMR",
]

const MIC_CORE_FEATURE_TAGS: MicCoreFeatureTag[] = [
  "ミュートボタン（タッチミュート）",
  "イヤホンジャック（ダイレクトモニタリング）",
  "ゲインノブ（音量調節ノブ）",
]

function micHaystack(gadget: Gadget) {
  return [
    gadget.name,
    gadget.brand,
    gadget.tagline,
    gadget.connection,
    ...gadget.highlights.flatMap((h) => [h.label, h.value]),
    ...gadget.specGroups.flatMap((g) => g.rows.flatMap((r) => [r.label, r.value])),
  ]
    .join(" ")
    .toLowerCase()
}

function extractAsin(gadget: Gadget): string | null {
  const m = gadget.purchaseUrl.match(/\/dp\/([A-Z0-9]{10})/)
  return m?.[1] ?? null
}

function micTags(gadget: Gadget): MicFilterTag[] {
  return inferMicFilterTagsMerged(gadget)
}

function isUnspecified(value: string) {
  return !value || value === "—" || /非対応|なし|無/i.test(value)
}

function specRows(gadget: Gadget) {
  return gadget.specGroups.flatMap((g) => g.rows)
}

function hasSpecLabel(gadget: Gadget, labelRe: RegExp, valueRe?: RegExp) {
  return specRows(gadget).some((row) => {
    if (!labelRe.test(row.label)) return false
    if (valueRe) return valueRe.test(row.value) && !isUnspecified(row.value)
    return !isUnspecified(row.value)
  })
}

function hasHighlightLabel(gadget: Gadget, labelRe: RegExp, valueRe?: RegExp) {
  return gadget.highlights.some((row) => {
    if (!labelRe.test(row.label)) return false
    if (valueRe) return valueRe.test(row.value) && !isUnspecified(row.value)
    return !isUnspecified(row.value)
  })
}

function isHeadsetMic(tags: MicFilterTag[]) {
  return tags.includes("headset")
}

function hasMuteButton(hay: string, gadget: Gadget, tags: MicFilterTag[]) {
  if (
    hasHighlightLabel(gadget, /タップトゥミュート|ワンタッチミュート|ミュート/, /対応|あり|○|有/i) ||
    hasSpecLabel(gadget, /タップトゥミュート|ワンタッチミュート|ミュート/, /対応|あり|○|有/i)
  ) {
    return true
  }

  if (
    /ミュートボタン|ミュート機能|タップトゥミュート|tap.?to.?mute|静音機能|静音モード|ワンタッチミュート|ワンキーミュート|静電容量.*ミュート|タッチミュート/i.test(
      hay,
    )
  ) {
    return true
  }

  if (isHeadsetMic(tags) && /マイクミュート|ミュート機能|ミュート付/i.test(hay)) {
    return true
  }

  return false
}

function hasHeadphoneJack(hay: string, gadget: Gadget, tags: MicFilterTag[]) {
  const monitoringLabel =
    /ヘッドホン端子|イヤホン出力|ヘッドホン出力|モニター端子|イヤホン端子|ヘッドホン/i

  if (
    hasSpecLabel(gadget, monitoringLabel, /3\.5\s*mm|3\.5mm/i) ||
    hasHighlightLabel(gadget, monitoringLabel, /3\.5\s*mm|3\.5mm/i)
  ) {
    return true
  }

  if (
    /イヤホン出力|ヘッドホン端子|3\.5mm.*モニタ|ダイレクトモニタ|リアルタイム.*リスニ|モニター端子|ヘッドホン端子.*リアルタイム/i.test(
      hay,
    )
  ) {
    if (isHeadsetMic(tags) && !/ダイレクトモニタ|モニター端子|ヘッドホン端子|イヤホン出力/i.test(hay)) {
      return false
    }
    return true
  }

  if (/usb\s*\/\s*3\.5\s*mm|3\.5\s*mm.*(イヤホン|ヘッドホン|モニタ)|イヤホン.*3\.5\s*mm|ヘッドホン.*3\.5\s*mm/i.test(`${gadget.connection} ${hay}`)) {
    if (isHeadsetMic(tags)) return false
    if (/trs|カメラ|camera|出力のみ/i.test(hay) && !/モニタ|ヘッドホン|イヤホン/i.test(hay)) {
      return false
    }
    return true
  }

  return false
}

function hasGainKnob(hay: string, gadget: Gadget, tags: MicFilterTag[]) {
  if (
    hasHighlightLabel(gadget, /ゲイン/, /ノブ|調節|調整|ダイヤル|つまみ/i) ||
    hasSpecLabel(gadget, /ゲイン/, /ノブ|調節|調整|ダイヤル|つまみ/i)
  ) {
    return true
  }

  if (
    /ゲイン.*(ノブ|調節|調整|ダイヤル|つまみ)|マイクゲイン.*(ノブ|調節|調整)|ゲインノブ|gain.*knob|ボリューム.*(ノブ|つまみ|ダイヤル)|内蔵プリアンプ|プリアンプ.*(スイッチ|搭載)|sm7db/i.test(
      hay,
    )
  ) {
    return true
  }

  if (/音量調整|音量調節|音量コントロール/i.test(hay) && /ノブ|ダイヤル|つまみ|本体|マイク/i.test(hay)) {
    if (isHeadsetMic(tags) && !/ゲイン|マイク.*音量|mic gain/i.test(hay)) {
      return false
    }
    return true
  }

  return false
}

/** ASIN 別の機能タグ（Amazon / 公式スペックに基づく確定値） */
export const MIC_FEATURE_TAG_OVERRIDES: Partial<Record<string, MicCoreFeatureTag[]>> = {
  B07NZZZ746: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ], // HyperX QuadCast
  B08G8WH435: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ], // QuadCast S
  B0DXW278KB: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ], // QuadCast 2
  B0DG9X4WHW: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ], // QuadCast 2 S
  B0GQRSQ86L: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ], // Elgato Wave:3
  B0B823S1NR: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ], // AT2020USB-X
  B000CZ0R42: [
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ], // AT2020USB+
  B08KY7G1GV: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ], // Shure MV7
  B0CYYZ78NJ: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ], // Shure MV7+
  B0DDP2HT3F: ["ミュートボタン（タッチミュート）"], // Shure MV6
  B0CCSVYWMH: ["ゲインノブ（音量調節ノブ）"], // Shure SM7dB（内蔵プリアンプ）
  B0DNJGTMBK: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ], // FIFINE K688CT
  B0822PMBTZ: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ], // Blue Yeti
}

function explicitCoreFeatureTags(gadget: Gadget): MicCoreFeatureTag[] {
  const explicit = gadget.micFeatureTags ?? []
  return MIC_CORE_FEATURE_TAGS.filter((tag) => explicit.includes(tag))
}

export function inferMicCoreFeatureTags(gadget: Gadget): MicCoreFeatureTag[] {
  if (gadget.category !== "mic") return []

  const asin = extractAsin(gadget)
  if (asin && MIC_FEATURE_TAG_OVERRIDES[asin]) {
    return [...MIC_FEATURE_TAG_OVERRIDES[asin]!]
  }

  const hay = micHaystack(gadget)
  const tags = micTags(gadget)
  const featureTags = new Set<MicCoreFeatureTag>()

  if (hasMuteButton(hay, gadget, tags)) {
    featureTags.add("ミュートボタン（タッチミュート）")
  }
  if (hasHeadphoneJack(hay, gadget, tags)) {
    featureTags.add("イヤホンジャック（ダイレクトモニタリング）")
  }
  if (hasGainKnob(hay, gadget, tags)) {
    featureTags.add("ゲインノブ（音量調節ノブ）")
  }

  return MIC_CORE_FEATURE_TAGS.filter((t) => featureTags.has(t))
}

export function inferMicFeatureTagsMerged(gadget: Gadget): MicFeatureTag[] {
  if (gadget.category !== "mic") return []

  const explicit = explicitCoreFeatureTags(gadget)
  const inferred = inferMicCoreFeatureTags(gadget)
  const fromSheet = micFeatureTagsFromSpreadsheet(gadget)
  const core = MIC_CORE_FEATURE_TAGS.filter(
    (t) => explicit.includes(t) || inferred.includes(t) || fromSheet.includes(t),
  )

  const jTags: MicFeatureTag[] = []
  if (hasMicSpreadsheetJTag(gadget, "ノイズキャンセリング")) {
    jTags.push("ノイズキャンセリング")
  }
  if (hasMicSpreadsheetJTag(gadget, "ASMR")) {
    jTags.push("ASMR")
  }

  return [...core, ...jTags]
}

/** @deprecated inferMicCoreFeatureTags を使用 */
export function inferMicFeatureTags(gadget: Gadget): MicFeatureTag[] {
  return inferMicFeatureTagsMerged(gadget)
}

export function hasMicSpreadsheetNoiseCancelFilter(gadget: Gadget): boolean {
  return gadget.category === "mic" && hasMicSpreadsheetJTag(gadget, "ノイズキャンセリング")
}

export function hasMicSpreadsheetAsmrFilter(gadget: Gadget): boolean {
  return gadget.category === "mic" && hasMicSpreadsheetJTag(gadget, "ASMR")
}

export function hasMicFeatureTag(gadget: Gadget, tag: MicFeatureTag): boolean {
  if (gadget.category !== "mic") return false
  if (tag === "ノイズキャンセリング") return hasMicSpreadsheetNoiseCancelFilter(gadget)
  if (tag === "ASMR") return hasMicSpreadsheetAsmrFilter(gadget)
  return inferMicFeatureTagsMerged(gadget).includes(tag)
}
