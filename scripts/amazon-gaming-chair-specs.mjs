/**
 * Amazon ゲーミングチェア商品タイトル・詳細表からアプリ用フィールドを推論
 */
import { parseDetailTable } from "./amazon-monitor-body-specs.mjs"
import {
  mergeDimensionRecords,
  parseGamingChairDimensionsFromMap,
} from "./gaming-chair-dimensions-parse.mjs"
import { GAMING_CHAIR_DIMENSIONS_KNOWN } from "./gaming-chair-dimensions-known.mjs"

export const DASH = "—"

const BRAND_PATTERNS = [
  ["GTPLAYER", /^(?:【[^】]+】\s*)?(?:gtplayer|gt\s*player)/i],
  ["GTRacing", /^(?:【[^】]+】\s*)?(?:gtracing|gt\s*racing)/i],
  ["GXTRACE", /^(?:【[^】]+】\s*)?gxtrace/i],
  ["Dowinx", /^dowinx\b/i],
  ["PUPOFA", /^pupofa\b/i],
  ["Eeasky", /^eeasky\b/i],
  ["SKYE", /^skye\b/i],
  ["NewBoy", /^newboy\b/i],
  ["HERCULES", /^hercules\b/i],
  ["RXGAMING", /^rxgaming\b/i],
  ["iLooiLooo", /^ilooilooo\b/i],
  ["NIONIK", /^nionik\b/i],
  ["IPPO+", /^(?:【[^】]+】\s*)?ippo\+?/i],
  ["ITOKI", /^(?:【[^】]+】\s*)?(?:itoki|イトーキ)/i],
  ["VESTEX", /^(?:【[^】]+】\s*)?(?:vestex|ベステックス)/i],
  ["SeekFun", /^seekfun\b/i],
  ["Wisteria", /^wisteria/i],
  ["Efomao", /^efomao\b/i],
  ["SUKIDA", /^sukida\b/i],
  ["Symino", /^symino\b/i],
  ["CHAIRKER", /^chairker\b/i],
  ["Localive", /^localive\b/i],
  ["ZJXKWIN", /^zjxkwin\b/i],
  ["AGRelux", /^agrelux|アグリラックス/i],
  ["Humergo", /^humergo\b/i],
  ["GTBoy", /^gtboy\b/i],
  ["Nekkoflo", /^nekkoflo\b/i],
  ["Razer", /^razer\b/i],
  ["AutoFull", /^(?:【[^】]+】\s*)?autofull(?:\(オートフル\))?/i],
  ["エア・リゾーム", /^(?:【[^】]+】\s*)?エア[・･]?リゾーム|air[\s-]?rhizome/i],
  ["ZIXWIN", /^zixwin\b/i],
  ["CYBER-GROUND", /^cyber-ground\b/i],
  ["Marsail", /^marsail\b/i],
  ["AKRacing", /^akracing\b/i],
  ["INECAR", /^inecar\b/i],
  ["GTPOFFICE", /^gtpoffice\b/i],
  ["BoxDesignLab", /^boxdesignlab\b/i],
  ["SITMOD", /^sitmod\b/i],
  ["Contieaks", /^contieaks\b/i],
  ["Tohma", /^tohma\b/i],
  ["Steelcase", /^steelcase\b/i],
  ["KTOW", /^ktow\b/i],
  ["GTRACING", /^(?:【[^】]+】\s*)?gtracing\b/i],
  ["PAX4", /^pax4\b/i],
  ["KARNOX", /^karnox\b/i],
  ["SYALEN", /^syalen\b/i],
  ["LUCKRACER", /^luckracer\b/i],
  ["SONGMICS", /^songmics\b/i],
  ["CORSAIR", /^corsair\b/i],
  ["SIHOO", /^sihoo\b/i],
  ["Yaheetech", /^yaheetech\b/i],
  ["VICTONE", /^victone\b/i],
  ["DoubleTT", /^doublett\b/i],
  ["EastForce", /^eastforce\b/i],
  ["BIRDX", /^birdx|バーデックス/i],
  ["MOKUTO", /^mokuto\b/i],
  ["Maydolly", /^maydolly\b/i],
  ["HOLLUDLE", /^holludle\b/i],
  ["EdoErgo", /^edoergo\b/i],
  ["LEEKAE?LIO", /^leekaelio\b/i],
  ["Goswave", /^goswave\b/i],
  ["Homracer", /^homracer\b/i],
  ["onenext", /^onenext|ワンネクスト/i],
  ["JPBSTO", /^jpbsto\b/i],
  ["AKRacing", /^akracing\b/i],
  ["HLDIRECT", /^hldirect\b/i],
  ["JK00K", /^jk00k\b/i],
  ["JKOOK", /^jkook\b/i],
  ["HLFURNITURE", /^hlfurniture\b/i],
  ["Secretlab", /^secretlab\b/i],
  ["noblechairs", /^noblechairs\b/i],
  ["COUGAR", /^cougar\b/i],
  ["DXRacer", /^dxracer\b/i],
  ["Vertagear", /^vertagear\b/i],
  ["Andaseat", /^andaseat\b/i],
  ["Logicool G", /^logicool\s*g\b/i],
  ["Bauhutte", /^bauhutte\b/i],
  ["Leffler", /^leffler\b/i],
  ["RESPAWN", /^respawn\b/i],
]

export function extractBrand(title) {
  const t = String(title).trim()
  for (const [brand, re] of BRAND_PATTERNS) {
    if (re.test(t)) return brand
  }
  const m = t.match(/^【[^】]+】\s*([A-Za-z0-9][^\s|｜]{1,20})/)
  if (m) return m[1].trim()
  if (/gaming chair/i.test(t)) {
    const words = t.split(/\s+/).slice(0, 2).join(" ")
    if (words.length <= 20) return words
  }
  return DASH
}

export function shortProductName(title, brand) {
  const full = String(title)
    .replace(/^【[^】]+】\s*/g, "")
    .replace(/^Gaming Chair,?\s*/i, "")
    .trim()

  const modelPatterns = [
    /\b(M6(?:\s*Ultra(?:\s*2\.0)?|\s*Pro)?)\b/i,
    /\b(force(?:\s*\([^)]+\))?)\b/i,
    /\b(G7(?:\s*Pro)?)\b/i,
    /\b(C3)\b/i,
    /\b(C2)\b/i,
    /\b(GT829-[A-Z]+)\b/i,
    /\b(GT905-[A-Z]+)\b/i,
    /\b(CH335-[A-Z]+)\b/i,
    /\b(JP-GTP610-[A-Z]+)\b/i,
    /\b(LR\d{3}-[A-Z]+)\b/i,
    /\b(LX-\d+[A-Z]+)\b/i,
    /\b(GT002[A-Z0-9-]*)\b/i,
    /\b(GT\d{3}[A-Z0-9-]*)\b/i,
    /\b(PL800-[A-Z]+)\b/i,
    /\b(GT905-[A-Z]+)\b/i,
    /\b(LS-[A-Z0-9-]+)\b/i,
    /\b(JK\d{2})\b/i,
    /\b(TITAN\s*Evo[^|｜]{0,20})\b/i,
    /\b(Wolf)\b/i,
    /\b(G-370)\b/i,
  ]
  for (const re of modelPatterns) {
    const m = full.match(re)
    if (m) return m[1].replace(/\s+/g, " ").trim()
  }

  let rest = full
  if (brand !== DASH) {
    rest = rest.replace(new RegExp(`^${brand}\\s*`, "i"), "")
  }
  rest = rest
    .replace(/^ゲーミングチェア\s*/, "")
    .replace(/^ゲーミング座椅子\s*/, "")
    .split(/[|｜]/)[0]
    .replace(/gaming chair,?\s*/gi, "")
    .replace(/office chair,?\s*/gi, "")
    .trim()

  const colorSuffix = rest.match(/\(([^)]+)\)\s*$/)
  const color = colorSuffix ? ` (${colorSuffix[1]})` : ""
  const distinctive = rest.match(/^(猫耳ゲーミングチェア|高級PU|ilooiloo公式[^、]{0,24})/i)
  if (distinctive) return (distinctive[1] + color).slice(0, 48)

  if (rest.length > 36) {
    const firstClause = rest.split(/[、。]/)[0].trim()
    if (firstClause.length >= 8 && firstClause.length <= 48) return firstClause
  }

  return rest.slice(0, 48) || full.slice(0, 48)
}

function inferModelFromHtml(html, title) {
  if (!html) return null
  const map = parseDetailTable(html)
  for (const [key, val] of Object.entries(map)) {
    if (/型番|モデル|model/i.test(key) && val && val.length <= 32) return val.trim()
  }
  const hay = `${html} ${title}`
  for (const re of [
    /\b(M6(?:\s*Ultra(?:\s*2\.0)?|\s*Pro)?)\b/i,
    /\b(force(?:\s*\([^)]+\))?)\b/i,
    /\b(G7(?:\s*Pro)?)\b/i,
    /\b(C3)\b/i,
    /\b(C2)\b/i,
    /\b(GT829-[A-Z]+)\b/i,
    /\b(GT905-[A-Z]+)\b/i,
    /\b(CH335-[A-Z]+)\b/i,
    /\b(LX-\d+[A-Z]+)\b/i,
    /\b(GT002[A-Z0-9-]*)\b/i,
    /\b(PL800-[A-Z]+)\b/i,
    /\b(GT905-[A-Z]+)\b/i,
    /\b(LS-[A-Z0-9-]+)\b/i,
  ]) {
    const m = hay.match(re)
    if (m) return m[1]
  }
  return null
}

export function inferUpholsteryMaterial(text) {
  const hay = String(text)
  if (/本革|genuine leather|real leather|牛革|天然皮革/i.test(hay) && !/pu|合成|フェイク|レザー調|炭素繊維/i.test(hay)) {
    return "本革"
  }
  if (
    /puレザー|pu皮革|合成皮革|pu leather|pvc|フェイクレザー|フェイクレザ|レザー調|炭素繊維レザー|高級pu|上質pu|\bpu\b/i.test(
      hay,
    )
  ) {
    return "PUレザー"
  }
  if (/(?:^|[^本])レザー|\bleather\b/i.test(hay) && !/pu|合成|本革|mesh|メッシュ/i.test(hay)) {
    return "PUレザー"
  }
  if (
    /メッシュ|mesh|ナイロン|ポリエステル|通気性メッシュ|breathable mesh|フルメッシュ|メッシュ座面|メッシュチェア/i.test(
      hay,
    )
  ) {
    return "メッシュ"
  }
  if (/ファブリック|布地|fabric|velvet|クロス|ベルベット|スエード/i.test(hay)) {
    return "ファブリック"
  }
  return DASH
}

export function inferUpholsteryMaterialFromDetailMap(detailMap = {}) {
  const skipKeys = /フレーム|frame|脚|ベース|base|キャスター|wheel|脚材/i
  const upholsteryKey =
    /^(材質|素材|material|張地|座面素材|本体素材|シート素材|背もたれ素材|アップホルスタリー|upholstery)$/i

  for (const [key, val] of Object.entries(detailMap)) {
    if (skipKeys.test(key)) continue
    if (upholsteryKey.test(key.trim()) || /材質\s*\/\s*素材/.test(key)) {
      const material = inferUpholsteryMaterial(val)
      if (material !== DASH) return material
    }
  }

  for (const [key, val] of Object.entries(detailMap)) {
    if (skipKeys.test(key)) continue
    if (/材質|素材|material/i.test(key) && /座|背|シート|seat|back|張/i.test(`${key} ${val}`)) {
      const material = inferUpholsteryMaterial(val)
      if (material !== DASH) return material
    }
  }

  return DASH
}

export function inferMaterial(text) {
  return inferUpholsteryMaterial(text)
}

export function inferAdjustments(text) {
  const hay = String(text)
  const adj = []
  if (/高さ調整|座面昇降|昇降式|height adjust|gas lift|ガスリフト/i.test(hay)) {
    adj.push("座面の高さ調整")
  }
  if (/座面.*傾|チルト|tilt|ロッキング|rocking|座面ロッキング/i.test(hay)) {
    adj.push("座面の傾き調整")
  }
  if (/リクライニング|リクライナ|recline|reclining|135°|145°|150°|155°|160°|165°|170°|180°/i.test(hay)) {
    adj.push("リクライニング調整")
  }
  if (/ヘッドレスト|頭枕|headrest|3d headrest/i.test(hay)) adj.push("ヘッドレスト調整")
  if (/ランバー|腰当|腰サポート|lumbar/i.test(hay)) adj.push("ランバーサポート調整")
  if (/アームレスト|肘置|4d|3d|2d.*アーム|可動肘|armrest|interlocking armrest|連動アーム/i.test(hay)) {
    adj.push("アームレスト調整")
  }
  return adj
}

/** @deprecated 推奨身長は廃止。フィルター・カード表示は maxRecliningAngle を使用 */
export function inferRecommendedHeight(text, detailMap = {}) {
  void text
  void detailMap
  return DASH
}

export function normalizeAsciiDigits(text) {
  return String(text).replace(/[０-９]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0),
  )
}

function collectReclineAngles(text) {
  const hay = normalizeAsciiDigits(text)
  const angles = []
  const push = (n, weight = 1) => {
    if (n >= 100 && n <= 180) angles.push({ n, weight })
  }

  for (const m of hay.matchAll(
    /(?:リクライニング|リクライナ|recline|reclining|可倒|最大)[^\d]{0,16}(\d{2,3})\s*(?:度|°)/gi,
  )) {
    push(Number(m[1]), 3)
  }

  for (const m of hay.matchAll(
    /(\d{2,3})\s*(?:度|°)\s*(?:リクライ|recline|可倒)/gi,
  )) {
    push(Number(m[1]), 3)
  }

  for (const m of hay.matchAll(/(\d{2,3})\s*度(?:\s*(?:リクライ|recline|可倒|まで))/gi)) {
    push(Number(m[1]), 3)
  }

  for (const m of hay.matchAll(/(\d{2,3})\s*度\s*リクライニング/gi)) {
    push(Number(m[1]), 4)
  }

  for (const m of hay.matchAll(
    /(?:最大|約)\s*(\d{2,3})\s*(?:度|°)\s*(?:まで)?(?:の)?(?:リクライ|recline)/gi,
  )) {
    push(Number(m[1]), 5)
  }

  for (const m of hay.matchAll(
    /リクライニング(?:機能|角度|は)?[^\d]{0,24}(?:最大|約)?\s*(\d{2,3})\s*(?:度|°)/gi,
  )) {
    push(Number(m[1]), 5)
  }

  for (const m of hay.matchAll(
    /(?:90|９０)\s*[-~〜～−]\s*(?:最大|約)?\s*(\d{2,3})\s*(?:度|°)[^\n]{0,30}リクライ/gi,
  )) {
    push(Number(m[1]), 5)
  }

  for (const m of hay.matchAll(
    /(?:約|約)?\s*90\s*[~〜～]\s*(\d{2,3})\s*度[^\n]{0,40}リクライ/gi,
  )) {
    push(Number(m[1]), 5)
  }

  for (const m of hay.matchAll(/(\d{2,3})\s*[-~〜～]\s*(\d{2,3})\s*(?:度|°)/gi)) {
    const ctx = hay.slice(Math.max(0, m.index - 20), m.index + m[0].length + 40)
    if (!/リクライ|recline|可倒/i.test(ctx)) continue
    for (const raw of [Number(m[1]), Number(m[2])]) push(raw, 4)
  }

  if (/フルフラット|180\s*度|180\s*°|完全(?:寝|なら)/i.test(hay)) {
    push(180, 4)
  }

  if (/リクライ|recline|可倒|フルフラット/i.test(hay)) {
    const name = hay.match(/name:\s*"([^"]*)"/i)?.[1] ?? ""
    const tagline = hay.match(/tagline:\s*"([^"]*)"/i)?.[1] ?? ""
    const titleHay = name ? `${name} ${tagline}` : hay.slice(0, 800)
    for (const m of titleHay.matchAll(/(\d{2,3})\s*(?:度|°)/gi)) {
      push(Number(m[1]), 1)
    }
  }

  return angles
}

function pickMaxReclineAngle(weighted) {
  const filtered = weighted.filter(({ n, weight, ctx = "" }) => {
    if (n === 360 || n === 720) return false
    if (n <= 30 && /ロッキング|rock/i.test(ctx)) return false
    if (n === 90 && /アーム|肘|跳ね上|flip|フリップ/i.test(ctx)) return false
    if ((n === 45 || n === 30) && /ヘッド|head/i.test(ctx)) return false
    return true
  })
  if (filtered.length === 0) return null
  filtered.sort((a, b) => b.weight - a.weight || b.n - a.n)
  return filtered[0].n
}

export function parseMaxReclineDegrees(text) {
  const hay = normalizeAsciiDigits(text)
  const weighted = collectReclineAngles(hay).map(({ n, weight }) => ({
    n,
    weight,
    ctx: hay,
  }))
  return pickMaxReclineAngle(weighted)
}

export function inferMaxRecliningAngle(text, detailMap = {}) {
  const hay = normalizeAsciiDigits(`${text} ${Object.values(detailMap).join(" ")}`)
  const weighted = collectReclineAngles(hay).map(({ n, weight }) => ({ n, weight, ctx: hay }))

  for (const [key, val] of Object.entries(detailMap)) {
    if (/リクライ|recline|角度|tilt|可倒|背もたれ/i.test(key)) {
      for (const n of collectReclineAngles(String(val)).map((x) => x.n)) {
        weighted.push({ n, weight: 5, ctx: String(val) })
      }
    }
  }

  const deg = pickMaxReclineAngle(weighted)
  if (deg == null) return DASH
  if (deg >= 180) return "180°"
  return `${deg}°`
}

export function formatMaxRecliningAngleForCard(raw) {
  if (!raw || raw === DASH) return DASH
  if (raw === "180°") return "最大180°（フルフラット）"
  const m = String(raw).match(/^(\d{2,3})°$/)
  if (m) return `最大${m[1]}°`
  if (/^最大/.test(raw)) return raw
  return `最大${raw}`
}

export function inferLoadCapacity(text, detailMap = {}) {
  void text
  void detailMap
  return DASH
}

/** Amazon Frame Material Type / フレーム素材 から正規化した表示値を返す */
export function normalizeFrameMaterial(raw) {
  const t = String(raw ?? "").trim()
  if (!t || t === DASH) return DASH

  if (/合金鋼|合成鋼|alloy\s*steel|合金(?:フレーム|製)?|合成(?:鋼|スチール)(?:フレーム|骨組)?/i.test(t)) {
    return "合金鋼"
  }
  if (/internal\s*steel|steel\s*tubing|cold\s*rolled\s*steel|1\.8mm\s*.*steel/i.test(t)) {
    return "スチール（鋼鉄）"
  }
  if (/金属[（(]鋼[）)]|metal\s*[（(]steel[）)]/i.test(t)) {
    return "スチール（鋼鉄）"
  }
  if (
    /強化プラスチック|強化樹脂|樹脂(?:フレーム|製)?|nylon|ナイロン|abs|plastic|プラスチック|ポリカーボネート|pc\s*frame/i.test(
      t,
    ) &&
    !/pu|レザー|合成皮革/i.test(t)
  ) {
    return "強化プラスチック"
  }
  if (/スチール|steel|鋼鉄|鉄骨|iron/i.test(t) && !/合金|stainless|ステンレス|合成鋼/i.test(t)) {
    return "スチール（鋼鉄）"
  }
  if (/木製|wood|ウッド|合板|plywood/i.test(t)) return "木製"
  if (/アルミ|aluminum|aluminium|マグネシウム|magnesium/i.test(t)) return "アルミ合金"
  if (/メタル|metal/i.test(t)) return "スチール（鋼鉄）"

  return DASH
}

const BRAND_FRAME_DEFAULTS = {
  NIONIK: "合金鋼",
}

export function extractAmazonChairSpecHaystack(html) {
  const parts = []
  const title =
    html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/i)?.[1]?.replace(/<[^>]+>/g, " ").trim() ?? ""
  if (title) parts.push(title)

  const bullets = html.match(/id="feature-bullets"[\s\S]*?<\/div>/i)?.[0] ?? ""
  if (bullets) parts.push(bullets.replace(/<[^>]+>/g, " "))

  for (const row of html.matchAll(/po-material[\s\S]*?po-break-word">([\s\S]*?)<\/span>/gi)) {
    parts.push(row[1].replace(/<[^>]+>/g, " ").trim())
  }

  for (const row of html.matchAll(
    /<th[^>]*class="[^"]*prodDetSectionEntry[^"]*"[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*class="[^"]*prodDetAttrValue[^"]*"[^>]*>([\s\S]*?)<\/td>/gi,
  )) {
    parts.push(`${row[1].replace(/<[^>]+>/g, " ")} ${row[2].replace(/<[^>]+>/g, " ")}`)
  }

  return parts.join(" ").replace(/\s+/g, " ").trim()
}

export function inferFrameMaterial(text, detailMap = {}, brand = "") {
  for (const [key, val] of Object.entries(detailMap)) {
    if (/frame\s*material|フレーム(?:の)?(?:素材|材質|材料)|フレーム素材/i.test(key)) {
      const normalized = normalizeFrameMaterial(val)
      if (normalized !== DASH) return normalized
    }
  }

  for (const [key, val] of Object.entries(detailMap)) {
    if (/^材質$|^material$/i.test(key.trim())) {
      const normalized = normalizeFrameMaterial(val)
      if (normalized !== DASH) return normalized
    }
  }

  const hay = `${text} ${Object.entries(detailMap)
    .map(([k, v]) => `${k} ${v}`)
    .join(" ")}`

  const labeled =
    hay.match(
      /(?:frame\s*material\s*type|フレーム(?:の)?(?:素材|材質|材料))[^:\n：]{0,10}[：:]\s*([^\n,、|｜]{1,40})/i,
    ) ??
    hay.match(/(?:フレーム(?:素材|材質))[^:\n：]{0,6}[：:]\s*([^\n,、|｜]{1,40})/i)
  if (labeled) {
    const normalized = normalizeFrameMaterial(labeled[1])
    if (normalized !== DASH) return normalized
  }

  const fromHay = normalizeFrameMaterial(hay)
  if (fromHay !== DASH) return fromHay

  const brandKey = Object.keys(BRAND_FRAME_DEFAULTS).find((b) =>
    new RegExp(`^${b}$`, "i").test(String(brand).trim()),
  )
  if (brandKey) return BRAND_FRAME_DEFAULTS[brandKey]

  return DASH
}

const FRAME_MATERIAL_CARD_DISPLAY = {
  合金鋼: "合金鋼フレーム",
  "スチール（鋼鉄）": "スチールフレーム（鋼製）",
  強化プラスチック: "強化樹脂フレーム",
  アルミ合金: "アルミ合金フレーム",
}

export function formatFrameMaterialForCard(raw) {
  if (!raw || raw === DASH) return DASH
  const cleaned = String(raw).replace(/^フレーム:\s*/, "").trim()
  if (!cleaned || cleaned === DASH) return DASH
  return FRAME_MATERIAL_CARD_DISPLAY[cleaned] ?? `${cleaned}フレーム`
}

export function inferHasOttoman(text, detailMap = {}) {
  const hay = `${text} ${Object.entries(detailMap)
    .map(([k, v]) => `${k} ${v}`)
    .join(" ")}`

  if (/オットマン(?:なし|無し|不要|非付|無)|(?:without|no)\s*ottoman/i.test(hay)) {
    return false
  }

  if (
    /オットマン|ottoman|収納式(?:の)?足置|足置き(?:付|あり|一体)|フットレスト|foot\s*rest|脚置き|レッグレスト|leg\s*rest/i.test(
      hay,
    )
  ) {
    return true
  }

  return false
}

export function inferStyle(text) {
  const hay = String(text)
  if (/フロアチェア|floor chair|座椅子|ローデスク|floor gaming/i.test(hay)) {
    return "座椅子タイプ"
  }
  if (/embody|aeron|ergo|エルゴノミクス|office master|executive office|president chair|オフィスチェア型/i.test(hay)) {
    return "オフィスチェア型"
  }
  if (/バケット|ハイバック|レーシング|gaming chair|ゲーミングチェア|pc chair|computer chair/i.test(hay)) {
    return "バケットシート型"
  }
  return DASH
}

function formatStyleLabel(style) {
  if (style === "バケットシート型") return "バケットシート型（ハイバック）"
  if (style === "オフィスチェア型") return "オフィスチェアカスタム型"
  if (style === "座椅子タイプ") return "座椅子タイプ（ローデスク用）"
  return style
}

export function buildTagline(title, specs) {
  const parts = []
  if (specs.material !== DASH) parts.push(specs.material)
  if (specs.maxRecliningAngle !== DASH) {
    parts.push(formatMaxRecliningAngleForCard(specs.maxRecliningAngle).replace(/^最大/, ""))
  }
  if (specs.frameMaterial !== DASH) parts.push(formatFrameMaterialForCard(specs.frameMaterial))
  const recline = specs.adjustments.find((a) => a.includes("リクライニング"))
  if (recline && specs.maxRecliningAngle === DASH) parts.push(recline.replace("調整", ""))
  if (specs.adjustments.some((a) => a.includes("オットマン")) || /ottoman|オットマン/i.test(title)) {
    parts.push("オットマン付き")
  }
  const base = parts.length ? parts.join("・") : title.split(/[|｜]/)[0].trim().slice(0, 70)
  return base.slice(0, 100)
}

export function buildGamingChairGadget(item, extra = {}) {
  const title = item.title ?? ""
  const brand = extra.brand ?? extractBrand(title)
  const model = extra.model ?? inferModelFromHtml(extra.html ?? "", title)
  const name = extra.name ?? (model ? model : shortProductName(title, brand))
  const detailMap = extra.html ? parseDetailTable(extra.html) : {}
  const hay = `${title} ${Object.values(detailMap).join(" ")}`
  const parsedDims = mergeDimensionRecords(
    GAMING_CHAIR_DIMENSIONS_KNOWN[item.asin],
    parseGamingChairDimensionsFromMap(detailMap),
    extra.dimensions ?? {},
  )

  const material = extra.material ?? inferMaterial(hay)
  const adjustments = extra.adjustments ?? inferAdjustments(hay)
  const maxRecliningAngle = extra.maxRecliningAngle ?? inferMaxRecliningAngle(hay, detailMap)
  const frameMaterial = extra.frameMaterial ?? inferFrameMaterial(hay, detailMap, brand)
  const hasOttoman = extra.hasOttoman ?? inferHasOttoman(hay, detailMap)
  const styleRaw = extra.style ?? inferStyle(hay)
  const style = formatStyleLabel(styleRaw)
  const maxRecliningAngleDisplay = formatMaxRecliningAngleForCard(maxRecliningAngle)
  const frameMaterialDisplay = formatFrameMaterialForCard(frameMaterial)

  const specs = {
    material,
    adjustments,
    maxRecliningAngle,
    frameMaterial,
    style: styleRaw,
  }

  const rank = item.rank ?? item.amazonRank ?? null
  const sizeRows = []
  if (parsedDims.dimensions) sizeRows.push({ label: "本体寸法", value: parsedDims.dimensions })
  if (parsedDims.seatDepth) sizeRows.push({ label: "座面の奥行", value: parsedDims.seatDepth })
  if (parsedDims.seatWidth) sizeRows.push({ label: "座面の幅", value: parsedDims.seatWidth })
  if (parsedDims.backrestWidth) sizeRows.push({ label: "背もたれ幅", value: parsedDims.backrestWidth })

  const gadget = {
    id: rank ? `chair-bs-${String(rank).padStart(3, "0")}` : `chair-${item.asin?.slice(-6) ?? "000"}`,
    rank,
    asin: item.asin,
    category: "gaming-chair",
    name,
    brand,
    maxRecliningAngle: maxRecliningAngle === DASH ? undefined : maxRecliningAngle,
    frameMaterial: frameMaterial === DASH ? undefined : frameMaterial,
    hasOttoman,
    ...(parsedDims.dimensions ? { dimensions: parsedDims.dimensions } : {}),
    ...(parsedDims.seatDepth ? { seatDepth: parsedDims.seatDepth } : {}),
    ...(parsedDims.seatWidth ? { seatWidth: parsedDims.seatWidth } : {}),
    ...(parsedDims.backrestWidth ? { backrestWidth: parsedDims.backrestWidth } : {}),
    tagline: extra.tagline ?? buildTagline(title, { ...specs, adjustments }),
    price: extra.price ?? item.price ?? null,
    rating: item.rating ?? extra.rating ?? 4.0,
    reviews: item.reviews ?? extra.reviews ?? 0,
    image: extra.image ?? item.image ?? "",
    purchaseUrl: `https://www.amazon.co.jp/dp/${item.asin}`,
    highlights: [
      { label: "素材", value: material },
      { label: "最大リクライニング角度", value: maxRecliningAngleDisplay },
      { label: "フレームの種類", value: frameMaterialDisplay },
      { label: "形状", value: style },
    ],
    compat: [],
    specGroups: [
      ...(sizeRows.length
        ? [{ title: "サイズ / 寸法", rows: sizeRows }]
        : []),
      {
        title: "リクライニング / フレーム",
        rows: [
          { label: "最大リクライニング角度", value: maxRecliningAngleDisplay },
          { label: "フレームの種類", value: frameMaterialDisplay },
        ],
      },
      {
        title: "調節機能",
        rows:
          adjustments.length > 0
            ? adjustments.map((a) => ({ label: a.replace("調整", ""), value: "対応" }))
            : [{ label: "調節機能", value: DASH }],
      },
      {
        title: "構造 / 素材",
        rows: [
          { label: "素材", value: material },
          { label: "形状", value: style },
          { label: "オットマン", value: hasOttoman ? "あり" : "なし" },
        ],
      },
      {
        title: "Amazon売れ筋",
        rows: [{ label: "ランキング", value: rank ? `#${rank}` : DASH }],
      },
    ],
  }

  return gadget
}
