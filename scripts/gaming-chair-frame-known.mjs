/**
 * Amazon / メーカー公式ベースのフレーム素材（ASIN 別）
 */
import { readFileSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseDetailTable } from "./amazon-monitor-body-specs.mjs"
import { inferFrameMaterial, DASH, extractAmazonChairSpecHaystack } from "./amazon-gaming-chair-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const HTML_DIR = join(__dirname, "gaming-chair-html")
const CACHE_PATH = join(__dirname, "gaming-chair-frame-cache.json")

/**
 * Amazon 仕様表・メーカー公式で確認済み（ASIN 優先）
 */
const MANUAL = {
  // Razer
  B0H7RYM4M2: "合金鋼", // Soma Chroma — steel frame (Razer support)

  // AutoFull
  B08CVNGYHK: "合金鋼", // C3 Pro — Frame Material Type: 金属（鋼） / 合金鋼
  B0DXPBGBPH: "合金鋼",
  B0FKB873SR: "合金鋼",
  B0H448HXD7: "合金鋼",
  B092DF433H: "合金鋼",

  // CORSAIR
  B0BMB5WFHW: "合金鋼", // T3 RUSH — steel frame

  // Dowinx 50H / LS-66D50H
  B0H35GKJYN: "合金鋼",
  B0GV486HG4: "合金鋼",
  B0GV49Z1GZ: "合金鋼",
  B0GV4JQV9D: "合金鋼",
  B0H459CMJK: "合金鋼",
  B0HD5YRVHJ: "合金鋼",
  B0BYYLPJQG: "合金鋼",
  B0FPL7B13K: "合金鋼",

  // AKRacing
  B07CBPDBKP: "合金鋼",
  B086JTT1GM: "合金鋼",
  B075R8GZR9: "合金鋼",
  B0BSP8RJ6J: "合金鋼",
  B01G8E2ETQ: "合金鋼",
  B0GFSNMZVN: "合金鋼",

  // JKOOK
  B0CJ2J6RXJ: "合金鋼",
  B0H6FPPJVQ: "合金鋼",

  // ATURBO / KM6006 white-label
  B0H74R6C4W: "合金鋼",
  B0H74ZQKVZ: "合金鋼",
  B0H2CWTDHT: "合金鋼",

  // GTPLAYER / GTRacing
  B0CX1J299G: "合金鋼",
  B0BXPBTTSL: "合金鋼",
  B0BXPFXZ5Z: "合金鋼",
  B07QGY4VGK: "合金鋼",

  // SIHOO
  B0CZ93PPX8: "合金鋼", // M18 — Class 4 gas lift + steel frame

  // HLDIRECT (nylon base but steel frame structure — Amazon 材質 lists alloy)
  B0H8YT5FCB: "合金鋼",

  // GALAKURO Lumora
  B0FXMBCG7L: "合金鋼",

  // 不二貿易 レイズ
  B08W21M8CL: "合金鋼",

  // Marsail mesh office
  B0G2L9NNZY: "合金鋼",

  // PAX4 / KTOW
  B0FJM2B7ZM: "アルミ合金", // 材質: アルミニウム, ナイロン, メッシュ

  // KARNOX — karnox.co.jp フレーム: スチール / Amazon 1.8mm steel tubing
  B0D981618B: "合金鋼",

  // Bonarca OEM PU ottoman (Amazon 材質: Alloy Steel)
  B0CZSQRX4W: "合金鋼",
  B0GLXG4BBM: "合金鋼",
  B0GVCRH3H5: "スチール（鋼鉄）",
  B09XHHKQ3F: "合金鋼",
  B0DR19FTHG: "合金鋼",
  B0DK2ZR1TY: "合金鋼",

  // GXTRACE mesh/resin frame (Amazon 材質: 樹脂 / ポリウレタン)
  B0F3N1H577: "強化プラスチック",
  B0F6XWL4LF: "強化プラスチック",
  B0FWC9HXM8: "強化プラスチック",
  B0FLJWVBHN: "強化プラスチック",
  B0GR9S1P69: "強化プラスチック",
  B0FY2PV2S9: "強化プラスチック",
  B0H2GWZ6XX: "強化プラスチック",
  B0GTXPNV95: "強化プラスチック",
  B0GTXW8SSD: "強化プラスチック",
  B0GGGLTTG4: "強化プラスチック",
  B0GVMLWP1P: "強化プラスチック",
  B0BXPGGBRM: "強化プラスチック",

  // mesh office chair (Amazon fetch)
  B0H3ZPLQ2F: "強化プラスチック",

  // CYBER-GROUND mesh rocker
  B01M629TAF: "スチール（鋼鉄）",

  // DoubleTT
  B0DZCL8VQM: "合金鋼",

  // IPPO+
  B0G3XDVW8Y: "合金鋼",
}

/** タイトル / ブロック本文からモデル名で解決 */
const MODEL_PATTERNS = [
  { test: /Dowinx|合成鋼(?:フレーム)?|50H-\d+|LS-66D50H|LS-6650/i, material: "合金鋼" },
  { test: /AutoFull|AF0\d+/i, material: "合金鋼" },
  { test: /AKRacing|アークレーシング/i, material: "合金鋼" },
  { test: /CORSAIR.*RUSH|T-3\s*RUSH|T3\s*RUSH/i, material: "合金鋼" },
  { test: /Razer.*(?:Iskur|Soma|Enki)/i, material: "合金鋼" },
  { test: /SIHOO|シフー/i, material: "合金鋼" },
  { test: /GTPLAYER|GTRacing|GTPLYER|Luft\d+|GTP\d+|GT829|GT890/i, material: "合金鋼" },
  { test: /JKOOK|JK\d{2}/i, material: "合金鋼" },
  { test: /KM6006|ATURBO/i, material: "合金鋼" },
  { test: /不二貿易|レイズ.*19429|19429/i, material: "合金鋼" },
  { test: /LUMORA|ルモーラ|GG-C2/i, material: "合金鋼" },
  { test: /Maydolly|メイドリー/i, material: "合金鋼" },
  { test: /NewBoy/i, material: "合金鋼" },
  { test: /Yaheetech/i, material: "合金鋼" },
  { test: /PAX\s*4|KTOW/i, material: "合金鋼" },
  { test: /Noblechairs|ノーブルチェア/i, material: "合金鋼" },
  { test: /Secretlab/i, material: "合金鋼" },
  { test: /DXRacer/i, material: "合金鋼" },
  { test: /COUGAR/i, material: "合金鋼" },
  { test: /Vertagear/i, material: "合金鋼" },
  { test: /RESPAWN/i, material: "合金鋼" },
  { test: /Andaseat/i, material: "合金鋼" },
  { test: /Marsail/i, material: "合金鋼" },
  { test: /Humergo/i, material: "合金鋼" },
  { test: /NINJA/i, material: "合金鋼" },
  { test: /VICTONE/i, material: "合金鋼" },
  { test: /CHAIRKER/i, material: "合金鋼" },
  { test: /Wisteria|ウィステリア|フリーダムチェア/i, material: "合金鋼" },
  { test: /onenext|ワンネクスト/i, material: "合金鋼" },
  { test: /Eeasky/i, material: "合金鋼" },
  { test: /HERCULES/i, material: "合金鋼" },
  { test: /HOLLUDLE/i, material: "合金鋼" },
  { test: /JPBSTO/i, material: "合金鋼" },
  { test: /iLooiLoo|ilooiloo/i, material: "合金鋼" },
  { test: /SYALEN|SLCH-15/i, material: "合金鋼" },
  { test: /Nekkoflo/i, material: "合金鋼" },
  { test: /GTBoy/i, material: "合金鋼" },
  { test: /HLDIRECT/i, material: "合金鋼" },
  { test: /FANTECH/i, material: "合金鋼" },
  { test: /COLEBREAD/i, material: "合金鋼" },
  { test: /NIONIK/i, material: "合金鋼" },
  {
    test: /収納式フットレスト.*連動式アームレスト|連動式アームレスト.*収納式フットレスト/i,
    material: "合金鋼",
  },
  {
    test: /頑丈な(?:合成|合金)?(?:鋼|スチール|金属)(?:フレーム|骨組|構造)/i,
    material: "合金鋼",
  },
  { test: /Frame Material Type.*合金|合金鋼フレーム/i, material: "合金鋼" },
  { test: /金属(?:フレーム|骨組|構造)|スチールフレーム|steel\s*frame/i, material: "スチール（鋼鉄）" },
  { test: /アルミ(?:ニウム)?(?:フレーム|合金|製)?|aluminum/i, material: "アルミ合金" },
  {
    test: /強化(?:プラスチック|樹脂|ナイロン)(?:フレーム|製)?|nylon\s*frame|pc\s*frame/i,
    material: "強化プラスチック",
  },
]

const BRAND_FRAME_DEFAULTS = {
  NIONIK: "合金鋼",
  Dowinx: "合金鋼",
  AutoFull: "合金鋼",
  AKRacing: "合金鋼",
  CORSAIR: "合金鋼",
  Razer: "合金鋼",
  GTPLAYER: "合金鋼",
  GTRacing: "合金鋼",
  SIHOO: "合金鋼",
  JKOOK: "合金鋼",
  ATURBO: "合金鋼",
  Humergo: "合金鋼",
  Maydolly: "合金鋼",
  NewBoy: "合金鋼",
  Yaheetech: "合金鋼",
  Marsail: "合金鋼",
  DXRacer: "合金鋼",
  Secretlab: "合金鋼",
  KARNOX: "合金鋼",
  GXTRACE: "強化プラスチック",
  KTOW: "アルミ合金",
  DoubleTT: "合金鋼",
  "IPPO+ PLUS": "合金鋼",
  IPPO: "合金鋼",
}

function extractTitle(html) {
  return (
    html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/i)?.[1]?.replace(/<[^>]+>/g, " ").trim() ??
    html.match(/<title>Amazon\.co\.jp:\s*([^:<]+)/i)?.[1]?.trim() ??
    ""
  )
}

function loadFromRawJson() {
  const map = {}
  for (const file of readdirSync(__dirname).filter((f) => /^gaming-chair.*-raw\.json$/i.test(f))) {
    const data = JSON.parse(readFileSync(join(__dirname, file), "utf8"))
    const items = data.gamingChairs ?? data.items ?? []
    for (const item of items) {
      const asin = item.asin
      const title = item.title ?? ""
      if (!asin || !title) continue
      const material = inferFrameMaterial(title)
      if (material !== DASH) map[asin] = material
    }
  }
  return map
}

function loadFromHtmlCache() {
  const map = {}
  if (!existsSync(HTML_DIR)) return map
  for (const file of readdirSync(HTML_DIR).filter((f) => f.endsWith(".html"))) {
    const asin = file.replace(".html", "")
    const html = readFileSync(join(HTML_DIR, file), "utf8")
    const haystack = extractAmazonChairSpecHaystack(html)
    const detailMap = parseDetailTable(html)
    const material = inferFrameMaterial(haystack, detailMap)
    if (material !== DASH) map[asin] = material
  }
  return map
}

function loadFromCache() {
  if (!existsSync(CACHE_PATH)) return {}
  const cache = JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  const map = {}
  for (const [asin, entry] of Object.entries(cache)) {
    if (entry.frameMaterial && entry.frameMaterial !== DASH) {
      map[asin] = entry.frameMaterial
    }
  }
  return map
}

function resolveFromPatterns(haystack) {
  for (const { test, material } of MODEL_PATTERNS) {
    if (test.test(haystack)) return material
  }
  return null
}

function resolveFromBrand(brand) {
  if (!brand || brand === DASH) return null
  const key = Object.keys(BRAND_FRAME_DEFAULTS).find((b) => new RegExp(`^${b}$`, "i").test(brand.trim()))
  return key ? BRAND_FRAME_DEFAULTS[key] : null
}

export const GAMING_CHAIR_FRAME_KNOWN = {
  ...loadFromRawJson(),
  ...loadFromHtmlCache(),
  ...loadFromCache(),
  ...MANUAL,
}

export function resolveGamingChairFrameMaterial(asin, haystack, brand = "") {
  if (asin && GAMING_CHAIR_FRAME_KNOWN[asin]) {
    return GAMING_CHAIR_FRAME_KNOWN[asin]
  }
  const fromPattern = resolveFromPatterns(haystack)
  if (fromPattern) return fromPattern
  const fromBrand = resolveFromBrand(brand)
  if (fromBrand) return fromBrand
  return inferFrameMaterial(haystack, {}, brand)
}
