/**
 * タブレット用キーボード向けスペック推論・Gadget 生成
 */
import {
  applyAmazonKeyboardSpecs,
  extractBrand,
  extractModelKey,
  inferConnectionFromTitle,
  inferKeyboardFilterTags,
  inferKeyboardUsage,
  inferKeycapsFromText,
  inferLayoutFromText,
  inferPowerFromText,
  inferRapidTrigger,
  inferStructureFromText,
  shortProductName,
  DASH,
} from "./amazon-keyboard-specs.mjs"
import { normalizeImportedPrice } from "./amazon-price.mjs"
import { resolveGadgetImage } from "./amazon-image.mjs"
import {
  isCaseOnlyKeyboardProduct,
  normalizeKeyboardBodyName,
} from "./keyboard-display-name.mjs"

export { DASH }

const TABLET_BRAND_RULES = [
  ["ESR", /\besr\b/i],
  ["Arteck", /arteck/i],
  ["Avidpad", /avidpad/i],
  ["ProtoArc", /protoarc/i],
  ["Nillkin", /nillkin/i],
  ["サンワダイレクト", /サンワダイレクト|sanwa direct/i],
  ["Quark", /quark/i],
  ["SOPPY", /soppy/i],
  ["HOU", /\bhou\b/i],
  ["BORIYUAN", /boriyuan/i],
  ["Winmaxle", /winmaxle/i],
  ["ALLDOCUBE", /alldocube/i],
  ["REDMI", /redmi|xiaomi/i],
  ["Aulaiiex", /aulaiiex/i],
]

export function extractTabletBrand(title) {
  const fromBase = extractBrand(title)
  if (fromBase !== "—") return fromBase
  for (const [brand, re] of TABLET_BRAND_RULES) {
    if (re.test(title)) return brand
  }
  return "—"
}

export function inferTabletCompatibility(title, hay = "") {
  const t = `${title} ${hay}`

  if (/smart connector|スマートコネクタ/i.test(t)) {
    if (/ipad pro 11|pro 11/i.test(t)) return "iPad Pro 11インチ (Smart Connector)"
    if (/ipad air 11|air\(第4|air\(第5|m2|m3|m4/i.test(t)) return "iPad Air 11インチ (Smart Connector)"
    if (/ipad\(第9|第9世代|10\.2|mx3l2/i.test(t)) return "iPad 10.2インチ 第9世代 (Smart Connector)"
    if (/ipad pro 10\.5|air 第3|第3世代/i.test(t)) return "iPad Pro 10.5 / iPad Air 第3世代 (Smart Connector)"
    return "iPad (Smart Connector)"
  }

  if (/surface pro 11|surface pro 10|surface pro x|surface pro 9|surface pro 8/i.test(t)) {
    return "Microsoft Surface Pro 8 / 9 / 10 / X / 11"
  }
  if (/surface pro 7\+|surface pro 7|surface pro 6|surface pro 5|surface pro 4|surface pro 3/i.test(t)) {
    return "Microsoft Surface Pro 3 / 4 / 5 / 6 / 7 / 7+"
  }
  if (/surface go/i.test(t)) return "Microsoft Surface Go"
  if (/surface pro/i.test(t)) return "Microsoft Surface Pro"

  if (/ipad mini 7|ipad mini 第7|mini 7/i.test(t)) return "iPad mini 第7世代"
  if (/ipad mini 6|mini 6|第6\/7世代/i.test(t)) return "iPad mini 第6 / 第7世代"

  if (/ipad air 13|air 13/i.test(t)) return "iPad Air 13インチ"
  if (/ipad air 11|air\(第4|air\(第5|m2\/m3\/m4|m4\/m3\/m2/i.test(t)) {
    return "iPad Air 11インチ (第4 / 5世代 / M2 / M3 / M4)"
  }
  if (/ipad pro 11|pro 11/i.test(t)) return "iPad Pro 11インチ"
  if (/ipad pro 12\.9|pro 12\.9|12\.9/i.test(t)) return "iPad Pro 12.9インチ"

  if (/ipad 10\.2|10\.2\/10\.5|第9世代|第8世代|第7世代|air3|air 第3/i.test(t)) {
    return "iPad 10.2 / 10.5インチ (第7〜9世代 / Air 第3世代)"
  }
  if (/ipad a16|第11世代 2025|第10世代/i.test(t)) return "iPad 第10 / 第11世代 (A16)"
  if (/ipad/i.test(t)) return "iPad 全般"

  if (/alldocube iplay 70|iplay 70 max pro/i.test(t)) return "ALLDOCUBE iPlay 70 Max Pro"
  if (/redmi pad 2 pro/i.test(t)) return "REDMI Pad 2 Pro"

  if (/android|タブレット|tablet|ipad|iphone|スマホ/i.test(t)) {
    return "タブレット / スマホ 汎用"
  }

  return DASH
}

export function inferTabletLayout(title, hay = "") {
  const t = `${title} ${hay}`
  if (/smart keyboard|magic keyboard/i.test(t) && !/カバー|cover/i.test(t)) {
    return "Smart Keyboard (Apple)"
  }
  if (/jis|日本語配列|日本語\s*\(jis\)/i.test(t)) return "JIS日本語配列"
  if (/us配列|us english|英語配列|\(us\)/i.test(t)) return "US英語配列"
  const folded = inferLayoutFromText(t)
  if (folded) return folded
  if (/折りたたみ|折り畳み|fold/i.test(t)) return "折りたたみ / コンパクト"
  if (/ミニ|mini|コンパクト|小型|薄型/i.test(t)) return "コンパクト"
  if (/フルキーボード|フルサイズ|104/i.test(t)) return "フルサイズ"
  return DASH
}

export function inferTabletStructure(title, hay = "", switchType = null) {
  const structure = inferStructureFromText(hay, switchType, title)
  const t = `${title} ${hay}`
  const touch = /タッチパッド|touchpad|トラックパッド/i.test(t) ? "・タッチパッド搭載" : ""
  if (structure && structure !== DASH) {
    return touch ? `${structure}${touch}` : structure
  }
  if (/パンタグラフ|pantograph|シザー|scissor/i.test(t)) {
    return `パンタグラフ (シザー)${touch}`
  }
  if (/メンブレン|membrane/i.test(t)) return `メンブレン${touch}`
  if (/機械式|メカニカル|mechanical/i.test(t)) return `メカニカル${touch}`
  if (touch) return `—${touch}`.replace(/^—/, "")
  return DASH
}

export function inferSmartConnector(title, hay = "") {
  return /smart connector|スマートコネクタ|smart keyboard/i.test(`${title} ${hay}`)
    ? "Smart Connector (Apple)"
    : null
}

export function buildTabletKeyboardGadget(entry, cached, overrides, imageCache) {
  const { rank, asin, rating, reviews, price, image, title: rawTitle } = entry
  const rankingTitle = rawTitle ?? entry.title ?? ""
  const cachedTitle = rankingTitle || cached?.title || rankingTitle
  const specs = cached?.specs
  const hay = `${cachedTitle} ${specs?.bullets ?? ""} ${Object.values(specs?.table ?? {}).join(" ")}`
  const override = overrides[asin] ?? {}

  let conn =
    override.connection ??
    specs?.connection ??
    inferSmartConnector(cachedTitle, hay) ??
    inferConnectionFromTitle(cachedTitle)
  if (/smart connector/i.test(conn)) conn = "Smart Connector (Apple)"

  const compatibility =
    override.compatibility ?? inferTabletCompatibility(cachedTitle, hay)
  const layout = override.layout ?? inferTabletLayout(cachedTitle, hay)
  const structure =
    override.internalStructure ??
    inferTabletStructure(cachedTitle, hay, specs?.switchType)
  const keycaps = override.keycaps ?? inferKeycapsFromText(hay) ?? DASH
  const power = override.power ?? specs?.power ?? inferPowerFromText(hay, conn) ?? DASH

  const rawName = override.name ?? shortProductName(cachedTitle)
  const name =
    normalizeKeyboardBodyName(rawName, cachedTitle, hay) ??
    (isCaseOnlyKeyboardProduct(cachedTitle, hay) ? null : rawName)
  if (!name) return null

  const base = {
    id: `k-tbl-${String(rank).padStart(3, "0")}`,
    category: "keyboard",
    name,
    brand: override.brand ?? extractTabletBrand(cachedTitle),
    tagline: override.tagline ?? buildTagline(cachedTitle, cached),
    price: normalizeImportedPrice(price ?? cached?.price, asin, overrides),
    rating,
    reviews,
    image: resolveGadgetImage(asin, image, imageCache, overrides),
    connection: conn,
    purchaseUrl: `https://www.amazon.co.jp/dp/${asin}`,
    keyboardUsage: "productivity",
    keyboardUseTags: ["タブレット用キーボード"],
    highlights: [
      { label: "レイアウト", value: layout },
      { label: "内部構造", value: structure },
      { label: "キーキャップ", value: keycaps },
      { label: "電源", value: power },
    ],
    compat: [],
    specGroups: [
      {
        title: "対応機種 / 互換",
        rows: [{ label: "対応機種", value: compatibility }],
      },
      {
        title: "キー / スイッチ",
        rows: [
          { label: "レイアウト", value: layout },
          { label: "内部構造", value: structure },
          { label: "キーキャップ", value: keycaps },
        ],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方式", value: conn },
          { label: "電源", value: power },
        ],
      },
    ],
  }

  let result = base
  if (specs) {
    result = applyAmazonKeyboardSpecs(base, specs, cachedTitle)
    if (specs.dimensions) {
      result = patchSpecRow(result, "サイズ / 重量", "寸法", specs.dimensions)
    }
    if (specs.weight) {
      result = patchSpecRow(result, "サイズ / 重量", "重量", specs.weight)
    }
  }

  if (override.isUsed) result = { ...result, isUsed: true }

  result = {
    ...result,
    keyboardFilterTags: inferKeyboardFilterTags(result),
    keyboardUsage: inferKeyboardUsage(result),
    keyboardUseTags: ["タブレット用キーボード"],
    ...(inferRapidTrigger(result) ? { hasRapidTrigger: true } : {}),
  }

  return applyTabletOverride(result, override)
}

function applyTabletOverride(gadget, override) {
  if (!override || Object.keys(override).length === 0) return finalizeKeyboardHighlights(gadget)
  let next = { ...gadget }
  if (override.name) {
    const normalized = normalizeKeyboardBodyName(override.name, gadget.tagline ?? override.name)
    next = { ...next, name: normalized ?? override.name }
  }
  if (override.brand) next = { ...next, brand: override.brand }
  if (override.tagline) next = { ...next, tagline: override.tagline }
  if (override.connection) next = { ...next, connection: override.connection }
  if (override.price != null) next = { ...next, price: override.price }
  if (override.isUsed) next = { ...next, isUsed: true }

  const fields = [
    ["レイアウト", override.layout, "キー / スイッチ", "レイアウト"],
    ["内部構造", override.internalStructure, "キー / スイッチ", "内部構造"],
    ["キーキャップ", override.keycaps, "キー / スイッチ", "キーキャップ"],
    ["電源", override.power, "接続 / 電源", "電源"],
  ]
  for (const [hLabel, value, gTitle, rLabel] of fields) {
    if (!value || value === DASH) continue
    next = patchHighlight(next, hLabel, value)
    next = patchSpecRow(next, gTitle, rLabel, value)
  }
  if (override.connection) {
    next = patchSpecRow(next, "接続 / 電源", "接続方式", override.connection)
  }
  if (override.compatibility) {
    next = patchSpecRow(next, "対応機種 / 互換", "対応機種", override.compatibility)
  }
  return finalizeKeyboardHighlights(next)
}

function specValue(gadget, groupPattern, rowLabel) {
  const group = gadget.specGroups.find((g) => groupPattern.test(g.title))
  const row = group?.rows.find((r) => r.label === rowLabel)
  return row?.value && row.value !== DASH ? row.value : null
}

function finalizeKeyboardHighlights(gadget) {
  const layout =
    gadget.highlights.find((h) => h.label === "レイアウト")?.value ??
    specValue(gadget, /キー|スイッチ/, "レイアウト") ??
    DASH
  const structure =
    gadget.highlights.find((h) => h.label === "内部構造")?.value ??
    specValue(gadget, /キー|スイッチ/, "内部構造") ??
    DASH
  const keycaps =
    gadget.highlights.find((h) => h.label === "キーキャップ")?.value ??
    specValue(gadget, /キー|スイッチ/, "キーキャップ") ??
    DASH
  const power =
    gadget.highlights.find((h) => h.label === "電源")?.value ??
    specValue(gadget, /接続|電源/, "電源") ??
    DASH

  return {
    ...gadget,
    highlights: [
      { label: "レイアウト", value: layout },
      { label: "内部構造", value: structure },
      { label: "キーキャップ", value: keycaps },
      { label: "電源", value: power },
    ],
  }
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

function buildTagline(title, cached) {
  const bullets = cached?.specs?.bullets ?? ""
  if (bullets.length > 40) {
    const first = bullets.split(/[。．!！]/)[0].trim()
    if (isValidTagline(first)) {
      return first.length > 140 ? first.slice(0, 137) + "…" : first
    }
  }
  const cleaned = title
    .replace(/^【[^】]+】\s*/g, "")
    .replace(/\s*\|\s*.+$/, "")
    .replace(/\s*国内正規品.*$/i, "")
    .trim()
  if (isValidTagline(cleaned)) {
    return cleaned.length > 140 ? cleaned.slice(0, 137) + "…" : cleaned
  }
  return cleaned.length > 140 ? cleaned.slice(0, 137) + "…" : cleaned
}

function isValidTagline(text) {
  if (!text || text.length < 12) return false
  if (/›|画像はありません|選択したカラー|パソコン・周辺機器|PCアクセサリ/i.test(text)) return false
  return true
}

function patchSpecRow(gadget, groupTitle, rowLabel, value) {
  if (!value || value === DASH) return gadget
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
  const hasGroup = groups.some((g) => g.title === groupTitle)
  return {
    ...gadget,
    specGroups: hasGroup
      ? groups
      : [...groups, { title: groupTitle, rows: [{ label: rowLabel, value }] }],
  }
}

export function dedupeTabletEntries(entries) {
  const seen = new Set()
  const out = []
  for (const entry of entries) {
    const model = extractModelKey(entry.title ?? "")
    const key = model ?? entry.asin
    if (seen.has(key)) continue
    seen.add(key)
    out.push(entry)
  }
  return out.map((item, i) => ({ ...item, rank: i + 1 }))
}
