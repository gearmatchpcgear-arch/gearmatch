import type { Gadget } from "@/lib/gadgets"

/** スプレッドシート I列（特徴・タグ）の正規化ラベル */
export type CameraSpreadsheetITag =
  | "AI自動追跡"
  | "AIオートフレーミング"
  | "自動暗視機能"
  | "書画カメラ"

export const CAMERA_SPREADSHEET_I_TAGS: CameraSpreadsheetITag[] = [
  "AI自動追跡",
  "AIオートフレーミング",
  "自動暗視機能",
  "書画カメラ",
]

export const CAMERA_SPREADSHEET_I_TAG_LABELS: Record<CameraSpreadsheetITag, string> = {
  AI自動追跡: "AI自動追跡",
  AIオートフレーミング: "AIオートフレーミング",
  自動暗視機能: "自動暗視機能",
  書画カメラ: "書画カメラ",
}

const I_FILTER_IDS: Record<CameraSpreadsheetITag, `cam-sheet-i-${string}`> = {
  AI自動追跡: "cam-sheet-i-ai-tracking",
  AIオートフレーミング: "cam-sheet-i-ai-framing",
  自動暗視機能: "cam-sheet-i-night-vision",
  書画カメラ: "cam-sheet-i-document",
}

export type CameraSpreadsheetIFilterId = (typeof I_FILTER_IDS)[CameraSpreadsheetITag]

export function cameraSpreadsheetIFilterId(tag: CameraSpreadsheetITag): CameraSpreadsheetIFilterId {
  return I_FILTER_IDS[tag]
}

export function isCameraSpreadsheetFilterId(id: string): id is CameraSpreadsheetIFilterId {
  return id.startsWith("cam-sheet-i-")
}

function isEmptyTag(value: string | undefined | null): boolean {
  if (!value) return true
  const t = value.trim()
  return !t || t === "-" || t === "—"
}

/** CSV I列の生値 → 正規化タグ（空・「-」は除外） */
export function normalizeCameraSpreadsheetITag(
  raw: string | undefined | null,
): CameraSpreadsheetITag | null {
  if (isEmptyTag(raw)) return null
  const t = raw.trim().normalize("NFKC")
  if (/書画/i.test(t)) return "書画カメラ"
  if (/自動暗視|夜間視/i.test(t)) return "自動暗視機能"
  if (/オートフレーミング|auto\s*fram/i.test(t)) return "AIオートフレーミング"
  if (/自動追跡|auto\s*track|ai追跡/i.test(t)) return "AI自動追跡"
  return null
}

export function getCameraSpreadsheetITags(gadget: Gadget): CameraSpreadsheetITag[] {
  if (gadget.category !== "camera") return []
  const explicit = gadget.cameraSpreadsheetITags ?? []
  return CAMERA_SPREADSHEET_I_TAGS.filter((t) => explicit.includes(t))
}

export function hasCameraSpreadsheetITag(gadget: Gadget, tag: CameraSpreadsheetITag): boolean {
  return getCameraSpreadsheetITags(gadget).includes(tag)
}

export function cameraSpreadsheetFilterMatch(gadget: Gadget, id: CameraSpreadsheetIFilterId): boolean {
  if (gadget.category !== "camera") return false
  if (id === "cam-sheet-i-ai-tracking") return hasCameraSpreadsheetITag(gadget, "AI自動追跡")
  if (id === "cam-sheet-i-ai-framing") return hasCameraSpreadsheetITag(gadget, "AIオートフレーミング")
  if (id === "cam-sheet-i-night-vision") return hasCameraSpreadsheetITag(gadget, "自動暗視機能")
  if (id === "cam-sheet-i-document") return hasCameraSpreadsheetITag(gadget, "書画カメラ")
  return false
}
