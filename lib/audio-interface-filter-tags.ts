import type { Gadget } from "@/lib/gadgets"
import { getAudioInterfacePcConnectionFilterTags } from "./audio-interface-pc-connection"

/** オーディオIF 主な用途 */
export type AudioInterfacePrimaryUse =
  | "ライブ配信・VoIP"
  | "歌唱・ボーカル録音"
  | "楽器録音・バンド"
  | "DTM・楽曲制作"

/** フィルターIDと1:1対応 */
export type AudioInterfaceFilterTag =
  | "use-streaming"
  | "use-vocal"
  | "use-instrument"
  | "use-dtm"
  | "feat-direct-monitoring"
  | "feat-loopback"
  | "feat-phantom"
  | "conn-usb-c"
  | "conn-usb-b"
  | "conn-bluetooth"
  | "conn-thunderbolt"
  | "conn-35mm"
  | "sr-48-95"
  | "sr-96-191"
  | "sr-192-plus"
  | "bit-16"
  | "bit-24"
  | "bit-32"
  | "bit-32-float"
  | "sys-win"
  | "sys-mac"
  | "sys-ios"
  | "sys-android"
  | "sys-linux"
  | "input-xlr"
  | "input-multi"

export const AI_FILTER_TAG_LABELS: Record<AudioInterfaceFilterTag, string> = {
  "use-streaming": "ライブ配信・VoIP",
  "use-vocal": "歌唱・ボーカル録音",
  "use-instrument": "楽器録音・バンド",
  "use-dtm": "DTM・楽曲制作",
  "feat-direct-monitoring": "ダイレクトモニタリング対応",
  "feat-loopback": "ループバック機能対応",
  "feat-phantom": "ファンタム電源 (+48V) 対応",
  "conn-usb-c": "USB-C",
  "conn-usb-b": "USB-B",
  "conn-bluetooth": "Bluetooth",
  "conn-thunderbolt": "Thunderbolt",
  "conn-35mm": "3.5mm",
  "sr-48-95": "48kHz~95kHz",
  "sr-96-191": "96kHz~191kHz",
  "sr-192-plus": "192kHz以上",
  "bit-16": "16-bit",
  "bit-24": "24-bit",
  "bit-32": "32-bit",
  "bit-32-float": "32-bit float",
  "sys-win": "Windows",
  "sys-mac": "macOS",
  "sys-ios": "iOS",
  "sys-android": "Android",
  "sys-linux": "Linux",
  "input-xlr": "XLR入力あり",
  "input-multi": "2入力以上",
}

const HIDDEN_AUDIO_INTERFACE_FILTER_TAGS = new Set<AudioInterfaceFilterTag>([
  "use-streaming",
  "use-vocal",
  "use-instrument",
  "use-dtm",
  "feat-direct-monitoring",
  "feat-loopback",
  "feat-phantom",
])

function aiHaystack(gadget: Gadget): string {
  return [
    gadget.name,
    gadget.tagline,
    gadget.connection,
    gadget.connectionType ?? "",
    gadget.inputs ?? "",
    gadget.phantomPower ?? "",
    gadget.systemRequirements ?? "",
    gadget.samplingRate ?? "",
    gadget.bitDepth ?? "",
    ...(gadget.primaryUses ?? []),
    ...gadget.highlights.flatMap((h) => [h.label, h.value]),
    ...gadget.specGroups.flatMap((g) => g.rows.flatMap((r) => [r.label, r.value])),
  ]
    .join(" ")
    .toLowerCase()
}

function isSupported(value: boolean | "対応" | "非対応" | undefined): boolean {
  if (value === true || value === "対応") return true
  if (value === false || value === "非対応") return false
  return false
}

function inferConnectionTags(gadget: Gadget): AudioInterfaceFilterTag[] {
  return getAudioInterfacePcConnectionFilterTags(gadget)
}

function inferSamplingRateTags(gadget: Gadget): AudioInterfaceFilterTag[] {
  const tag = getAudioInterfaceSamplingRateRangeTag(gadget)
  return tag ? [tag] : []
}

function inferBitDepthTagsFromText(hay: string): AudioInterfaceFilterTag[] {
  const tags: AudioInterfaceFilterTag[] = []
  if (/32[\s-]?bit\s*float|32bit float|32-bit float/i.test(hay)) {
    tags.push("bit-32-float")
  } else if (/32[\s-]?bit|32bit/i.test(hay)) {
    tags.push("bit-32")
  }
  if (/24[\s-]?bit|24bit/i.test(hay)) tags.push("bit-24")
  if (/16[\s-]?bit|16bit/i.test(hay)) tags.push("bit-16")
  return tags
}

function inferBitDepthTags(gadget: Gadget): AudioInterfaceFilterTag[] {
  const bit = resolveAudioInterfaceBitDepthOnly(gadget)
  if (bit === UNSPECIFIED_SPEC) return []
  return inferBitDepthTagsFromText(bit)
}

/** ガジェットが対応する最大サンプリングレート (kHz) */
export function getMaxSampleRateKhz(gadget: Gadget): number {
  const hz = getMaxSampleRateHz(gadget)
  return hz > 0 ? hz / 1000 : 0
}

/** ガジェットが対応する最大サンプリングレート (Hz) — フィルター判定用（構造化スペックのみ） */
function getMaxSampleRateHzForFilter(gadget: Gadget): number {
  const rateText = resolveAudioInterfaceSamplingRateOnly(gadget)
  if (rateText === UNSPECIFIED_SPEC) return 0

  const rates = [...rateText.matchAll(/(\d{2,3}(?:\.\d+)?)\s*khz/gi)].map((m) => Number(m[1]) * 1000)
  let peak = rates.length ? Math.max(...rates) : 0
  if (/44\.1\s*khz|44100/i.test(rateText)) peak = Math.max(peak, 44100)
  return peak
}

/** ガジェットが対応する最大サンプリングレート (Hz) */
export function getMaxSampleRateHz(gadget: Gadget): number {
  const structuredPeak = getMaxSampleRateHzForFilter(gadget)
  if (structuredPeak > 0) return structuredPeak

  const hay = `${gadget.samplingRate ?? ""} ${aiHaystack(gadget)}`
  const rates = [...hay.matchAll(/(\d{2,3}(?:\.\d+)?)\s*khz/gi)].map((m) => Number(m[1]) * 1000)
  let peak = rates.length ? Math.max(...rates) : 0
  if (/44\.1\s*khz|44100/i.test(hay)) peak = Math.max(peak, 44100)
  return peak
}

export type AudioInterfaceSamplingRateRangeTag = "sr-48-95" | "sr-96-191" | "sr-192-plus"

/** 最大サンプリングレートに対応する範囲タグ（フィルター用） */
export function getAudioInterfaceSamplingRateRangeTag(
  gadget: Gadget,
): AudioInterfaceSamplingRateRangeTag | null {
  const hz = getMaxSampleRateHzForFilter(gadget)
  if (hz >= 192_000) return "sr-192-plus"
  if (hz >= 96_000) return "sr-96-191"
  if (hz >= 48_000) return "sr-48-95"
  return null
}

export function matchesAudioInterfaceSamplingRateRange(
  gadget: Gadget,
  tag: AudioInterfaceSamplingRateRangeTag,
): boolean {
  return getAudioInterfaceSamplingRateRangeTag(gadget) === tag
}

function inferFeatureTags(gadget: Gadget): AudioInterfaceFilterTag[] {
  const tags: AudioInterfaceFilterTag[] = []
  const hay = aiHaystack(gadget)

  if (isSupported(gadget.directMonitoring) || /ダイレクトモニタ|direct monitor|dspmix|monitor mix/i.test(hay)) {
    tags.push("feat-direct-monitoring")
  }
  if (isSupported(gadget.loopback) || /loopback|ループバック/i.test(hay)) {
    tags.push("feat-loopback")
  }
  if (isPhantomPowerSupported(gadget)) {
    tags.push("feat-phantom")
  }
  return tags
}

function inferUseTags(gadget: Gadget): AudioInterfaceFilterTag[] {
  const uses = gadget.primaryUses ?? []
  const tags: AudioInterfaceFilterTag[] = []
  const hay = aiHaystack(gadget)

  const has = (label: AudioInterfacePrimaryUse, re: RegExp, tag: AudioInterfaceFilterTag) => {
    if (uses.includes(label) || re.test(hay)) tags.push(tag)
  }

  has("ライブ配信・VoIP", /配信|streaming|voip|live stream|bridge cast|ag0/i, "use-streaming")
  has("歌唱・ボーカル録音", /ボーカル|vocal|歌|マイク/i, "use-vocal")
  has("楽器録音・バンド", /楽器|ギター|guitar|hi-z|バンド|instrument/i, "use-instrument")
  has("DTM・楽曲制作", /dtm|daw|cubase|ableton|制作|recording|rec/i, "use-dtm")

  return tags
}

function getRawSystemRequirementsHaystack(gadget: Gadget): string {
  const parts: string[] = []
  if (gadget.systemRequirements && gadget.systemRequirements !== UNSPECIFIED_SPEC) {
    parts.push(gadget.systemRequirements)
  }
  for (const highlight of gadget.highlights) {
    if (highlight.label === "システム要件" && highlight.value !== UNSPECIFIED_SPEC) {
      parts.push(highlight.value)
    }
  }
  for (const group of gadget.specGroups) {
    const row = group.rows.find((r) => r.label === "システム要件")
    if (row?.value && row.value !== UNSPECIFIED_SPEC) {
      parts.push(row.value)
    }
  }
  return parts.join(" ")
}

function inferSystemTags(gadget: Gadget): AudioInterfaceFilterTag[] {
  const hay = getRawSystemRequirementsHaystack(gadget)
  if (!hay.trim()) return []

  const tags: AudioInterfaceFilterTag[] = []
  if (/windows\s*[\d./]*|windows|\bwin\b/i.test(hay)) tags.push("sys-win")
  if (/macos|\bmac\b/i.test(hay)) tags.push("sys-mac")
  if (/\bios\b/i.test(hay)) tags.push("sys-ios")
  if (/\bandroid\b/i.test(hay)) tags.push("sys-android")
  if (/\blinux\b/i.test(hay)) tags.push("sys-linux")
  return tags
}

function inferInputTags(gadget: Gadget): AudioInterfaceFilterTag[] {
  const text = getAudioInterfaceCardSpec(gadget, "入力端子と数")
  if (text === UNSPECIFIED_SPEC) return []

  const tags: AudioInterfaceFilterTag[] = []
  if (/xlr/i.test(text)) tags.push("input-xlr")
  const connectorSegments = text.split(/[,、]/).filter((part) => part.trim().length > 0)
  const hasMultiCount = /×[2-9]|2in|4in|[2-9]入力|[2-9]in|\(2\/|\(4\//i.test(text)
  const hasMultiConnectors = connectorSegments.length >= 2
  if (hasMultiCount || hasMultiConnectors) tags.push("input-multi")
  return tags
}

export function inferAudioInterfaceFilterTags(gadget: Gadget): AudioInterfaceFilterTag[] {
  if (gadget.category !== "audio-interface") return []

  const explicit = (gadget.audioInterfaceFilterTags ?? []).filter(
    (tag) => !HIDDEN_AUDIO_INTERFACE_FILTER_TAGS.has(tag),
  )
  const inferred = [
    ...inferConnectionTags(gadget),
    ...inferSamplingRateTags(gadget),
    ...inferBitDepthTags(gadget),
    ...inferSystemTags(gadget),
    ...inferInputTags(gadget),
  ]
  return [...new Set([...explicit, ...inferred])]
}

const AUDIO_INTERFACE_BIT_DEPTH_TAGS = new Set<AudioInterfaceFilterTag>([
  "bit-16",
  "bit-24",
  "bit-32",
  "bit-32-float",
])

const AUDIO_INTERFACE_SAMPLING_RATE_TAGS = new Set<AudioInterfaceFilterTag>([
  "sr-48-95",
  "sr-96-191",
  "sr-192-plus",
])

export function hasAudioInterfaceFilterTag(
  gadget: Gadget,
  tag: AudioInterfaceFilterTag,
): boolean {
  if (AUDIO_INTERFACE_BIT_DEPTH_TAGS.has(tag)) {
    return inferBitDepthTags(gadget).includes(tag)
  }
  if (AUDIO_INTERFACE_SAMPLING_RATE_TAGS.has(tag)) {
    return getAudioInterfaceSamplingRateRangeTag(gadget) === tag
  }
  return inferAudioInterfaceFilterTags(gadget).includes(tag)
}

export const UNSPECIFIED_SPEC = "—"

function resolvePhantomPowerFromField(phantomPower?: string): "supported" | "unsupported" | "unknown" {
  const value = (phantomPower ?? "").trim()
  if (!value || value === UNSPECIFIED_SPEC) return "unknown"
  if (/非対応|なし|not supported|no phantom|without phantom/i.test(value)) return "unsupported"
  if (/対応|\+48\s*v|\+24\s*v|48v|24v|phantom power/i.test(value)) return "supported"
  return "unknown"
}

/** カード表示・フィルター共通: ファンタム電源 (+48V) 対応と判定できるか */
export function isPhantomPowerSupported(gadget: Gadget): boolean {
  const display = getAudioInterfaceCardSpec(gadget, "ファンタム電源")
  if (display !== UNSPECIFIED_SPEC) {
    if (/非対応/.test(display)) return false
    if (/\+48|48v|\+24|24v|対応/i.test(display)) return true
    return false
  }
  return resolvePhantomPowerFromField(gadget.phantomPower) === "supported"
}

export function isPhantomPowerUnsupported(gadget: Gadget): boolean {
  const display = getAudioInterfaceCardSpec(gadget, "ファンタム電源")
  if (display !== UNSPECIFIED_SPEC && /非対応/.test(display)) return true
  return resolvePhantomPowerFromField(gadget.phantomPower) === "unsupported"
}

/** サンプリングレートのみ正規化（例: 192kHz） */
export function normalizeSamplingRateDisplay(value?: string): string {
  const raw = (value ?? "").trim()
  if (!raw || raw === UNSPECIFIED_SPEC) return UNSPECIFIED_SPEC

  if (/\//.test(raw)) {
    const ratePart = raw
      .split("/")
      .map((part) => part.trim())
      .find((part) => /khz/i.test(part) || /^\d+(\.\d+)?$/.test(part))
    if (ratePart) return normalizeSamplingRateDisplay(ratePart)
  }

  if (/bit/i.test(raw) && !/khz/i.test(raw)) return UNSPECIFIED_SPEC

  if (/khz/i.test(raw)) return raw.replace(/\s*khz/i, "kHz")
  if (/^\d+(\.\d+)?$/.test(raw)) return `${raw}kHz`
  return raw
}

/** ビット深度のみ正規化（例: 24-bit, 32-bit float） */
export function normalizeBitDepthDisplay(value?: string): string {
  const raw = (value ?? "").trim()
  if (!raw || raw === UNSPECIFIED_SPEC) return UNSPECIFIED_SPEC
  if (/32[\s-]?bit\s*float|32bit float/i.test(raw)) return "32-bit float"
  if (/32[\s-]?bit|32bit/i.test(raw)) return "32-bit"
  if (/24[\s-]?bit|24bit/i.test(raw)) return "24-bit"
  if (/16[\s-]?bit|16bit/i.test(raw)) return "16-bit"
  if (/\//.test(raw)) {
    const bitPart = raw
      .split("/")
      .map((part) => part.trim())
      .find((part) => /bit/i.test(part))
    if (bitPart) return normalizeBitDepthDisplay(bitPart)
  }
  return raw
}

/** ビット深度 + サンプリングレート → 旧カード表示（例: 24-bit / 192kHz）— 互換用 */
export function formatAudioInterfaceSamplingRateDisplay(
  bitDepth?: string,
  samplingRate?: string,
): string {
  const bit = normalizeBitDepthDisplay(bitDepth)
  const rate = normalizeSamplingRateDisplay(samplingRate)
  const hasBit = bit !== UNSPECIFIED_SPEC
  const hasRate = rate !== UNSPECIFIED_SPEC
  if (!hasBit && !hasRate) return UNSPECIFIED_SPEC
  if (hasBit && hasRate) return `${bit} / ${rate}`
  if (hasBit) return bit
  return rate
}

function resolveAudioInterfaceSamplingRateOnly(gadget: Gadget): string {
  if (gadget.samplingRate && gadget.samplingRate !== UNSPECIFIED_SPEC) {
    return normalizeSamplingRateDisplay(gadget.samplingRate)
  }

  for (const group of gadget.specGroups) {
    const rateRow = group.rows.find((r) => /サンプリング|サンプルレート/i.test(r.label))
    if (rateRow?.value && rateRow.value !== UNSPECIFIED_SPEC) {
      return normalizeSamplingRateDisplay(rateRow.value)
    }
  }

  for (const key of ["サンプリングレート", "サンプルレート"]) {
    const fromHighlight = gadget.highlights.find((h) => h.label === key)?.value
    if (fromHighlight && fromHighlight !== UNSPECIFIED_SPEC) {
      const parsed = normalizeSamplingRateDisplay(fromHighlight)
      if (parsed !== UNSPECIFIED_SPEC) return parsed
    }
  }

  return UNSPECIFIED_SPEC
}

function resolveAudioInterfaceBitDepthOnly(gadget: Gadget): string {
  if (gadget.bitDepth && gadget.bitDepth !== UNSPECIFIED_SPEC) {
    return normalizeBitDepthDisplay(gadget.bitDepth)
  }

  for (const group of gadget.specGroups) {
    const bitRow = group.rows.find((r) => /ビット深度|bit depth/i.test(r.label))
    if (bitRow?.value && bitRow.value !== UNSPECIFIED_SPEC) {
      return normalizeBitDepthDisplay(bitRow.value)
    }
  }

  for (const key of ["サンプリングレート", "サンプルレート", "ビット深度"]) {
    const fromHighlight = gadget.highlights.find((h) => h.label === key)?.value
    if (fromHighlight && fromHighlight !== UNSPECIFIED_SPEC) {
      const parsed = normalizeBitDepthDisplay(fromHighlight)
      if (parsed !== UNSPECIFIED_SPEC) return parsed
    }
  }

  return UNSPECIFIED_SPEC
}

function readAudioInterfaceInputSpec(gadget: Gadget): string {
  for (const group of gadget.specGroups) {
    const row = group.rows.find((r) => r.label === "入力端子" || r.label === "入力端子と数")
    if (row?.value && row.value !== UNSPECIFIED_SPEC) return row.value
  }
  if (gadget.inputs && gadget.inputs !== UNSPECIFIED_SPEC) return gadget.inputs
  return UNSPECIFIED_SPEC
}

/** 詳細モーダル用：カード省略前の全文スペック */
export function getAudioInterfaceDetailSpec(
  gadget: Gadget,
  label: "入力端子と数" | "サンプリングレート" | "ファンタム電源" | "システム要件",
): string {
  if (label === "入力端子と数") {
    const fromField = readAudioInterfaceInputSpec(gadget)
    if (fromField !== UNSPECIFIED_SPEC) return fromField
  }
  if (label === "システム要件") {
    if (gadget.systemRequirements && gadget.systemRequirements !== UNSPECIFIED_SPEC) {
      return gadget.systemRequirements
    }
  }
  if (label === "ファンタム電源") {
    if (gadget.phantomPower && gadget.phantomPower !== UNSPECIFIED_SPEC) {
      return gadget.phantomPower
    }
  }
  if (label === "サンプリングレート") {
    return resolveAudioInterfaceSamplingRateOnly(gadget)
  }
  return getAudioInterfaceCardSpec(gadget, label)
}

/** 詳細モーダル用：ビット深度 */
export function getAudioInterfaceBitDepthSpec(gadget: Gadget): string {
  return resolveAudioInterfaceBitDepthOnly(gadget)
}

/** カード表示用：主要4スペックの値取得 */
export function getAudioInterfaceCardSpec(
  gadget: Gadget,
  label: "入力端子と数" | "サンプリングレート" | "ファンタム電源" | "システム要件",
): string {
  const highlightAliases: Record<typeof label, string[]> = {
    入力端子と数: ["入力端子と数", "入力端子"],
    サンプリングレート: ["サンプリングレート", "サンプルレート"],
    ファンタム電源: ["ファンタム電源"],
    システム要件: ["システム要件"],
  }

  for (const key of highlightAliases[label]) {
    const fromHighlight = gadget.highlights.find((h) => h.label === key)?.value
    if (fromHighlight && fromHighlight !== UNSPECIFIED_SPEC) {
      if (label === "サンプリングレート") {
        const parsed = normalizeSamplingRateDisplay(fromHighlight)
        if (parsed !== UNSPECIFIED_SPEC) return parsed
        continue
      }
      return fromHighlight
    }
  }

  if (label === "入力端子と数") {
    const fromField = readAudioInterfaceInputSpec(gadget)
    if (fromField !== UNSPECIFIED_SPEC) return fromField
  }
  if (label === "サンプリングレート") {
    return resolveAudioInterfaceSamplingRateOnly(gadget)
  }
  if (label === "ファンタム電源") {
    if (gadget.phantomPower && gadget.phantomPower !== UNSPECIFIED_SPEC) {
      if (/非対応/.test(gadget.phantomPower)) return "非対応"
      if (/対応|\+48\s*v|48v/i.test(gadget.phantomPower)) return "+48V対応"
      return gadget.phantomPower
    }
  }
  if (label === "システム要件") {
    if (gadget.systemRequirements && gadget.systemRequirements !== UNSPECIFIED_SPEC) {
      return gadget.systemRequirements
        .replace(/Windows 10\/11|Windows|Win/gi, "Win")
        .replace(/macOS[^,]*/gi, "Mac")
        .replace(/iOS[^,]*/gi, "iOS")
        .replace(/Android[^,]*/gi, "Android")
        .replace(/,\s*/g, " / ")
    }
  }

  return UNSPECIFIED_SPEC
}
