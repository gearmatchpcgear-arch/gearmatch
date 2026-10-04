/**
 * mic-dynamic-new-releases-raw.json → lib/mic-dynamic-new-releases.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isMicRankingBodyTitle } from "./mic-accessory-title.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const DASH = "—"

function loadJson(name) {
  const p = join(__dirname, name)
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {}
}

const OVERRIDES = {
  ...loadJson("mic-dynamic-bestsellers-spec-overrides.json"),
  ...loadJson("mic-dynamic-new-releases-spec-overrides.json"),
}

function isExcluded(title) {
  if (isMicRankingBodyTitle(title)) return true
  if (/ウタエット|UTAET/i.test(title)) return true
  if (/ヘッドセット|ヘッドウォーン|headset|headworn/i.test(title) && !/ピンマイク/i.test(title)) return true
  return false
}

function inferBrand(title) {
  const brands = [
    "COMICA", "CAROL", "ZVGT", "SHURE", "Sennheiser", "オーディオテクニカ", "Audio-technica",
    "FIFINE", "MAONO", "HyperX", "BEHRINGER", "YAMAHA", "FDUCE", "TONOR",
  ]
  for (const b of brands) {
    if (title.includes(b)) {
      return b.replace(/^Audio-technica/i, "オーディオテクニカ")
    }
  }
  return DASH
}

function inferName(title, brand) {
  const model =
    title.match(/\b(D10 Pro|AC-930|PD200XS|PD100XS|K688|SM58|e835|V7|AT2040)\b/i)?.[1]
  if (model) return model
  if (/USB\/XLR|USB\/XLRマイク/i.test(title)) return "USB/XLR ダイナミックマイク"
  if (/カラオケ|Karaoke/i.test(title)) return "カラオケマイク"
  const stripped = title.replace(new RegExp(`^${brand}\\s*`, "i"), "").split(/[|｜]/)[0].trim()
  return stripped.length > 48 ? stripped.slice(0, 45) + "…" : stripped || title.slice(0, 40)
}

function inferConnection(title) {
  if (/2\.4\s*GHz|2\.4G/i.test(title) && /USB/i.test(title) && /XLR/i.test(title)) {
    return "2.4GHzワイヤレス / USB / XLR"
  }
  if (/2\.4\s*GHz|2\.4G/i.test(title) && /ワイヤレス|wireless|receiver/i.test(title)) {
    return "2.4GHzワイヤレス"
  }
  if (/USB.*XLR|XLR.*USB/i.test(title)) return "USB / XLR"
  if (/XLR/i.test(title)) return "XLR"
  if (/USB/i.test(title)) return "USB"
  return DASH
}

function inferPolar(title) {
  if (/スーパーカーディオイド|supercardioid|超指向性/i.test(title)) return "スーパーカーディオイド"
  if (/ハイパーカーディオイド|hypercardioid|超単一指向/i.test(title)) {
    return "超単一指向性 (ハイパーカーディオイド)"
  }
  if (/全指向性|無指向性|360°/i.test(title)) return "全指向性"
  if (/双指向|bidirectional/i.test(title)) return "双指向性"
  if (/カーディオイド|cardioid|単一指向/i.test(title)) return "単一指向性 (カーディオイド)"
  return DASH
}

function inferMicType(title) {
  if (/ワイヤレス|wireless|2\.4\s*GHz|receiver/i.test(title) && /カラオケ|Karaoke/i.test(title)) {
    return "ワイヤレスダイナミックマイク（カラオケ/ライブストリーム用）"
  }
  if (/ワイヤレス|wireless|2\.4\s*GHz/i.test(title)) return "ワイヤレスダイナミックマイク"
  if (/USB.*XLR|XLR.*USB/i.test(title)) return "USB/XLRダイナミックマイク"
  return "ダイナミックマイク"
}

function inferMicFilterTags(title, typeLabel, overrideTags) {
  if (overrideTags) return overrideTags
  const tags = ["dynamic"]
  if (/ワイヤレス|wireless|2\.4\s*GHz|receiver/i.test(title)) tags.push("wireless")
  if (/卓上|スタンド|desk|三脚|stand/i.test(title) && !/マイクスタンド単/i.test(title)) tags.push("stand")
  if (/ピンマイク|ラベリア|クリップ/i.test(title)) tags.push("pin")
  return [...new Set(tags)]
}

function inferPower(connection) {
  if (/2\.4GHz|ワイヤレス|wireless/i.test(connection) && !/usb|xlr/i.test(connection.toLowerCase())) {
    return "充電式"
  }
  if (/usb|xlr/i.test(connection.toLowerCase())) return "有線給電"
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
  const micFilterTags = o.micFilterTags ?? inferMicFilterTags(workTitle, typeLabel)
  const terminal = connection.includes("/") ? connection.split("/")[0].trim() : connection
  const sampleRate = o.sampleRate ?? DASH
  const frequency = o.frequency ?? DASH
  const power = o.power ?? inferPower(connection)
  const image = normalizeAmazonImageUrl(o.image ?? item.image)

  const featureRows = []
  if (/AIノイズ|ai noise/i.test(workTitle)) {
    featureRows.push({ label: "AIノイズキャンセリング", value: "対応" })
  }
  if (/ダイレクトモニタ|direct monitor/i.test(workTitle)) {
    featureRows.push({ label: "ダイレクトモニタリング", value: "対応" })
  }
  if (/ミュート|mute/i.test(workTitle)) featureRows.push({ label: "ミュート", value: "対応" })
  if (/音量調整|gain|ゲイン/i.test(workTitle)) {
    featureRows.push({ label: "音量調整", value: "対応" })
  }
  if (/スタンド|tripod|三脚/i.test(workTitle) && !/マイクスタンド単/i.test(workTitle)) {
    featureRows.push({ label: "スタンド付属", value: "対応" })
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

  const id = `mic-dyn-nr-${String(item.amazonRank).padStart(2, "0")}`

  return `  {
    id: "${id}",
    category: "mic",
    name: "${esc(name)}",
    brand: "${esc(brand)}",
    tagline: "${esc(tagline)}",
    price: ${price ?? "null"},
    rating: ${item.rating ?? 4.0},
    reviews: ${item.reviews ?? 0},
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
          { label: "タイプ", value: "${esc(typeLabel)}" },
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
${featureLines ? featureLines + "\n" : ""}          { label: "Amazon新着", value: "ダイナミックマイク #${item.amazonRank}" },
        ],
      },
    ],
  }`
}

const rawPath = join(__dirname, "mic-dynamic-new-releases-raw.json")
if (!existsSync(rawPath)) {
  console.error("Run fetch-mic-dynamic-new-releases.mjs first")
  process.exit(1)
}

const { microphones } = JSON.parse(readFileSync(rawPath, "utf8"))
const sorted = microphones
  .filter((item) => !isExcluded(OVERRIDES[item.asin]?.title ?? item.title))
  .sort((a, b) => a.amazonRank - b.amazonRank)

const blocks = sorted.map(buildGadget)

const out = `import type { Gadget } from "./gadgets"

/** Amazon.co.jp ダイナミックマイク新着（2130075051）。マイク本体のみ。 */
export const micDynamicNewReleases: Gadget[] = [
${blocks.join(",\n")}
]
`

writeFileSync(join(ROOT, "lib", "mic-dynamic-new-releases.ts"), out)
console.log(`Generated ${blocks.length} dynamic mic new release entries`)
