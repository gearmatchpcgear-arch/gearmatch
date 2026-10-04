/**
 * mic-condenser-bestsellers-page2-raw.json → lib/mic-condenser-bestsellers-page2.ts
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const raw = JSON.parse(
  readFileSync(join(__dirname, "mic-condenser-bestsellers-page2-raw.json"), "utf8"),
).microphones

const EXISTING_ASINS = new Set([
  "B075PJ7V3V", // K669B in mic-bestsellers
])
const EXCLUDE_ASINS = new Set([
  "B0FQTRJ4GH", // SM57 dynamic duplicate listing
  "B000CZ0R3S", // SM57 dynamic
  "B00IVPG0SW", // headset mic
  "B08NXFNDVK", // K690 duplicate (keep B09XDH2P6P)
  "B01GE2L1SC", // AT875R duplicate (keep B000BQ79W0)
  "B0C1Z5DWNJ", // ZealSound set duplicate
  "B08GYC4PGY", // HM-100 duplicate
  "B0FSZGKX8Q", // HM-100 duplicate low reviews
])

const USER_OVERRIDES = {
  B001TOYV4M: {
    name: "PRO35",
    brand: "オーディオテクニカ",
    tagline: "金管楽器・サックス向けXLRコンデンサーマイク。楽器用ホルダー付属、高耐入力145dB",
    connection: "XLR (ファントム電源)",
    polar: "単一指向性",
    micFilterTags: ["condenser"],
  },
  B0BTPYCD86: {
    name: "Profile USB",
    brand: "Sennheiser",
    tagline: "ポッドキャスト・ストリーマー・ゲーマー向けUSBコンデンサーマイク（国内正規品）",
    price: 15445,
    connection: "USB",
    polar: "単一指向性 (カーディオイド)",
    micFilterTags: ["stand", "condenser"],
  },
  B0014THK5E: {
    name: "AT9901",
    brand: "オーディオテクニカ",
    tagline: "小型・高音質のステレオコンデンサーマイク。ピンマイク/スタンドマイク2WAY、PC通話・Web会議向け",
    price: 3400,
    connection: "3.5mmミニプラグ",
    polar: "単一指向性",
    micFilterTags: ["pin", "condenser"],
  },
  B07NZZZ746: {
    name: "QuadCast",
    brand: "HyperX",
    tagline: "4指向性切替・タップトゥミュート・防振ショックマウント内蔵のUSBゲーミングマイク",
    price: 16500,
    connection: "USB",
    polar: "指向性切替対応 (マルチパターン)",
    micFilterTags: ["stand", "condenser"],
  },
  B09XDH2P6P: {
    name: "K690",
    brand: "FIFINE",
    tagline: "ステレオ録音対応USBコンデンサーマイク。ミュートボタン・3.5mmモニター端子・極性調整可能",
    price: 10499,
    connection: "USB / 3.5mm",
    polar: "指向性切替対応 (マルチパターン)",
    micFilterTags: ["stand", "condenser"],
  },
  B093LFS9QF: {
    name: "TM-250U",
    brand: "TASCAM",
    tagline: "超単一指向性USBコンデンサーマイク。ウェブ会議・配信・ゲーム実況向け",
    price: 7480,
    connection: "USB",
    polar: "超単一指向性",
    micFilterTags: ["stand", "condenser"],
  },
  B0GQRSQ86L: {
    name: "Wave:3",
    brand: "Elgato",
    tagline: "Wave FX Processor・Clipguard 2.0搭載のプレミアムUSBコンデンサーマイク",
    price: 28980,
    connection: "USB",
    polar: "単一指向性 (カーディオイド)",
    micFilterTags: ["stand", "condenser"],
  },
  B0G8XDVZH8: {
    name: "AT2020 CWH (セット)",
    brand: "オーディオテクニカ",
    tagline: "ホワイトXLRコンデンサーマイク＋マイクケーブルセット",
    price: 23624,
    connection: "XLR",
    polar: "単一指向性",
    micFilterTags: ["condenser"],
  },
  B09XQVB4XC: {
    name: "SoloCast (ホワイト)",
    brand: "HyperX",
    tagline: "タップトゥミュート・LEDステータス搭載のUSBコンデンサーマイク（ホワイト）",
    connection: "USB",
    polar: "単一指向性 (カーディオイド)",
    micFilterTags: ["stand", "condenser"],
  },
  B0051O2Y72: {
    name: "USB コンデンサーマイク (セット)",
    brand: "ZealSound",
    tagline: "アームスタンド付属・ワンタッチミュート・エコー機能搭載のUSBコンデンサーマイク",
    price: 5999,
    connection: "USB",
    polar: "単一指向性 (カーディオイド)",
    micFilterTags: ["stand", "condenser"],
  },
  B0H6Q4TK8K: {
    name: "ワイヤレスピンマイク (3in1)",
    brand: "—",
    tagline: "Type-C/Lightning/3.5mm対応のコードレスピンマイク。360°全指向性・2人同時収音",
    price: 1399,
    connection: "USB Type-C / Lightning / 3.5mm",
    polar: "全指向性 (360°)",
    micFilterTags: ["pin", "wireless", "condenser"],
  },
  B099NY1425: {
    name: "HM-100",
    brand: "—",
    tagline: "路線バス運転手向け後頭部掛け式ピンマイク。3.5mm/6.5mm変換プラグ付き",
    price: 1709,
    connection: "3.5mm",
    polar: "—",
    micFilterTags: ["pin", "condenser"],
  },
}

function isAccessory(title) {
  if (/拡張マイク|YVC-MIC|用拡張|首掛け.*ヘッドセット|ヘッドセット.*首掛け/i.test(title)) return true
  if (/マイクスタンド単|アーム単|ケース単|ポップフィルター単|ショックマウント単/i.test(title)) return true
  if (/ダイナミック\s*マイク|ダイナミック\s*マイクロフォン/i.test(title)) return true
  if (/ヘッドセット/i.test(title) && !/ピンマイク/i.test(title)) return true
  return false
}

function inferBrand(title) {
  const m =
    title.match(/^(Amazonベーシック|ZealSound|Zealsound|ZeaLSound|UGREEN|HyperX|ハイパーエックス|FIFINE|MAONO|JBL|Logicool G|オーディオテクニカ|SHURE|シュア|ソニー|Marantz|エレコム|Sennheiser|ゼンハイザー|TASCAM|Elgato|Superlux|FerBuee|ZOOM|Rosebe|asmrlabo)/) ||
    title.match(/^(Sony|SONY)/)
  if (!m) return "—"
  return m[1]
    .replace(/^SONY/, "ソニー")
    .replace(/^ハイパーエックス/, "HyperX")
    .replace(/^ゼンハイザー/, "Sennheiser")
    .replace(/^シュア/, "SHURE")
}

function inferName(title, brand) {
  const model =
    title.match(
      /\b(PRO35|Profile(?: USB)?|AT9901|AT875R|AT2020|QuadCast|K690|TM-250U|Wave:?3|Am7|ECM-999|ECM-PC60|DGM20|GamerWave|auriq01|HM-100|HM.?100|K669B?|Violet)\b/i,
    )?.[1] ||
    title.match(/\b(SoloCast|SM35)\b/i)?.[1]
  if (model) {
    return model
      .replace(/Profile(?: USB)?/i, "Profile USB")
      .replace(/Wave:?3/i, "Wave:3")
      .replace(/HM.?100/i, "HM-100")
  }
  const stripped = title.replace(new RegExp(`^${brand}\\s*`), "").split(/[|｜]/)[0].trim()
  return stripped.slice(0, 48) || title.slice(0, 40)
}

function inferConnection(title) {
  if (/XLR/i.test(title) && !/USB/i.test(title)) return "XLR"
  if (/USB-Type-C|USB Type-C|Type-C/i.test(title) && /USB/i.test(title)) return "USB Type-C"
  if (/Type-C.*Lightning|Lightning.*Type-C/i.test(title)) return "USB Type-C / Lightning / 3.5mm"
  if (/3\.5mm|ミニプラグ/i.test(title) && /USB/i.test(title)) return "USB / 3.5mm"
  if (/3\.5mm|ミニプラグ/i.test(title)) return "3.5mmミニプラグ"
  if (/USB/i.test(title)) return "USB"
  return "—"
}

function inferPolar(title) {
  if (/4パターン|4つの指向性|指向性の変更|単一指向性、全方向性、双指向性、ステレオ/i.test(title))
    return "指向性切替対応 (マルチパターン)"
  if (/超単一指向/i.test(title)) return "超単一指向性"
  if (/極性調整|指向性切替|マルチパターン|2モード/i.test(title))
    return "指向性切替対応 (マルチパターン)"
  if (/360°|全指向性|無指向性/i.test(title)) return "全指向性 (無指向性)"
  if (/単一指向|カーディオイド|Unidirectional/i.test(title)) return "単一指向性"
  if (/ステレオ/i.test(title)) return "単一指向性"
  return "—"
}

function inferMicFilterTags(title, connection) {
  const tags = ["condenser"]
  if (/ピンマイク|ラベリア|クリップ|ECM-|Type-C端子.*ピン|後頭部掛け/i.test(title)) tags.push("pin")
  if (/ワイヤレス|wireless|コードレス|EasySing Mic Mini/i.test(title)) tags.push("wireless")
  if (/会議用|スピーカーフォン/i.test(title)) tags.push("conference")
  if (/卓上|スタンド|desk|三脚|スタンドマイク|USBスタンドアロン|スタンドアロン/i.test(title) && !tags.includes("pin"))
    tags.push("stand")
  if (/^AT875R|^AT2020|^PRO35/i.test(title) && /XLR/i.test(connection)) return ["condenser"]
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

  return `  {
    id: "mic-cnd2-${String(idx).padStart(3, "0")}",
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
      { label: "タイプ", value: "コンデンサー" },
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

/** Amazon.co.jp コンデンサーマイク売れ筋 2ページ目（2130076051 pg=2）。マイク本体のみ。 */
export const micCondenserBestsellersPage2: Gadget[] = [
${entries.join(",\n")}
]
`

writeFileSync(join(__dirname, "..", "lib", "mic-condenser-bestsellers-page2.ts"), out)
console.log(`Generated ${items.length} entries (excluded ${raw.length - items.length})`)
