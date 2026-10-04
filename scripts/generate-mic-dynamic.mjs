/**
 * mic-dynamic-bestsellers-raw.json → lib/mic-dynamic-bestsellers.ts
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const raw = JSON.parse(
  readFileSync(join(__dirname, "mic-dynamic-bestsellers-raw.json"), "utf8"),
).microphones

const EXISTING_ASINS = new Set([
  "B0002E4Z8M", // SM7B inline
  "B000CZ0R3S", // SM57 condenser p2 excluded
  "B0FQTRJ4GH",
])
const EXCLUDE_ASINS = new Set([
  "B0G5PQWSDR", // UTAET duplicate
  "B0B31LVXW9", // UTAET (消音練習器具、マイク本体ではない)
  "B0001DBZNM", // WH20XLR duplicate
  "B0D8KD47FY", // WH20XLR headset
  "B000N94RP2", // XS 1 duplicate (keep B07GCHX2YS)
  "B0F13CMSZF", // COMICA D10 duplicate
  "B009GY4E2G", // FDUCE SL40X duplicate
  "B0D24G1RSB", // NEXADYNE duplicate
  "B091G4QW18", // TM-70 duplicate
  "B0G5D9JT5G", // TM-70 duplicate
  "B08GYC4PGY", // HM-100 duplicate
  "B0FSZGKX8Q", // HM-100 duplicate
  "B00GTDQT1Q", // PRO8HE headset
  "B08L4Z8RPN", // mic cover accessory
  "B08KQ1ZJJ1", // mic case
])

const USER_OVERRIDES = {
  B09BFPNW2J: {
    name: "AT2040",
    brand: "オーディオテクニカ",
    tagline: "配信・ポッドキャスト向け超単一指向性ダイナミックマイク。ショックマウント内蔵・ポップフィルター一体構造",
    price: 12800,
    connection: "XLR",
    polar: "超単一指向性 (ハイパーカーディオイド)",
    micFilterTags: ["dynamic"],
  },
  B00006I5R7: {
    name: "e 835",
    brand: "Sennheiser",
    tagline: "ボーカル・スピーチ定番の高品位ダイナミックマイク。メタルハウジング堅牢設計（国内正規品）",
    price: 14700,
    connection: "XLR",
    polar: "単一指向性 (カーディオイド)",
    micFilterTags: ["dynamic"],
  },
  B09W5MWL9Z: {
    name: "V7",
    brand: "sE Electronics",
    tagline: "アルミニウムボイスコイル・内蔵ショックマウント搭載のスーパーカーディオイドダイナミックマイク。ライブ・スタジオボーカル用",
    price: 17600,
    connection: "XLR",
    polar: "スーパーカーディオイド",
    micFilterTags: ["dynamic"],
  },
  B07MW2Z1CD: {
    name: "ANM-865",
    brand: "AUDIO NEXSUS",
    tagline: "手元スイッチ付きエントリーダイナミックマイク。3m・6.3mm標準プラグケーブル付属",
    price: 1239,
    connection: "6.3mm標準プラグ",
    polar: "—",
    micFilterTags: ["dynamic"],
  },
  B0DZ5HLQC7: {
    name: "400-SP045",
    brand: "サンワダイレクト",
    tagline: "手元スイッチ付き単一指向性ダイナミックマイク。4.5mケーブル付属、ボーカル・スピーチ・カラオケ・イベント向け",
    price: 3980,
    connection: "XLR / 6.3mm",
    polar: "単一指向性",
    micFilterTags: ["dynamic", "stand"],
  },
  B07NZZZ746: null,
  B0002BACB4: {
    name: "BETA 58A",
    brand: "SHURE",
    tagline: "ステージ・スタジオ向けスーパーカーディオイドダイナミックマイク（国内正規品）",
    connection: "XLR",
    polar: "スーパーカーディオイド",
    micFilterTags: ["dynamic"],
  },
}

const MANUAL_SUPPLEMENTS = [
  {
    amazonRank: 49,
    asin: "B0DZ5HLQC7",
    title: "サンワダイレクト ダイナミックマイク 単一指向性 スイッチ付 4.5mケーブル付 400-SP045",
    rating: 4.2,
    reviews: 0,
    price: 3980,
    image: "https://m.media-amazon.com/images/I/71PPbcuU0FL._AC_SL1500_.jpg",
  },
  {
    amazonRank: 0,
    asin: "B00006I5R7",
    title: "ゼンハイザー ダイナミックマイクロホン e 835 カーディオイド ボーカル・スピーチ向け",
    rating: 4.7,
    reviews: 1216,
    price: 14700,
    image: "https://m.media-amazon.com/images/I/71IXf7n8W-L._AC_SL1500_.jpg",
  },
  {
    amazonRank: 0,
    asin: "B09W5MWL9Z",
    title: "sE Electronics V7 Black ダイナミックマイク スーパーカーディオイド ボーカル用",
    rating: 4.6,
    reviews: 200,
    price: 17600,
    image: "https://m.media-amazon.com/images/I/41CW447wgFL._AC_SL1500_.jpg",
  },
  {
    amazonRank: 0,
    asin: "B07MW2Z1CD",
    title: "有線マイク ANM-865 (3m 6.3Φ)",
    rating: 4.0,
    reviews: 50,
    price: 1239,
    image: "https://m.media-amazon.com/images/I/415ob8IkIkL._AC_SL1500_.jpg",
  },
]

function isAccessory(title) {
  if (/拡張マイク|YVC-MIC|用拡張|ケーブル単|ケーブルのみ|マイクケース|業務用.*ケース/i.test(title)) return true
  if (/マイクスタンド単|アーム単|ケース単|ポップフィルター単|ショックマウント単|カバーセット|マイク&カバー/i.test(title))
    return true
  if (/ウタエット|UTAET/i.test(title)) return true
  if (/ヘッドセット|ヘッドウォーン|headset|headworn/i.test(title) && !/ピンマイク/i.test(title)) return true
  return false
}

function inferBrand(title) {
  const m =
    title.match(
      /^(サンワダイレクト|サンワサプライ|オーディオテクニカ|SHURE|シュア|ゼンハイザー|Sennheiser|sE Electronics|AUDIO NEXSUS|FIFINE|HyperX|MAONO|BEHRINGER|ベリンガー|YAMAHA|ヤマハ|JBL|Elgato|TASCAM|Superlux|TONOR|Moukey|KC|COMICA|FDUCE|Talomen|LEWITT|AKG|CAROL|XIAOKOA|FerBuee|ZOOM|Rosebe|asmrlabo|Elnicec)/i,
    )
  if (!m) return "—"
  return m[1]
    .replace(/^Audio-Technica/i, "オーディオテクニカ")
    .replace(/^Shure|^シュア/i, "SHURE")
    .replace(/^Sennheiser|^ゼンハイザー/i, "Sennheiser")
    .replace(/^YAMAHA|^ヤマハ/i, "YAMAHA")
    .replace(/^BEHRINGER|^ベリンガー/i, "BEHRINGER")
}

function inferName(title, brand) {
  const model =
    title.match(
      /\b(400-SP045|400-MC002|AT2040(?:USB)?|AT-X3|AT875R|e835|e945|e845|XS\s*1|SM7dB|SM58|BETA\s*58A|K688(?:CT)?|XM8500|DM-105|TM-70|TM-250U|PD200XS|PD100XS|PD100|TD510|K380S|MV6|MV7\+?|V7|ANM-865|NEXADYNE|SL40X|CLM-101|D10|D5-Y3|PRO35|L52|MTP\s*5|Am7|ECM-999|auriq01|FT-DM7|CM-2000|PartyBox Wireless Mic|QUANTUM|Profile)\b/i,
    )?.[1]
  if (model) return model.replace(/\s+/g, " ").trim()
  const stripped = title.replace(new RegExp(`^${brand}\\s*`, "i"), "").split(/[|｜]/)[0].trim()
  return stripped.slice(0, 48) || title.slice(0, 40)
}

function inferConnection(title) {
  if (/USB.*XLR|XLR.*USB/i.test(title)) return "USB / XLR"
  if (/XLR/i.test(title) && /6\.3|標準プラグ|Phone/i.test(title)) return "XLR / 6.3mm"
  if (/XLR/i.test(title)) return "XLR"
  if (/USB-Type-C|USB Type-C|Type-C/i.test(title) && /USB/i.test(title)) return "USB Type-C"
  if (/6\.3|標準プラグ|Phone/i.test(title)) return "6.3mm標準プラグ"
  if (/USB/i.test(title)) return "USB"
  if (/2\.4\s*GHz|2\.4GHz/i.test(title)) return "2.4GHz ワイヤレス"
  return "—"
}

function inferPolar(title) {
  if (/ハイパーカーディオイド|hypercardioid|超単一指向/i.test(title)) return "超単一指向性 (ハイパーカーディオイド)"
  if (/スーパーカーディオイド|supercardioid/i.test(title)) return "スーパーカーディオイド"
  if (/全指向性|無指向性|360°/i.test(title)) return "全指向性"
  if (/双指向|bidirectional/i.test(title)) return "双指向性"
  if (/カーディオイド|cardioid|単一指向/i.test(title)) return "単一指向性 (カーディオイド)"
  return "—"
}

function inferMicFilterTags(title, connection) {
  const tags = ["dynamic"]
  if (/ピンマイク|ラベリア|クリップ/i.test(title)) tags.push("pin")
  if (/ワイヤレス|wireless|コードレス|2\.4\s*GHz|2\.4GHz|UHF/i.test(title)) tags.push("wireless")
  if (/会議用|スピーカーフォン|拡声器|PartyBox Wireless/i.test(title)) tags.push("conference")
  if (/卓上|スタンド|desk|三脚|手元スイッチ|400-SP045|400-MC002|USBスタンド/i.test(title) && !tags.includes("pin"))
    tags.push("stand")
  if (/^AT2040|^e835|^V7\b|^ANM-865|^SM7|^BETA|^e945|^XS\s*1/i.test(title) && !/卓上|スタンド|セット/i.test(title)) {
    return ["dynamic"]
  }
  return [...new Set(tags)]
}

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

const rawAsins = new Set(raw.map((i) => i.asin))
const merged = [
  ...raw,
  ...MANUAL_SUPPLEMENTS.filter((m) => !rawAsins.has(m.asin)),
]

const items = merged.filter((item) => {
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
  const rankLabel = item.amazonRank > 0 ? `#${item.amazonRank}` : "人気モデル"

  return `  {
    id: "mic-dyn-${String(idx).padStart(3, "0")}",
    category: "mic",
    name: "${esc(name)}",
    brand: "${esc(brand)}",
    tagline: "${esc(tagline)}",
    price: ${price ?? "null"},
    rating: ${item.rating},
    reviews: ${item.reviews},
    image: "${item.image || "https://m.media-amazon.com/images/I/61placeholder._AC_SL1500_.jpg"}",
    connection: "${esc(connection)}",
    purchaseUrl: "https://www.amazon.co.jp/dp/${item.asin}",
    micFilterTags: ${JSON.stringify(micFilterTags)},
    highlights: [
      { label: "指向性", value: "${esc(polar)}" },
      { label: "周波数特性", value: "—" },
      { label: "接続方式", value: "${esc(connection)}" },
      { label: "サンプルレート", value: "—" },
      { label: "タイプ", value: "ダイナミック" },
    ],
    compat: [],
    specGroups: [
      {
        title: "オーディオ",
        rows: [
          { label: "タイプ", value: "ダイナミックマイク" },
          { label: "指向性", value: "${esc(polar)}" },
          { label: "周波数特性", value: "—" },
          { label: "サンプルレート", value: "—" },
        ],
      },
      {
        title: "接続 / 機能",
        rows: [
          { label: "接続方式", value: "${esc(connection)}" },
          { label: "Amazonランキング", value: "ダイナミックマイク ${rankLabel}" },
        ],
      },
    ],
  }`
})

const out = `import type { Gadget } from "./gadgets"

/** Amazon.co.jp ダイナミックマイク売れ筋（2130075051）。マイク本体のみ。 */
export const micDynamicBestsellers: Gadget[] = [
${entries.join(",\n")}
]
`

writeFileSync(join(__dirname, "..", "lib", "mic-dynamic-bestsellers.ts"), out)
console.log(`Generated ${items.length} entries from ${merged.length} merged (${raw.length} fetched + ${MANUAL_SUPPLEMENTS.length} manual)`)
