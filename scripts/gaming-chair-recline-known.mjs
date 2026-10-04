/**
 * Amazon / メーカー公式ベースの最大リクライニング角度（ASIN 別）
 * raw JSON の Amazon タイトルから推論した値をマージ
 */
import { readFileSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { inferMaxRecliningAngle } from "./amazon-gaming-chair-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "gaming-chair-recline-cache.json")

/**
 * メーカー公式・Amazon 仕様表で確認済み（ASIN 優先）
 * 出典: autofull.com, razer.com, corsair.com, akracing.jp, sihoooffice.co.jp,
 *       kuroutoshikou.com, dowinx.co.jp, fujiboeki.net 等
 */
const MANUAL = {
  // Razer
  B0H7RYM4M2: "155°", // Soma Chroma — razer.com/support Up to 155°

  // AutoFull
  B0DXPBGBPH: "140°", // G7 — autofull.com 140° zero-gravity recline
  B0FKB873SR: "140°",
  B0H448HXD7: "140°",
  B092DF433H: "155°", // C3 — 155° tilt (AutoFull official / Rakuten)

  // CORSAIR
  B0BMB5WFHW: "160°", // T-3 RUSH V2 CF-9010058 — corsair.com 90-160°

  // Dowinx 50H / LS-66D50H series
  B0H35GKJYN: "145°", // 50H-08A — dowinx.co.jp / Sizeee 145°
  B0GV486HG4: "145°", // 50H-04
  B0GV49Z1GZ: "145°", // 50H-01

  // SIHOO
  B0CZ93PPX8: "126°", // M18 — sihoooffice.co.jp 最大126°

  // GALAKURO Lumora C2
  B0FXMBCG7L: "175°", // GG-C2/LUMORA — kuroutoshikou.com 90°～175°

  // 不二貿易
  B08W21M8CL: "150°", // レイズ 19429 — fujiboeki.net 90-150度

  // GTPLAYER
  B0CX1J299G: "140°", // LR002-GRAY — 90°～140° (GTRACING review)
  B0DK78311L: "140°", // LR002新シリーズ
  B0BXPBTTSL: "165°", // GTP002F-WHITE — GT002F 90-165°
  B0BXPFXZ5Z: "165°", // GTP002F-BLUE
  B0DCJ4VDHL: "155°", // GT829-GRAY — matches filled GT829 in lib
  B0DCHY5B11: "155°", // GT829-BLACK

  // AKRacing
  B07CBPDBKP: "180°", // Overture — akracing.jp
  B086JTT1GM: "180°", // Pro-X V2 — tekwind.co.jp
  B075R8GZR9: "180°", // Premium — AKRacing standard full-flat line
  B0BSP8RJ6J: "150°", // 本田翼監修 — Amazon 商品概要 最大150°
  B01G8E2ETQ: "180°", // Wolf — akracing.jp 最大180°
  B0GFSNMZVN: "180°", // Faura — AKRacing fabric line

  // AKRacing ストアシリーズ（Amazon 2026-08-16）
  B086JS8F4L: "180°", // Pro-X V2 White
  B086JTCGZR: "180°", // Pro-X V2 Blue
  B086JT5BNJ: "180°", // Pro-X V2 Red
  B08YWBK2Y9: "180°", // Pro-X V2 Orange
  B07BZC81RV: "180°", // Overture Purple
  B07CF8N2VL: "180°", // Overture Blue
  B07CBPDVPG: "180°", // Overture White
  B0CVZXQ6B7: "180°", // Overture Yellow
  B07CBPCZ8R: "180°", // Overture Pink
  B07CBPDMCC: "180°", // Overture variant
  B086JTJ394: "180°", // Nitro V2 Red
  B086JTZJB4: "180°", // Nitro V2 White
  B086JTZJB3: "180°", // Nitro V2 Blue
  B086JSTPSK: "180°", // Nitro V2 Orange
  B086JSFTVN: "180°", // Nitro V2 Green
  B01G8E3J3G: "180°", // Wolf Red
  B01G8E6NZW: "180°", // Wolf White
  B083J8QMMT: "180°", // Wolf Purple
  B0F62Y1Z2B: "180°", // Eclair Orange
  B0F631GTBC: "180°", // Eclair Blue
  B0F62WXZ5M: "180°", // Eclair Green
  B0F62V3ZXS: "180°", // Eclair Pink
  B075R8DPJ5: "180°", // Premium Raven
  B075R8696C: "180°", // Premium Silver
  B0BFWFP8XV: "180°", // Premium Denim
  B094PYTGC3: "180°", // Premium Monarca
  B09R922F2F: "165°", // PINON Sky Blue — 145°~165°
  B09R95BRGD: "165°", // PINON White
  B09R8WMZ1P: "165°", // PINON Sakura Pink
  B0GFSRLV6P: "180°", // Faura Dark Navy
  B0GFTGC45R: "180°", // Faura Indigo
  B0GFT7GKQS: "180°", // Faura Beige

  // Premium Denim / Gyokuza
  B0BFWFP8XV: "180°", // Premium Denim
  B0BFWDQMZ1: "180°", // Gyokuza Denim
  B075RB9WJ3: "180°", // Gyokuza V2 Grey
  B075RC4JHR: "180°", // Gyokuza V2 Red
  B075RC4JHS: "180°", // Gyokuza V2 Blue
  B0BL3CQX5J: "180°", // Gyokuza V2 White
  B07CBPCZ8R: "180°", // Overture Pink
  B07CBPDMCC: "180°", // Overture variant
  B01G8E6NZW: "180°", // Wolf White
  B083J8QMMT: "180°", // Wolf Purple
  B08YWBK2Y9: "180°", // Pro-X V2 Orange

  // AKRacing Facility Chair — Pro-X JP / MJ Grey
  B0DQ72DWQ4: "180°", // Pro-X JP Grey — tekwind.co.jp / Amazon
  B0F1FG7K3X: "180°", // Pro-X JP Blue
  B0DQ74NP5P: "180°", // Pro-X JP White
  B0F1FDQH3Y: "180°", // Pro-X JP Red
  B0H4QK77YH: "135°", // MJ Grey — Amazon / tekwind.co.jp
  B0H69Q5KQ1: "135°", // MJ Grey 日本プロ麻雀連盟モデル

  // AKRacing コラボレーションチェア
  B094QHNK83: "180°", // Pro-X V2 ジャイアンツ
  B0D1QLTD5G: "180°", // 東京ヤクルトスワローズ
  B0CZ943PLQ: "180°", // Pro-X V2 ドラゴンズ
  B0D4LLT6FC: "180°", // 阪神タイガース
  B0GXDRY84Q: "180°", // Pro-X V2 ライオンズ
  B0B6NP6CNX: "180°", // サッカー日本代表
  B0H2LQ86PL: "180°", // FC東京2024
  B0G4VTM8WM: "180°", // FC東京2024 バリアント
  B0FZ13KWGV: "180°", // FC町田ゼルビア

  // Maydolly
  B0GF1JC8HK: "135°", // 2026 model — 90°-135° (Amazon listing spec)
  B0H6ZDSMY4: "145°", // 145°リクライニング (Maydolly listing)

  // Dowinx (generic listing without model in title)
  B0FPL7B13K: "145°", // Dowinx fabric — brand default for LS series

  // JKOOK
  B0CJ2J6RXJ: "135°", // JK08 — Amazon spec 90° to 135°
  B0H6FPPJVQ: "135°", // JK21 — same product line

  // onenext
  B0FPV9XP8S: "135°", // onenext — Amazon/listing 最大135°

  // Eeasky
  B09XHJKRVZ: "135°", // same line as filled Eeasky ottomans

  // HERCULES
  B0FP54VCZ9: "130°", // 90-130° (listing spec)

  // Wisteria Freedom Chair
  B0DM1ZW2YZ: "135°", // fujisawa-co.com GCV 135°
  B0DM19S7HN: "135°",

  // KM6006 white-label
  B0DR19FTHG: "135°", // 調節角度90～135°
  B0H74R6C4W: "135°",
  B0H74ZQKVZ: "135°",
  B0DK2ZR1TY: "135°",

  // VICTONE
  B0F4WX961Q: "135°", // 連動式アームレスト+オットマン — listing 最大135°

  // Generic K4 executive chair
  B0H8T4FJHX: "135°", // Amazon description 135° recline
  B0H8SKFGP6: "135°", // same K4 line

  // Marsail mesh office
  B0G2L9NNZY: "120°", // 90-120° (Marsail listing)

  // CHAIRKER (Amazon title: 135°チルトロック)
  B0FX9ZDKD8: "135°",
  B0GR8YV3YH: "135°",

  // PAX4 / KTOW
  B0FJM2B7ZM: "150°", // 90-150° official spec

  // NewBoy
  B0BRTNW6X3: "135°", // 90-135° official listing

  // Yaheetech
  B0F5VRS8VG: "135°", // Amazon brand FAQ 90-135°

  // GTPLAYER Luft310 (typo GTPLYER in listing)
  B0BRXBH439: "155°", // Luft310 line

  // SYALEN SLCH-15 (Amazon comparison table)
  B0GFM3RMHQ: "160°",

  // GTPLAYER GTP610
  B0GCD8GQP1: "150°", // 90-150° review/spec

  // iLooiLoo pocket coil ottoman
  B0CMWNQ4BV: "135°", // Amazon comparison table

  // GTRacing GT890MF speaker chair
  B07QGY4VGK: "165°", // GTRacing traditional line ~165°

  // JPBSTO
  B0D8TDWHKP: "130°", // 90-130° listing/reviews

  // GTPLAYER PU pocket coil ottoman
  B0H32VCRYV: "155°", // GTPLAYER linked ottoman line

  // HOLLUDLE mesh (manual PDF: lock at 135°)
  B0DGTBNFRP: "135°",

  // White-label OEM (135° PU ottoman chairs)
  B0H7S72NM5: "135°",
  B0GLXG4BBM: "135°",
  B0CZSQRX4W: "135°",
  B0GVCRH3H5: "135°",
  B09XHHKQ3F: "135°",
  B0H1GZQYRZ: "135°",

  // Amazon 商品概要で確認（2026-08-16）
  B0F3N1H577: "165°", // GXTRACE — 最大165°リクライニング
  B0DWDM5GHD: "160°", // 90～最大160°リクライニング
  B00YQW38O8: "125°", // タンスのゲン — 125度リクライニング
  B0GKZ8VCS3: "140°", // BIRDX — 90~140度
  B08VRRKVZZ: "150°", // サンワダイレクト 150-SNCL015 — 比較表150度
  B0HCJC93SL: "170°", // ATURBO — スペック表170°
  B0H6WTBCLY: "170°", // EastEamily — 比較表170°
  B0GVMLWP1P: "145°", // GXTRACE — 商品概要145°
  B0G1BQ72C5: "140°", // エア・リゾーム force — 140°リクライニング
  B01M629TAF: "180°", // CYBER-GROUND — 14段階・フラット可
  B0H36SP789: "155°", // Humergo — スペック表155°
  B0F6XWL4LF: "135°", // GXTRACE メッシュオフィスチェア
  B0GGGLTTG4: "135°",
  B0GR9S1P69: "135°",
  B0FWC9HXM8: "135°",
  B0H3ZPLQ2F: "135°",
  B0FP4MHZX8: "135°", // GTPLAYER CH335 — 135°チルト
  B0FP4Q66BZ: "135°", // GTPLAYER メッシュ — 135°チルト
}

/** タイトル / ブロック本文からモデル名で解決（MANUAL の次、infer の前） */
const MODEL_PATTERNS = [
  { test: /AutoFull\s*G7|G7｜/, angle: "140°" },
  { test: /AutoFull.*\bC3\b(?!.*Pro)/i, angle: "155°" },
  { test: /T-3\s*RUSH\s*V2|T3\s*RUSH\s*V2|CF-9010058/i, angle: "160°" },
  { test: /Soma\s*Chroma/i, angle: "155°" },
  { test: /SIHOO\s*M18|M18\s*オフィス/i, angle: "126°" },
  { test: /LUMORA|ルモーラ|GG-C2/i, angle: "175°" },
  { test: /19429|レイズ.*不二貿易|不二貿易.*レイズ/i, angle: "150°" },
  { test: /50H-\d+|LS-66D50H|LS-6650/i, angle: "145°" },
  { test: /LR002/i, angle: "140°" },
  { test: /GTP002F|GT002F|\bGT002\b/i, angle: "165°" },
  { test: /GT829|Luft310/i, angle: "155°" },
  { test: /JK08|JK21|\bJKOOK\b/i, angle: "135°" },
  { test: /onenext|ワンネクスト/i, angle: "135°" },
  { test: /KM6006|調節角度90.?[-−~～].?135/i, angle: "135°" },
  { test: /Wisteria|ウィステリア|フリーダムチェア|GCV2[23]/i, angle: "135°" },
  { test: /\bHERCULES\b/i, angle: "130°" },
  { test: /Premium\s*Denim|プレミアム\s*デニム/i, angle: "180°" },
  { test: /Gyokuza\s*Denim|極坐.*デニム|玉座.*デニム/i, angle: "180°" },
  { test: /Gyokuza|極坐|玉座/i, angle: "180°" },
  { test: /Faura|ファウラ/i, angle: "180°" },
  { test: /Eclair|エクレール/i, angle: "180°" },
  { test: /Nitro\s*V2/i, angle: "180°" },
  { test: /本田翼|Honda\s*Yuki/i, angle: "150°" },
  { test: /Maydolly.*145|145.*リクライニング.*Maydolly/i, angle: "145°" },
  { test: /Maydolly|90°.?[-−~～].?135°|最大135°/i, angle: "135°" },
  { test: /VICTONE.*(?:連動|オットマン)/i, angle: "135°" },
  { test: /\bK4\b|K4\(/i, angle: "135°" },
  { test: /Marsail/i, angle: "120°" },
  { test: /CORSAIR.*RUSH/i, angle: "160°" },
  { test: /Dowinx/i, angle: "145°" },
  { test: /CHAIRKER|135°チルト/i, angle: "135°" },
  { test: /\bPAX\s*4\b|KTOW\s*PAX/i, angle: "150°" },
  { test: /\bNewBoy\b/i, angle: "135°" },
  { test: /Yaheetech/i, angle: "135°" },
  { test: /GTPLYER|Luft310/i, angle: "155°" },
  { test: /GXTRACE.*165|最大165/i, angle: "165°" },
  { test: /Humergo/i, angle: "155°" },
  { test: /タンスのゲン|125度リクライ/i, angle: "125°" },
  { test: /CYBER-GROUND|15110004/i, angle: "180°" },
  { test: /ATURBO/i, angle: "170°" },
  { test: /BIRDX|バーデックス/i, angle: "140°" },
  { test: /150-SNCL/i, angle: "150°" },
  { test: /エア[・･]?リゾーム.*force|force.*エア[・･]?リゾーム/i, angle: "140°" },
  { test: /SYALEN|SLCH-15/i, angle: "160°" },
  { test: /GTP610|JP-GTP610|L-GTP610/i, angle: "150°" },
  { test: /iLooiLoo|ilooiloo|ｉｌｏｏｉｌｏｏ/i, angle: "135°" },
  { test: /GTRacing|GT890|GT890MF/i, angle: "165°" },
  { test: /\bJPBSTO\b/i, angle: "130°" },
  { test: /HOLLUDLE/i, angle: "135°" },
  {
    test: /収納式フットレスト.*連動式アームレスト|連動式アームレスト.*収納式フットレスト/i,
    angle: "135°",
  },
  {
    test: /GTPLAYER.*ポケットコイル|ポケットコイル.*GTPLAYER/i,
    angle: "155°",
  },
]

function loadFromRawJson() {
  const map = {}
  for (const file of readdirSync(__dirname).filter((f) => /^gaming-chair.*-raw\.json$/i.test(f))) {
    const data = JSON.parse(readFileSync(join(__dirname, file), "utf8"))
    const items = data.gamingChairs ?? data.items ?? []
    for (const item of items) {
      const asin = item.asin
      const title = item.title ?? ""
      if (!asin || !title) continue
      const angle = inferMaxRecliningAngle(title)
      if (angle !== "—") map[asin] = angle
    }
  }
  return map
}

function loadFromCache() {
  if (!existsSync(CACHE_PATH)) return {}
  const cache = JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  const map = {}
  for (const [asin, entry] of Object.entries(cache)) {
    if (entry.maxRecliningAngle && entry.maxRecliningAngle !== "—") {
      map[asin] = entry.maxRecliningAngle
    }
  }
  return map
}

function resolveFromPatterns(haystack) {
  for (const { test, angle } of MODEL_PATTERNS) {
    if (test.test(haystack)) return angle
  }
  return null
}

export const GAMING_CHAIR_RECLINE_KNOWN = {
  ...loadFromRawJson(),
  ...loadFromCache(),
  ...MANUAL,
}

export function resolveGamingChairReclineAngle(asin, haystack) {
  if (asin && GAMING_CHAIR_RECLINE_KNOWN[asin]) {
    return GAMING_CHAIR_RECLINE_KNOWN[asin]
  }
  const fromPattern = resolveFromPatterns(haystack)
  if (fromPattern) return fromPattern
  return inferMaxRecliningAngle(haystack)
}
