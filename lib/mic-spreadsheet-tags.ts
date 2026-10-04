import type { Gadget } from "@/lib/gadgets"

/** スプレッドシート J欄（その他機能）の正規化ラベル */
export type MicSpreadsheetJTag = "ノイズキャンセリング" | "ASMR"

/** スプレッドシート K欄の正規化ラベル */
export type MicSpreadsheetKTag = "ミュート機能"

export const MIC_SPREADSHEET_J_TAGS: MicSpreadsheetJTag[] = ["ノイズキャンセリング", "ASMR"]

export const MIC_SPREADSHEET_K_TAGS: MicSpreadsheetKTag[] = ["ミュート機能"]

export const MIC_SPREADSHEET_J_TAG_LABELS: Record<MicSpreadsheetJTag, string> = {
  ノイズキャンセリング: "ノイズキャンセリング",
  ASMR: "ASMR",
}

export const MIC_SPREADSHEET_K_TAG_LABELS: Record<MicSpreadsheetKTag, string> = {
  ミュート機能: "ミュート機能",
}

const J_FILTER_IDS: Record<MicSpreadsheetJTag, `mic-sheet-j-${string}`> = {
  ノイズキャンセリング: "mic-sheet-j-noise-cancel",
  ASMR: "mic-sheet-j-asmr",
}

const K_FILTER_IDS: Record<MicSpreadsheetKTag, `mic-sheet-k-${string}`> = {
  ミュート機能: "mic-sheet-k-mute",
}

export type MicSpreadsheetJFilterId = (typeof J_FILTER_IDS)[MicSpreadsheetJTag]
export type MicSpreadsheetKFilterId = (typeof K_FILTER_IDS)[MicSpreadsheetKTag]
export type MicSpreadsheetFilterId = MicSpreadsheetJFilterId | MicSpreadsheetKFilterId

export function micSpreadsheetJFilterId(tag: MicSpreadsheetJTag): MicSpreadsheetJFilterId {
  return J_FILTER_IDS[tag]
}

export function micSpreadsheetKFilterId(tag: MicSpreadsheetKTag): MicSpreadsheetKFilterId {
  return K_FILTER_IDS[tag]
}

export function isMicSpreadsheetFilterId(id: string): id is MicSpreadsheetFilterId {
  return id.startsWith("mic-sheet-j-") || id.startsWith("mic-sheet-k-")
}

function isEmptyTag(value: string | undefined | null): boolean {
  if (!value) return true
  const t = value.trim()
  return !t || t === "-" || t === "—"
}

/** CSV J欄の生値 → 正規化タグ（空・「-」は除外） */
export function normalizeMicSpreadsheetJTag(raw: string | undefined | null): MicSpreadsheetJTag | null {
  if (isEmptyTag(raw)) return null
  const t = raw!.trim().normalize("NFKC")
  if (/ノイズキャンセ/i.test(t)) return "ノイズキャンセリング"
  if (/asmr|ＡＳＭＲ/i.test(t)) return "ASMR"
  return null
}

/** CSV K欄の生値 → 正規化タグ */
export function normalizeMicSpreadsheetKTag(raw: string | undefined | null): MicSpreadsheetKTag | null {
  if (isEmptyTag(raw)) return null
  const t = raw!.trim().normalize("NFKC")
  if (/ミュート/i.test(t)) return "ミュート機能"
  return null
}

export function getMicSpreadsheetJTags(gadget: Gadget): MicSpreadsheetJTag[] {
  if (gadget.category !== "mic") return []
  const explicit = gadget.micSpreadsheetJTags ?? []
  return MIC_SPREADSHEET_J_TAGS.filter((t) => explicit.includes(t))
}

export function getMicSpreadsheetKTags(gadget: Gadget): MicSpreadsheetKTag[] {
  if (gadget.category !== "mic") return []
  const explicit = gadget.micSpreadsheetKTags ?? []
  return MIC_SPREADSHEET_K_TAGS.filter((t) => explicit.includes(t))
}

export function hasMicSpreadsheetJTag(gadget: Gadget, tag: MicSpreadsheetJTag): boolean {
  return getMicSpreadsheetJTags(gadget).includes(tag)
}

export function hasMicSpreadsheetKTag(gadget: Gadget, tag: MicSpreadsheetKTag): boolean {
  return getMicSpreadsheetKTags(gadget).includes(tag)
}

export function micSpreadsheetFilterIdToLabel(id: MicSpreadsheetFilterId): string {
  if (id === "mic-sheet-j-noise-cancel") return MIC_SPREADSHEET_J_TAG_LABELS["ノイズキャンセリング"]
  if (id === "mic-sheet-j-asmr") return MIC_SPREADSHEET_J_TAG_LABELS.ASMR
  if (id === "mic-sheet-k-mute") return MIC_SPREADSHEET_K_TAG_LABELS["ミュート機能"]
  return id
}

export function micSpreadsheetFilterMatch(gadget: Gadget, id: MicSpreadsheetFilterId): boolean {
  if (gadget.category !== "mic") return false
  if (id === "mic-sheet-j-noise-cancel") return hasMicSpreadsheetJTag(gadget, "ノイズキャンセリング")
  if (id === "mic-sheet-j-asmr") return hasMicSpreadsheetJTag(gadget, "ASMR")
  if (id === "mic-sheet-k-mute") return hasMicSpreadsheetKTag(gadget, "ミュート機能")
  return false
}

/** J/K タグから既存 micFeatureTags へ反映する追加候補（J欄のノイズキャンセリングは含めない） */
export function micFeatureTagsFromSpreadsheet(gadget: Gadget): import("./mic-feature-tags").MicCoreFeatureTag[] {
  const out = new Set<import("./mic-feature-tags").MicCoreFeatureTag>()
  if (hasMicSpreadsheetKTag(gadget, "ミュート機能")) {
    out.add("ミュートボタン（タッチミュート）")
  }
  return [...out]
}
