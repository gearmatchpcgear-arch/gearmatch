/**
 * mic-bestsellers-raw.json → lib/mic-bestsellers.ts
 * Preserves curated gadget blocks from existing file; adds/updates ranking items.
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { isMicAccessoryTitle } from "./mic-accessory-title.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const DASH = "—"

const overridesPath = join(__dirname, "mic-bestsellers-spec-overrides.json")
const OVERRIDES = existsSync(overridesPath)
  ? JSON.parse(readFileSync(overridesPath, "utf8"))
  : {}

/** Load existing gadget source blocks keyed by ASIN */
function loadCuratedBlocks() {
  const path = join(ROOT, "lib", "mic-bestsellers.ts")
  if (!existsSync(path)) return new Map()
  const src = readFileSync(path, "utf8")
  const map = new Map()
  const re =
    /(\{[\s\S]*?category: "mic"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?\n  \})/g
  for (const m of src.matchAll(re)) {
    map.set(m[2], m[1])
  }
  return map
}

function inferBrand(title) {
  const brands = [
    "HyperX",
    "FIFINE",
    "Logicool G",
    "Razer",
    "オーディオテクニカ",
    "Audio-Technica",
    "MAONO",
    "DJI",
    "Hollyland",
    "TKGOU",
    "MillSO",
    "サンワサプライ",
    "Sanwa Supply",
    "エレコム",
    "Elecom",
    "COMICA",
    "Cubilux",
    "Anker",
    "EMEET",
    "SEIKO",
    "セイコー",
    "ELUTENG",
    "Amazonベーシック",
    "ZealSound",
    "UGREEN",
  ]
  for (const b of brands) {
    if (title.includes(b)) return b.replace("Sanwa Supply", "サンワサプライ").replace("Elecom", "エレコム")
  }
  if (/^ソニー|^Sony|^SONY/i.test(title)) return "ソニー"
  return DASH
}

function inferName(title, brand) {
  const model =
    title.match(
      /\b(SoloCast 2?|QuadCast2?S?|K669B?|K054|K690|A6V|AM8|PD100X|DM30|AT2020USB-X|AT-CSP1|HS-MC0[67]UBK|HS-MC06BK|Seiren Mini|U30K|MM-MCU0[16]BKN|STM30WH|EJoy Uni|Mic Mini 2?|Lark M2)\b/i,
    )?.[1]
  if (model) {
    return model
      .replace(/quadcast2s/i, "QuadCast 2S")
      .replace(/quadcast2/i, "QuadCast2")
      .replace(/solocast 2/i, "SoloCast 2")
      .replace(/mic mini 2/i, "Mic Mini 2")
      .replace(/at2020usb-x/i, "AT2020USB-X")
      .replace(/mm-mcu06bkn/i, "MM-MCU06BKN")
  }
  const stripped = title
    .replace(new RegExp(`^${brand}\\s*`), "")
    .split(/[|｜]/)[0]
    .trim()
  return stripped.length > 52 ? stripped.slice(0, 49) + "…" : stripped || title.slice(0, 48)
}

function inferConnection(title) {
  if (/2\.4\s*ghz|2\.4g/i.test(title) && /ワイヤレス|wireless|lark/i.test(title)) return "2.4GHzワイヤレス"
  if (/XLR/i.test(title) && /USB/i.test(title)) return "USB / XLR"
  if (/XLR/i.test(title) && !/USB/i.test(title)) return "XLR"
  if (/USB-Type-C|USB Type-C|Type-C/i.test(title)) return "USB Type-C"
  if (/3\.5mm|ミニプラグ/i.test(title)) return "3.5mmミニプラグ"
  if (/USB/i.test(title)) return "USB"
  return DASH
}

function inferPolar(title) {
  if (/4パターン|4つの指向性|指向性の変更|4指向性|マルチパターン/i.test(title)) {
    return "指向性切替対応 (4パターン)"
  }
  if (/全指向性|無指向性|360°|360˚/i.test(title)) return "全指向性"
  if (/単一指向|カーディオイド/i.test(title)) return "単一指向性 (カーディオイド)"
  if (/双指向/i.test(title)) return "双指向性"
  return DASH
}

function inferMicType(title) {
  if (/ダイナミック/i.test(title)) return "ダイナミック"
  if (/ピンマイク|ラベリア|クリップ式|lark m2|mic mini/i.test(title)) return "ワイヤレスピンマイク"
  if (/コンデンサー|condenser/i.test(title)) return "コンデンサー"
  if (/ピックアップ/i.test(title)) return "ピックアップマイク"
  return "コンデンサー"
}

function inferMicFilterTags(title, connection, typeLabel) {
  const tags = []
  if (/ダイナミック/i.test(title)) tags.push("dynamic")
  else tags.push("condenser")
  if (/ピンマイク|ラベリア|クリップ|lark m2|mic mini/i.test(title)) tags.push("pin")
  if (/2\.4\s*ghz|ワイヤレス|wireless|lark/i.test(title)) tags.push("wireless")
  if (/スピーカーフォン|会議用マイク/i.test(title)) tags.push("conference")
  if (
    (/卓上|スタンド|desk|三脚|スタンドマイク|USBスタンド|フレキシブルアーム/i.test(title) ||
      /stand/i.test(title)) &&
    !tags.includes("pin")
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

function buildNewGadget(item, rankIdx) {
  const o = OVERRIDES[item.asin] ?? {}
  const brand = o.brand ?? inferBrand(item.title)
  const name = o.name ?? inferName(item.title, brand)
  const tagline = o.tagline ?? item.title.split(/[|｜]/)[0].slice(0, 120)
  const price = o.price ?? item.price ?? null
  const connection = o.connection ?? inferConnection(item.title)
  const polar = o.polar ?? inferPolar(item.title)
  const typeLabel = o.type ?? inferMicType(item.title)
  const typeSpec =
    typeLabel === "ダイナミック"
      ? "ダイナミックマイク"
      : typeLabel === "ワイヤレスピンマイク"
        ? "ワイヤレスピンマイク"
        : typeLabel === "ピックアップマイク"
          ? "ピックアップマイク"
          : "コンデンサーマイク"
  const micFilterTags = o.micFilterTags ?? inferMicFilterTags(item.title, connection, typeLabel)
  const terminal = o.terminal ?? inferTerminal(connection)
  const sampleRate = o.sampleRate ?? DASH
  const frequency = o.frequency ?? DASH
  const power = o.power ?? (connection.includes("USB") || connection.includes("XLR") ? "有線給電" : DASH)

  const featureRows = []
  if (/ミュート|mute/i.test(item.title)) featureRows.push({ label: "ミュート", value: "対応" })
  if (/rgb/i.test(item.title)) featureRows.push({ label: "RGBライティング", value: "対応" })
  if (/ノイズキャンセ|anc/i.test(item.title)) featureRows.push({ label: "ノイズキャンセリング", value: "対応" })
  if (/イヤホン|ヘッドホン|モニター/i.test(item.title)) featureRows.push({ label: "イヤホンジャック", value: "対応" })
  if (/音量調|ゲイン/i.test(item.title)) featureRows.push({ label: "音量調整", value: "対応" })
  if (o.features) {
    for (const [label, value] of Object.entries(o.features)) {
      featureRows.push({ label, value })
    }
  }
  if (o.dimensions) featureRows.push({ label: "寸法", value: o.dimensions })
  if (o.weight) featureRows.push({ label: "重量", value: o.weight })

  return {
    id: `mic-bs-${String(rankIdx).padStart(3, "0")}`,
    asin: item.asin,
    block: null,
    gadget: {
      name,
      brand,
      tagline,
      price,
      rating: item.rating,
      reviews: item.reviews,
      image: item.image,
      connection,
      polar,
      typeLabel,
      typeSpec,
      micFilterTags,
      terminal,
      sampleRate,
      frequency,
      power,
      featureRows,
      amazonRank: item.amazonRank,
    },
  }
}

function patchCuratedBlock(block, item, rankIdx, o) {
  let next = block
  next = next.replace(/id: "mic-bs-\d+"/, `id: "mic-bs-${String(rankIdx).padStart(3, "0")}"`)
  if (o?.price != null) {
    next = next.replace(/price: [^,\n]+/, `price: ${o.price}`)
  } else if (item.price != null) {
    next = next.replace(/price: [^,\n]+/, `price: ${item.price}`)
  }
  next = next.replace(/rating: [\d.]+/, `rating: ${item.rating}`)
  next = next.replace(/reviews: \d+/, `reviews: ${item.reviews}`)
  if (item.image) {
    next = next.replace(/image: "https:\/\/[^"]+"/, `image: "${item.image}"`)
  }
  if (o?.name) next = next.replace(/name: "[^"]*"/, `name: "${esc(o.name)}"`)
  if (o?.brand) next = next.replace(/brand: "[^"]*"/, `brand: "${esc(o.brand)}"`)
  if (o?.connection) next = next.replace(/connection: "[^"]*"/, `connection: "${esc(o.connection)}"`)
  return next
}

function gadgetToBlock(entry) {
  const g = entry.gadget
  const featureRows = g.featureRows
    .map((r) => `          { label: "${esc(r.label)}", value: "${esc(r.value)}" },`)
    .join("\n")

  return `  {
    id: "${entry.id}",
    category: "mic",
    name: "${esc(g.name)}",
    brand: "${esc(g.brand)}",
    tagline: "${esc(g.tagline)}",
    price: ${g.price ?? "null"},
    rating: ${g.rating},
    reviews: ${g.reviews},
    image: "${g.image}",
    connection: "${esc(g.connection)}",
    purchaseUrl: "https://www.amazon.co.jp/dp/${entry.asin}",
    micFilterTags: ${JSON.stringify(g.micFilterTags)},
    highlights: [
      { label: "指向性", value: "${esc(g.polar)}" },
      { label: "周波数特性", value: "${esc(g.frequency)}" },
      { label: "接続方式", value: "${esc(g.terminal)}" },
      { label: "サンプルレート", value: "${esc(g.sampleRate)}" },
      { label: "タイプ", value: "${esc(g.typeLabel)}" },
    ],
    compat: [],
    specGroups: [
      {
        title: "オーディオ",
        rows: [
          { label: "タイプ", value: "${esc(g.typeSpec)}" },
          { label: "指向性", value: "${esc(g.polar)}" },
          { label: "周波数特性", value: "${esc(g.frequency)}" },
          { label: "サンプルレート", value: "${esc(g.sampleRate)}" },
        ],
      },
      {
        title: "接続 / 機能",
        rows: [
          { label: "接続方式", value: "${esc(g.connection)}" },
          { label: "電源", value: "${esc(g.power)}" },
${featureRows ? featureRows + "\n" : ""}          { label: "Amazonランキング", value: "PC用マイク #${g.amazonRank}" },
        ],
      },
    ],
  }`
}

function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

const rawPath = join(__dirname, "mic-bestsellers-raw.json")
if (!existsSync(rawPath)) {
  console.error("Run fetch-mic-bestsellers.mjs first")
  process.exit(1)
}

const { microphones } = JSON.parse(readFileSync(rawPath, "utf8"))
const curated = loadCuratedBlocks()

const byAsin = new Map()
for (const item of microphones) {
  if (isMicAccessoryTitle(item.title)) continue
  const prev = byAsin.get(item.asin)
  if (!prev || item.amazonRank < prev.amazonRank) byAsin.set(item.asin, item)
}

const sorted = [...byAsin.values()].sort((a, b) => a.amazonRank - b.amazonRank)
const blocks = []
let rankIdx = 0

for (const item of sorted) {
  rankIdx++
  const o = OVERRIDES[item.asin]
  const curatedBlock = curated.get(item.asin)
  if (curatedBlock && !o?.forceRegenerate) {
    blocks.push(patchCuratedBlock(curatedBlock, item, rankIdx, o))
    continue
  }
  const entry = buildNewGadget(item, rankIdx)
  blocks.push(gadgetToBlock(entry))
}

const out = `import type { Gadget } from "./gadgets"

/** Amazon.co.jp PC用マイク売れ筋（2152017051）。マイク本体のみ（アーム・フィルター単体等は除外）。 */
export const micBestsellers: Gadget[] = [
${blocks.join(",\n")}
]
`

writeFileSync(join(ROOT, "lib", "mic-bestsellers.ts"), out)
console.log(`Generated ${blocks.length} mic bestsellers (from ${microphones.length} raw, ${sorted.length} unique ASINs)`)
