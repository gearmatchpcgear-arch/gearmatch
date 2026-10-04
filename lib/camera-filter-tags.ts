import type { Gadget } from "@/lib/gadgets"
import { UNSPECIFIED_SPEC } from "@/lib/gadgets"
import { isFilterSpecFilled } from "@/lib/filter-match-utils"
import { getConnectionTerminalRowValue, resolveGadgetConnectionSource } from "@/lib/usb-connection-display"

export type CameraResolutionTag = "res-4k" | "res-2k" | "res-1080p" | "res-720-below"
export type CameraFovTag = "fov-wide" | "fov-standard" | "fov-narrow" | "fov-unknown"
export type CameraMicTag = "mic-built-in" | "mic-none"
export type CameraFocusTag = "focus-auto" | "focus-fixed" | "focus-manual"

export const CAMERA_RESOLUTION_LABELS: Record<CameraResolutionTag, string> = {
  "res-4k": "4K",
  "res-2k": "2K",
  "res-1080p": "1080p",
  "res-720-below": "720p 以下",
}

export const CAMERA_FOV_LABELS: Record<CameraFovTag, string> = {
  "fov-wide": "広角（90°以上）",
  "fov-standard": "標準（70°〜89°）",
  "fov-narrow": "狭角（69°以下）",
  "fov-unknown": "未記載・不明",
}

export const CAMERA_MIC_LABELS: Record<CameraMicTag, string> = {
  "mic-built-in": "内蔵マイクあり（デュアルマイク／ノイズキャンセリング含む）",
  "mic-none": "マイクなし / 外付け推奨",
}

export const CAMERA_FOCUS_LABELS: Record<CameraFocusTag, string> = {
  "focus-auto": "オートフォーカス",
  "focus-fixed": "固定焦点",
  "focus-manual": "マニュアルフォーカス",
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

/** 解像度フィールド（highlights / specGroups の「解像度」）を優先し、未記載時は tagline から推論 */
export function getCameraResolution(gadget: Gadget): string {
  const fromSpec = getLabeledValue(gadget, "解像度")
  if (fromSpec) return fromSpec

  const hay = `${gadget.tagline} ${gadget.name}`
  if (/2k|2\.5k|1440|2560\s*[x×]\s*1440|\bqhd\b|\bwqhd\b/i.test(hay) && !/4k|3840|2160|\buhd\b/i.test(hay)) {
    return "2K"
  }
  if (/4k\s*uhd|3840\s*[x×]\s*2160|\b4k\b/i.test(hay)) return "4K"
  if (/1080p\s*\/\s*60|1080p@60|1080\s*p\s*60|60\s*fps.*1080|1080.*60\s*fps/i.test(hay)) {
    return "1080p"
  }
  if (/1080|full\s*hd|fhd|1920\s*[x×]\s*1080/i.test(hay)) return "1080p"
  if (/720|hd\s*720|1280\s*[x×]\s*720/i.test(hay)) return "720p"

  return UNSPECIFIED_SPEC
}

export function classifyCameraResolution(gadget: Gadget): CameraResolutionTag | null {
  const fromSpec = getLabeledValue(gadget, "解像度")
  if (!fromSpec) return null

  const v = fromSpec.toLowerCase()
  if (/4k|3840|2160|\buhd\b/.test(v)) return "res-4k"
  if (/2k|2\.5k|1440|2560\s*[x×]\s*1440|\bqhd\b|\bwqhd\b/.test(v)) return "res-2k"
  if (/1080|fhd|1920\s*[x×]\s*1080|full\s*hd/.test(v)) return "res-1080p"
  if (/720|480|vga|360p|576p|640\s*[x×]\s*480/.test(v)) return "res-720-below"

  return null
}

export function getCameraFieldOfView(gadget: Gadget): string {
  return getLabeledValue(gadget, "画角") ?? UNSPECIFIED_SPEC
}

function parseFovDegrees(value: string): number[] {
  if (!value || value === UNSPECIFIED_SPEC) return []
  return [...value.matchAll(/(\d{2,3})\s*°/g)].map((m) => Number(m[1]))
}

export function classifyCameraFov(gadget: Gadget): CameraFovTag {
  const fromSpec = getCameraFieldOfView(gadget)
  const degrees = parseFovDegrees(fromSpec)

  if (degrees.length === 0) return "fov-unknown"

  const max = Math.max(...degrees)
  if (max >= 90) return "fov-wide"
  if (max >= 70) return "fov-standard"
  return "fov-narrow"
}

export function getCameraMicrophone(gadget: Gadget): string {
  return getLabeledValue(gadget, "マイク") ?? UNSPECIFIED_SPEC
}

function micValueImpliesBuiltIn(value: string) {
  if (!value || value === UNSPECIFIED_SPEC) return false
  if (/なし|無し|無\b|none|no mic|マイクなし|非搭載|外付け/i.test(value)) return false
  return /マイク|mic|内蔵/i.test(value)
}

export function classifyCameraMic(gadget: Gadget): CameraMicTag {
  const value = getCameraMicrophone(gadget)
  if (value === UNSPECIFIED_SPEC) return "mic-none"
  if (micValueImpliesBuiltIn(value)) return "mic-built-in"
  return "mic-none"
}

export function getCameraFocus(gadget: Gadget): string {
  return getLabeledValue(gadget, "フォーカス") ?? UNSPECIFIED_SPEC
}

export function classifyCameraFocus(gadget: Gadget): CameraFocusTag | null {
  if (gadget.category !== "camera") return null
  const text = getCameraFocus(gadget)
  if (text === UNSPECIFIED_SPEC) return null

  if (/オート|AF\b|autofocus|自動/i.test(text)) return "focus-auto"
  if (/マニュアル|manual|\bMF\b/i.test(text)) return "focus-manual"
  return "focus-fixed"
}

export function hasCameraFocusTag(gadget: Gadget, tag: CameraFocusTag): boolean {
  return gadget.category === "camera" && classifyCameraFocus(gadget) === tag
}

export function hasCameraResolutionTag(gadget: Gadget, tag: CameraResolutionTag): boolean {
  return gadget.category === "camera" && classifyCameraResolution(gadget) === tag
}

export function hasCameraFovTag(gadget: Gadget, tag: CameraFovTag): boolean {
  return gadget.category === "camera" && classifyCameraFov(gadget) === tag
}

export function hasCameraMicTag(gadget: Gadget, tag: CameraMicTag): boolean {
  return gadget.category === "camera" && classifyCameraMic(gadget) === tag
}

export const CAMERA_CARD_SPEC_LABELS = ["解像度", "画角", "フレームレート", "内蔵マイク"] as const

export function getCameraFrameRate(gadget: Gadget): string {
  const fromSpec = getLabeledValue(gadget, "フレームレート")
  if (fromSpec) return fromSpec

  const resolutionRaw = getLabeledValue(gadget, "解像度")
  if (resolutionRaw) {
    const fpsInResolution = resolutionRaw.match(/(\d+)\s*fps/i)
    if (fpsInResolution) return `${fpsInResolution[1]}fps`
  }

  const hay = `${gadget.tagline} ${gadget.name} ${gadget.highlights.map((h) => h.value).join(" ")}`
  for (const re of [/\/\s*(\d+)\s*fps/i, /@\s*(\d+)\s*fps/i, /\b(\d+)\s*fps\b/i]) {
    const match = hay.match(re)
    if (match) return `${match[1]}fps`
  }

  return UNSPECIFIED_SPEC
}

export function getCameraBuiltInMicCardDisplay(gadget: Gadget): string {
  return classifyCameraMic(gadget) === "mic-built-in" ? "あり" : "なし"
}

export function getCameraCardHighlights(gadget: Gadget): { label: string; value: string }[] {
  return [
    { label: "解像度", value: getCameraResolution(gadget) },
    { label: "画角", value: getCameraFieldOfView(gadget) },
    { label: "フレームレート", value: getCameraFrameRate(gadget) },
    { label: "内蔵マイク", value: getCameraBuiltInMicCardDisplay(gadget) },
  ]
}

/** USB単体以外（Wi-Fi / 2.4GHz / HDMI 等）の接続を持つカメラ */
const NON_USB_CONNECTION_PATTERN =
  /wi-?fi|2\.4\s*ghz|ワイヤレス|wireless|bluetooth|hdmi|lan\s*[\/／]|(?:^|[^a-z])lan(?:[^a-z]|$)|rs232|rs485|poe|イーサネット|ethernet/i

function getCameraConnectionStructuredText(gadget: Gadget): string {
  const parts: string[] = []
  const connectionSource = resolveGadgetConnectionSource(gadget)
  if (isFilterSpecFilled(connectionSource)) parts.push(connectionSource!)
  if (isFilterSpecFilled(gadget.connection)) parts.push(gadget.connection!)
  const terminalRow = getConnectionTerminalRowValue(gadget)
  if (isFilterSpecFilled(terminalRow)) parts.push(terminalRow!)
  if (gadget.cameraSpreadsheetITags?.length) parts.push(...gadget.cameraSpreadsheetITags)
  return parts.join(" ")
}

export function matchesCameraNonUsbConnection(gadget: Gadget): boolean {
  if (gadget.category !== "camera") return false
  const text = getCameraConnectionStructuredText(gadget)
  if (!text.trim()) return false
  return NON_USB_CONNECTION_PATTERN.test(text)
}

export function hasCameraNonUsbConnectionFilter(gadget: Gadget): boolean {
  return matchesCameraNonUsbConnection(gadget)
}
