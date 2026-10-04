/**
 * Amazon ウェブカメラ商品タイトル・詳細表からアプリ用フィールドを推論
 */
import { parseDetailTable, formatDimensions } from "./amazon-monitor-body-specs.mjs"
import { formatWeight } from "./amazon-mouse-specs.mjs"

export const DASH = "—"

const BRAND_PATTERNS = [
  ["Logicool", /^(?:【[^】]+】\s*)?(?:logicool|ロジクール)/i],
  ["Anker", /^anker\b/i],
  ["EMEET", /^emeet\b/i],
  ["ELECOM", /^(?:エレコム|elecom)/i],
  ["UGREEN", /^ugreen\b/i],
  ["AOC", /^aoc\b/i],
  ["Buffalo", /^(?:バッファロー|buffalo)/i],
  ["Insta360", /^insta360\b/i],
  ["DAMOACAM", /^damoacam\b/i],
  ["NearStream", /^nearstream\b/i],
  ["NexiGo", /^nexigo\b/i],
  ["DEPSTECH", /^depstech\b/i],
  ["OBSBOT", /^obsbot\b/i],
  ["Nuroum", /^nuroum\b/i],
  ["サンワダイレクト", /^サンワダイレクト/i],
  ["サンワサプライ", /^サンワサプライ/i],
  ["Angetube", /^angetube\b/i],
  ["TOALLIN", /^toallin\b/i],
  ["Innex", /^innex\b/i],
  ["FoMaKo", /^fomako\b/i],
  ["ELP", /^elp\b/i],
  ["KEYESTUDIO", /^keyestudio\b/i],
  ["YoloLiv", /^yololiv\b/i],
  ["NearStream", /^nearstream\b/i],
  ["Elgato", /^elgato\b/i],
  ["OBSBOT", /^obsbot\b/i],
  ["Innex", /^innex\b/i],
  ["j5create", /^j5create\b/i],
  ["Hollyland", /^hollyland\b/i],
  ["MAXHUB", /^maxhub\b/i],
  ["Spedal", /^spedal\b/i],
  ["Creative", /^creative\b/i],
  ["Ideao", /^ideao\b/i],
  ["Angetube", /^angetube\b/i],
  ["TOALLIN", /^toallin\b/i],
  ["TreasLin", /^treaslin\b/i],
  ["INSWAN", /^inswan\b/i],
  ["TONGVEO", /^tongveo\b/i],
  ["Tenveo", /^tenveo\b/i],
  ["AIRHUG", /^airhug\b/i],
  ["Cyvorsky", /^cyvorsky\b/i],
  ["ZAIDER", /^zaider\b/i],
  ["Aury", /^aury\b/i],
  ["Amazonベーシック", /^amazonベーシック|^amazon basics/i],
]

export function extractBrand(title) {
  const t = String(title).trim()
  for (const [brand, re] of BRAND_PATTERNS) {
    if (re.test(t)) return brand
  }
  const m = t.match(/^【[^】]+】\s*([A-Za-z\u3040-\u30ff\u4e00-\u9fff][^\s|｜]{0,18})/)
  if (m) return m[1].trim()
  return DASH
}

export function shortProductName(title, brand) {
  const t = String(title)
    .replace(/^【Amazon\.co\.jp\s*限定】\s*/i, "")
    .replace(/^【Amazon\.co\.jp Exclusive】\s*/i, "")
    .trim()

  const modelPatterns = [
    /\b(C\d{3,4}[a-z]{0,3})\b/i,
    /\b(Brio\s*\d+[a-z]*|BRIO\s*\d+[a-z]*)\b/i,
    /\b(MX\s*BRIO\s*\d+)\b/i,
    /\b(PowerConf\s*C\d{3})\b/i,
    /\b(FineCam\s*Lite)\b/i,
    /\b(UCAM-[A-Z0-9]+)\b/i,
    /\b(BSW\d+[A-Z]+)\b/i,
    /\b(C960|C950|S600|PIXY)\b/i,
    /\b(Link\s*2C\s*Pro)\b/i,
    /\b(C1000eR|C920s\s*Pro)\b/i,
  ]
  for (const re of modelPatterns) {
    const m = t.match(re)
    if (m) return m[1].replace(/\s+/g, " ")
  }

  const cleaned = t
    .replace(new RegExp(`^${brand}\\s*`, "i"), "")
    .replace(/webカメラ|ウェブカメラ|webcam|usbカメラ/gi, "")
    .split(/[|｜]/)[0]
    .trim()
  return cleaned.slice(0, 48) || t.slice(0, 48)
}

export function inferResolution(text) {
  const hay = String(text)
  if (/4k\s*uhd|3840\s*[x×]\s*2160|\b4k\b/i.test(hay) && /60\s*fps|60fps/i.test(hay)) {
    return "4K / 60fps"
  }
  if (/4k\s*uhd|3840\s*[x×]\s*2160|\b4k\b/i.test(hay)) return "4K / 30fps"
  if (/2k\s*hq|2560\s*[x×]\s*1440|\b2k\b/i.test(hay)) return "2K / 30fps"
  if (/1080p\s*\/\s*60|1080p@60|1080\s*p\s*60|60\s*fps.*1080|1080.*60\s*fps/i.test(hay)) {
    return "1080p / 60fps"
  }
  if (/1080|full\s*hd|fhd|1920\s*[x×]\s*1080/i.test(hay)) return "1080p / 30fps"
  if (/720|hd\s*720|1280\s*[x×]\s*720/i.test(hay)) return "720p / 30fps"
  return DASH
}

export function inferFieldOfView(text) {
  const hay = String(text)
  const m =
    hay.match(/(?:視野角|画角|fov|field of view)[^\d]{0,12}(\d{2,3})\s*°/i) ??
    hay.match(/(\d{2,3})\s*°(?:広角|視野角|画角|fov)?/i) ??
    hay.match(/広角\s*(\d{2,3})\s*°/i)
  return m ? `${m[1]}°` : DASH
}

export function inferFocusType(text) {
  const hay = String(text)
  if (/固定フォーカス|固定焦点|fixed focus/i.test(hay)) return "固定フォーカス"
  if (/pdaf|オートフォーカス|auto\s*focus|autofocus|\baf\b/i.test(hay)) return "オートフォーカス"
  return DASH
}

export function inferMicrophone(text) {
  const hay = String(text)
  if (/ai\s*ノイズ|aiノイズ|ai noise/i.test(hay)) return "AIノイズキャンセリングマイク"
  if (/ノイズキャンセ|ノイズリダクション|noise cancel|noise reduction/i.test(hay)) {
    return /ステレオ|stereo|x2|2\s*個/i.test(hay) ? "ステレオマイク (ノイズリダクション)" : "ノイズキャンセリングマイク"
  }
  if (/ステレオマイク|stereo\s*mic|ステレオ\s*マイク|デュアルマイク|2\s*マイク/i.test(hay)) {
    return "ステレオマイク"
  }
  if (/モノラル|mono/i.test(hay)) return "モノラルマイク"
  if (/マイク内蔵|内蔵マイク|マイク付/i.test(hay)) return "内蔵マイク"
  return DASH
}

export function inferConnector(text, detailMap = {}) {
  const hay = `${text} ${Object.values(detailMap).join(" ")}`.toLowerCase()
  if (/usb[\s-]?type[\s-]?c|usb-c|type-c/i.test(hay)) return "USB-C"
  if (/usb[\s-]?a|usb\s*2\.0|usb\s*3\.0|usb接続|usb\s*port/i.test(hay)) return "USB-A"
  if (/\busb\b/i.test(hay)) return "USB-A"
  return DASH
}

export function inferFrameRate(text, resolution) {
  const hay = String(text)
  if (/60\s*fps|60fps|@60/i.test(hay)) return "60fps"
  if (/30\s*fps|30fps|@30/i.test(hay)) return "30fps"
  if (/4k/i.test(resolution)) return "30fps"
  if (/1080|720|2k/i.test(resolution)) return "30fps"
  return DASH
}

export function inferDimensionsWeight(html, title) {
  const map = html ? parseDetailTable(html) : {}
  const hay = `${title} ${Object.entries(map).map(([k, v]) => `${k} ${v}`).join(" ")}`

  let dimensions = DASH
  for (const [key, val] of Object.entries(map)) {
    if (/^(商品の寸法|製品の寸法|品目の寸法|本体サイズ|サイズ|寸法)/i.test(key) && !/パッケージ|梱包/i.test(key)) {
      const formatted = formatDimensions(val)
      if (formatted) {
        dimensions = formatted
        break
      }
    }
  }
  if (dimensions === DASH) {
    const fromTitle = hay.match(/(?:約\s*)?([\d.]+)\s*[x×]\s*([\d.]+)\s*[x×]\s*([\d.]+)\s*(?:mm|cm)/i)
    if (fromTitle) {
      dimensions = `${fromTitle[1]} × ${fromTitle[2]} × ${fromTitle[3]} mm`
    }
  }

  let weight = DASH
  for (const [key, val] of Object.entries(map)) {
    if (/^(商品の重量|商品重量|本体重量|重量)/i.test(key) && !/パッケージ|梱包/i.test(key)) {
      const w = formatWeight(val)
      if (w) {
        weight = w
        break
      }
    }
  }

  return { dimensions, weight, detailMap: map }
}

export function buildTagline(title, specs) {
  const parts = []
  if (specs.resolution !== DASH) parts.push(specs.resolution)
  if (specs.fieldOfView !== DASH) parts.push(`${specs.fieldOfView}画角`)
  if (specs.focusType !== DASH) parts.push(specs.focusType)
  if (specs.microphone !== DASH) parts.push(specs.microphone)
  const base = parts.length ? parts.join("・") : title.split(/[|｜]/)[0].trim().slice(0, 60)
  return base.slice(0, 100)
}

export function mergeSpecs(base, override = {}) {
  const keys = [
    "name",
    "brand",
    "tagline",
    "price",
    "connection",
    "resolution",
    "fieldOfView",
    "focusType",
    "microphone",
    "connector",
    "frameRate",
    "dimensions",
    "weight",
    "image",
  ]
  const out = { ...base }
  for (const k of keys) {
    if (override[k] != null && override[k] !== "") out[k] = override[k]
  }
  return out
}

export function buildCameraGadget(item, extra = {}) {
  const title = item.title ?? ""
  const brand = extra.brand ?? extractBrand(title)
  const name = extra.name ?? shortProductName(title, brand)
  const inferred = inferDimensionsWeight(extra.html ?? "", title)

  const resolution = extra.resolution ?? inferResolution(`${title} ${Object.values(inferred.detailMap).join(" ")}`)
  const fieldOfView = extra.fieldOfView ?? inferFieldOfView(title)
  const focusType = extra.focusType ?? inferFocusType(title)
  const microphone = extra.microphone ?? inferMicrophone(title)
  const connector = extra.connector ?? inferConnector(title, inferred.detailMap)
  const frameRate = extra.frameRate ?? inferFrameRate(title, resolution)
  const dimensions = extra.dimensions ?? inferred.dimensions
  const weight = extra.weight ?? inferred.weight
  const connection = extra.connection ?? connector
  const price = extra.price ?? item.price ?? null
  const image = extra.image ?? item.image ?? ""

  const specs = mergeSpecs(
    {
      name,
      brand,
      tagline: buildTagline(title, { resolution, fieldOfView, focusType, microphone }),
      price,
      connection,
      resolution,
      fieldOfView,
      focusType,
      microphone,
      connector,
      frameRate,
      dimensions,
      weight,
      image,
    },
    extra,
  )

  const id = `cam-bs-${String(item.rank ?? item.amazonRank ?? 0).padStart(3, "0")}`

  return {
    id,
    rank: item.rank ?? item.amazonRank,
    asin: item.asin,
    rating: item.rating ?? 4.0,
    reviews: item.reviews ?? 0,
    purchaseUrl: `https://www.amazon.co.jp/dp/${item.asin}`,
    ...specs,
    highlights: [
      { label: "解像度", value: specs.resolution },
      { label: "画角", value: specs.fieldOfView },
      { label: "フォーカス", value: specs.focusType },
      { label: "マイク", value: specs.microphone },
    ],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [
          { label: "寸法", value: specs.dimensions },
          { label: "重量", value: specs.weight },
        ],
      },
      {
        title: "映像",
        rows: [
          { label: "解像度", value: specs.resolution },
          { label: "フレームレート", value: specs.frameRate },
          { label: "画角", value: specs.fieldOfView },
          { label: "フォーカス", value: specs.focusType },
          { label: "マイク", value: specs.microphone },
        ],
      },
      {
        title: "接続",
        rows: [
          { label: "接続端子", value: specs.connector },
          { label: "Amazon売れ筋", value: item.rank ? `Webカメラ #${item.rank}` : DASH },
        ],
      },
    ],
  }
}
