/**
 * Parse Amazon.co.jp keyboard product detail table into app spec fields.
 */
const DASH = "—"

/** Reject obviously wrong Amazon weight parses (e.g. "1 グラム"). */
export function sanitizeKeyboardWeight(weight) {
  if (!weight || weight === DASH || weight === "-") return null
  const m = String(weight).match(/([\d.,]+)\s*(?:g|グラム|gram)/i)
  if (!m) return weight
  const grams = parseFloat(m[1].replace(/,/g, ""))
  if (!Number.isFinite(grams) || grams < 150) return null
  return weight
}

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
}

function stripTags(s) {
  return decodeHtml(String(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
}

export function parseAmazonDetailTable(html) {
  const map = {}
  const rows = [
    ...html.matchAll(
      /<th[^>]*class="[^"]*prodDetSectionEntry[^"]*"[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*class="[^"]*prodDetAttrValue[^"]*"[^>]*>([\s\S]*?)<\/td>/gi,
    ),
  ]
  for (const m of rows) {
    const key = stripTags(m[1])
    const val = stripTags(m[2])
    if (key && val) map[key] = val
  }
  return map
}

function bulletText(html) {
  const bullets = [
    ...html.matchAll(/<span[^>]*class="[^"]*a-list-item[^"]*"[^>]*>([\s\S]*?)<\/span>/gi),
  ]
  return bullets.map((m) => stripTags(m[1])).filter(Boolean).join(" ")
}

export function parseAmazonKeyboardSpecs(html) {
  const table = parseAmazonDetailTable(html)
  const bullets = bulletText(html)
  const title = stripTags(html.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? "")

  const pick = (...keys) => {
    for (const k of keys) {
      for (const [tk, tv] of Object.entries(table)) {
        if (tk.includes(k)) return tv
      }
    }
    return null
  }

  return {
    title,
    bullets,
    table,
    layout: pick("キーボード配列", "キー数", "キーレイアウト"),
    switchType: pick("スイッチ", "キースイッチ", "キータイプ"),
    connection: pick("接続方式", "通信方式", "インターフェース"),
    power: pick("電源", "電池", "バッテリー"),
    weight: sanitizeKeyboardWeight(pick("本体重量", "商品重量", "重量")),
    dimensions: pick("商品の寸法", "パッケージサイズ"),
  }
}

export function applyAmazonKeyboardSpecs(gadget, specs, title) {
  if (!specs) return gadget
  const hay = `${title} ${specs.bullets} ${Object.values(specs.table).join(" ")}`
  let next = { ...gadget }

  const layout = specs.layout ?? inferLayoutFromText(hay)
  const structure = inferStructureFromText(hay, specs.switchType, title)
  const keycaps = inferKeycapsFromText(hay)
  const conn = specs.connection ?? gadget.connection
  const powerRaw = specs.power ?? inferPowerFromText(hay, gadget.connection)
  const power = normalizePowerValue(powerRaw, conn, hay)

  if (layout && layout !== DASH) {
    next = patchHighlight(next, "レイアウト", layout)
    next = patchSpecRow(next, "キー / スイッチ", "レイアウト", layout)
  }
  if (structure && structure !== DASH) {
    next = patchHighlight(next, "内部構造", structure)
    next = patchSpecRow(next, "キー / スイッチ", "内部構造", structure)
  }
  if (keycaps && keycaps !== DASH) {
    next = patchHighlight(next, "キーキャップ", keycaps)
    next = patchSpecRow(next, "キー / スイッチ", "キーキャップ", keycaps)
  }
  if (power && power !== DASH) {
    next = patchHighlight(next, "電源", power)
    next = patchSpecRow(next, "接続 / 電源", "電源", power)
  }
  if (conn && conn !== gadget.connection) {
    next = { ...next, connection: normalizeConnection(conn) }
    next = patchSpecRow(next, "接続 / 電源", "接続方式", next.connection)
  }
  if (specs.weight) {
    const weight = sanitizeKeyboardWeight(specs.weight)
    if (weight) next = patchSpecRow(next, "サイズ / 重量", "重量", weight)
  }

  return next
}

function normalizePowerValue(power, conn, hay) {
  if (!power || power === DASH) return null
  if (/^(いいえ|はい|no|yes|n\/a|—|-)$/i.test(power.trim())) return null
  if (/電源コード|usb給電/i.test(power) && /有線|wired/i.test(`${conn} ${hay}`)) {
    return "有線給電"
  }
  if (/^USB電源[。.]?$/i.test(power.trim())) {
    if (/usb-c|type-c|充電|wireless|ワイヤレス|bluetooth|2\.4/i.test(`${conn} ${hay}`)) {
      return "充電式 (USB-C)"
    }
    return "有線給電"
  }
  if (/^Usb Type-c/i.test(power)) return "充電式 (USB-C)"
  if (/^単3形乾電池×2本\s*\/\s*USB-C$/i.test(power)) {
    return "有線給電 / 単3形乾電池×2本"
  }
  if (
    /REALFORCE\s+R[34][A-Z0-9]*.*ハイブリッド|REALFORCE\s+R[34].*Hybrid|HHKB.*HYBRID/i.test(hay)
  ) {
    return "有線給電 / 単3形乾電池×2本"
  }
  if (/bluetooth|2\.4\s*ghz|logi bolt|lightspeed|unifying|ワイヤレス|wireless/i.test(power)) {
    if (/有線/i.test(`${conn} ${power}`)) {
      if (/単4/i.test(hay)) return "有線給電 / 単4形乾電池×2本"
      if (/単3/i.test(hay)) return "有線給電 / 単3形乾電池×2本"
      if (/充電|rechargeable|usb-c|type-c/i.test(hay)) return "有線給電 / 充電式 (USB-C)"
      return "有線給電 / 単3形乾電池×2本"
    }
    const inferred = inferPowerFromText(hay, conn)
    if (inferred) return inferred
  }
  if (/^バッテリー式$/i.test(power) && /単3|単4|aa/i.test(hay)) {
    if (/単4/i.test(hay)) return "単4形乾電池×2本"
    if (/単3/i.test(hay)) return "単3形乾電池×1本"
  }
  if (power === "バッテリー式") {
    const inferred = inferPowerFromText(hay, conn)
    if (inferred) return inferred
  }
  if (power === "充電式" && /usb-c|type-c/i.test(hay)) {
    return "充電式 (USB-C)"
  }
  return power
}

function patchHighlight(gadget, label, value) {
  const has = gadget.highlights.some((h) => h.label === label)
  return {
    ...gadget,
    highlights: has
      ? gadget.highlights.map((h) => (h.label === label ? { ...h, value } : h))
      : [...gadget.highlights, { label, value }],
  }
}

function patchSpecRow(gadget, groupTitle, rowLabel, value) {
  const groups = gadget.specGroups.map((g) => {
    if (g.title !== groupTitle) return g
    const has = g.rows.some((r) => r.label === rowLabel)
    return {
      ...g,
      rows: has
        ? g.rows.map((r) => (r.label === rowLabel ? { ...r, value } : r))
        : [...g.rows, { label: rowLabel, value }],
    }
  })
  return { ...gadget, specGroups: groups }
}

function normalizeConnection(raw, hay = "") {
  const t = String(raw)
  const context = `${t} ${hay}`
  if (/Keychron\s+(Q|K|V)\d*\s*Pro\b/i.test(context) && !/Max|B1 Pro|C3 Pro/i.test(context)) {
    return /bluetooth\s*5\.1/i.test(context)
      ? "有線 USB-C / Bluetooth 5.1"
      : "有線 USB-C / Bluetooth"
  }
  const parts = []
  if (/2\.4\s*ghz|2\.4g|logi bolt|lightspeed|usbレシーバー|usbドングル/i.test(t)) {
    parts.push(/logi bolt/i.test(t) ? "2.4GHz (Logi Bolt)" : "2.4GHz (USBレシーバー)")
  }
  if (/bluetooth|ブルートゥース/i.test(t)) parts.push("Bluetooth")
  if (/usb-c|type-c/i.test(t) && !parts.length) parts.push("USB-C")
  if (/有線|wired|usb/i.test(t) && !/wireless|ワイヤレス|無線/i.test(t)) {
    if (!parts.length) return "有線 USB"
  }
  return parts.length ? parts.join(" / ") : raw
}

export function inferLayoutFromText(text) {
  const t = String(text)
  if (/テンキーレス|tenkeyless|\btkl\b|87キー|84キー|80%|75%|65%|60%|\bmini\b|コンパクトキーボード|ミニ/i.test(t)) {
  if (/75%/.test(t)) return "75%"
  if (/65%/.test(t)) return "65%"
  if (/60%|fun60/i.test(t)) return "60%"
    if (/60%/.test(t)) return "60%"
    if (/mini|ミニ/i.test(t)) return "テンキーレス（コンパクト）"
    return "テンキーレス"
  }
  if (/104キー|108キー|フルサイズ|フルキーボード|full.?size|テンキー付|numpad/i.test(t)) {
    return "フルサイズ"
  }
  if (/折りたたみ|折り畳み|fold/i.test(t)) return "折りたたみ（フルサイズ）"
  return null
}

export function inferStructureFromText(text, switchType, title = "") {
  const titleLower = String(title).toLowerCase()
  if (
    /赤軸|青軸|茶軸|銀軸|黒軸|メカニカル|mechanical|cherry\s*mx/i.test(titleLower) &&
    !/磁気|magnetic|hall effect|ラピッドトリガー|rapid trigger|\bhe\b/i.test(titleLower)
  ) {
    return "メカニカル"
  }
  if (
    /タイプライター|typewriter/i.test(titleLower) &&
    !/磁気|magnetic|ラピッドトリガー|rapid trigger/i.test(titleLower)
  ) {
    return "メカニカル"
  }

  const t = `${switchType ?? ""} ${text}`.toLowerCase()
  if (/perfect stroke|パーフェクト・ストローク|perfect\s*stroke/i.test(t)) {
    return "Perfect Stroke シザー"
  }
  if (/磁気|magnetic|hall effect|heセンサー/i.test(t)) {
    if (/ロープロ|low[\s-]?profile/i.test(t)) return "磁気式（ロープロファイル）"
    if (/ラピッドトリガー|rapid trigger/i.test(t)) return "磁気スイッチ（ラピッドトリガー）"
    return "磁気スイッチ"
  }
  if (/mech-dome|メックドーム/i.test(t)) return "Mech-dome"
  if (/シザー|scissor/i.test(t)) return "シザー（パンタグラフ）"
  if (/パンタグラフ|pantograph/i.test(t)) return "パンタグラフ"
  if (/ダブルガスケット|double\s*gasket/i.test(t)) return "ダブルガスケット"
  if (/unicushion|ユニクッション|ガスケット/i.test(t)) return "ガスケットマウント"
  if (/メカニカル|mechanical|ホットスワップ|hot.?swap/i.test(t)) return "メカニカル"
  if (/メンブレン|membrane/i.test(t)) return "メンブレン"
  if (/トレーマウント|tray\s*mount/i.test(t)) return "トレーマウント"
  return null
}

export function inferKeycapsFromText(text) {
  const t = String(text).toLowerCase()
  if (/球面ディッシュ|spherical\s*dish/i.test(t)) return "球面ディッシュ"
  if (/pbt.*ダブル|pbt\s*double|pbt（ダブルショット）/i.test(t)) return "PBT"
  if (/ロープロ|low[\s-]?profile/i.test(t)) return "ロープロファイル"
  if (/\babs\b/i.test(t)) return "ABS"
  if (/pbt/i.test(t)) return "PBT"
  return null
}

export function inferPowerFromText(text, connection) {
  const t = String(text)
  if (/単4形|aa\s*batter|単4/i.test(t)) return "単4形乾電池×2本"
  if (/単3形|単3/i.test(t)) return "単3形乾電池×1本"
  if (/充電式|rechargeable|usb-c.*充電|内蔵バッテリー|リチウム/i.test(t)) {
    return "充電式 (USB-C)"
  }
  if (/電池寿命|乾電池/i.test(t) && /単/i.test(t)) {
    const m = t.match(/単[34]形[^。]{0,20}/)
    if (m) return m[0].replace(/\s+/g, "")
  }
  if (
    (/有線|wired/i.test(t) && !/wireless|ワイヤレス|無線|bluetooth/i.test(t)) ||
    connection === "有線 USB"
  ) {
    return "有線給電"
  }
  if (/2\.4\s*ghz|wireless|ワイヤレス/i.test(t) && /単/i.test(t)) {
    return "単3形乾電池×1本"
  }
  return null
}

function isKeyboardAccessory(gadget) {
  const hay = `${gadget.name} ${gadget.tagline}`.toLowerCase()
  return /キーキャップ.*\d+個|\d+個.*キーキャップ|キースイッチ.*セット|スイッチ.*\d+個セット|キーボード部品|キーボードdiy/i.test(
    hay,
  )
}

export function inferRapidTrigger(gadget) {
  if (gadget.hasRapidTrigger === true) return true
  if (gadget.hasRapidTrigger === false) return false
  if (isKeyboardAccessory(gadget)) return false

  const hay = `${gadget.name} ${gadget.tagline}`.toLowerCase()
  if (
    /赤軸|青軸|茶軸|銀軸|黒軸/i.test(hay) &&
    !/ラピッドトリガー|rapid trigger|磁気|magnetic|hall effect/i.test(hay)
  ) {
    return false
  }

  return (
    /ラピッドトリガー|rapid trigger|\brt0?\.?\d/i.test(hay) ||
    (/g515\s*rapid|g515-.*rt|huntsman v3 he|pcmk 3he|fun60|matataki|\baim1\b|cool68|x68he|mercury v60/i.test(
      hay,
    ) &&
      /磁気|magnetic|0\.0\d\s*mm/i.test(hay))
  )
}

export function inferKeyboardFilterTags(gadget) {
  const hay = [
    gadget.name,
    gadget.tagline,
    ...gadget.highlights.flatMap((h) => [h.label, h.value]),
    ...gadget.specGroups.flatMap((g) => g.rows.flatMap((r) => [r.label, r.value])),
  ]
    .join(" ")
    .toLowerCase()

  const tags = new Set(gadget.keyboardFilterTags ?? [])

  const layout = gadget.highlights.find((h) => h.label === "レイアウト")?.value ?? ""
  if (
    /tenkeyless|テンキーレス|87キー|80%|75%|65%|60%|コンパクト|mini/i.test(
      `${layout} ${hay}`,
    ) &&
    !/104キー|108キー|フルサイズ|テンキー付/i.test(`${layout} ${hay}`)
  ) {
    tags.add("tenkeyless")
  }

  if (/perfect stroke|シザー|scissor|パンタグラフ/i.test(hay)) tags.add("kb-structure-scissor")
  if (/ダブルガスケット|double\s*gasket/i.test(hay)) tags.add("kb-structure-double-gasket")
  if (/unicushion|ガスケット|gasket/i.test(hay) && !/ダブル|double/i.test(hay)) {
    tags.add("kb-structure-gasket")
  }
  if (/トレーマウント|tray\s*mount/i.test(hay)) tags.add("kb-structure-tray")
  if (/球面ディッシュ|spherical/i.test(hay)) tags.add("kb-keycap-spherical")
  if (/pbt.*ダブル|pbt\s*double/i.test(hay)) tags.add("kb-keycap-pbt-double")
  if (/\babs\b/i.test(hay)) tags.add("kb-keycap-abs")
  if (/ロープロ|low[\s-]?profile/i.test(hay)) tags.add("kb-keycap-low-profile")
  if (inferRapidTrigger(gadget)) tags.add("rapid-trigger")

  return [...tags]
}

export function shortProductName(title) {
  let name = title
    .replace(/^【[^】]+】\s*/g, "")
    .replace(/\s*\|\s*.+$/, "")
    .replace(/\s*国内正規品.*$/i, "")
    .trim()
  if (name.length > 72) name = name.slice(0, 69) + "…"
  return name
}

export function extractBrand(title) {
  const rules = [
    ["Logicool G", /logicool g|logitech g|ロジクール g/i],
    ["Logicool", /logicool|logitech|ロジクール/i],
    ["ELECOM", /elecom|エレコム/i],
    ["Keychron", /keychron/i],
    ["Apple", /\bapple\b/i],
    ["Anker", /\banker\b/i],
    ["Amazon Basics", /amazonベーシック|amazon basics/i],
    ["Buffalo", /バッファロー|buffalo/i],
    ["PFU", /\bpfu\b|hhkb/i],
    ["iClever", /iclever/i],
    ["Omikamo", /omikamo/i],
    ["Microsoft", /microsoft|マイクロソフト/i],
    ["Razer", /razer|レイザー/i],
    ["CORSAIR", /corsair/i],
    ["AIM1", /\baim1\b|matataki/i],
    ["MonsGeek", /monsgeek/i],
    ["Pulsar", /pulsar/i],
    ["SmackApe", /smackape/i],
    ["Ewin", /\bewin\b/i],
    ["Mobo", /\bmobo\b|モボ/i],
    ["Turtle Beach", /turtle beach/i],
    ["WOBKEY", /wobkey/i],
    ["EPOMAKER", /epomaker/i],
    ["Merdia", /merdia/i],
    ["KizunaAI", /kizunaai|キズナアイ/i],
  ]
  for (const [brand, re] of rules) if (re.test(title)) return brand
  return "—"
}

export function inferConnectionFromTitle(title) {
  if (/magic keyboard/i.test(title)) return "Bluetooth / USB-C"
  const has8000 = /8000\s*hz|8k polling|8k\s*polling/i.test(title)
  const has24 =
    /2\.4\s*ghz|2\.4g\b|logi bolt|lightspeed|usbドングル|usbレシーバー/i.test(title) &&
    !/レシーバーのみ|receiver only/i.test(title)
  const hasBt = /bluetooth|ブルートゥース/i.test(title)
  const wireless = /wireless|ワイヤレス|無線|cordless|3way|3-way|tri-mode/i.test(title)
  const wired =
    (/有線|wired/i.test(title) && !wireless && !hasBt && !has24) ||
    (/usb接続|usb connection/i.test(title) && !wireless && !hasBt && !has24)

  if (has8000 && wired && !wireless && !hasBt) {
    return "有線 USB (8000Hz)"
  }
  if (wired && /着脱式|detachable/i.test(title)) {
    return "有線 USB (着脱式ケーブル)"
  }

  const parts = []
  if (has24) {
    if (/lightspeed/i.test(title)) parts.push("2.4GHz (LIGHTSPEED)")
    else if (/logi bolt/i.test(title)) parts.push("2.4GHz (Logi Bolt)")
    else if (/unifying/i.test(title)) parts.push("2.4GHz (Unifying USBレシーバー)")
    else parts.push("2.4GHz (USBレシーバー)")
  }
  if (hasBt) parts.push("Bluetooth")
  if (/usb-c|type-c/i.test(title) && (wired || wireless)) {
    if (!parts.some((p) => /usb/i.test(p))) parts.push("USB-C")
  }
  if (parts.length > 0) {
    return has8000 && !parts.some((p) => /8000/i.test(p))
      ? `${parts.join(" / ")} (8000Hz)`
      : parts.join(" / ")
  }
  if (wireless) return "2.4GHz (USBレシーバー)"
  if (wired) return "有線 USB"
  return "—"
}

/** 同一モデルの重複除外用（型番・シリーズ名） */
export function extractModelKey(title) {
  const model =
    title.match(/\b(G515[-\w]+|G-PKB-\w+|G213r?|FUN60[\w\s]*|PCMK\s*3HE|MATATAKI|AIM1|Impact\s*80|Z-88|TK-[A-Z0-9]+|K\d+[A-Z]*|KX\d+[A-Za-z]*|K\d{3}[A-Z]*|BSKBW\d+|HHKB[^,\s|]+|DK\d+|TK-MC\d+[A-Z]+)/i)?.[1] ??
    title.match(/MX KEYS?(?:\s+mini|\s+S)?/i)?.[0] ??
    title.match(/Alto Keys K98/i)?.[0]
  if (model) return model.toUpperCase().replace(/\s+/g, " ").trim()
  return null
}

const PRODUCTIVITY_KEYBOARD =
  /mx keys(?!\s*mini\s*mechanical)|signature slim|\bk295\b|\bk275\b|\bk120\b|\bk780\b|\bk950\b|\bk400\b|hhkb|realforce|magic keyboard|amazonベーシック|anker.*keyboard|有線キーボード.*メンブレン/i

const GAMING_BRAND =
  /logicool g|logitech g|\brazer\b|レイザー|corsair|steelseries|hyperx|redragon|attack shark|asus rog|\brog\b|msi.*keyboard|v custom|v-cust/i

export function inferKeyboardUsage(gadget) {
  if (gadget.category !== "keyboard") return "productivity"
  if (gadget.keyboardUsage) return gadget.keyboardUsage

  const hay = [
    gadget.name,
    gadget.brand,
    gadget.tagline,
    gadget.connection,
    ...gadget.highlights.flatMap((h) => [h.label, h.value]),
    ...gadget.specGroups.flatMap((g) => g.rows.flatMap((r) => [r.label, r.value])),
  ]
    .join(" ")
    .toLowerCase()

  if (GAMING_BRAND.test(hay)) return "gaming"
  if (/ゲーミング|gaming keyboard|\bgaming\b/i.test(hay)) return "gaming"
  if (/mx mechanical|alto keys|leggero|tk-mc30/i.test(hay)) return "gaming"
  if (/nキーロールオーバー|n-key rollover|anti-ghost/i.test(hay)) return "gaming"
  if (/keychron q\d|keychron k[0-9]|keychron v[0-9]/i.test(hay)) return "gaming"
  if (
    /(1000|8000)\s*hz/i.test(hay) &&
    /ポーリング|polling|リフレッシュ/i.test(hay)
  ) {
    return "gaming"
  }
  if (
    /rgb|ライティング|イルミネーション/i.test(hay) &&
    /メカニカル|mechanical|ゲーム|gaming/i.test(hay)
  ) {
    return "gaming"
  }
  if (
    (/ホットスワップ|hot.?swap/i.test(hay) || /ダブルガスケット|double gasket/i.test(hay)) &&
    /メカニカル|mechanical|qmk|via/i.test(hay)
  ) {
    return "gaming"
  }
  if (PRODUCTIVITY_KEYBOARD.test(hay)) return "productivity"
  return "productivity"
}

export { DASH }
