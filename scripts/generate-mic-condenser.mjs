/**
 * mic-condenser-bestsellers-raw.json → lib/mic-condenser-bestsellers.ts
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const raw = JSON.parse(
  readFileSync(join(__dirname, "mic-condenser-bestsellers-raw.json"), "utf8"),
).microphones

const EXISTING_ASINS = new Set([
  "B075PJ7V3V", // K669B in mic-bestsellers
])
const EXCLUDE_ASINS = new Set([
  "B00KC82HD8", // YVC-1000 extension mic
  "B0FC6SD57D", // headset
  "B0D8BDFQ22", // duplicate MAONO AU-A04 variant
])

const USER_OVERRIDES = {
  B0CL9BTQRF: {
    name: "USBコンデンサーマイク",
    brand: "Amazonベーシック",
    tagline: "卓上スタンド付属のUSBコンデンサーマイク。PCストリーミング・ゲーム実況・ポッドキャスト向け",
    price: 3867,
    connection: "USB",
    polar: "単一指向性 (カーディオイド)",
    micFilterTags: ["stand", "condenser"],
  },
  B092JB6XR3: {
    name: "USB コンデンサーマイク",
    brand: "ZealSound",
    tagline: "エコー機能・マイクゲイン調整・ミュートボタン搭載。卓上スタンド・ポップガード付属",
    price: 4999,
    connection: "USB / 3.5mmイヤホンジャック",
    polar: "単一指向性",
    micFilterTags: ["stand", "condenser"],
  },
  B0006H92QK: {
    name: "AT2020",
    brand: "オーディオテクニカ",
    tagline: "宅録・配信の定番スタジオクオリティXLRコンデンサーマイク。高耐入力設計",
    price: 13200,
    connection: "XLR (オーディオインターフェース接続)",
    polar: "単一指向性",
    micFilterTags: ["condenser"],
  },
  B0DXW278KB: {
    name: "QuadCast2",
    brand: "HyperX",
    tagline: "24bit/96kHz・LEDステータス・防振ショックマウント内蔵のUSBコンデンサーマイク",
    price: 22800,
    connection: "USB",
    polar: "単一指向性 (カーディオイド)",
    micFilterTags: ["stand", "condenser"],
  },
}

function isAccessory(title) {
  if (/拡張マイク|YVC-MIC|用拡張|首掛け.*ヘッドセット|ヘッドセット.*首掛け/i.test(title)) return true
  if (/マイクスタンド単|アーム単|ケース単|ポップフィルター単/i.test(title)) return true
  return false
}

function inferBrand(title) {
  const m =
    title.match(/^(Amazonベーシック|ZealSound|UGREEN|HyperX|FIFINE|MAONO|JBL|Logicool G|オーディオテクニカ|SHURE|ソニー|Marantz|エレコム)/) ||
    title.match(/^(Sony|SONY)/)
  if (m) return m[1].replace(/^SONY/, "ソニー")
  if (/^ソニー/.test(title)) return "ソニー"
  return "—"
}

function inferName(title, brand) {
  const model =
    title.match(/\b(AT20[0-9]{2}(?:USB-X)?|AT4040|K670|K669|HS-MC09UBK|AU-A04|ECM-[A-Z0-9]+|MPM-2000U|QuadCast2S?|DuoCast|YETI ORB|QUANTUM STREAM(?: TALK)?|JBLQSTREAMBLK|MV88\+|EasySing Mic Mini Duo)\b/i)?.[1] ||
    title.match(/\b(G-YETI-ORB-BK|JBLSTRMTALKBLK)\b/i)?.[1]
  if (model) return model.replace(/JBLQSTREAMBLK/i, "QUANTUM STREAM").replace(/JBLSTRMTALKBLK/i, "QUANTUM STREAM TALK")
  const stripped = title.replace(new RegExp(`^${brand}\\s*`), "").split(/[|｜]/)[0].trim()
  return stripped.slice(0, 48) || title.slice(0, 40)
}

function inferConnection(title) {
  if (/XLR/i.test(title) && !/USB/i.test(title)) return "XLR"
  if (/USB-Type-C|USB Type-C|Type-C/i.test(title)) return "USB Type-C"
  if (/USB.*3\.5|3\.5mm.*USB|イヤホン端子/i.test(title)) return "USB / 3.5mm"
  if (/USB/i.test(title)) return "USB"
  if (/Type-C/i.test(title)) return "USB Type-C"
  return "—"
}

function inferPolar(title) {
  if (/4パターン|4つの指向性|指向性の変更|単一指向性、全方向性、双指向性、ステレオ/i.test(title))
    return "4パターン (単一/双/全/ステレオ)"
  if (/ステレオ/i.test(title) && /MV88/i.test(title)) return "ステレオ"
  if (/全指向性|無指向性/i.test(title)) return "全指向性"
  if (/単一指向|カーディオイド/i.test(title)) return "単一指向性"
  return "—"
}

function inferMicFilterTags(title, connection) {
  const tags = ["condenser"]
  if (/ピンマイク|ラベリア|クリップ|ECM-TL3|Type-C端子.*ピン/i.test(title)) tags.push("pin")
  if (/ワイヤレス|wireless|EasySing Mic Mini/i.test(title)) tags.push("wireless")
  if (/スピーカーフォン|会議用マイク/i.test(title)) tags.push("conference")
  if (/卓上|スタンド|desk|三脚|スタンドマイク|USBスタンドアロン/i.test(title) && !tags.includes("pin"))
    tags.push("stand")
  if (/^AT20|^AT4040|^AT2035/i.test(title) && /XLR/i.test(connection)) {
    return ["condenser"]
  }
  return [...new Set(tags)]
}

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

const items = raw.filter((item) => {
  if (EXISTING_ASINS.has(item.asin) || EXCLUDE_ASINS.has(item.asin)) return false
  if (isAccessory(item.title)) return false
  return true
})

let idx = 0
const entries = items.map((item) => {
  idx++
  const o = USER_OVERRIDES[item.asin]
  const brand = o?.brand ?? inferBrand(item.title)
  const name = o?.name ?? inferName(item.title, brand)
  const tagline = o?.tagline ?? item.title.split(/[|｜]/)[0].slice(0, 100)
  const price = o?.price ?? item.price ?? null
  const connection = o?.connection ?? inferConnection(item.title)
  const polar = o?.polar ?? inferPolar(item.title)
  const micFilterTags = o?.micFilterTags ?? inferMicFilterTags(item.title, connection)
  const typeLabel = polar.includes("会議") ? "会議用スピーカーフォン" : "コンデンサー"

  return `  {
    id: "mic-cnd-${String(idx).padStart(3, "0")}",
    category: "mic",
    name: "${esc(name)}",
    brand: "${esc(brand)}",
    tagline: "${esc(tagline)}",
    price: ${price ?? "null"},
    rating: ${item.rating},
    reviews: ${item.reviews},
    image: "${item.image}",
    connection: "${esc(connection)}",
    purchaseUrl: "https://www.amazon.co.jp/dp/${item.asin}",
    micFilterTags: ${JSON.stringify(micFilterTags)},
    highlights: [
      { label: "指向性", value: "${esc(polar)}" },
      { label: "周波数特性", value: "—" },
      { label: "接続方式", value: "${esc(connection)}" },
      { label: "サンプルレート", value: "—" },
      { label: "タイプ", value: "${esc(typeLabel)}" },
    ],
    compat: [],
    specGroups: [
      {
        title: "オーディオ",
        rows: [
          { label: "タイプ", value: "コンデンサーマイク" },
          { label: "指向性", value: "${esc(polar)}" },
          { label: "周波数特性", value: "—" },
          { label: "サンプルレート", value: "—" },
        ],
      },
      {
        title: "接続 / 機能",
        rows: [
          { label: "接続方式", value: "${esc(connection)}" },
          { label: "Amazonランキング", value: "コンデンサーマイク #${item.amazonRank}" },
        ],
      },
    ],
  }`
})

const out = `import type { Gadget } from "./gadgets"

/** Amazon.co.jp コンデンサーマイク売れ筋（2130076051）。マイク本体のみ。 */
export const micCondenserBestsellers: Gadget[] = [
${entries.join(",\n")}
]
`

writeFileSync(join(__dirname, "..", "lib", "mic-condenser-bestsellers.ts"), out)
console.log(`Generated ${items.length} entries`)
