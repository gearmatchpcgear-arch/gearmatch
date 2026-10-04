/**
 * mic-dynamic-bestsellers-page2-raw.json + manual supplements
 * → lib/mic-dynamic-bestsellers-page2.ts
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const raw = JSON.parse(
  readFileSync(join(__dirname, "mic-dynamic-bestsellers-page2-raw.json"), "utf8"),
).microphones

const page1Src = readFileSync(join(__dirname, "..", "lib", "mic-dynamic-bestsellers.ts"), "utf8")
const PAGE1_ASINS = new Set([...page1Src.matchAll(/dp\/([A-Z0-9]{10})/g)].map((m) => m[1]))

const EXCLUDE_ASINS = new Set([
  "B0F13CMSZF", // COMICA D10 duplicate listing
  "B0D24G1RSB", // NEXADYNE duplicate listing
  "B00GTDQT1Q", // PRO8HE headset
  "B08KQ1ZJJ1", // mic case
])

const USER_OVERRIDES = {
  B009GY4E2G: {
    name: "MD-5A",
    brand: "UNI-PEX",
    tagline: "業務用ハンド型ダイナミックマイク。スピーチ・イベント・司会向け",
    price: 4300,
    connection: "XLR",
    polar: "単一指向性",
    micFilterTags: ["dynamic"],
  },
  B0G5D9JT5G: {
    name: "TKY-93",
    brand: "MEDIACOM",
    tagline: "ハイパーモロリゲ君。クラシックガイコツ型ダイナミックマイク付属",
    price: 9570,
    connection: "XLR",
    polar: "単一指向性",
    micFilterTags: ["dynamic"],
  },
  B091G4QW18: {
    name: "TM-70",
    brand: "TASCAM",
    tagline: "エンドアドレス型ダイナミックマイク。ボーカル・楽器録音向け",
    price: 7055,
    connection: "XLR",
    polar: "単一指向性 (カーディオイド)",
    micFilterTags: ["dynamic"],
  },
  B00BLDTKBK: {
    name: "PROH7F",
    brand: "Superlux",
    tagline: "HISTORIC SERIES ガイコツ型レトロデザイン。ボーカル・ステージパフォーマンス向け",
    price: 8870,
    connection: "XLR",
    polar: "超単一指向性 (スーパーカーディオイド)",
    micFilterTags: ["dynamic"],
  },
  B083NC4ZTT: {
    name: "EM-89D",
    brand: "MACKIE",
    tagline: "Elementシリーズの頑丈なプロ仕様ダイナミックマイク。ボーカル・楽器収音・ポッドキャスト向け（ケーブル・ホルダー付属）",
    price: 7580,
    connection: "XLR (マイクケーブル・マイクホルダー付属)",
    polar: "単一指向性 (カーディオイド)",
    micFilterTags: ["dynamic"],
  },
  B0GQGP99Y7: {
    name: "DM-1200",
    brand: "TOA",
    tagline: "トークスイッチ付き業務用ハンド型ダイナミックマイク。演説・スピーチ・イベント向け高耐久モデル",
    price: 12706,
    connection: "XLR / 6.3mm標準プラグ",
    polar: "単一指向性",
    micFilterTags: ["dynamic"],
  },
  B091DP52RD: {
    name: "SM63LB-X",
    brand: "SHURE",
    tagline: "ロングシャフト仕様の報道・インタビュー用定番マイク。ネオジムマグネット採用、Vera-Velocityポップフィルター内蔵",
    price: 29700,
    connection: "XLR",
    polar: "無指向性 (オムニ)",
    micFilterTags: ["dynamic"],
  },
  B078Z79SZJ: {
    name: "Q6",
    brand: "Samson",
    tagline: "オン/オフスイッチ搭載のスーパーカーディオイド・ダイナミックマイク。高出力・耐ハウリング設計、ライブボーカル向け",
    price: 4780,
    connection: "XLR",
    polar: "超単一指向性 (スーパーカーディオイド)",
    micFilterTags: ["dynamic"],
  },
}

const MANUAL_SUPPLEMENTS = [
  {
    amazonRank: 60,
    asin: "B009GY4E2G",
    title: "UNI-PEX ユニペックス マイクロホン(ハンドタイプ) MD-5A",
    rating: 4.0,
    reviews: 0,
    price: 4300,
    image: "https://m.media-amazon.com/images/I/114Qbd5m6TL._AC_SL1500_.jpg",
  },
  {
    amazonRank: 70,
    asin: "B0G5D9JT5G",
    title: "MEDIACOM TKY-93 ハイパーモロリゲ君 クラシックマイク付属",
    rating: 4.6,
    reviews: 501,
    price: 9570,
    image: "https://m.media-amazon.com/images/I/51u1SDds8BL._AC_SL1500_.jpg",
  },
  {
    amazonRank: 72,
    asin: "B091G4QW18",
    title: "TASCAM タスカム エンドアドレス・ダイナミックマイクロホン TM-70",
    rating: 4.6,
    reviews: 24,
    price: 7055,
    image: "https://m.media-amazon.com/images/I/71NDwYPOZqS._AC_SL1500_.jpg",
  },
  {
    amazonRank: 90,
    asin: "B00BLDTKBK",
    title: "Superlux HISTORIC SERIES PROH7F ガイコツマイク",
    rating: 4.0,
    reviews: 77,
    price: 8870,
    image: "https://m.media-amazon.com/images/I/71M10U0vFQL._AC_SL1500_.jpg",
  },
  {
    amazonRank: 91,
    asin: "B083NC4ZTT",
    title: "MACKIE マッキー プロフェッショナルダイナミックマイク EM-89D",
    rating: 4.6,
    reviews: 211,
    price: 7580,
    image: "https://m.media-amazon.com/images/I/51bWQetY7vL._AC_SL1500_.jpg",
  },
  {
    amazonRank: 93,
    asin: "B0GQGP99Y7",
    title: "TOA ハンド型ダイナミックマイク DM-1200",
    rating: 3.6,
    reviews: 6,
    price: 12706,
    image: "https://m.media-amazon.com/images/I/41tDjUIpfnL._AC_SL1500_.jpg",
  },
  {
    amazonRank: 94,
    asin: "B091DP52RD",
    title: "SHURE インタビュー マイクロホン SM63LB-X",
    rating: 4.0,
    reviews: 0,
    price: 29700,
    image: "https://m.media-amazon.com/images/I/51whmGDBOnL._AC_SL1500_.jpg",
  },
  {
    amazonRank: 95,
    asin: "B078Z79SZJ",
    title: "Samson Q6 ダイナミックハンドヘルドマイク",
    rating: 4.9,
    reviews: 20,
    price: 4780,
    image: "https://m.media-amazon.com/images/I/6143c-BrNUL._AC_SL1500_.jpg",
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

function isCompleteSet(title) {
  if (/オーディオインターフェース.*セット|配信セット|コンプリート.*セット|ストリーミングセット/i.test(title)) return true
  if (/&.*(スタンド|アーム|ブーム|ショックマウント|ケーブル).*セット/i.test(title)) return true
  if (/ブームアーム付|アーム付き|マイクアーム|boom arm/i.test(title) && /セット|付き|同梱|&/i.test(title))
    return true
  if (/AT2040.*&(スタンド|アーム|ショック|USB)/i.test(title)) return true
  if (/BETA58A.*\+.*ケーブル|ケーブル.*セット/i.test(title)) return true
  if (/TD510\+|TD510\+.*アーム|オーディオインターフェース/i.test(title) && /セット|アーム/i.test(title))
    return true
  if (/Producer Bundle|MACKIE.*セット/i.test(title)) return true
  return false
}

function inferBrand(title) {
  const m =
    title.match(
      /^(Superlux|Samson|MACKIE|Mackie|TOA|SHURE|シュア|UNI-PEX|ユニペックス|MEDIACOM|TASCAM|タスカム|BEHRINGER|ベリンガー|CAROL|FDUCE|TONOR|MAONO|AKG|XIAOKOA|キングジム|Kingjim|Shure|Audio-Technica|オーディオテクニカ|Sennheiser|ゼンハイザー|COMICA|ZealSound)/i,
    )
  if (!m) return "—"
  return m[1]
    .replace(/^Mackie/i, "MACKIE")
    .replace(/^Shure|^シュア/i, "SHURE")
    .replace(/^ユニペックス/i, "UNI-PEX")
    .replace(/^タスカム/i, "TASCAM")
}

function inferName(title, brand) {
  const model =
    title.match(
      /\b(PROH7F|EM-89D|DM-1200|SM63LB(?:-X)?|Q6|MD-5A|TKY-93|TM-70|D112\/C|FT-DM7|CLM-101|XM8500|SL40X|AT-X3|e845-S|D5-Y3|PD300XT|PGA48|NEXADYNE|BETA\s*58A)\b/i,
    )?.[1]
  if (model) return model.replace(/\s+/g, " ").trim()
  const stripped = title.replace(new RegExp(`^${brand}\\s*`, "i"), "").split(/[|｜]/)[0].trim()
  return stripped.slice(0, 48) || title.slice(0, 40)
}

function inferConnection(title) {
  if (/USB.*XLR|XLR.*USB/i.test(title)) return "USB / XLR"
  if (/XLR/i.test(title) && /6\.3|標準プラグ|Phone/i.test(title)) return "XLR / 6.3mm"
  if (/XLR/i.test(title)) return "XLR"
  if (/6\.3|標準プラグ|Phone/i.test(title)) return "6.3mm標準プラグ"
  if (/USB/i.test(title)) return "USB"
  if (/2\.4\s*GHz|2\.4GHz|UHF/i.test(title)) return "2.4GHz ワイヤレス"
  return "—"
}

function inferPolar(title) {
  if (/ハイパーカーディオイド|hypercardioid|超単一指向/i.test(title)) return "超単一指向性 (ハイパーカーディオイド)"
  if (/スーパーカーディオイド|supercardioid/i.test(title)) return "スーパーカーディオイド"
  if (/全指向性|無指向性|360°|オムニ/i.test(title)) return "無指向性 (オムニ)"
  if (/双指向|bidirectional/i.test(title)) return "双指向性"
  if (/カーディオイド|cardioid|単一指向/i.test(title)) return "単一指向性 (カーディオイド)"
  return "—"
}

function inferMicFilterTags(title) {
  const tags = ["dynamic"]
  if (/ピンマイク|ラベリア|クリップ/i.test(title)) tags.push("pin")
  if (/ワイヤレス|wireless|コードレス|2\.4\s*GHz|2\.4GHz|UHF/i.test(title)) tags.push("wireless")
  if (/会議用|スピーカーフォン|拡声器|PartyBox Wireless/i.test(title)) tags.push("conference")
  if (/卓上|スタンド|desk|三脚|手元スイッチ|400-SP045|400-MC002|USBスタンド/i.test(title) && !tags.includes("pin"))
    tags.push("stand")
  return [...new Set(tags)]
}

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

const rawAsins = new Set(raw.map((i) => i.asin))
const merged = [
  ...raw.filter((item) => !MANUAL_SUPPLEMENTS.some((m) => m.asin === item.asin)),
  ...MANUAL_SUPPLEMENTS.filter((m) => !rawAsins.has(m.asin) || USER_OVERRIDES[m.asin]),
]

const items = merged.filter((item) => {
  if (PAGE1_ASINS.has(item.asin) && !USER_OVERRIDES[item.asin]) return false
  if (EXCLUDE_ASINS.has(item.asin)) return false
  if (isAccessory(item.title)) return false
  if (isCompleteSet(item.title)) return false
  return true
})

// Dedupe by ASIN (prefer manual supplements)
const byAsin = new Map()
for (const item of items) {
  byAsin.set(item.asin, item)
}
const uniqueItems = [...byAsin.values()].sort((a, b) => {
  const ra = a.amazonRank || 999
  const rb = b.amazonRank || 999
  return ra - rb
})

let idx = 0
const entries = uniqueItems.map((item) => {
  idx++
  const o = USER_OVERRIDES[item.asin]
  const brand = o?.brand ?? inferBrand(item.title)
  const name = o?.name ?? inferName(item.title, brand)
  const tagline = o?.tagline ?? item.title.split(/[|｜]/)[0].slice(0, 100)
  const price = o?.price ?? item.price ?? null
  const connection = o?.connection ?? inferConnection(item.title)
  const polar = o?.polar ?? inferPolar(item.title)
  const micFilterTags = o?.micFilterTags ?? inferMicFilterTags(item.title)
  const rankLabel = item.amazonRank > 0 ? `#${item.amazonRank}` : "人気モデル"
  const image = normalizeAmazonImageUrl(item.image) || "https://m.media-amazon.com/images/I/61placeholder._AC_SL1500_.jpg"

  return `  {
    id: "mic-dyn2-${String(idx).padStart(3, "0")}",
    category: "mic",
    name: "${esc(name)}",
    brand: "${esc(brand)}",
    tagline: "${esc(tagline)}",
    price: ${price ?? "null"},
    rating: ${item.rating},
    reviews: ${item.reviews},
    image: "${image}",
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

/** Amazon.co.jp ダイナミックマイク売れ筋 2ページ目（2130075051 pg=2）。マイク本体のみ。 */
export const micDynamicBestsellersPage2: Gadget[] = [
${entries.join(",\n")}
]
`

writeFileSync(join(__dirname, "..", "lib", "mic-dynamic-bestsellers-page2.ts"), out)
console.log(
  `Generated ${uniqueItems.length} page2 entries (${raw.length} fetched, ${MANUAL_SUPPLEMENTS.length} manual, skipped ${PAGE1_ASINS.size} page1 ASINs)`,
)
