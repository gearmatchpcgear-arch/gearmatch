/**
 * Parse Amazon.co.jp monitor product dimensions & weight from detail table.
 */
import { formatWeight, extractWeightFromText } from "./amazon-mouse-specs.mjs"
import { inferMonitorVesaStandardFromText } from "./monitor-vesa-standard.mjs"

export const DASH = "—"

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

export function parseDetailTable(html) {
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

  // Fallback: generic spec table rows (English/JP mixed product pages)
  for (const m of html.matchAll(
    /<tr[^>]*>\s*<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi,
  )) {
    const key = stripTags(m[1])
    const val = stripTags(m[2])
    if (!key || !val || key.length > 80 || val.length > 500) continue
    if (/customer reviews|おすすめ度|var dpAcr/i.test(key + val)) continue
    if (!map[key]) map[key] = val
  }

  return map
}

const DIM_KEY_RE =
  /^(商品の寸法|製品の寸法|品目の寸法|本体サイズ|モニターのサイズ|ディスプレイサイズ|サイズ|寸法)/i
const WEIGHT_KEY_RE =
  /^(商品の重量|商品重量|本体重量|重量|Item Weight|Product Weight|Unit Weight|梱包重量)/i
const PACKAGE_RE = /パッケージ|梱包|発送|梱包サイズ/i
const SCREEN_SIZE_RE = /画面サイズ|解像度|パネル|ディスプレイ解像度/i

/** Normalize Amazon dimension string to display form (cm preferred, else mm). */
export function formatDimensions(raw) {
  const text = String(raw ?? "").trim()
  if (!text) return null

  // Strip trailing weight segment: "61.4 x 21 x 46.1 cm; 6.35 kg"
  const dimPart = text.split(/[;；]/)[0].trim()

  // English Amazon: 18.7D x 54.2W x 44.2H cm
  const dwhSuffix = dimPart.match(
    /([\d.]+)\s*D\s*[x×]\s*([\d.]+)\s*W\s*[x×]\s*([\d.]+)\s*H\s*(?:cm|センチ)?/i,
  )
  if (dwhSuffix) {
    return `${dwhSuffix[2]} × ${dwhSuffix[3]} × ${dwhSuffix[1]} cm`
  }

  // D x W x H with Japanese labels: 19.2奥行き x 55.7幅 x 40.9高さ cm
  const dwhMatch = dimPart.match(
    /([\d.]+)\s*(?:奥行|奥行き|depth)[^x×]*[x×]\s*([\d.]+)\s*(?:幅|width)[^x×]*[x×]\s*([\d.]+)\s*(?:高さ|height)?[^x×]*(?:cm|センチ)?/i,
  )
  if (dwhMatch) {
    const depth = dwhMatch[1]
    const width = dwhMatch[2]
    const height = dwhMatch[3]
    return `${width} × ${height} × ${depth} cm`
  }

  // cm: 61.4 x 21 x 46.1 cm  or  61.4×21×46.1cm
  const cmMatch = dimPart.match(
    /(?:約\s*)?([\d.]+)\s*[x×]\s*([\d.]+(?:\s*[-–]\s*[\d.]+)?)\s*[x×]\s*([\d.]+)\s*(?:cm|センチ|センチメートル)?/i,
  )
  if (cmMatch) {
    const w = cmMatch[1]
    const h = cmMatch[2].replace(/\s*[-–]\s*/g, "–")
    const d = cmMatch[3]
    return `${w} × ${h} × ${d} cm`
  }

  // mm: 540 x 379 x 193 mm
  const mmMatch = dimPart.match(
    /(?:約\s*)?([\d.]+)\s*[x×]\s*([\d.]+(?:\s*[-–]\s*[\d.]+)?)\s*[x×]\s*([\d.]+)\s*(?:mm|ミリ|ミリメートル)?/i,
  )
  if (mmMatch) {
    const w = mmMatch[1]
    const h = mmMatch[2].replace(/\s*[-–]\s*/g, "–")
    const d = mmMatch[3]
    return `約${w} × ${h} × ${d} mm`
  }

  // W x H only (no depth) — skip, not full dimensions
  return null
}

/** Reject implausible monitor weights from noisy page text. */
export function validateMonitorWeight(formatted, dimensions = DASH) {
  if (!formatted || formatted === DASH) return DASH

  let kg = null
  const kgMatch = formatted.match(/([\d.]+)\s*kg\b/i)
  const gMatch = formatted.match(/([\d.]+)\s*g\b/i)
  if (kgMatch) kg = Number(kgMatch[1])
  else if (gMatch) kg = Number(gMatch[1]) / 1000
  else return formatted

  if (!Number.isFinite(kg) || kg <= 0) return DASH

  const nums = [...String(dimensions).matchAll(/([\d.]+)/g)].map((m) => Number(m[1]))
  const maxDim = nums.length ? Math.max(...nums) : null
  const portable = maxDim != null && maxDim <= 40

  const minKg = portable ? 0.25 : 0.9
  const maxKg = portable ? 3.5 : 25
  if (kg < minKg || kg > maxKg) return DASH

  return formatted
}

/** Reject implausible monitor dimensions (bad Amazon rows, package mix-ups). */
export function validateDimensions(formatted) {
  if (!formatted || formatted === DASH) return DASH
  const nums = [...formatted.matchAll(/([\d.]+)/g)].map((m) => Number(m[1]))
  if (nums.length < 3) return DASH
  const [a, b, c] = nums
  const max = Math.max(a, b, c)
  const min = Math.min(a, b, c)
  // Desktop / portable monitors: no edge above 120cm, no edge below 0.8cm
  if (max > 120 || min < 0.8) return DASH
  // Two edges should exceed ~20cm (smallest mobile ~10" width)
  const sorted = [...nums].sort((x, y) => y - x)
  if (sorted[1] < 15) return DASH
  return formatted
}

export function extractWeightFromCombined(raw) {
  const text = String(raw ?? "")
  const afterSemi = text.split(/[;；]/)[1]?.trim()
  if (afterSemi) {
    const kg = afterSemi.match(/([\d.,]+)\s*(kg|キロ|kilograms?)/i)
    if (kg) return `${kg[1].replace(/,/g, "")} kg`
    const g = formatWeight(afterSemi)
    if (g) return g.replace(/\s*g\b/i, " g")
  }
  return null
}

export function formatMonitorWeight(raw) {
  const text = String(raw ?? "").trim()
  if (!text) return null

  const fromCombined = extractWeightFromCombined(text)
  if (fromCombined) return fromCombined

  const kgMatch = text.match(
    /(?:約\s*)?([\d.,]+)\s*(?:kg|キログラム|キロ|kilograms?)(?:\s|$|[;；,)）])/i,
  )
  if (kgMatch) {
    const num = kgMatch[1].replace(/,/g, "")
    return `${num} kg`
  }

  const gramMatch = text.match(
    /(?:約\s*)?([\d.,]+)\s*(?:g|グラム|grams?)(?:\s|$|[;；,)）])/i,
  )
  if (gramMatch) {
    const grams = Number(gramMatch[1].replace(/,/g, ""))
    if (Number.isFinite(grams) && grams > 0) {
      if (grams >= 1000) return `${(grams / 1000).toFixed(2).replace(/\.?0+$/, "")} kg`
      return `${grams} g`
    }
  }

  const poundsMatch = text.match(/(?:約\s*)?([\d.,]+)\s*(?:lbs?|pounds?|ポンド)/i)
  if (poundsMatch) {
    const lbs = Number(poundsMatch[1].replace(/,/g, ""))
    if (Number.isFinite(lbs) && lbs > 0) {
      return `${(Math.round(lbs * 0.453592 * 100) / 100).toFixed(2).replace(/\.00$/, "")} kg`
    }
  }

  const gFormatted = formatWeight(text)
  if (gFormatted) return gFormatted

  return null
}

export function pickDimensionValue(map) {
  for (const [key, val] of Object.entries(map)) {
    if (PACKAGE_RE.test(key) || SCREEN_SIZE_RE.test(key)) continue
    if (DIM_KEY_RE.test(key) || /item dimensions|product dimensions/i.test(key)) {
      const formatted = formatDimensions(val)
      if (formatted !== DASH) return formatted
    }
  }
  for (const [key, val] of Object.entries(map)) {
    if (PACKAGE_RE.test(key) || SCREEN_SIZE_RE.test(key)) continue
    if (/寸法|dimensions/i.test(key)) {
      const formatted = formatDimensions(val)
      if (formatted !== DASH) return formatted
    }
  }
  return null
}

export function pickWeightValue(map, dimRaw = "") {
  for (const [key, val] of Object.entries(map)) {
    if (WEIGHT_KEY_RE.test(key) || /^item weight$/i.test(key.trim())) {
      const w = formatMonitorWeight(val)
      if (w) return w
    }
  }
  const fromDim = extractWeightFromCombined(dimRaw)
  if (fromDim) return fromDim
  return null
}

function pickWeightFromHtml(html) {
  const bullets = [
    ...html.matchAll(/<span[^>]*class="[^"]*a-list-item[^"]*"[^>]*>([\s\S]*?)<\/span>/gi),
  ]
  for (const b of bullets) {
    const w = formatMonitorWeight(stripTags(b[1]))
    if (w) return w
  }

  const fromText = extractWeightFromText(stripTags(html).slice(0, 80000))
  if (fromText) {
    const w = formatMonitorWeight(fromText)
    if (w) return w
  }

  return null
}

export function pickVesaValue(map, html = "") {
  const VESA_KEY_RE = /vesa|壁掛け|wall\s*mount|マウント規格/i

  for (const [key, val] of Object.entries(map)) {
    if (/マウント規格|mount/i.test(key)) {
      const std = inferMonitorVesaStandardFromText(val)
      if (std !== DASH) return std
    }
  }

  const overview = html.match(/id="productDescription"[^>]*>([\s\S]*?)<\/div>/i)?.[1]
  if (overview) {
    const overviewText = stripTags(overview).slice(0, 8000)
    const mountMatch = overviewText.match(/マウント規格[：:]\s*(\d{2,3})\s*[x×]\s*(\d{2,3})/i)
    if (mountMatch) {
      return inferMonitorVesaStandardFromText(`${mountMatch[1]}×${mountMatch[2]} mm`)
    }
  }

  for (const [key, val] of Object.entries(map)) {
    if (VESA_KEY_RE.test(key)) {
      const std = inferMonitorVesaStandardFromText(val)
      if (std !== DASH) return std
    }
  }

  const bullets = [
    ...html.matchAll(/<span[^>]*class="[^"]*a-list-item[^"]*"[^>]*>([\s\S]*?)<\/span>/gi),
  ]
  for (const b of bullets) {
    const text = stripTags(b[1])
    if (VESA_KEY_RE.test(text)) {
      const std = inferMonitorVesaStandardFromText(text)
      if (std !== DASH) return std
    }
  }

  if (overview && VESA_KEY_RE.test(overview)) {
    const std = inferMonitorVesaStandardFromText(stripTags(overview).slice(0, 4000))
    if (std !== DASH) return std
  }

  return DASH
}

export function parseAmazonMonitorBodySpecs(html) {
  const map = parseDetailTable(html)
  const dimRaw =
    Object.entries(map).find(
      ([k]) => !PACKAGE_RE.test(k) && /寸法|サイズ|dimensions/i.test(k),
    )?.[1] ?? ""
  const dimensions = validateDimensions(pickDimensionValue(map) ?? DASH)
  const weight = validateMonitorWeight(
    pickWeightValue(map, dimRaw) ?? pickWeightFromHtml(html) ?? DASH,
    dimensions,
  )
  const vesaStandard = pickVesaValue(map, html)
  return { map, dimensions, weight, vesaStandard }
}
