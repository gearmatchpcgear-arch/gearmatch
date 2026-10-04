/**
 * mic-bestsellers-page2-raw.json → lib/mic-bestsellers-page2.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { isMicRankingBodyTitle } from "./mic-accessory-title.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const DASH = "—"

const page1Overrides = existsSync(join(__dirname, "mic-bestsellers-spec-overrides.json"))
  ? JSON.parse(readFileSync(join(__dirname, "mic-bestsellers-spec-overrides.json"), "utf8"))
  : {}
const page2Overrides = JSON.parse(
  readFileSync(join(__dirname, "mic-bestsellers-page2-spec-overrides.json"), "utf8"),
)
const OVERRIDES = { ...page1Overrides, ...page2Overrides }

function loadCuratedBlocks() {
  const map = new Map()
  const re =
    /(\{[\s\S]*?category: "mic"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?\n  \})/g
  for (const file of ["mic-bestsellers.ts", "mic-bestsellers-page2.ts"]) {
    const path = join(ROOT, "lib", file)
    if (!existsSync(path)) continue
    const src = readFileSync(path, "utf8")
    for (const m of src.matchAll(re)) map.set(m[2], m[1])
  }
  return map
}

function inferBrand(title) {
  const brands = [
    "HyperX",
    "FIFINE",
    "Razer",
    "オーディオテクニカ",
    "Audio-Technica",
    "SteelSeries",
    "EMEET",
    "eMeet",
    "Anker",
    "サンワダイレクト",
    "サンワサプライ",
    "Sanwa Supply",
    "Sanwa Direct",
    "エレコム",
    "Elecom",
    "Cubilux",
    "Veetop",
    "BILIWAL",
    "BitTradeOne",
    "Freell",
    "Solxion",
    "e-Better",
  ]
  for (const b of brands) {
    if (title.includes(b)) {
      return b
        .replace(/Sanwa Supply|Sanwa Direct/i, "サンワサプライ")
        .replace(/^eMeet$/i, "EMEET")
        .replace(/^Elecom$/i, "エレコム")
    }
  }
  return DASH
}

function inferName(title, brand) {
  const model =
    title.match(
      /\b(SoloCast|QuadCast|K053|AT9933USB|Alias Pro|Seiren V3 Mini(?: White)?|MM-MCU03BKN|MM-MCTC02NC|400-MC011|HS-SP02M2BK|PowerConf S3|Luna Plus|Luna|M2|MO-MIC04U-B)\b/i,
    )?.[1]
  if (model) return model.replace(/seiren v3 mini white/i, "Seiren V3 Mini White")
  const stripped = title.replace(new RegExp(`^${brand}\\s*`), "").split(/[|｜]/)[0].trim()
  return stripped.length > 52 ? stripped.slice(0, 49) + "…" : stripped || title.slice(0, 48)
}

function inferConnection(title) {
  if (/2\.4\s*ghz|2\.4g/i.test(title) && /ワイヤレス|wireless/i.test(title)) return "2.4GHzワイヤレス"
  if (/bluetooth/i.test(title) && /usb.*aux|aux.*usb|usb\/aux/i.test(title)) return "USB / Bluetooth / AUX"
  if (/bluetooth/i.test(title) && /usb/i.test(title)) return "USB / Bluetooth"
  if (/bluetooth/i.test(title)) return "Bluetooth"
  if (/XLR/i.test(title) && /USB/i.test(title)) return "XLR / USB"
  if (/XLR/i.test(title) && !/USB/i.test(title)) return "XLR"
  if (/USB-Type-C|USB Type-C|Type-C/i.test(title)) return "USB Type-C"
  if (/3\.5mm|ミニプラグ/i.test(title)) return "3.5mmミニプラグ"
  if (/USB/i.test(title)) return "USB"
  return DASH
}

function inferPolar(title) {
  if (/4パターン|4つの指向性|指向性切替|マルチパターン/i.test(title)) {
    return "指向性切替対応 (4パターン)"
  }
  if (/全指向性|無指向性|360°|360˚|omnidirectional/i.test(title)) {
    return /360/.test(title) ? "全指向性 (360°)" : "全指向性"
  }
  if (/単一指向|カーディオイド|cardioid|unidirectional/i.test(title)) {
    return "単一指向性 (カーディオイド)"
  }
  return DASH
}

function inferMicType(title) {
  if (/スピーカーフォン|speakerphone|会議用マイクスピーカー|powerconf|400-mc/i.test(title)) {
    return "会議用スピーカーフォン"
  }
  if (/ダイナミック|dynamic/i.test(title)) return "ダイナミック"
  if (/ピンマイク|ラベリア|クリップ|ワイヤレス.*ピン|wireless.*pin/i.test(title)) {
    return "ワイヤレスピンマイク"
  }
  if (/バイノーラル|binaural/i.test(title)) return "バイノーラルマイク"
  if (/コンデンサー|condenser|usbマイク/i.test(title)) return "コンデンサー"
  return "コンデンサー"
}

function typeSpecFromLabel(typeLabel) {
  if (typeLabel === "会議用スピーカーフォン") return "会議用スピーカーフォン"
  if (typeLabel === "ダイナミック") return "ダイナミックマイク"
  if (typeLabel === "ワイヤレスピンマイク") return "ワイヤレスピンマイク"
  if (typeLabel === "バイノーラルマイク") return "バイノーラルマイク"
  return "コンデンサーマイク"
}

function inferMicFilterTags(title, typeLabel) {
  const tags = []
  if (typeLabel === "会議用スピーカーフォン") tags.push("conference")
  else if (/ダイナミック/i.test(title)) tags.push("dynamic")
  else tags.push("condenser")
  if (/ピンマイク|ラベリア|クリップ|pin microphone/i.test(title)) tags.push("pin")
  if (/2\.4\s*ghz|ワイヤレス|wireless/i.test(title)) tags.push("wireless")
  if (
    (/卓上|スタンド|desk|スタンドアロン|stand-alone|stand alone|フレキシブルアーム/i.test(title) ||
      /standalone microphone/i.test(title)) &&
    !tags.includes("pin") &&
    typeLabel !== "会議用スピーカーフォン"
  ) {
    tags.push("stand")
  }
  if (typeLabel === "ダイナミック" && tags.includes("condenser")) {
    return tags.filter((t) => t !== "condenser").concat(["dynamic"])
  }
  return [...new Set(tags)]
}

function inferTerminal(connection) {
  if (connection === DASH) return DASH
  if (connection.includes("/")) return connection.split("/")[0].trim()
  return connection
}

function inferPower(connection, typeLabel) {
  if (typeLabel === "会議用スピーカーフォン") {
    if (/bluetooth/i.test(connection)) return "充電式 (USB給電 / バッテリー)"
    return "有線給電 (USB)"
  }
  if (/bluetooth|2\.4ghz|ワイヤレス/i.test(connection) && !/usb/i.test(connection)) {
    return "充電式"
  }
  if (/usb|xlr|3\.5mm/i.test(connection)) return "有線給電"
  return DASH
}

function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function buildGadget(item) {
  const o = OVERRIDES[item.asin] ?? {}
  const brand = o.brand ?? inferBrand(item.title)
  const name = o.name ?? inferName(item.title, brand)
  const tagline = o.tagline ?? item.title.split(/[|｜]/)[0].slice(0, 120)
  const price = o.price ?? item.price ?? null
  const connection = o.connection ?? inferConnection(item.title)
  const polar = o.polar ?? inferPolar(item.title)
  const typeLabel = o.type ?? inferMicType(item.title)
  const typeSpec = typeSpecFromLabel(typeLabel)
  const micFilterTags = o.micFilterTags ?? inferMicFilterTags(item.title, typeLabel)
  const terminal = o.terminal ?? inferTerminal(connection)
  const sampleRate = o.sampleRate ?? DASH
  const frequency = o.frequency ?? DASH
  const power = o.power ?? inferPower(connection, typeLabel)

  const featureRows = []
  if (/エコー/i.test(item.title)) featureRows.push({ label: "エコーキャンセリング", value: "対応" })
  if (/ノイズキャンセ|noise cancel/i.test(item.title)) {
    featureRows.push({ label: "ノイズキャンセリング", value: "対応" })
  }
  if (/bluetooth/i.test(item.title)) featureRows.push({ label: "Bluetooth", value: "対応" })
  if (/ミュート|mute|タップミュート/i.test(item.title)) featureRows.push({ label: "ミュート", value: "対応" })
  if (/rgb/i.test(item.title)) featureRows.push({ label: "RGBライティング", value: "対応" })
  if (/イヤホン|ヘッドホン/i.test(item.title)) featureRows.push({ label: "イヤホンジャック", value: "対応" })
  if (o.features) {
    for (const [label, value] of Object.entries(o.features)) {
      if (!featureRows.some((r) => r.label === label)) featureRows.push({ label, value })
    }
  }
  if (o.dimensions) featureRows.push({ label: "寸法", value: o.dimensions })
  if (o.weight) featureRows.push({ label: "重量", value: o.weight })

  const featureLines = featureRows
    .map((r) => `          { label: "${esc(r.label)}", value: "${esc(r.value)}" },`)
    .join("\n")

  const id = `mic-bs2-${String(item.amazonRank).padStart(3, "0")}`

  return `  {
    id: "${id}",
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
      { label: "周波数特性", value: "${esc(frequency)}" },
      { label: "接続方式", value: "${esc(terminal)}" },
      { label: "サンプルレート", value: "${esc(sampleRate)}" },
      { label: "タイプ", value: "${esc(typeLabel)}" },
    ],
    compat: [],
    specGroups: [
      {
        title: "オーディオ",
        rows: [
          { label: "タイプ", value: "${esc(typeSpec)}" },
          { label: "指向性", value: "${esc(polar)}" },
          { label: "周波数特性", value: "${esc(frequency)}" },
          { label: "サンプルレート", value: "${esc(sampleRate)}" },
        ],
      },
      {
        title: "接続 / 機能",
        rows: [
          { label: "接続方式", value: "${esc(connection)}" },
          { label: "電源", value: "${esc(power)}" },
${featureLines ? featureLines + "\n" : ""}          { label: "Amazonランキング", value: "PC用マイク 2ページ目 #${item.amazonRank}" },
        ],
      },
    ],
  }`
}

const rawPath = join(__dirname, "mic-bestsellers-page2-raw.json")
if (!existsSync(rawPath)) {
  console.error("Run import-mic-browser-scrape-page2.mjs first")
  process.exit(1)
}

const { microphones } = JSON.parse(readFileSync(rawPath, "utf8"))
const byAsin = new Map()
for (const item of microphones) {
  if (isMicRankingBodyTitle(item.title)) continue
  const prev = byAsin.get(item.asin)
  if (!prev || item.amazonRank < prev.amazonRank) byAsin.set(item.asin, item)
}

const sorted = [...byAsin.values()].sort((a, b) => a.amazonRank - b.amazonRank)
const blocks = sorted.map(buildGadget)

const out = `import type { Gadget } from "./gadgets"

/** Amazon.co.jp PC用マイク売れ筋 2ページ目（2152017051 pg=2 #51–#80）。マイク本体・会議用スピーカーフォン含む。 */
export const micBestsellersPage2: Gadget[] = [
${blocks.join(",\n")}
]
`

writeFileSync(join(ROOT, "lib", "mic-bestsellers-page2.ts"), out)
console.log(`Generated ${blocks.length} mic bestsellers page2 (from ${microphones.length} raw)`)
