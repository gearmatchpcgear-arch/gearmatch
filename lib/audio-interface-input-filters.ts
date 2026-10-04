import type { Gadget } from "@/lib/gadgets"
import { getAudioInterfaceCardSpec } from "@/lib/audio-interface-filter-tags"
import { hasAudioInterfaceBluetoothSupport } from "@/lib/audio-interface-pc-connection"

/** 入力端子絞り込み filter ID（ai-input-{key}） */
export type AudioInterfaceInputFilterId = `ai-input-${string}`

export const AUDIO_INTERFACE_INPUT_FILTER_MIN_COUNT = 2

export const AUDIO_INTERFACE_INPUT_4PLUS_FILTER_KEY = "4plus"
export const AUDIO_INTERFACE_INPUT_4PLUS_FILTER_LABEL = "入力4以上"

const UNSPECIFIED = "—"

type InputConnectorDefinition = {
  key: string
  label: string
  patterns: RegExp[]
}

/** カード「入力端子と数」から検出する主要端子（上から優先してラベル用に使用） */
const INPUT_CONNECTOR_TYPES: InputConnectorDefinition[] = [
  {
    key: "xlr-trs-combo",
    label: "XLR/TRSコンボ",
    patterns: [
      /xlr\s*\/\s*trs/i,
      /xlr\/trsコンボ/i,
      /コンボ入力/i,
      /\(combo\)/i,
      /,\s*1\/4\s*"\s*trs\s*\×\s*\d+\s*\(combo\)/i,
    ],
  },
  {
    key: "6-35mm",
    label: "6.35mm",
    patterns: [/6\.35\s*mm/i, /6\.3\s*mm/i, /1\/4\s*["']/i, /1\/4"/i, /trs\(1\/4/i],
  },
  {
    key: "trrs",
    label: "3.5mm",
    patterns: [/3\.5\s*mm/i, /trrs/i],
  },
  {
    key: "rca",
    label: "RCA",
    patterns: [/rca/i],
  },
  {
    key: "xlr",
    label: "XLR",
    patterns: [],
  },
  {
    key: "adat",
    label: "ADAT",
    patterns: [/adat/i],
  },
  {
    key: "bluetooth",
    label: "Bluetooth",
    patterns: [/bluetooth/i],
  },
]

const CONNECTOR_LABEL_BY_KEY = new Map(
  INPUT_CONNECTOR_TYPES.map((def) => [def.key, def.label]),
)

function parseInputPortTokens(text: string): string[] {
  return text
    .split(/[,、]+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function isStandaloneXlrPortToken(token: string): boolean {
  const trimmed = token.trim()
  if (/^XLR$/i.test(trimmed)) return true
  if (/^XLR\s*[×x]\s*\d+$/i.test(trimmed)) return true
  return false
}

/** 入力端子表記に独立した XLR 端子（XLR/TRSコンボのみは false）が含まれるか */
export function hasStandaloneXlrInputPort(text: string | null | undefined): boolean {
  if (!text || text === UNSPECIFIED) return false
  return parseInputPortTokens(text).some(isStandaloneXlrPortToken)
}

function getAudioInterfaceInputPortText(gadget: Gadget): string {
  return getAudioInterfaceInputSpecText(gadget) ?? gadget.inputs?.trim() ?? ""
}

/** カード表示用の入力端子テキスト */
export function getAudioInterfaceInputSpecText(gadget: Gadget): string | null {
  if (gadget.category !== "audio-interface") return null
  const text = getAudioInterfaceCardSpec(gadget, "入力端子と数")
  if (!text || text === UNSPECIFIED) return null
  return text
}

/** 入力端子フィルター判定用テキスト（入力端子表記 + PC接続等） */
function getAudioInterfaceInputFilterHaystack(gadget: Gadget): string {
  if (gadget.category !== "audio-interface") return ""
  return [
    getAudioInterfaceInputSpecText(gadget),
    gadget.inputs,
    gadget.connection,
    gadget.connectionType,
  ]
    .filter(Boolean)
    .join(" ")
}

/** 入力端子表記に含まれる端子キー一覧 */
export function detectAudioInterfaceInputConnectorKeys(gadget: Gadget): string[] {
  const inputPortText = getAudioInterfaceInputPortText(gadget)
  const haystack = getAudioInterfaceInputFilterHaystack(gadget)
  if (!inputPortText && !haystack) return []

  return INPUT_CONNECTOR_TYPES.filter((def) => {
    if (def.key === "bluetooth") return hasAudioInterfaceBluetoothSupport(gadget)
    if (def.key === "xlr") return hasStandaloneXlrInputPort(inputPortText)
    const textForMatch = def.key === "xlr-trs-combo" ? inputPortText : haystack
    if (!textForMatch) return false
    return def.patterns.some((pattern) => pattern.test(textForMatch))
  }).map((def) => def.key)
}

export function parseAudioInterfaceInputTierCount(tier?: string): number | null {
  const text = tier?.trim()
  if (!text) return null
  const labeled = text.match(/(\d+)\s*入力/)
  if (labeled) return Number(labeled[1])
  if (/^\d+$/.test(text)) return Number(text)
  return null
}

function inferInputCountFromText(text: string): number | null {
  const counts: number[] = []
  for (const match of text.matchAll(/[×x]\s*(\d+)/gi)) {
    const n = Number(match[1])
    if (Number.isFinite(n)) counts.push(n)
  }
  for (const match of text.matchAll(/(\d+)\s*入力/gi)) {
    const n = Number(match[1])
    if (Number.isFinite(n)) counts.push(n)
  }
  for (const match of text.matchAll(/(\d+)\s*in\b/gi)) {
    const n = Number(match[1])
    if (Number.isFinite(n)) counts.push(n)
  }
  if (counts.length === 0) return null
  return Math.max(...counts)
}

/** J列（audioInterfaceInputTier）または入力端子表記から「入力4以上」を判定 */
export function hasAudioInterfaceInput4Plus(gadget: Gadget): boolean {
  if (gadget.category !== "audio-interface") return false

  const tier = gadget.audioInterfaceInputTier?.trim()
  if (tier) {
    const fromTier = parseAudioInterfaceInputTierCount(tier)
    if (fromTier !== null) return fromTier >= 4
    return true
  }

  const text = [gadget.inputs, getAudioInterfaceInputSpecText(gadget)].filter(Boolean).join(" ")
  const inferred = inferInputCountFromText(text)
  return inferred !== null && inferred >= 4
}

export function audioInterfaceInputFilterId(key: string): AudioInterfaceInputFilterId {
  return `ai-input-${key}`
}

export function isAudioInterfaceInputFilterId(id: string): id is AudioInterfaceInputFilterId {
  return id.startsWith("ai-input-") && id.length > "ai-input-".length
}

export function connectorKeyFromAudioInterfaceInputFilterId(
  id: AudioInterfaceInputFilterId,
): string {
  return id.slice("ai-input-".length)
}

export function matchesAudioInterfaceInputFilterId(
  gadget: Gadget,
  filterId: AudioInterfaceInputFilterId,
): boolean {
  const key = connectorKeyFromAudioInterfaceInputFilterId(filterId)
  if (key === AUDIO_INTERFACE_INPUT_4PLUS_FILTER_KEY) {
    return hasAudioInterfaceInput4Plus(gadget)
  }
  return detectAudioInterfaceInputConnectorKeys(gadget).includes(key)
}

export type AudioInterfaceInputFilterOption = {
  id: AudioInterfaceInputFilterId
  label: string
  count: number
  match: (gadget: Gadget) => boolean
}

/** 登録数が minCount 以上の入力端子選択肢を生成 */
export function buildMajorAudioInterfaceInputFilters(
  gadgets: Gadget[],
  minCount = AUDIO_INTERFACE_INPUT_FILTER_MIN_COUNT,
): AudioInterfaceInputFilterOption[] {
  const counts = new Map<string, number>()

  for (const gadget of gadgets) {
    if (gadget.category !== "audio-interface") continue
    for (const key of detectAudioInterfaceInputConnectorKeys(gadget)) {
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  const connectorFilters = INPUT_CONNECTOR_TYPES.filter((def) => {
    const threshold =
      def.key === "trrs" || def.key === "adat" || def.key === "bluetooth" ? 1 : minCount
    return (counts.get(def.key) ?? 0) >= threshold
  }).map((def) => {
    const count = counts.get(def.key) ?? 0
    const id = audioInterfaceInputFilterId(def.key)
    return {
      id,
      label: CONNECTOR_LABEL_BY_KEY.get(def.key) ?? def.label,
      count,
      match: (gadget: Gadget) => detectAudioInterfaceInputConnectorKeys(gadget).includes(def.key),
    }
  })

  const fourPlusCount = gadgets.filter(
    (gadget) => gadget.category === "audio-interface" && hasAudioInterfaceInput4Plus(gadget),
  ).length

  if (fourPlusCount === 0) return connectorFilters

  return [
    {
      id: audioInterfaceInputFilterId(AUDIO_INTERFACE_INPUT_4PLUS_FILTER_KEY),
      label: AUDIO_INTERFACE_INPUT_4PLUS_FILTER_LABEL,
      count: fourPlusCount,
      match: hasAudioInterfaceInput4Plus,
    },
    ...connectorFilters,
  ]
}
