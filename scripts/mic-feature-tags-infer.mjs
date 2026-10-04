/** Node script mirror of lib/mic-feature-tags.ts */

export const MIC_FEATURE_TAGS = [
  "ミュートボタン（タッチミュート）",
  "イヤホンジャック（ダイレクトモニタリング）",
  "ゲインノブ（音量調節ノブ）",
  "ノイズキャンセリング機能",
]

export const MIC_FEATURE_TAG_OVERRIDES = {
  B07NZZZ746: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ],
  B08G8WH435: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ],
  B0DXW278KB: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ],
  B0GQRSQ86L: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ],
  B0B823S1NR: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ],
  B000CZ0R42: ["イヤホンジャック（ダイレクトモニタリング）", "ゲインノブ（音量調節ノブ）"],
  B08KY7G1GV: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
    "ノイズキャンセリング機能",
  ],
  B0CYYZ78NJ: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
    "ノイズキャンセリング機能",
  ],
  B0DDP2HT3F: ["ミュートボタン（タッチミュート）", "ノイズキャンセリング機能"],
  B0CCSVYWMH: ["ゲインノブ（音量調節ノブ）"],
  B0DNJGTMBK: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ],
  B0822PMBTZ: [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
  ],
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

function extractAsin(gadget) {
  const m = gadget.purchaseUrl.match(/\/dp\/([A-Z0-9]{10})/)
  return m?.[1] ?? null
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

function isUnspecified(value) {
  return !value || value === "—" || /非対応|なし|無/i.test(value)
}

function specRows(gadget) {
  return gadget.specGroups.flatMap((g) => g.rows)
}

function hasSpecLabel(gadget, labelRe, valueRe) {
  return specRows(gadget).some((row) => {
    if (!labelRe.test(row.label)) return false
    if (valueRe) return valueRe.test(row.value) && !isUnspecified(row.value)
    return !isUnspecified(row.value)
  })
}

function hasHighlightLabel(gadget, labelRe, valueRe) {
  return gadget.highlights.some((row) => {
    if (!labelRe.test(row.label)) return false
    if (valueRe) return valueRe.test(row.value) && !isUnspecified(row.value)
    return !isUnspecified(row.value)
  })
}

function isHeadsetMic(tags) {
  return tags.includes("headset")
}

function hasMuteButton(hay, gadget, tags) {
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

function hasHeadphoneJack(hay, gadget, tags) {
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

function hasGainKnob(hay, gadget, tags) {
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

function hasNoiseCancellation(hay, tags) {
  if (
    /ノイズキャンセ|noise cancel|\banc\b|denoiser|ノイズ除去|アクティブノイズ|aiノイズ|2段階ノイズ|ノイズ抑制.*機能|クリアボイス|cvc|clipguard|エコー.*ノイズ/i.test(
      hay,
    )
  ) {
    return true
  }
  if (/ノイズ低減|noise reduction/i.test(hay) && /dsp|ソフトウェア|専用アプリ|motiv|wave fx|clipguard/i.test(hay)) {
    return true
  }
  if (isHeadsetMic(tags) && /ノイズキャンセ|noise cancel|cvc|クリアボイス/i.test(hay)) {
    return true
  }
  return false
}

export function inferMicFeatureTags(gadget) {
  if (gadget.category !== "mic") return []

  const asin = extractAsin(gadget)
  if (asin && MIC_FEATURE_TAG_OVERRIDES[asin]) {
    return [...MIC_FEATURE_TAG_OVERRIDES[asin]]
  }

  const hay = micHaystack(gadget)
  const tags = inferMicFilterTags(gadget)
  const featureTags = new Set()

  if (hasMuteButton(hay, gadget, tags)) {
    featureTags.add("ミュートボタン（タッチミュート）")
  }
  if (hasHeadphoneJack(hay, gadget, tags)) {
    featureTags.add("イヤホンジャック（ダイレクトモニタリング）")
  }
  if (hasGainKnob(hay, gadget, tags)) {
    featureTags.add("ゲインノブ（音量調節ノブ）")
  }
  if (hasNoiseCancellation(hay, tags)) {
    featureTags.add("ノイズキャンセリング機能")
  }

  return MIC_FEATURE_TAGS.filter((t) => featureTags.has(t))
}
