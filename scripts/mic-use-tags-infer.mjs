/** Node script mirror of lib/mic-use-tags.ts + mic-filter-tags inference */

export const MIC_USE_TAGS = [
  "Web会議・オンライン授業・通話",
  "ゲーム実況・配信・ラジオ録音",
  "歌・楽器の録音（DTM）",
  "Vlog・動画撮影（屋外）",
]

export const MIC_USE_TAG_OVERRIDES = {
  B0002E4Z8M: ["ゲーム実況・配信・ラジオ録音", "歌・楽器の録音（DTM）"],
  B0B823S1NR: ["Web会議・オンライン授業・通話", "ゲーム実況・配信・ラジオ録音"],
  B000CZ0R42: ["Web会議・オンライン授業・通話", "ゲーム実況・配信・ラジオ録音"],
  B08KY7G1GV: ["Web会議・オンライン授業・通話", "ゲーム実況・配信・ラジオ録音"],
  B08G8WH435: ["ゲーム実況・配信・ラジオ録音"],
  B0DXW278KB: ["ゲーム実況・配信・ラジオ録音"],
  B0GQRSQ86L: ["ゲーム実況・配信・ラジオ録音"],
  B0822PMBTZ: ["Web会議・オンライン授業・通話", "ゲーム実況・配信・ラジオ録音"],
  B0FLKJ7FH7: ["Web会議・オンライン授業・通話", "ゲーム実況・配信・ラジオ録音"],
  B0006H92QK: ["歌・楽器の録音（DTM）"],
  B0002D0BQ8: ["歌・楽器の録音（DTM）"],
  B000NAXCC0: ["歌・楽器の録音（DTM）"],
  B0000AQ6SC: ["歌・楽器の録音（DTM）"],
  B09FF8426V: ["Web会議・オンライン授業・通話"],
  B0G39C97WQ: ["Vlog・動画撮影（屋外）"],
  B004KVIZFM: ["Vlog・動画撮影（屋外）"],
  B005M2HDA6: ["Vlog・動画撮影（屋外）"],
  B08P411XR5: ["Vlog・動画撮影（屋外）"],
}

function micHaystack(gadget) {
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

function inferMicFilterTags(gadget) {
  const hay = micHaystack(gadget)
  const tags = new Set(gadget.micFilterTags ?? [])
  if (/ピンマイク|ラベリア|lavali|クリップ式|clip/i.test(hay)) tags.add("pin")
  if (/スピーカーフォン|会議用|conference speaker|アレイマイク/i.test(hay)) tags.add("conference")
  if (/スタンド|卓上|desk|三脚|tripod/i.test(hay) && !/ピンマイク|ラベリア|lavali/i.test(hay)) {
    tags.add("stand")
  }
  if (/コンデンサ|condenser/i.test(hay)) tags.add("condenser")
  if (/ダイナミック|dynamic/i.test(hay)) tags.add("dynamic")
  if (/ワイヤレス|wireless|2\.4\s*ghz|2\.4ghz/i.test(hay)) tags.add("wireless")
  if (/ヘッドセット|headset|マイク付き.*イヤホン|マイク付き.*ヘッド/i.test(hay)) tags.add("headset")
  return [...tags]
}

function extractAsin(gadget) {
  const m = gadget.purchaseUrl.match(/\/dp\/([A-Z0-9]{10})/)
  return m?.[1] ?? null
}

function isCardioid(hay) {
  if (/全指向|omni|360|双指向|bidirectional|ステレオ/i.test(hay)) return false
  return /単一指向|カーディオイド|cardioid|unidirectional|スーパーカーディオイド|hypercardioid/i.test(hay)
}

function isUsb(hay, connection) {
  return /usb|type-c|type c|lightning/i.test(`${hay} ${connection}`)
}

function hasMuteControl(hay) {
  return /ミュート|mute|タップトゥミュート|tap.to.mute/i.test(hay)
}

function hasGainVolumeControl(hay) {
  return /ゲイン|gain|音量調|volume|ボリューム|monitoring/i.test(hay)
}

function isStreamingProduct(hay, name) {
  return (
    /sm7b|sm7db|quadcast|solocast|yeti|wave:?3|wave:3|at2020usb|podcast|ポッドキャスト|配信|実況|ストリーミング|streamer|ラジオ/i.test(
      `${hay} ${name}`,
    ) || /hyperx|elgato wave|maono.*pd/i.test(hay)
  )
}

function isRecordingStudio(hay, name, connection) {
  return (
    /at2020|at4040|at2035|at2040|at875|sm58|sm57|sm7b|beta\s*5|e[\s-]?9|xm8500|dtm|宅録|レコーディング|studio|ボーカル|楽器/i.test(
      `${hay} ${name} ${connection}`,
    ) && !/カラオケ|karaoke|ピンマイク|clip/i.test(hay)
  )
}

function isVlogOutdoor(hay, tags) {
  if (tags.includes("pin") || tags.includes("wireless")) {
    if (/ピン|ラベリア|clip|lavali|wireless go|dji mic|mic mini|ピンマイク/i.test(hay)) return true
  }
  return (
    /vlog|動画撮影|カメラ用|ガンマイク|shotgun|videomic|ウインドスクリーン|防風|windscreen|ecm-|am7|wireless go|ワイヤレスピン/i.test(
      hay,
    ) && !/会議|conference|スピーカーフォン/i.test(hay)
  )
}

function isWebMeeting(hay, connection, tags) {
  if (tags.includes("conference")) return true
  if (/会議|通話|teams|zoom|telework|テレワーク|オンライン授業|ハンズフリー|拡声|スピーカーフォン|speakerphone|web会議|在宅勤務/i.test(hay)) {
    return true
  }
  if (tags.includes("headset") && /usb|bluetooth|有線/i.test(`${hay} ${connection}`)) return true
  if (isUsb(hay, connection) && isCardioid(hay)) return true
  if (isUsb(hay, connection) && /ノイズキャンセ|noise cancel|anc/i.test(hay)) return true
  if (/mv7|at2020usb|spmc10|mm-mcu|emeat|speakerphone/i.test(hay)) return true
  return false
}

function isStreaming(hay, name, connection, tags) {
  if (isStreamingProduct(hay, name)) return true
  if (hasMuteControl(hay) && (isUsb(hay, connection) || tags.includes("stand"))) return true
  if (hasGainVolumeControl(hay) && isUsb(hay, connection) && tags.includes("condenser")) return true
  if (tags.includes("condenser") && tags.includes("stand") && /ゲーム|配信|実況|youtube/i.test(hay)) return true
  return false
}

function isDtm(hay, name, connection, tags) {
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

export function inferMicUseTags(gadget) {
  if (gadget.category !== "mic") return []
  const asin = extractAsin(gadget)
  if (asin && MIC_USE_TAG_OVERRIDES[asin]) return [...MIC_USE_TAG_OVERRIDES[asin]]

  const hay = micHaystack(gadget)
  const tags = inferMicFilterTags(gadget)
  const useTags = new Set()
  if (isWebMeeting(hay, gadget.connection, tags)) useTags.add(MIC_USE_TAGS[0])
  if (isStreaming(hay, gadget.name, gadget.connection, tags)) useTags.add(MIC_USE_TAGS[1])
  if (isDtm(hay, gadget.name, gadget.connection, tags)) useTags.add(MIC_USE_TAGS[2])
  if (isVlogOutdoor(hay, tags)) useTags.add(MIC_USE_TAGS[3])
  return MIC_USE_TAGS.filter((t) => useTags.has(t))
}
