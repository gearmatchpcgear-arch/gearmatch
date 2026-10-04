/**
 * mic-headset-new-releases-raw.json → lib/mic-headset-new-releases.ts
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isNonPcHeadset } from "./fetch-mic-headset-new-releases.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

const page1Asins = new Set([
  ...readFileSync(join(ROOT, "lib", "mic-bestsellers.ts"), "utf8").matchAll(/dp\/([A-Z0-9]{10})/g),
].map((m) => m[1]))

const USER_OVERRIDES = {
  B0H35YKFF4: {
    name: "LBT-HSC11MPGN",
    brand: "エレコム",
    tagline: "Bluetoothワイヤレスヘッドセット・片耳・マイクミュート付き・左右装着切替・HD Voice対応",
    price: 2982,
    connection: "Bluetooth / 片耳ハンズフリー",
    wearType: "片耳",
    micFilterTags: ["headset", "wireless"],
  },
  B0H2L55QBW: {
    name: "クリップ式マイク付き有線イヤホン",
    brand: "—",
    tagline: "3.5mm 4極 L字プラグ・クリップ式マイク付き・ゲーミング/通話向け",
    price: 1699,
    connection: "3.5mm 4極ミニプラグ",
    wearType: "インイヤー",
    micFilterTags: ["headset", "pin"],
  },
  B0H7BK7NT6: {
    name: "MM-BTSH73BK",
    brand: "サンワサプライ",
    tagline: "Bluetoothオープンイヤーヘッドセット・有線USB接続にも対応・Web会議/テレワーク向け",
    price: 8973,
    connection: "Bluetooth / USB (有線)",
    wearType: "オープンイヤー",
    micFilterTags: ["headset", "wireless"],
  },
  B0H28QKKV2: {
    name: "Type-C 有線ヘッドセット",
    brand: "Callez",
    tagline: "USB Type-C接続・ノイズキャンセリングマイク付き・片耳・ミュート機能・350°回転",
    price: 1800,
    connection: "USB Type-C",
    wearType: "片耳",
    micFilterTags: ["headset"],
  },
  B0H5KMQPZ2: {
    name: "有線ゲーミングヘッドセット",
    brand: "—",
    tagline: "3.5mm有線・オーバーイヤー・ノイズキャンセリングマイク・PS4/PS5/PC対応",
    price: 2280,
    connection: "3.5mm",
    wearType: "オーバーイヤー",
    micFilterTags: ["headset"],
  },
  B0FP5FMBDJ: {
    name: "AOC ワイヤレスヘッドセット",
    brand: "AOC",
    tagline: "3WAY接続（Bluetooth 5.4/USB/有線）・AIノイズキャンセリング・マイクミュート・270°回転マイク",
    connection: "Bluetooth / USB / 有線",
    wearType: "両耳",
    micFilterTags: ["headset", "wireless"],
  },
  B0H4R14WQK: {
    name: "有線セミインイヤーヘッドフォン",
    brand: "—",
    tagline: "3.5mmジャック・ステレオ・マイク付き・PC/MP3/MP4対応",
    price: 1920,
    connection: "3.5mm",
    wearType: "セミインイヤー",
    micFilterTags: ["headset"],
  },
  B0GZWMRY3K: {
    name: "7.1サラウンドゲーミングヘッドセット",
    brand: "—",
    tagline: "7.1chサラウンド・RGBライティング・40mmドライバー・ノイズキャンセリングマイク・USB/3.5mm",
    price: 2599,
    connection: "USB / 3.5mm",
    wearType: "オーバーイヤー",
    micFilterTags: ["headset"],
  },
  B0H148JZYW: {
    name: "USBヘッドセット",
    brand: "—",
    tagline: "USB有線・ノイズキャンセリング単一指向性マイク・軽量・テレワーク/在宅勤務向け",
    price: 918,
    connection: "USB",
    wearType: "片耳",
    micFilterTags: ["headset"],
  },
  B0HCTPD29D: {
    name: "USB-A 有線ヘッドセット",
    brand: "エレコム",
    tagline: "USB-A・指向性マイク・ノイズキャンセリング・小型軽量・両耳・ケーブル1.8m",
    connection: "USB Type-A",
    wearType: "両耳",
    micFilterTags: ["headset"],
  },
  B0GZZG1GWT: {
    name: "USB ステレオヘッドセット",
    brand: "TOALLIN",
    tagline: "USB有線・ステレオ・ノイズキャンセリングマイク・音量調整・ワンキーミュート",
    connection: "USB",
    wearType: "両耳",
    micFilterTags: ["headset"],
  },
  B0GYRP8PBD: {
    name: "Zone 305 Wireless",
    brand: "Logicool",
    tagline: "Teams認証ビジネス向けワイヤレスヘッドセット・USBレシーバー付属",
    connection: "USB / 2.4GHz ワイヤレス",
    wearType: "両耳",
    micFilterTags: ["headset", "wireless"],
  },
  B0GXJH7FJ7: {
    name: "Zone Wireless 2",
    brand: "Logicool",
    tagline: "Teams版ノイズキャンセリングワイヤレスヘッドセット・ビジネス/PC向け",
    connection: "USB / Bluetooth",
    wearType: "両耳",
    micFilterTags: ["headset", "wireless"],
  },
}

function inferBrand(title) {
  const m =
    title.match(
      /^(エレコム|Elecom|サンワサプライ|Sanwa Supply|サンワダイレクト|Logicool|Logitech|HP Poly|Poly|AOC|TOALLIN|Callez|Fiaster|Elecom|BenQ|HyperX)/i,
    )
  if (!m) return "—"
  return m[1]
    .replace(/^Elecom/i, "エレコム")
    .replace(/^Sanwa Supply/i, "サンワサプライ")
    .replace(/^Logitech/i, "Logicool")
}

function inferName(title, brand) {
  const model =
    title.match(
      /\b(LBT-HSC\d+[A-Z]+|MM-BTSH\d+[A-Z]+|400-BTSH\d+|Zone\s*\d+|Mission\s*\d+|HY-[A-Z0-9]+)\b/i,
    )?.[1]
  if (model) return model.replace(/\s+/g, " ")
  const stripped = title.replace(new RegExp(`^${brand}\\s*`, "i"), "").split(/[|｜]/)[0].trim()
  if (/ヘッドセット|headset/i.test(stripped)) return stripped.slice(0, 40)
  if (/イヤホン|earphone|headphone/i.test(stripped)) return stripped.slice(0, 40)
  return stripped.slice(0, 48) || title.slice(0, 40)
}

function inferConnection(title) {
  if (/bluetooth|ワイヤレス/i.test(title) && /usb|有線/i.test(title)) return "Bluetooth / USB"
  if (/bluetooth|ワイヤレス/i.test(title)) return "Bluetooth"
  if (/usb[\s-]?type[\s-]?c|type[\s-]?c|タイプc/i.test(title)) return "USB Type-C"
  if (/usb[\s-]?a|usb-a/i.test(title)) return "USB Type-A"
  if (/usb/i.test(title)) return "USB"
  if (/3\.5\s*mm|3\.5mm|4極/i.test(title)) return "3.5mm"
  return "—"
}

function inferWearType(title) {
  if (/片耳|single ear|monaural/i.test(title)) return "片耳"
  if (/両耳|binaural|stereo/i.test(title)) return "両耳"
  if (/オープンイヤー|open.?ear/i.test(title)) return "オープンイヤー"
  if (/オーバーイヤー|over.?ear/i.test(title)) return "オーバーイヤー"
  if (/インイヤー|in.?ear|イヤホン/i.test(title)) return "インイヤー"
  if (/セミインイヤー|semi/i.test(title)) return "セミインイヤー"
  return "—"
}

function inferMicFilterTags(title, connection, overrideTags) {
  if (overrideTags) return overrideTags
  const tags = ["headset"]
  const hay = `${title} ${connection}`.toLowerCase()
  if (/bluetooth|ワイヤレス|wireless|2\.4\s*ghz/i.test(hay)) tags.push("wireless")
  if (/クリップ|clip|ピン|ラベリア|インイヤー.*マイク/i.test(hay)) tags.push("pin")
  return [...new Set(tags)]
}

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

const { headsets } = JSON.parse(
  readFileSync(join(__dirname, "mic-headset-new-releases-raw.json"), "utf8"),
)

const items = headsets.filter((item) => {
  if (page1Asins.has(item.asin)) return false
  if (isNonPcHeadset(item.title)) return false
  return true
})

const byAsin = new Map()
for (const item of items.sort((a, b) => a.amazonRank - b.amazonRank)) {
  byAsin.set(item.asin, item)
}
const unique = [...byAsin.values()]

let idx = 0
const entries = unique.map((item) => {
  idx++
  const o = USER_OVERRIDES[item.asin]
  const brand = o?.brand ?? inferBrand(item.title)
  const name = o?.name ?? inferName(item.title, brand)
  const tagline = o?.tagline ?? item.title.split(/[|｜]/)[0].slice(0, 100)
  const price = o?.price ?? item.price ?? null
  const connection = o?.connection ?? inferConnection(item.title)
  const wearType = o?.wearType ?? inferWearType(item.title)
  const micFilterTags =
    o?.micFilterTags ?? inferMicFilterTags(item.title, connection)
  const image = normalizeAmazonImageUrl(item.image) || "https://m.media-amazon.com/images/I/61placeholder._AC_SL1500_.jpg"
  const rankLabel = item.amazonRank > 0 ? `#${item.amazonRank}` : "新着"

  return `  {
    id: "mic-hs-${String(idx).padStart(3, "0")}",
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
      { label: "タイプ", value: "ヘッドセット" },
      { label: "装着", value: "${esc(wearType)}" },
      { label: "接続", value: "${esc(connection.includes("/") ? connection.split("/")[0].trim() : connection)}" },
      { label: "マイク", value: "内蔵" },
      { label: "用途", value: "${esc(/ゲーミング|gaming|ps4|ps5/i.test(item.title) ? "ゲーミング" : /teams|ビジネス|テレワーク|web会議|在宅/i.test(item.title) ? "ビジネス/Web会議" : "通話・音楽")}" },
    ],
    compat: [],
    specGroups: [
      {
        title: "オーディオ",
        rows: [
          { label: "タイプ", value: "ヘッドセット / マイク付きイヤホン" },
          { label: "装着形式", value: "${esc(wearType)}" },
          { label: "マイク", value: "内蔵" },
        ],
      },
      {
        title: "接続 / 機能",
        rows: [
          { label: "接続方式", value: "${esc(connection)}" },
          { label: "Amazon新着ランキング", value: "PC用ヘッドセット ${rankLabel}" },
        ],
      },
    ],
  }`
})

const out = `import type { Gadget } from "./gadgets"

/** Amazon.co.jp PC用ヘッドセット新着（2152016051）。 */
export const micHeadsetNewReleases: Gadget[] = [
${entries.join(",\n")}
]
`

writeFileSync(join(ROOT, "lib", "mic-headset-new-releases.ts"), out)
console.log(`Generated ${unique.length} headset entries`)
