/**
 * Amazon モニターアーム商品ページ・タイトルからアプリ用フィールドを推論
 */
import { parseDetailTable, formatDimensions } from "./amazon-monitor-body-specs.mjs"
import { formatWeight } from "./amazon-mouse-specs.mjs"

export const DASH = "—"

const BRAND_PATTERNS = [
  ["Amazonベーシック", /^amazonベーシック|^amazon basics/i],
  ["Pixio", /^pixio\b/i],
  ["HUANUO", /^(?:huanuo|ファーノー|HUANUO)/i],
  ["ELECOM", /^(?:エレコム|elecom)/i],
  ["ERGOTRON", /^(?:ergotron|エルゴトロン)/i],
  ["BONTEC", /^bontec\b/i],
  ["VIVO", /^vivo\b/i],
  ["WALI", /^wali\b/i],
  ["Loctek", /^loctek\b/i],
  ["North Bayou", /^north bayou\b/i],
  ["NB", /^nb\s/i],
  ["サンワダイレクト", /^サンワダイレクト/i],
  ["サンワサプライ", /^サンワサプライ/i],
  ["Archiss", /^archiss\b/i],
  ["ZepSon", /^zepson\b/i],
  ["HumanCentric", /^humancentric\b/i],
  ["AmazonBasics", /^amazonベーシック/i],
  ["Fleximounts", /^fleximounts\b/i],
  ["MOUNTUP", /^mountup\b/i],
  ["ErGear", /^ergear\b/i],
  ["Bauhutte", /^(?:bauhutte|バウヒュッテ)/i],
  ["Pholiten", /^pholiten\b/i],
  ["GREENHOUSE", /^(?:greenhouse|グリーンハウス)/i],
  ["cocopar", /^cocopar\b/i],
  ["FORGING MOUNT", /^forging\s*mount\b/i],
  ["Bracwiser", /^bracwiser\b/i],
  ["WORLDLIFT", /^worldlift\b/i],
  ["suptek", /^suptek\b/i],
  ["COFO", /^cofo\b/i],
  ["AVLT", /^avlt\b/i],
  ["KABCON", /^kabcon\b/i],
  ["InnoGear", /^innogear\b/i],
  ["GASPRING", /^gaspring\b/i],
  ["Amazon", /^amazon\b/i],
]

export function extractBrand(title) {
  const t = String(title).trim()
  for (const [brand, re] of BRAND_PATTERNS) {
    if (re.test(t)) return brand
  }
  const m = t.match(/^【[^】]+】\s*([A-Za-z\u3040-\u30ff\u4e00-\u9fff][^\s|｜]{0,20})/)
  if (m) return m[1].trim()
  return DASH
}

export function shortProductName(title, brand) {
  const t = String(title)
    .replace(/^【Amazon\.co\.jp\s*限定】\s*/i, "")
    .trim()

  const modelPatterns = [
    /\b(DPA-[A-Z0-9]+)\b/i,
    /\b(PS1S\s*Wave|PS1S)\b/i,
    /\b(HNSS6|HNSS\d+[A-Z]*)\b/i,
    /\b(45-\d{3}-\d{3})\b/,
    /\b(LX|HX|MX|FX|Neo\s*Flex)\b/i,
    /\b(100-[A-Z0-9]+)\b/i,
    /\b([A-Z]{2,}\d{2,}[A-Z0-9-]*)\b/,
  ]
  for (const re of modelPatterns) {
    const m = t.match(re)
    if (m) return m[1].replace(/\s+/g, " ")
  }

  const cleaned = t
    .replace(new RegExp(`^${brand}\\s*`, "i"), "")
    .replace(/モニターアーム|monitor arm|ディスプレイアーム/gi, "")
    .split(/[|｜]/)[0]
    .trim()
  return cleaned.slice(0, 56) || t.slice(0, 56)
}

function detailHaystack(title, detailMap = {}) {
  return `${title} ${Object.entries(detailMap).map(([k, v]) => `${k} ${v}`).join(" ")}`
}

export function inferSupportedSize(text, detailMap = {}) {
  const hay = detailHaystack(text, detailMap)
  const range =
    hay.match(/(?:対応|適合|サポート)?(?:画面)?(?:サイズ|インチ)[^\d]{0,20}(\d+(?:\.\d+)?)\s*[–\-〜~]\s*(\d+(?:\.\d+)?)\s*(?:インチ|inch|")/i) ??
    hay.match(/(\d+(?:\.\d+)?)\s*[–\-〜~]\s*(\d+(?:\.\d+)?)\s*(?:インチ|inch|")/i) ??
    hay.match(/(?:最大|〜|~|up to)\s*(\d+(?:\.\d+)?)\s*(?:インチ|inch|")/i) ??
    hay.match(/(\d+(?:\.\d+)?)\s*[~〜]\s*(?:インチ|inch|")/i)

  if (!range) return DASH
  if (range[2]) return `${range[1]}〜${range[2]}インチ`
  return `〜${range[1]}インチ`
}

export function inferWeightCapacity(text, detailMap = {}) {
  const hay = detailHaystack(text, detailMap)
  const range =
    hay.match(/(\d+(?:\.\d+)?)\s*[–\-〜~]\s*(\d+(?:\.\d+)?)\s*kg/i) ??
    hay.match(/(\d+(?:\.\d+)?)\s*kg\s*[–\-〜~]\s*(\d+(?:\.\d+)?)(?:\s*kg)?/i)
  if (range) return `${range[1]}〜${range[2]}kg`
  const single = hay.match(/(?:耐荷重|荷重|load)[^\d]{0,16}(\d+(?:\.\d+)?)\s*kg/i)
  if (single) return `${single[1]}kg`
  return DASH
}

export function inferArmType(text) {
  const hay = String(text)
  if (/トリプル|triple|3\s*画面|3台/i.test(hay)) return "トリプル (3画面)"
  if (/デュアル\s*モニターアーム|デュアルモニターアーム|dual\s*monitor\s*arm/i.test(hay)) {
    return "デュアル (2画面)"
  }
  if (/シングル|single|1\s*画面|1台/i.test(hay)) return "シングル (1画面)"
  if (/モニターアーム|monitor arm/i.test(hay)) return "シングル (1画面)"
  return DASH
}

export function inferSpringType(text, detailMap = {}) {
  const hay = detailHaystack(text, detailMap)
  if (/ガススプリング|gas\s*spring/i.test(hay)) return "ガススプリング式"
  if (/メカニカルスプリング|mechanical\s*spring|constant\s*force/i.test(hay)) {
    return "メカニカルスプリング式"
  }
  if (/ポール|pole|固定/i.test(hay) && /モニターアーム|monitor arm/i.test(hay)) {
    return "ポール式/固定式"
  }
  return DASH
}

export function inferMountType(text, detailMap = {}) {
  const hay = detailHaystack(text, detailMap)
  const hasBothPhrase =
    /両対応|clamp\s*[&＆/／].*grommet|grommet\s*[&＆/／].*clamp|クランプ\s*[&＆/／・].*グロメット|グロメット\s*[&＆/／・].*クランプ/i.test(
      hay,
    )
  const hasClamp = /クランプ|clamp|クランプ固定/i.test(hay)
  const hasGrommet = /グロメット|grommet|グロメット取付|配線穴|天板穴/i.test(hay)
  const hasWall = /壁|wall/i.test(hay)
  const hasDesk = /据え置|desk\s*mount|freestanding/i.test(hay)

  if (hasBothPhrase || (hasClamp && hasGrommet)) return "クランプ式 & グロメット式"
  if (hasClamp) return "クランプ式"
  if (hasGrommet) return "グロメット式"
  if (hasWall) return "壁面取付"
  if (hasDesk) return "据え置き"
  return DASH
}

export function inferVesaStandard(text, detailMap = {}) {
  const hay = detailHaystack(text, detailMap)
  const both = /75\s*[x×]\s*75\s*[/／&]\s*100\s*[x×]\s*100|75\s*\/\s*100|75x75\s*\/\s*100x100/i.test(hay)
  const v75 = /75\s*[x×]\s*75|vesa\s*75/i.test(hay)
  const v100 = /100\s*[x×]\s*100|vesa\s*100/i.test(hay)
  if (both || (v75 && v100)) return "75×75 / 100×100 mm"
  if (v100) return "100×100 mm"
  if (v75) return "75×75 mm"
  return DASH
}

export function inferBodyWeight(html, title) {
  const map = html ? parseDetailTable(html) : {}
  for (const [key, val] of Object.entries(map)) {
    if (/^(商品の重量|商品重量|本体重量|重量)/i.test(key) && !/パッケージ|梱包/i.test(key)) {
      const w = formatWeight(val)
      if (w) return w
    }
  }
  const hay = detailHaystack(title, map)
  const m = hay.match(/(?:本体重量|重量)[^\d]{0,12}(\d+(?:\.\d+)?)\s*(?:kg|g|グラム|キロ)/i)
  if (m) {
    const unit = /kg|キロ/i.test(m[0]) ? "kg" : "g"
    return unit === "kg" ? `${m[1]} kg` : `${m[1]} g`
  }
  return DASH
}

export function buildTagline(specs) {
  const parts = []
  if (specs.supportedSize !== DASH) parts.push(`${specs.supportedSize}対応`)
  if (specs.weightCapacity !== DASH) parts.push(`耐荷重${specs.weightCapacity}`)
  if (specs.springType !== DASH) parts.push(specs.springType)
  return parts.join("・").slice(0, 100) || specs.name
}

export function buildMonitorArmGadget(item, extra = {}) {
  const title = item.title ?? ""
  const brand = extra.brand ?? extractBrand(title)
  const name = extra.name ?? shortProductName(title, brand)
  const detailMap = extra.html ? parseDetailTable(extra.html) : {}
  const hay = detailHaystack(title, detailMap)

  const supportedSize = extra.supportedSize ?? inferSupportedSize(hay, detailMap)
  const weightCapacity = extra.weightCapacity ?? inferWeightCapacity(hay, detailMap)
  const armType = extra.armType ?? inferArmType(hay)
  const springType = extra.springType ?? inferSpringType(hay, detailMap)
  const mountType = extra.mountType ?? inferMountType(hay, detailMap)
  const vesaStandard = extra.vesaStandard ?? inferVesaStandard(hay, detailMap)
  const weight = extra.weight ?? inferBodyWeight(extra.html ?? "", title)
  const price = extra.price ?? item.price ?? null
  const image = extra.image ?? item.image ?? ""
  const connection = extra.connection ?? (mountType !== DASH ? mountType : "—")
  const tagline =
    extra.tagline ??
    buildTagline({ name, supportedSize, weightCapacity, springType })

  const vesaHighlight =
    vesaStandard === DASH ? DASH : vesaStandard.replace(/ mm$/, "")

  const rank = item.rank ?? item.amazonRank ?? 0
  const id =
    extra.id ??
    (rank >= 1000
      ? `arm-sr-${String(item.amazonRank ?? rank - 1000).padStart(3, "0")}`
      : `arm-bs-${String(rank).padStart(3, "0")}`)

  return {
    id,
    rank,
    asin: item.asin,
    name,
    brand,
    tagline,
    price,
    rating: item.rating ?? 4.0,
    reviews: item.reviews ?? 0,
    image,
    connection,
    purchaseUrl: `https://www.amazon.co.jp/dp/${item.asin}`,
    supportedSize,
    weightCapacity,
    armType,
    springType,
    mountType,
    vesaStandard,
    weight,
    highlights: [
      { label: "対応サイズ", value: supportedSize },
      { label: "耐荷重", value: weightCapacity },
      { label: "VESA", value: vesaHighlight },
      { label: "取付方式", value: mountType },
    ],
    specGroups: [
      {
        title: "対応モニター",
        rows: [
          { label: "画面サイズ", value: supportedSize },
          { label: "耐荷重", value: weightCapacity },
          { label: "VESA", value: vesaStandard },
          { label: "アーム数", value: armType },
        ],
      },
      {
        title: "設置 / 可動",
        rows: [
          { label: "取付方式", value: mountType },
          { label: "駆動方式", value: springType },
          { label: "重量", value: weight },
        ],
      },
    ],
  }
}
