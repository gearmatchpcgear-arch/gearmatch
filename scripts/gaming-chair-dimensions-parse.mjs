/**
 * Parse gaming chair dimensions from Amazon.co.jp detail table keys.
 */
import { parseDetailTable } from "./amazon-monitor-body-specs.mjs"

export function formatSingleCm(raw) {
  if (!raw) return null
  const text = String(raw).trim()
  const m = text.match(/([\d.]+)\s*(?:cm|センチ|センチメートル|centimeters?)/i)
  if (m) return `${m[1]} cm`
  const m2 = text.match(/^([\d.]+)\s*$/)
  if (m2) return `${m2[1]} cm`
  return null
}

/** Normalize chair body dimensions to "D × W × H cm" (奥行 × 幅 × 高さ). */
export function formatChairDimensions(raw) {
  if (!raw) return null
  const text = String(raw).trim().split(/[;；]/)[0].trim()

  const dwh = text.match(
    /([\d.]+)\s*D\s*[x×]\s*([\d.]+)\s*W\s*[x×]\s*([\d.]+)\s*H\s*(?:cm|センチ)?/i,
  )
  if (dwh) return `${dwh[1]} × ${dwh[2]} × ${dwh[3]} cm`

  const hwd = text.match(
    /([\d.]+)\s*H\s*[x×]\s*([\d.]+)\s*W\s*[x×]\s*([\d.]+)\s*D\s*(?:cm|センチ)?/i,
  )
  if (hwd) return `${hwd[3]} × ${hwd[2]} × ${hwd[1]} cm`

  const jp = text.match(
    /([\d.]+)\s*(?:幅|W)[^x×]*[x×]\s*([\d.]+)\s*(?:奥行|D)[^x×]*[x×]\s*([\d.]+)\s*(?:高さ|H)?/i,
  )
  if (jp) return `${jp[2]} × ${jp[1]} × ${jp[3]} cm`

  const plain = text.match(
    /([\d.]+)\s*[x×]\s*([\d.]+)\s*[x×]\s*([\d.]+)\s*(?:cm|センチ|センチメートル|centimeters?)?/i,
  )
  if (plain) return `${plain[1]} × ${plain[2]} × ${plain[3]} cm`

  const jpLabeled = text.match(
    /([\d.]+)\s*奥行(?:き|)?\s*[x×]\s*([\d.]+)\s*幅\s*[x×]\s*([\d.]+)\s*高(?:さ|)?\s*cm/i,
  )
  if (jpLabeled) return `${jpLabeled[1]} × ${jpLabeled[2]} × ${jpLabeled[3]} cm`

  return null
}

const DIMENSION_KEY =
  /^(品目の寸法|商品の寸法|製品の寸法|本体寸法|本体サイズ|製品サイズ|チェアサイズ|サイズ|寸法)/i
const SEAT_DEPTH_KEY = /^(座部奥行|座部奥行き|座面の奥行|座面奥行|seat depth)/i
const SEAT_WIDTH_KEY = /^(座面の長さ|座面の幅|座面幅|seat width|seat length)/i
const BACKREST_WIDTH_KEY = /^(椅子の背もたれの幅|背もたれの幅|背幅|backrest width)/i

export function parseGamingChairDimensionsFromMap(detailMap) {
  const out = {}
  for (const [key, val] of Object.entries(detailMap ?? {})) {
    if (!out.dimensions && DIMENSION_KEY.test(key)) {
      const d = formatChairDimensions(val)
      if (d) out.dimensions = d
    }
    if (!out.seatDepth && SEAT_DEPTH_KEY.test(key)) {
      const d = formatSingleCm(val)
      if (d) out.seatDepth = d
    }
    if (!out.seatWidth && SEAT_WIDTH_KEY.test(key)) {
      const d = formatSingleCm(val)
      if (d) out.seatWidth = d
    }
    if (!out.backrestWidth && BACKREST_WIDTH_KEY.test(key)) {
      const d = formatSingleCm(val)
      if (d) out.backrestWidth = d
    }
  }
  return out
}

function readLabeledCm(html, labelRes) {
  const m = html.match(labelRes)
  return m ? formatSingleCm(m[1] + " cm") : null
}

/** Parse dimensions from full Amazon HTML (detail table + inline product facts). */
export function parseGamingChairDimensionsFromText(html) {
  if (!html) return {}
  const out = {}

  const dimPatterns = [
    /(?:品目の寸法|商品の寸法|商品本体サイズ|製品の寸法)[^0-9]{0,40}([\d.]+(?:\s*奥行(?:き|)?\s*[x×]\s*[\d.]+\s*幅\s*[x×]\s*[\d.]+\s*高(?:さ|)?|\s*[x×]\s*[\d.]+\s*[x×]\s*[\d.]+)\s*cm)/i,
    /([\d.]+\s*奥行(?:き|)?\s*[x×]\s*[\d.]+\s*幅\s*[x×]\s*[\d.]+\s*高(?:さ|)?\s*cm)/i,
    /([\d.]+\s*[x×]\s*[\d.]+\s*[x×]\s*[\d.]+)\s*cm/i,
  ]
  for (const re of dimPatterns) {
    const m = html.match(re)
    if (m) {
      const d = formatChairDimensions(m[1])
      if (d) {
        out.dimensions = d
        break
      }
    }
  }

  out.seatDepth =
    readLabeledCm(html, /(?:座部奥行き|座部奥行|座面の奥行)[^0-9]{0,24}([\d.]+)\s*(?:cm|センチ)/i) ??
    out.seatDepth
  out.seatWidth =
    readLabeledCm(html, /(?:座面の長さ|座面の幅)[^0-9]{0,24}([\d.]+)\s*(?:cm|センチ)/i) ??
    readLabeledCm(html, /座面の幅\s*(\d+)\s*cm/i) ??
    out.seatWidth
  out.backrestWidth =
    readLabeledCm(
      html,
      /(?:椅子の背もたれの幅|背もたれの幅)[^0-9]{0,24}([\d.]+)\s*(?:cm|センチ)/i,
    ) ?? out.backrestWidth

  return out
}

export function parseGamingChairDimensionsFromHtml(html) {
  if (!html) return {}
  return mergeDimensionRecords(
    parseGamingChairDimensionsFromMap(parseDetailTable(html)),
    parseGamingChairDimensionsFromText(html),
  )
}

export function mergeDimensionRecords(...records) {
  const out = {}
  for (const rec of records) {
    if (!rec) continue
    for (const key of ["dimensions", "seatDepth", "seatWidth", "backrestWidth"]) {
      if (rec[key] && !out[key]) out[key] = rec[key]
    }
  }
  return out
}
