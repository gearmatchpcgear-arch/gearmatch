/**
 * Parse Amazon.co.jp mouse product detail table into app spec fields.
 * Only values explicitly present on the product page are returned.
 */
const DASH = "—"

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

function parseDetailTable(html) {
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

function formatDpi(raw) {
  const m = String(raw).match(/([\d,]+)/)
  if (!m) return null
  const n = Number(m[1].replace(/,/g, ""))
  if (!Number.isFinite(n) || n <= 0) return null
  return `${n.toLocaleString("ja-JP")} DPI`
}

const OZ_TO_G = 28.35

function roundGrams(n) {
  return Math.round(n)
}

/** Format weight string to "NN g". Handles g, kg, oz, ounces, オンス. */
export function formatWeight(raw) {
  const text = String(raw ?? "").trim()
  if (!text) return null

  // Prefer explicit grams in "2.2 oz (63 g)" style
  const parenG = text.match(/\(\s*([\d.,]+)\s*g\s*\)/i)
  if (parenG) {
    const n = Number(parenG[1].replace(/,/g, ""))
    if (Number.isFinite(n) && n > 0 && n < 2000) return `${roundGrams(n)} g`
  }

  const gMatch = text.match(/([\d.,]+)\s*(g|グラム|grams?)\b/i)
  if (gMatch) {
    const num = Number(gMatch[1].replace(/,/g, ""))
    if (Number.isFinite(num) && num > 0) return `${roundGrams(num)} g`
  }

  const ozMatch = text.match(/([\d.,]+)\s*(?:oz|ounces?|オンス)\b/i)
  if (ozMatch) {
    const oz = Number(ozMatch[1].replace(/,/g, ""))
    if (Number.isFinite(oz) && oz > 0 && oz < 50) return `${roundGrams(oz * OZ_TO_G)} g`
  }

  const kgMatch = text.match(/([\d.,]+)\s*(kg|キロ|kilograms?)\b/i)
  if (kgMatch) {
    const num = Number(kgMatch[1].replace(/,/g, ""))
    if (Number.isFinite(num) && num > 0) return `${roundGrams(num * 1000)} g`
  }

  return null
}

/** Extract product weight from title, bullets, or description text. */
export function extractWeightFromText(text) {
  const hay = String(text ?? "")
  if (!hay.trim()) return null

  const patterns = [
    /\(\s*([\d.,]+)\s*g\s*\)/i,
    /(?:item\s+)?weight[:\s]+([\d.,]+)\s*g\b/i,
    /(?:本体重量|商品重量|重量|product\s+weight)[：:\s]+([\d.,]+)\s*(?:g|グラム|gram(?:s)?)\b/i,
    /([\d.,]+)\s*g(?:\b|[^a-z])/i,
    /(\d{2,3})g\b/i,
    /([\d.,]+)\s*(?:oz|ounces?|オンス)\b/i,
    /(?:weight|重量)[：:\s]+([\d.,]+)\s*(?:oz|ounces?|オンス)\b/i,
    /(?:lightweight|超軽量|leicht)[^\d]{0,20}([\d.,]+)\s*g\b/i,
    /(?:^|[\s(,（])(\d{2,3})\s*g(?:\b|[,.)）])/i,
  ]

  for (const re of patterns) {
    const m = hay.match(re)
    if (!m) continue
    const token = /oz|ounces?|オンス/i.test(m[0]) ? `${m[1]} oz` : `${m[1]} g`
    const formatted = formatWeight(token)
    if (formatted) {
      const grams = Number(formatted.match(/^([\d.]+)/)?.[1])
      // Mice typically 20–500 g; skip package/bulk weights.
      if (grams >= 15 && grams <= 600) return formatted
    }
  }

  return null
}

/** Fill missing 重量 in gadget highlights/specGroups from name/tagline text. */
export function applyWeightFromText(gadget, extraText = "") {
  const current = gadget.highlights?.find((h) => h.label === "重量")?.value?.trim()
  if (current && current !== DASH && current !== "-" && current !== "未設定") return gadget

  const hay = `${gadget.name ?? ""} ${gadget.tagline ?? ""} ${extraText}`.trim()
  const weight = extractWeightFromText(hay)
  if (!weight) return gadget

  const highlights = gadget.highlights.map((h) =>
    h.label === "重量" ? { ...h, value: weight } : h,
  )

  let specGroups = gadget.specGroups.map((group) => {
    if (!/サイズ|重量/.test(group.title)) return group
    const hasWeight = group.rows.some((r) => r.label === "重量")
    const rows = hasWeight
      ? group.rows.map((r) => (r.label === "重量" ? { ...r, value: weight } : r))
      : [...group.rows, { label: "重量", value: weight }]
    return { ...group, rows }
  })

  const hasSizeGroup = specGroups.some((g) => /サイズ|重量/.test(g.title))
  if (!hasSizeGroup) {
    specGroups = [{ title: "サイズ / 重量", rows: [{ label: "重量", value: weight }] }, ...specGroups]
  }

  return { ...gadget, highlights, specGroups }
}

function parseDimensions(raw) {
  const text = String(raw)
  const nums = [...text.matchAll(/([\d.]+)\s*(?:cm|mm|センチ|ミリ)?/gi)].map((m) =>
    Number(m[1]),
  )
  if (nums.length >= 3) {
    const unit = /mm|ミリ/i.test(text) ? "mm" : "cm"
    const factor = unit === "cm" ? 10 : 1
    return {
      width: `${nums[0] * factor} mm`,
      depth: `${nums[1] * factor} mm`,
      height: `${nums[2] * factor} mm`,
    }
  }
  return null
}

function mapReadingMethod(movement, contextHay = "") {
  const hay = `${movement} ${contextHay}`.toLowerCase()
  if (/トラックボール|trackball/i.test(hay)) return "トラックボール"
  if (/darkfield/i.test(hay)) return "Darkfield"
  if (/blueled|blue led|bluel?ed/i.test(hay)) return "BlueLED"
  if (/ultimate\s*ir\s*led|ir\s*led|赤外線/i.test(hay)) return "光学式"
  if (/レーザー|laser/i.test(hay)) return "レーザー"
  if (/光学|optical|オプティカル/i.test(hay)) {
    if (/blueled|blue led/i.test(hay)) return "BlueLED"
    return "光学式"
  }
  return null
}

function extractReadingContext(html, title, map) {
  const chunks = [title]
  if (map["商品の追加説明1"]) chunks.push(map["商品の追加説明1"])
  if (map["ムーブメント検出技術"]) chunks.push(map["ムーブメント検出技術"])

  const bullets = [
    ...html.matchAll(/<span class="a-list-item">([\s\S]*?)<\/span>/gi),
  ]
    .map((m) => stripTags(m[1]))
    .filter((t) => t.length > 4 && t.length < 500)
  chunks.push(...bullets.slice(0, 35))

  const desc = html.match(/id="productDescription"[^>]*>([\s\S]*?)<\/div>/i)
  if (desc) chunks.push(stripTags(desc[1]).slice(0, 2500))

  const featureDiv = html.match(/id="feature-bullets"[\s\S]{0,12000}/i)
  if (featureDiv) chunks.push(stripTags(featureDiv[0]).slice(0, 3000))

  for (const m of html.matchAll(/\balt="([^"]{8,200})"/gi)) {
    if (/光学|optical|blueled|darkfield|レーザー|laser|トラックボール|オプティカル/i.test(m[1])) {
      chunks.push(m[1])
    }
  }

  return chunks.join(" ")
}

function parsePollingRate(title, map, extras) {
  const hay = `${title} ${extras} ${Object.values(map).join(" ")}`
  const hz = hay.match(/([\d,]+)\s*hz/i)
  if (!hz) return null
  const n = Number(hz[1].replace(/,/g, ""))
  if (!Number.isFinite(n) || n < 100) return null
  return `${n.toLocaleString("ja-JP")} Hz`
}

function parseBattery(map) {
  const raw = map["バッテリ平均持続時間"] ?? map["バッテリー平均持続時間"]
  if (!raw) return null
  return raw
}

/** 仕様表・商品説明・箇条書きのみ（関連商品広告を除外） */
function buildBatteryContextHay(html, title, map) {
  const extras = [map["商品の追加説明1"], map["商品の追加説明2"], map["商品の説明"]]
    .filter(Boolean)
    .join(" ")
  const bullets = [...String(html).matchAll(/<li[^>]*><span class="a-list-item">([\s\S]*?)<\/span><\/li>/gi)]
    .map((m) => stripTags(m[1]))
    .join(" ")
  const chunks = [
    title,
    extras,
    bullets,
    String(html).match(/id="productDescription"[\s\S]*?<\/div>\s*<\/div>/i)?.[0],
    String(html).match(/id="prodDetails"[\s\S]*?<\/table>/i)?.[0],
    String(html).match(/id="detailBullets_feature_div"[\s\S]*?<\/ul>/i)?.[0],
    `${map["電源のタイプ"] ?? ""} ${map["電池の数"] ?? ""}`,
  ].filter(Boolean)
  return stripTags(chunks.join(" ")).replace(/\s+/g, " ")
}

function hasStrongRechargeableContext(context) {
  return /充電式|type-c.*充電|usb[- ]?c.*充電|usb充電|リチャージ|rechargeable|内蔵リチウム|内蔵.*バッテリー|built-in.*recharg/i.test(
    context,
  )
}

function hasExplicitDisposableContext(context) {
  return (
    /単[1234]形\s*(乾電池|アルカリ|マンガン)|電池式\s*[（(]\s*単[1234]|単[1234]形乾電池|aa\s*battery|aaa\s*battery|1\s*x\s*aa\b|単三|単四/i.test(
      context,
    ) && !hasStrongRechargeableContext(context)
  )
}

const KANJI_CELL_SIZE = { 一: "1", 二: "2", 三: "3", 四: "4" }

function normalizeCellSize(token) {
  if (!token) return null
  if (/^[1234]$/.test(token)) return token
  return KANJI_CELL_SIZE[token] ?? null
}

function parseCellSizeFromText(text) {
  const m =
    text.match(/単([1234])形/i) ??
    text.match(/単([一二三四])形/i) ??
    (/\bAAA\b/i.test(text) ? ["", "4"] : null) ??
    (/\bAA\b/i.test(text) ? ["", "3"] : null)
  return m ? normalizeCellSize(m[1]) : null
}

function parseCellCountFromText(text, size) {
  const sizePattern = size ? `単${size}形` : "単[1234]形"
  const block = text.match(new RegExp(`${sizePattern}[^。]{0,120}`, "i"))?.[0] ?? text
  return (
    block.match(/いずれか\s*(\d+)\s*本/i)?.[1] ??
    block.match(/[×x]\s*(\d+)/i)?.[1] ??
    block.match(/(\d+)\s*本/i)?.[1] ??
    text.match(/(\d+)\s*単[1234]形/i)?.[1] ??
    "1"
  )
}

/** Amazon 商品説明・仕様文から乾電池サイズを抽出（仕様表の誤記を上書きする） */
export function extractBatteryFromContext(html = "", title = "", map = {}) {
  const plain = html.includes("<")
    ? buildBatteryContextHay(html, title, map)
    : stripTags(`${title} ${html}`).replace(/\s+/g, " ")

  const official = plain.match(/電源\s*[（(]?本体[）)]?\s*[：:]\s*単([1234一二三四])形/i)
  if (official) {
    const size = normalizeCellSize(official[1])
    const block = plain.slice(official.index, official.index + 160)
    const count = parseCellCountFromText(block, size)
    return {
      size,
      count,
      included: /付属|動作確認用/i.test(block),
      confidence: 90,
      source: "official-body",
    }
  }

  const accessory = plain.match(
    /付属品[^。]{0,250}?単([1234一二三四])形[^。]{0,80}?(?:[×x]\s*(\d+)|(\d+)\s*本)/i,
  )
  if (accessory) {
    return {
      size: normalizeCellSize(accessory[1]),
      count: accessory[2] ?? accessory[3] ?? "1",
      included: true,
      confidence: 80,
      source: "accessory",
    }
  }

  const size3 = /単3形|単三|\bAA\b(?![A-Za-z])/i.test(plain)
  const size4 = /単4形|単四|\bAAA\b/i.test(plain)
  if (size3 && !size4) {
    return {
      size: "3",
      count: parseCellCountFromText(plain, "3"),
      included: /付属/i.test(plain),
      confidence: 55,
      source: "context-aa",
    }
  }
  if (size4 && !size3) {
    return {
      size: "4",
      count: parseCellCountFromText(plain, "4"),
      included: /付属/i.test(plain),
      confidence: 55,
      source: "context-aaa",
    }
  }

  return null
}

function formatDisposableFromResolved({ size, count, included }) {
  if (included || Number(count) <= 1) return `単${size}形 乾電池（付属）`
  return `電池式（単${size}形乾電池 ${count}本）`
}

function formatDisposableFromRaw(source) {
  const size =
    parseCellSizeFromText(source) ??
    (source.includes("単4") ? "4" : source.includes("単2") ? "2" : "3")
  const count = parseCellCountFromText(source, size)
  if (/付属|電池\s*[（(]\s*付属/i.test(source)) return `単${size}形 乾電池（付属）`
  return `電池式（単${size}形乾電池 ${count}本）`
}

function resolveBatteryWithContext(tableSource, contextHay, map = {}, title = "") {
  const tableSize = parseCellSizeFromText(tableSource)
  const ctxBattery = extractBatteryFromContext(contextHay, title, map)
  if (
    ctxBattery &&
    tableSize &&
    ctxBattery.size !== tableSize &&
    ctxBattery.confidence >= 80
  ) {
    return formatDisposableFromResolved({
      size: ctxBattery.size,
      count: ctxBattery.count,
      included: ctxBattery.included || /付属/i.test(tableSource),
    })
  }
  if (!tableSize && ctxBattery && ctxBattery.confidence >= 55) {
    return formatDisposableFromResolved(ctxBattery)
  }
  return null
}

/** 有線 USB マウス（Amazon バリエーション表の無線/電池情報と混同しない） */
export function isWiredUsbProduct(title, map = {}) {
  const hay = `${title} ${map["型番"] ?? ""} ${map["商品の追加説明1"] ?? ""}`
  const wirelessHint =
    /wireless|ワイヤレス|無線|2\.4\s*ghz|bluetooth|レシーバー|cordless|充電式/i.test(hay)
  const wiredHint = /有線|wired/i.test(hay)
  if (wirelessHint && !wiredHint) return false
  if (wiredHint) return true
  return /コード式|電源コード|ケーブル付/i.test(map["電源のタイプ"] ?? "")
}

/** 有線モデルでバリエーション由来の「無線2.4GHz」等を除去 */
export function sanitizeCommunicationInterface(raw, title, map = {}) {
  const value = String(raw ?? "").trim()
  if (!value) return null
  if (!isWiredUsbProduct(title, map)) return value
  if (/無線|2\.4\s*ghz|bluetooth|レシーバー|wireless|wi-fi|wifi/i.test(value)) {
    return /usb/i.test(value) ? "USB" : "USB"
  }
  return value
}

export function formatPowerDisplay(rawValue, context = "", map = {}) {
  const raw = String(rawValue).trim()
  if (!raw || raw === DASH) return raw

  if (/^充電式（内蔵バッテリー）$/.test(raw)) return raw
  if (/^有線給電$/.test(raw)) return raw

  if (isWiredUsbProduct(context, map)) return "有線給電"
  if (
    /有線|wired/i.test(context) &&
    !/wireless|ワイヤレス|無線|2\.4\s*ghz|bluetooth/i.test(context)
  ) {
    return "有線給電"
  }

  const contextResolved = resolveBatteryWithContext(raw, context, map)
  if (contextResolved) return contextResolved

  if (/^電池式（単[1234]形乾電池 \d+本）$/.test(raw)) return raw
  if (/^単[1234]形 乾電池（付属）$/.test(raw)) return raw

  if (/^(コード式|電源コード式|ケーブル付き)/.test(raw)) return "有線給電"

  const ctx = `${raw} ${context}`

  if (/非標準バッテリ|リチウムイオン|リチウムポリマー|lithium\s*ion|li-po|li-ion/i.test(raw) && !/単[1234]形/i.test(raw)) {
    return "充電式（内蔵バッテリー）"
  }

  if (hasStrongRechargeableContext(context) && !hasExplicitDisposableContext(context)) {
    return "充電式（内蔵バッテリー）"
  }

  const normalized = raw.replace(/^バッテリー式\s*[\/／]\s*/, "").trim()
  const source = normalized || raw

  const isDisposableCell =
    /単[1234]形|単三|単四/i.test(source) && !/リチウム|lithium|非標準/i.test(source)

  if (isDisposableCell) return formatDisposableFromRaw(source)

  if (/^バッテリー式$|^電池式$/.test(raw)) {
    if (hasStrongRechargeableContext(context)) return "充電式（内蔵バッテリー）"
    return "電池式"
  }

  if (/充電式|rechargeable/i.test(ctx) && !hasExplicitDisposableContext(context)) {
    return "充電式（内蔵バッテリー）"
  }

  return raw
}

function parsePower(map, title = "", batteryContextHay = "") {
  const type = (map["電源のタイプ"] ?? "").replace(/。+$/, "").trim()
  const cells = (map["電池の数"] ?? "").trim()
  const contextHay = batteryContextHay || `${title} ${type} ${cells}`
  const hay = `${type} ${cells} ${contextHay}`

  if (isWiredUsbProduct(title, map)) return "有線給電"

  if (/コード式|電源コード|ケーブル付/i.test(type)) return "有線給電"

  if (hasStrongRechargeableContext(contextHay) && !hasExplicitDisposableContext(contextHay)) {
    return "充電式（内蔵バッテリー）"
  }

  const isDisposable =
    /単[1234]形|単三|単四|\bAA\b|\bAAA\b/i.test(cells) &&
    !/リチウム|lithium|非標準/i.test(`${type} ${cells}`)
  const isRechargeable =
    /充電式|リチウム|lithium|内蔵|非標準バッテリ|rechargeable/i.test(hay) &&
    !/単[1234]形/i.test(cells)

  if (isDisposable) {
    const raw = cells.includes("付属") ? cells : `バッテリー式 / ${cells}`
    const resolved = resolveBatteryWithContext(raw, contextHay, map, title)
    if (resolved) return resolved
    return formatPowerDisplay(raw, contextHay, map)
  }

  if (isRechargeable) return "充電式（内蔵バッテリー）"

  const ctxBattery = extractBatteryFromContext(contextHay, title, map)
  if (ctxBattery && ctxBattery.confidence >= 55 && !hasStrongRechargeableContext(contextHay)) {
    return formatDisposableFromResolved(ctxBattery)
  }

  const raw = cells || (type && type !== "バッテリー式" ? type : type || null)
  if (!raw) return null
  return formatPowerDisplay(raw, contextHay, map)
}

/** Extract button count from product name, tagline, or description text. */
export function extractButtonCountFromText(text) {
  const hay = String(text ?? "")
  if (!hay.trim()) return null

  // Reject bulk-pack titles ("Set of 40", "40個セット") — not button counts.
  if (/\bset\s+of\s+\d{2,}\b|\d{2,}\s*(?:個|本)\s*(?:セット|入)/i.test(hay)) {
    const bulk = hay.match(/\bset\s+of\s+(\d+)\b|\b(\d{2,})\s*(?:個|本)\s*(?:セット|入)/i)
    if (bulk) {
      const n = Number(bulk[1] ?? bulk[2])
      if (n > 10) {
        // Still allow explicit "N buttons" patterns below; skip only ambiguous lone numbers.
      }
    }
  }

  const patterns = [
    /(\d+)\s*ボタン/i,
    /(\d+)\s*buttons?\b/i,
    /(\d+)[\s-]*buttons?\b/i,
    /\b(\d+)\s*Button\b/,
    /buttons?\s*[:(（]\s*(\d+)/i,
    /(\d+)\s*programmable\s*buttons?/i,
    /(\d+)\s*键/i,
    /ボタン\s*[：:]\s*(\d+)/i,
    /number\s+of\s+buttons?\s*[：:]\s*(\d+)/i,
  ]

  for (const re of patterns) {
    const m = hay.match(re)
    if (!m) continue
    const n = Number(m[1])
    if (Number.isFinite(n) && n >= 1 && n <= 20) return n
  }

  // "2 buttons + wheel" → 3 total (left, right, wheel click)
  const wheelMatch = hay.match(/(\d+)\s*buttons?\s*\+\s*wheel/i)
  if (wheelMatch) {
    const n = Number(wheelMatch[1]) + 1
    if (n >= 1 && n <= 20) return n
  }

  return null
}

/** Fill missing ボタン数 in gadget specGroups from name/tagline. */
export function applyButtonCountFromText(gadget, extraText = "") {
  const sensorGroup = gadget.specGroups?.find((g) => /センサー|入力/i.test(g.title))
  const existing = sensorGroup?.rows.find((r) => r.label === "ボタン数")
  const raw = existing?.value?.trim()
  if (raw && raw !== DASH && raw !== "-" && raw !== "未設定") return gadget

  const hay = `${gadget.name ?? ""} ${gadget.tagline ?? ""} ${extraText}`.trim()
  const count = extractButtonCountFromText(hay)
  if (count === null) return gadget

  const specGroups = gadget.specGroups.map((group) => {
    if (!/センサー|入力/i.test(group.title)) return group
    const hasBtn = group.rows.some((r) => r.label === "ボタン数")
    const rows = hasBtn
      ? group.rows.map((r) =>
          r.label === "ボタン数" ? { ...r, value: String(count) } : r,
        )
      : [...group.rows, { label: "ボタン数", value: String(count) }]
    return { ...group, rows }
  })

  return { ...gadget, specGroups }
}

function parseSideFeatures(title, extras, buttonCount) {
  const hay = `${title} ${extras}`.toLowerCase()
  const sideButtons =
    buttonCount !== null && buttonCount >= 5
      ? "あり"
      : /サイドボタン|thumb\s*button|親指ボタン|進む.*戻る|back.*forward|戻る.*進む/i.test(hay)
        ? "あり"
        : null
  const sideWheel = /サイドホイール|thumb\s*wheel|サムホイール|横スクロール|horizontal\s*scroll|チルト/i.test(
    hay,
  )
    ? "あり"
    : null
  return { sideButtons, sideWheel }
}

export function parseAmazonMouseSpecs(html, title = "") {
  const map = parseDetailTable(html)
  const extras = map["商品の追加説明1"] ?? ""

  const maxDpiRaw = map["マウス最大感度"] ?? map["Mouse Maximum Sensitivity"]
  const maxDpi = maxDpiRaw ? formatDpi(maxDpiRaw) : null

  const weightRaw =
    map["商品の重量"] ??
    map["Item Weight"] ??
    map["本体重量"] ??
    map["重量"] ??
    map["単品重量"] ??
    map["パッケージ重量"]
  let weight = weightRaw ? formatWeight(weightRaw) : null
  const readingContext = extractReadingContext(html, title, map)
  if (!weight) {
    weight =
      extractWeightFromText(`${title} ${extras} ${readingContext}`) ??
      extractWeightFromText(title.match(/(?:^|[\s(,（])(\d{2,3})\s*g(?:\b|[,.)）])/i)?.[0] ?? "")
  }

  const dimRaw =
    map["商品の寸法"] ?? map["製品サイズ"] ?? map["本体サイズ"] ?? map["パッケージサイズ"]
  const dims = dimRaw ? parseDimensions(dimRaw) : null

  const buttonRaw = map["ボタン数"] ?? map["Button Quantity"]
  let buttonCount = buttonRaw ? Number(String(buttonRaw).match(/(\d+)/)?.[1]) : null
  if (buttonCount === null || !Number.isFinite(buttonCount) || buttonCount < 1 || buttonCount > 20) {
    buttonCount = extractButtonCountFromText(`${title} ${extras} ${readingContext}`)
  }
  const movement = map["ムーブメント検出技術"] ?? map["Movement Detection"] ?? ""
  const reading = mapReadingMethod(movement, readingContext)
  const polling = parsePollingRate(title, map, extras)
  const battery = parseBattery(map)
  const batteryContextHay = buildBatteryContextHay(html, title, map)
  const power = parsePower(map, title, batteryContextHay)
  const batteryContext = extractBatteryFromContext(html, title, map)
  const { sideButtons, sideWheel } = parseSideFeatures(title, extras, buttonCount)

  const sizeRows = []
  if (dims?.width) sizeRows.push({ label: "幅", value: dims.width })
  if (dims?.depth) sizeRows.push({ label: "奥行き", value: dims.depth })
  if (dims?.height) sizeRows.push({ label: "高さ", value: dims.height })
  if (weight) sizeRows.push({ label: "重量", value: weight })

  const sensorRows = []
  if (maxDpi) sensorRows.push({ label: "最大 DPI", value: maxDpi.replace(" DPI", "") })
  if (polling) sensorRows.push({ label: "ポーリングレート", value: polling })
  if (reading) sensorRows.push({ label: "読み取り方式", value: reading })
  if (buttonCount !== null && Number.isFinite(buttonCount))
    sensorRows.push({ label: "ボタン数", value: String(buttonCount) })
  if (sideButtons) sensorRows.push({ label: "サイドボタン", value: sideButtons })
  if (sideWheel) sensorRows.push({ label: "サイドホイール", value: sideWheel })
  if (map["ムーブメント検出技術"])
    sensorRows.push({ label: "センサー", value: map["ムーブメント検出技術"] })

  const powerRows = []
  if (power) powerRows.push({ label: "電源", value: power })
  if (battery) powerRows.push({ label: "電池持続", value: battery })
  const iface = sanitizeCommunicationInterface(map["通信・接続インターフェース"], title, map)
  if (iface)
    powerRows.push({
      label: "通信インターフェース（Amazon記載）",
      value: iface,
    })

  return {
    highlights: {
      weight: weight ?? DASH,
      maxDpi: maxDpi ?? DASH,
      reading: reading ?? DASH,
      polling: polling ?? DASH,
    },
    sizeRows,
    sensorRows,
    powerRows,
    meta: {
      modelNumber: map["型番"] ?? null,
      brand: map["ブランド名"] ?? null,
      buttonCount,
      sideButtons: sideButtons === "あり",
      sideWheel: sideWheel === "あり",
      movementRaw: map["ムーブメント検出技術"] ?? null,
      batteryContext,
    },
  }
}

export function applyAmazonSpecs(baseGadget, amazonSpecs, inferredConnection, contextTitle = "") {
  if (!amazonSpecs) return baseGadget

  const powerContext = `${contextTitle} ${baseGadget.tagline ?? ""} ${baseGadget.name ?? ""}`.trim()

  const h = amazonSpecs.highlights
  const highlights = [
    { label: "重量", value: h.weight !== DASH ? h.weight : baseGadget.highlights.find(x => x.label === "重量")?.value ?? DASH },
    { label: "最大DPI", value: h.maxDpi !== DASH ? h.maxDpi : baseGadget.highlights.find(x => x.label === "最大DPI")?.value ?? DASH },
    {
      label: "読み取り方式",
      value:
        h.reading !== DASH
          ? h.reading
          : baseGadget.highlights.find((x) => x.label === "読み取り方式")?.value ?? DASH,
    },
    {
      label: "ポーリングレート",
      value:
        h.polling !== DASH
          ? h.polling
          : baseGadget.highlights.find((x) => x.label === "ポーリングレート")?.value ?? DASH,
    },
  ]

  const specGroups = []

  const sizeRows =
    amazonSpecs.sizeRows.length > 0
      ? amazonSpecs.sizeRows
      : []
  if (sizeRows.some((r) => r.value && r.value !== DASH))
    specGroups.push({ title: "サイズ / 重量", rows: sizeRows })

  const sensorRows = [
    ...(amazonSpecs.sensorRows.length
      ? amazonSpecs.sensorRows
      : baseGadget.specGroups.find((g) => /センサー|入力/i.test(g.title))?.rows ?? []),
  ]
  if (sensorRows.length) specGroups.push({ title: "センサー / 入力", rows: sensorRows })

  const connRow = { label: "接続方式", value: inferredConnection }
  const wiredUsb = /有線\s*usb/i.test(inferredConnection)
  const powerRows = [
    connRow,
    ...amazonSpecs.powerRows
      .filter((row) => !(wiredUsb && row.label === "電池持続"))
      .map((row) => {
        if (row.label === "電源") {
          const value = wiredUsb
            ? "有線給電"
            : formatPowerDisplay(row.value, powerContext, {
                型番: amazonSpecs.meta?.modelNumber ?? "",
              })
          return { ...row, value }
        }
        if (row.label === "通信インターフェース（Amazon記載）" && wiredUsb) {
          return {
            ...row,
            value: sanitizeCommunicationInterface(row.value, contextTitle, {
              型番: amazonSpecs.meta?.modelNumber ?? "",
            }),
          }
        }
        return row
      }),
  ]
  specGroups.push({ title: "接続 / 電源", rows: powerRows })

  const tags = new Set(baseGadget.mouseFilterTags ?? [])
  if (amazonSpecs.meta.sideButtons) tags.add("side-buttons")
  if (amazonSpecs.meta.sideWheel) tags.add("side-wheel")
  const readingVal = highlights.find((x) => x.label === "読み取り方式")?.value ?? ""
  if (/darkfield|レーザー|laser/i.test(readingVal)) tags.add("reading-laser")
  else if (/トラックボール|trackball/i.test(readingVal)) tags.add("reading-trackball")
  else if (/光学|オプティカル|optical|blueled/i.test(readingVal)) tags.add("reading-optical")

  return {
    ...baseGadget,
    highlights,
    specGroups,
    mouseFilterTags: [...tags],
  }
}
