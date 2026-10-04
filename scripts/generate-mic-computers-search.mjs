/**
 * mic-computers-search-raw.json → lib/mic-computers-search.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { isMicRankingBodyTitle } from "./mic-accessory-title.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const DASH = "—"

function loadJson(name) {
  const p = join(__dirname, name)
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {}
}

const OVERRIDES = {
  ...loadJson("mic-bestsellers-spec-overrides.json"),
  ...loadJson("mic-bestsellers-page2-spec-overrides.json"),
  ...loadJson("mic-most-gifted-spec-overrides.json"),
  ...loadJson("mic-most-gifted-page2-spec-overrides.json"),
  ...loadJson("mic-computers-search-spec-overrides.json"),
}

function inferBrand(title) {
  const brands = [
    "HyperX", "FIFINE", "Razer", "Logicool G", "Logitech G", "Blue", "ASUS", "TONOR",
    "Sennheiser", "BILIWAL", "G-MODELL", "Aokeo", "ZealSound", "GRAPHT", "FDUCE", "ZOOM",
    "Marantz", "TKGOU", "MillSO", "ZiZuuBar", "オーディオテクニカ", "Audio-technica",
    "SteelSeries", "EMEET", "Anker", "サンワダイレクト", "サンワサプライ", "Sanwa Supply",
    "エレコム", "Elecom", "COMICA", "MAONO", "DJI", "Poly", "Jabra", "AIRHUG", "Kaysuda",
    "iBUFFALO", "PLOY", "SEIKO", "ヤマハ", "e-Better", "SoundTech", "AREA", "バッファロー",
  ]
  for (const b of brands) {
    if (title.includes(b)) {
      return b
        .replace(/Sanwa Supply/i, "サンワサプライ")
        .replace(/^Elecom$/i, "エレコム")
        .replace(/^Logitech G$/i, "Logicool G")
        .replace(/^audio-technica|^Audio-technica/i, "オーディオテクニカ")
    }
  }
  return DASH
}

function inferName(title, brand) {
  const model =
    title.match(
      /\b(SoloCast 2|SoloCast|QuadCast2S|QuadCast2|QuadCast|DuoCast|Blue Yeti|Yeti GX|Yeti ORB|Yeti|AM8T|A6T|A6V|EJoy Uni S|EJoy Uni|PD100X|PD200X|K054|K669B|HS-MC06BK|HS-MC07UBK|HS-MC14UBK|AT9933USB|AT9901|AT-CSP1|DM30(?: RGB)?|Mic Mini 2|Seiren V3 Mini(?: White)?|Seiren V3 Chroma|Seiren X|Speak 710 MS|Sync 20\+|PowerConf S500|PowerConf S330|SP300U|SP300|AIRHUG|YVC-331|MM-MC15W|MM-MCF02BK|MM-MCU10SV|MM-MCUSB13|MM-MC28|MO-MIC04L-W|STM30BK|BSHSM05BK|U30K|TC310\+|Snowball|C501|CARNYX|400-MC003|XS LAV USB-C|CM-1000|MPM-1000U|ZUM-2PMP|M160\+)\b/i,
    )?.[1]
  if (model) {
    return model
      .replace(/soloCast 2/i, "SoloCast 2")
      .replace(/quadcast2s/i, "QuadCast2S")
      .replace(/quadcast2/i, "QuadCast2")
      .replace(/yeti gx/i, "Yeti GX")
      .replace(/yeti orb/i, "Yeti ORB")
      .replace(/seiren v3 mini white/i, "Seiren V3 Mini White")
      .replace(/seiren v3 mini/i, "Seiren V3 Mini")
  }
  const stripped = title.replace(new RegExp(`^${brand}\\s*`), "").split(/[|｜]/)[0].trim()
  return stripped.length > 52 ? stripped.slice(0, 49) + "…" : stripped || title.slice(0, 48)
}

function inferConnection(title) {
  if (/2\.4\s*ghz|2\.4g/i.test(title) && /ワイヤレス|wireless/i.test(title)) return "2.4GHzワイヤレス"
  if (/bluetooth/i.test(title) && /usb-c|type-c/i.test(title)) return "Bluetooth / USB-C"
  if (/bluetooth/i.test(title) && /usb/i.test(title)) return "Bluetooth / USB"
  if (/bluetooth/i.test(title)) return "Bluetooth"
  if (/XLR/i.test(title) && /USB/i.test(title)) return "XLR / USB"
  if (/XLR/i.test(title)) return "XLR"
  if (/USB-Type-C|USB Type-C|Type-C/i.test(title)) return "USB Type-C"
  if (/3\.5mm|ミニプラグ/i.test(title) && /usb/i.test(title)) return "USB / 3.5mm"
  if (/3\.5mm|ミニプラグ/i.test(title)) return "3.5mmミニプラグ"
  if (/USB/i.test(title)) return "USB"
  return DASH
}

function inferPolar(title) {
  if (/4パターン|4つの指向性|指向性切替|指向性の変更|マルチパターン|multi-pattern/i.test(title)) {
    return "指向性切替対応 (マルチパターン)"
  }
  if (/超単一指向|スーパーカーディオイド|supercardioid/i.test(title)) {
    return "超単一指向性 (スーパーカーディオイド)"
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
  if (/スピーカーフォン|speakerphone|会議用|powerconf|speak 710|sync 20|sp300|airhug|yvc-331|at-csp/i.test(title)) {
    return "会議用スピーカーフォン"
  }
  if (/ダイナミック|dynamic/i.test(title)) return "ダイナミック"
  if (/ピンマイク|ラベリア|クリップ|ワイヤレス.*ピン|wireless.*pin|mic mini/i.test(title)) {
    return "ワイヤレスピンマイク"
  }
  if (/バイノーラル|binaural/i.test(title)) return "バイノーラルマイク"
  if (/コンデンサー|condenser|usbマイク|usb microphone/i.test(title)) return "コンデンサー"
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
  if (/ピンマイク|ラベリア|クリップ|pin microphone|xs lav/i.test(title)) tags.push("pin")
  if (/2\.4\s*ghz|ワイヤレス|wireless|mic mini/i.test(title)) tags.push("wireless")
  if (
    (/卓上|スタンド|desk|スタンドアロン|stand-alone|stand alone|フレキシブル|グースネック|gooseneck/i.test(title) ||
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
  const workTitle = o.title ?? item.title
  const brand = o.brand ?? inferBrand(workTitle)
  const name = o.name ?? inferName(workTitle, brand)
  const tagline = o.tagline ?? workTitle.split(/[|｜]/)[0].slice(0, 120)
  const price = o.price ?? item.price ?? null
  const connection = o.connection ?? inferConnection(workTitle)
  const polar = o.polar ?? inferPolar(workTitle)
  const typeLabel = o.type ?? inferMicType(workTitle)
  const typeSpec = typeSpecFromLabel(typeLabel)
  const micFilterTags = o.micFilterTags ?? inferMicFilterTags(workTitle, typeLabel)
  const terminal = o.terminal ?? inferTerminal(connection)
  const sampleRate = o.sampleRate ?? DASH
  const frequency = o.frequency ?? DASH
  const power = o.power ?? inferPower(connection, typeLabel)
  const image = o.image ?? item.image

  const featureRows = []
  if (/エコー/i.test(workTitle)) featureRows.push({ label: "エコーキャンセリング", value: "対応" })
  if (/ノイズキャンセ|noise cancel|ノイズリダクション/i.test(workTitle)) {
    featureRows.push({ label: "ノイズキャンセリング", value: "対応" })
  }
  if (/ハウリング/i.test(workTitle)) featureRows.push({ label: "ハウリング抑制", value: "対応" })
  if (/bluetooth/i.test(workTitle)) featureRows.push({ label: "Bluetooth", value: "対応" })
  if (/ミュート|mute|タップミュート|touch mute/i.test(workTitle)) {
    featureRows.push({ label: "ミュート", value: "対応" })
  }
  if (/rgb/i.test(workTitle)) featureRows.push({ label: "RGBライティング", value: "対応" })
  if (/イヤホン|ヘッドホン/i.test(workTitle)) featureRows.push({ label: "イヤホンジャック", value: "対応" })
  if (/microsoft|teams|zoom/i.test(workTitle)) {
    featureRows.push({ label: "Web会議アプリ", value: "Zoom / Teams 等" })
  }
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

  const id = `mic-srch-${String(item.amazonRank).padStart(4, "0")}`

  return `  {
    id: "${id}",
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
${featureLines ? featureLines + "\n" : ""}          { label: "Amazon検索", value: "PC用マイク #${item.amazonRank}" },
        ],
      },
    ],
  }`
}

const rawPath = join(__dirname, "mic-computers-search-raw.json")
if (!existsSync(rawPath)) {
  console.error("Run fetch-mic-computers-search.mjs or parse-mic-search-cdp.mjs first")
  process.exit(1)
}

const { microphones } = JSON.parse(readFileSync(rawPath, "utf8"))
const byAsin = new Map()
for (const item of microphones) {
  const title = OVERRIDES[item.asin]?.title ?? item.title
  if (isMicRankingBodyTitle(title)) continue
  const prev = byAsin.get(item.asin)
  if (!prev || item.amazonRank < prev.amazonRank) byAsin.set(item.asin, item)
}

const sorted = [...byAsin.values()].sort((a, b) => a.amazonRank - b.amazonRank)
const blocks = sorted.map(buildGadget)

const out = `import type { Gadget } from "./gadgets"

/** Amazon.co.jp PC用マイク検索（computers / 2127209051）。マイク本体・会議用スピーカーフォン含む。 */
export const micComputersSearch: Gadget[] = [
${blocks.join(",\n")}
]
`

writeFileSync(join(ROOT, "lib", "mic-computers-search.ts"), out)
console.log(`Generated ${blocks.length} mic computers search (from ${microphones.length} raw)`)
