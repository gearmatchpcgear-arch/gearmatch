import type { Gadget } from "./gadgets"
import { inferMicFilterTagsMerged, type MicFilterTag } from "./mic-filter-tags"

/** マイク用途別タグ（絞り込み UI 表示ラベルと同一） */
export type MicUseTag =
  | "Web会議・オンライン授業・通話"
  | "ゲーム実況・配信・ラジオ録音"
  | "歌・楽器の録音（DTM）"
  | "Vlog・動画撮影（屋外）"

export const MIC_USE_TAGS: MicUseTag[] = [
  "Web会議・オンライン授業・通話",
  "ゲーム実況・配信・ラジオ録音",
  "歌・楽器の録音（DTM）",
  "Vlog・動画撮影（屋外）",
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

function micTags(gadget: Gadget): MicFilterTag[] {
  return inferMicFilterTagsMerged(gadget)
}

function extractAsin(gadget: Gadget): string | null {
  const m = gadget.purchaseUrl.match(/\/dp\/([A-Z0-9]{10})/)
  return m?.[1] ?? null
}

function hasPattern(hay: string, re: RegExp) {
  return re.test(hay)
}

function isCardioid(hay: string) {
  if (/全指向|omni|360|双指向|bidirectional|ステレオ/i.test(hay)) return false
  return /単一指向|カーディオイド|cardioid|unidirectional|スーパーカーディオイド|hypercardioid/i.test(
    hay,
  )
}

function isUsb(hay: string, connection: string) {
  return /usb|type-c|type c|lightning/i.test(`${hay} ${connection}`)
}

function hasMuteControl(hay: string) {
  return /ミュート|mute|タップトゥミュート|tap.to.mute/i.test(hay)
}

function hasGainVolumeControl(hay: string) {
  return /ゲイン|gain|音量調|volume|ボリューム|monitoring/i.test(hay)
}

function isStreamingProduct(hay: string, name: string) {
  return (
    /sm7b|sm7db|quadcast|solocast|yeti|wave:?3|wave:3|at2020usb|podcast|ポッドキャスト|配信|実況|ストリーミング|streamer|ラジオ/i.test(
      `${hay} ${name}`,
    ) || /hyperx|elgato wave|maono.*pd/i.test(hay)
  )
}

function isRecordingStudio(hay: string, name: string, connection: string) {
  return (
    /at2020|at4040|at2035|at2040|at875|sm58|sm57|sm7b|beta\s*5|e[\s-]?9|xm8500|dtm|宅録|レコーディング|studio|ボーカル|楽器/i.test(
      `${hay} ${name} ${connection}`,
    ) && !/カラオケ|karaoke|ピンマイク|clip/i.test(hay)
  )
}

function isVlogOutdoor(hay: string, tags: MicFilterTag[]) {
  if (tags.includes("pin") || tags.includes("wireless")) {
    if (/ピン|ラベリア|clip|lavali|wireless go|dji mic|mic mini|ピンマイク/i.test(hay)) {
      return true
    }
  }
  return (
    /vlog|動画撮影|カメラ用|ガンマイク|shotgun|videomic|ウインドスクリーン|防風|windscreen|ecm-|am7|wireless go|ワイヤレスピン/i.test(
      hay,
    ) && !/会議|conference|スピーカーフォン/i.test(hay)
  )
}

function isWebMeeting(hay: string, connection: string, tags: MicFilterTag[]) {
  if (tags.includes("conference")) return true
  if (
    hasPattern(hay, /会議|通話|teams|zoom|telework|テレワーク|オンライン授業|ハンズフリー|拡声|スピーカーフォン|speakerphone|web会議|在宅勤務/)
  ) {
    return true
  }
  if (tags.includes("headset") && /usb|bluetooth|有線/i.test(`${hay} ${connection}`)) {
    return true
  }
  if (isUsb(hay, connection) && isCardioid(hay)) return true
  if (isUsb(hay, connection) && /ノイズキャンセ|noise cancel|anc/i.test(hay)) return true
  if (/mv7|at2020usb|spmc10|mm-mcu|emeat|speakerphone/i.test(hay)) return true
  return false
}

function isStreaming(hay: string, name: string, connection: string, tags: MicFilterTag[]) {
  if (isStreamingProduct(hay, name)) return true
  if (hasMuteControl(hay) && (isUsb(hay, connection) || tags.includes("stand"))) return true
  if (hasGainVolumeControl(hay) && isUsb(hay, connection) && tags.includes("condenser")) {
    return true
  }
  if (tags.includes("condenser") && tags.includes("stand") && /ゲーム|配信|実況|youtube/i.test(hay)) {
    return true
  }
  return false
}

function isDtm(hay: string, name: string, connection: string, tags: MicFilterTag[]) {
  if (tags.includes("headset") || tags.includes("conference")) return false
  if (tags.includes("pin") && !tags.includes("dynamic")) return false
  if (isRecordingStudio(hay, name, connection)) return true
  if (tags.includes("condenser") && /xlr/i.test(`${hay} ${connection}`) && !isUsb(hay, connection)) {
    return true
  }
  if (tags.includes("dynamic") && !/カラオケ|karaoke|uhf|ワイヤレスマイク 2人用/i.test(hay)) {
    if (/xlr|ボーカル|vocal|live|ライブ|ステージ/i.test(`${hay} ${connection}`)) return true
  }
  return false
}

/** ASIN 別の用途タグ（Amazon / 公式スペックに基づく確定値） */
export const MIC_USE_TAG_OVERRIDES: Partial<Record<string, MicUseTag[]>> = {
  B0002E4Z8M: ["ゲーム実況・配信・ラジオ録音", "歌・楽器の録音（DTM）"], // SM7B
  B0B823S1NR: ["Web会議・オンライン授業・通話", "ゲーム実況・配信・ラジオ録音"], // AT2020USB-X
  B000CZ0R42: ["Web会議・オンライン授業・通話", "ゲーム実況・配信・ラジオ録音"], // AT2020USB+
  B08KY7G1GV: ["Web会議・オンライン授業・通話", "ゲーム実況・配信・ラジオ録音"], // Shure MV7
  B0CYYZ78NJ: ["Web会議・オンライン授業・通話", "ゲーム実況・配信・ラジオ録音", "歌・楽器の録音（DTM）"], // Shure MV7+
  B08G8WH435: ["ゲーム実況・配信・ラジオ録音"], // QuadCast S
  B0DXW278KB: ["ゲーム実況・配信・ラジオ録音"], // QuadCast 2
  B0DG9X4WHW: ["ゲーム実況・配信・ラジオ録音"], // QuadCast 2 S
  B0GQRSQ86L: ["ゲーム実況・配信・ラジオ録音"], // Elgato Wave:3
  B0822PMBTZ: ["Web会議・オンライン授業・通話", "ゲーム実況・配信・ラジオ録音"], // Blue Yeti
  B0FLKJ7FH7: ["Web会議・オンライン授業・通話", "ゲーム実況・配信・ラジオ録音"], // SoloCast 2
  B0006H92QK: ["歌・楽器の録音（DTM）"], // AT2020
  B0002D0BQ8: ["歌・楽器の録音（DTM）"], // AT4040
  B000NAXCC0: ["歌・楽器の録音（DTM）"], // e945
  B0000AQ6SC: ["歌・楽器の録音（DTM）"], // SM58
  B09FF8426V: ["Web会議・オンライン授業・通話"], // キングジム SPMC10 系
  B0G39C97WQ: ["Vlog・動画撮影（屋外）"], // DJI Mic Mini 2
  B004KVIZFM: ["Vlog・動画撮影（屋外）"], // Sony ECM-TL3
  B005M2HDA6: ["Vlog・動画撮影（屋外）"], // Sony ECM-PCV80U
  B08P411XR5: ["Vlog・動画撮影（屋外）"], // ZOOM Am7
  B0BQHHZ1QQ: ["歌・楽器の録音（DTM）", "ゲーム実況・配信・ラジオ録音"], // RODE NT1 第5世代
}

export function inferMicUseTags(gadget: Gadget): MicUseTag[] {
  if (gadget.category !== "mic") return []

  const asin = extractAsin(gadget)
  if (asin && MIC_USE_TAG_OVERRIDES[asin]) {
    return [...MIC_USE_TAG_OVERRIDES[asin]!]
  }

  const hay = micHaystack(gadget)
  const tags = micTags(gadget)
  const name = gadget.name
  const connection = gadget.connection
  const useTags = new Set<MicUseTag>()

  if (isWebMeeting(hay, connection, tags)) {
    useTags.add("Web会議・オンライン授業・通話")
  }
  if (isStreaming(hay, name, connection, tags)) {
    useTags.add("ゲーム実況・配信・ラジオ録音")
  }
  if (isDtm(hay, name, connection, tags)) {
    useTags.add("歌・楽器の録音（DTM）")
  }
  if (isVlogOutdoor(hay, tags)) {
    useTags.add("Vlog・動画撮影（屋外）")
  }

  return MIC_USE_TAGS.filter((t) => useTags.has(t))
}

export function inferMicUseTagsMerged(gadget: Gadget): MicUseTag[] {
  if (gadget.category !== "mic") return []
  const explicit = gadget.micUseTags ?? []
  const inferred = inferMicUseTags(gadget)
  return MIC_USE_TAGS.filter((t) => explicit.includes(t) || inferred.includes(t))
}

export function hasMicUseTag(gadget: Gadget, tag: MicUseTag): boolean {
  return inferMicUseTagsMerged(gadget).includes(tag)
}
