/**
 * モニター VESA 規格の確定値（Amazon / メーカー公式ベース）
 * ASIN 上書き + 型番パターン + デスクトップブランド既定
 */
import { readFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { MONITOR_LG_DISPLAY_SPECS_KNOWN } from "./monitor-lg-display-specs-known.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "monitor-body-specs-cache.json")

/** ASIN → VESA 規格 */
export const MONITOR_VESA_KNOWN_BY_ASIN = buildKnownAsinMap()

/** 型番・名称パターン（上から順に評価） */
export const MONITOR_VESA_MODEL_PATTERNS = [
  {
    re: /JN-IPS238G120F|JN-238IPS120F|JN-215V120F|JN-215IPS120F|JN-IPS215G120F|JN-Ei238G165F/i,
    vesa: "75×75 mm",
    note: "JAPANNEXT 21.5–23.8型 公式",
  },
  {
    re: /PTFBLT-22W|PTFWLT-22W/i,
    vesa: "100×100 mm",
    note: "Princeton 22型 100mmピッチ",
  },
  {
    re: /UPERFECT.*23\.8.*(?:Mobile|モバイル)|23\.8.*UPERFECT.*(?:Mobile|モバイル)/i,
    vesa: "75×75 mm",
    note: "UPERFECT 23.8型モバイル VESA Compatible",
  },
  {
    re: /(?:EVICIV|LivElect).*(?:18\.5|17\.3|16).*(?:VESA|壁掛)/i,
    vesa: "75×75 mm",
    note: "EVICIV/LivElect 大画面モバイル VESA対応",
  },
  {
    re: /EX-LDC151DBM|ARZOPA.*15\.6|NK-133|G-133Q|C-16QH/i,
    vesa: "非対応",
    note: "15–16型モバイル（VESA穴なし）",
  },
  {
    re: /Nitro\s+(?:VG|QG)|VG\d{3}|KA\d{3}|Predator/i,
    vesa: "100×100 mm",
    note: "Acer デスクトップゲーミング VESA 100×100",
  },
  {
    re: /(?:4[59]|39)GX950[AB]-B/i,
    vesa: "100×100 mm",
    note: "LG UltraGear OLED GX950 シリーズ",
  },
  {
    re: /ThinkVision|Thinkvision/i,
    vesa: "100×100 mm",
    note: "Lenovo ThinkVision 公式 VESA 100×100",
  },
  {
    re: /\b2[247]\dS\d+[A-Z][^/]*\/?\d*/i,
    vesa: "100×100 mm",
    note: "Philips S-line デスクトップ",
  },
  {
    re: /\bE1715S\b|\bU2424H\b|\bV247YU\b/i,
    vesa: "100×100 mm",
    note: "Dell/Acer 公式 VESA",
  },
  {
    re: /kksmart.*16\s*インチ|16インチ.*kksmart/i,
    vesa: "75×75 mm",
    note: "kksmart 16型モバイル VESA対応",
  },
  {
    re: /(?:VisionOwl|Upperizon|Newsoul|cocopar).*(?:14|15\.6).*(?:モバイル|Mobile|Portable)/i,
    vesa: "非対応",
    note: "小型モバイルモニター（VESA穴なし）",
  },
]

const MOBILE_RE =
  /モバイルモニター|Mobile Monitor|ポータブルモニター|Portable Monitor|デュアルモバイル|ポータブルディスプレイ|Portable Display/i

const DESKTOP_BRAND_RE =
  /\b(?:Lenovo|Dell|ASUS|Acer|PHILIPS|Philips|KOORUI|MSI|BenQ|AOC|ViewSonic|iiyama|IODATA|IO DATA|INNOCN|KTC|Pixio|Minifire|FeuVision|XUNDEFINED|CRUA|MAXZEN|Samsung|GIGABYTE|Huawei|NEC|EIZO|LG|JAPANNEXT|Xiaomi|Redmi)\b/i

function buildKnownAsinMap() {
  const map = {}

  if (existsSync(CACHE_PATH)) {
    const cache = JSON.parse(readFileSync(CACHE_PATH, "utf8"))
    for (const [asin, entry] of Object.entries(cache)) {
      if (entry.vesaStandard && entry.vesaStandard !== "—") {
        map[asin] = entry.vesaStandard
      }
    }
  }

  for (const [asin, spec] of Object.entries(MONITOR_LG_DISPLAY_SPECS_KNOWN)) {
    if (spec.vesa) map[asin] = spec.vesa
  }

  Object.assign(map, {
    B0GWDVFYBY: "100×100 mm", // Lenovo R25f-30 (64B8UAR1UZ)
    B0CPC17DZ9: "100×100 mm", // Philips 221S9A/11
    B0CPBZMBKT: "100×100 mm", // Philips 241S9A/11
    B0DXVF6S6C: "100×100 mm", // LG 45GX950A-B（Amazon: マウント規格 100×100）
    B0GZ7H94NP: "100×100 mm", // LG 39GX950B-B
    B0H26Q4JBQ: "100×100 mm", // LG 45GX950B-B
  })

  return map
}

function parseScreenInches(hay) {
  const fromHighlight =
    hay.match(/label:\s*"画面サイズ"[^]*?value:\s*"([^"]+)"/)?.[1] ??
    hay.match(/label:\s*"画面サイズ",\s*value:\s*"([^"]+)"/)?.[1]
  if (fromHighlight) {
    const hm = fromHighlight.match(/(\d{2}(?:\.\d)?)/)
    if (hm) {
      const n = Number(hm[1])
      if (Number.isFinite(n)) return n
    }
  }

  const patterns = [
    /(\d{2}(?:\.\d)?)\s*[-]?\s*(?:型|インチ|inch|Inch|")/i,
    /(\d{2}(?:\.\d)?)\s+Wide/i,
    /(\d{2}(?:\.\d)?)\s*Inch/i,
  ]
  for (const re of patterns) {
    const m = hay.match(re)
    if (m) {
      const n = Number(m[1])
      if (Number.isFinite(n)) return n
    }
  }

  if (/size-315-plus/.test(hay)) return 32
  if (/size-27/.test(hay)) return 27
  if (/size-24/.test(hay)) return 24
  if (/size-238/.test(hay)) return 23.8

  return null
}

/** デスクトップ系ブランドの 21.5型以上は VESA 100×100 が標準（メーカー仕様） */
function inferDesktopBrandDefaultVesa(hay) {
  if (MOBILE_RE.test(hay)) return null
  if (/Tiny-in-One|タッチモニター.*一体/i.test(hay)) return null
  if (!DESKTOP_BRAND_RE.test(hay)) return null

  const inches = parseScreenInches(hay)
  if (inches != null && inches < 17) return null
  if (inches == null && !/\b(?:1[89]|2[0-9]|[3-9]\d)(?:\.\d)?\s*[-]?\s*(?:型|インチ|inch|Inch|")/i.test(hay)) {
    return null
  }

  return "100×100 mm"
}

/** VESA対応表記のみでサイズ不明 → 画面サイズから推定（モバイル 16–19型） */
function inferMobileVesaCompatible(hay) {
  if (!MOBILE_RE.test(hay)) return null
  if (!/vesa|壁掛/i.test(hay)) return "非対応"
  const inches = parseScreenInches(hay)
  if (inches != null && inches <= 15.6) return "75×75 mm"
  if (inches != null && inches >= 16 && inches <= 19) return "75×75 mm"
  if (inches != null && inches >= 21) return "100×100 mm"
  if (/vesa/i.test(hay)) return "75×75 mm"
  return null
}

/** タグライン等に VESA 表記があるデスクトップ → 100×100（22型以上の一般的規格） */
function inferDesktopVesaCompatible(hay) {
  if (MOBILE_RE.test(hay)) return null
  if (!/vesa|壁掛け|wall\s*mount/i.test(hay)) return null
  const inches = parseScreenInches(hay)
  if (inches != null && inches >= 21.5) return "100×100 mm"
  if (inches != null && inches >= 19 && inches < 21.5) return "75×75 mm"
  if (/\b(?:2[1-9]|[3-9]\d)\s*(?:型|インチ|")\b/.test(hay)) return "100×100 mm"
  return null
}

/**
 * 確定 VESA を解決（見つからなければ null）
 * @param {string} asin
 * @param {string} haystack name + tagline + block text
 */
export function resolveMonitorVesaKnown(asin, haystack) {
  const hay = String(haystack ?? "")

  if (asin && MONITOR_VESA_KNOWN_BY_ASIN[asin]) {
    return MONITOR_VESA_KNOWN_BY_ASIN[asin]
  }

  for (const { re, vesa } of MONITOR_VESA_MODEL_PATTERNS) {
    if (re.test(hay)) return vesa
  }

  const mobile = inferMobileVesaCompatible(hay)
  if (mobile) return mobile

  const desktopCompat = inferDesktopVesaCompatible(hay)
  if (desktopCompat) return desktopCompat

  const brandDefault = inferDesktopBrandDefaultVesa(hay)
  if (brandDefault) return brandDefault

  return null
}
