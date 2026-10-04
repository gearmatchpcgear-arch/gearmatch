/**
 * mic-dynamic-bestsellers-raw.json → lib/mic-dynamic-bestsellers.ts (+ page2)
 * Ranks 1–50 → page1, 51+ → page2
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isDynamicMicBodyTitle } from "./mic-dynamic-exclusions.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const DASH = "—"

function loadJson(name) {
  const p = join(__dirname, name)
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {}
}

const OVERRIDES = {
  ...loadJson("mic-dynamic-bestsellers-spec-overrides.json"),
}

const EXCLUDE_ASINS = new Set([
  "B0D8KD47FY", // WH20XLR duplicate headset
  "B0F13CMSZF", // COMICA D10 duplicate
  "B0G5PQWSDR", // UTAET duplicate
  "B0FHPWTPW8", // AT2040 USB bundle (mis-titled PodMic rank slot)
])

function inferBrand(title) {
  const brands = [
    "FIFINE", "HyperX", "SHURE", "シュア", "Sennheiser", "ゼンハイザー", "オーディオテクニカ", "Audio-Technica",
    "YAMAHA", "ヤマハ", "BEHRINGER", "ベリンガー", "MAONO", "TONOR", "RODE", "Logicool", "Logitech G", "Razer",
    "KC", "Moukey", "JYX", "TALOMEN", "Talomen", "LEKATO", "FDUCE", "UNI-PEX", "AKG", "NEEWER", "TOA", "CAROL",
    "COMICA", "Classic Pro", "CLASSIC PRO", "Sanwa Supply", "サンワサプライ", "Amazon Basics", "JBL", "Superlux",
    "Samson", "MACKIE", "TASCAM", "LEWITT", "サンワダイレクト", "Kithouse", "Elnicec", "XIAOKOA",
  ]
  for (const b of brands) {
    if (title.includes(b)) {
      return b
        .replace(/^Audio-Technica/i, "オーディオテクニカ")
        .replace(/^Shure|^シュア/i, "SHURE")
        .replace(/^Sennheiser|^ゼンハイザー/i, "Sennheiser")
        .replace(/^YAMAHA|^ヤマハ/i, "YAMAHA")
        .replace(/^BEHRINGER|^ベリンガー/i, "BEHRINGER")
        .replace(/^Sanwa Supply/i, "サンワサプライ")
        .replace(/^Logitech G/i, "Logicool G")
        .replace(/^Classic Pro|^CLASSIC PRO/i, "CLASSIC PRO")
    }
  }
  return DASH
}

function inferName(title, brand) {
  const model =
    title.match(
      /\b(K688CT|AT2040(?:USB)?|SM7dB|SM58(?:SE)?|BETA\s*58A|MV6|MV7\+?|PD100XS|PD200XS|e835|e945|e935|e845-S|XS\s*1|XM8500|XM1800S|CM-2000|CM5S|CM5\b|DM-105|DM-1200|PodMic|PGA48|D5S|D5-Y3|MD-5A|NW-040|K669D|PRO41|AT-X11|SL40X|TD510|K380S|Seiren V2 Pro|YETI GX|L52|400-MC005|400-SP045|MTP\s*5|AC-910S|AC-930|NEXADYNE|TM-70|EM-89D|PROH7F|Q6|SM63LB)\b/i,
    )?.[1]
  if (model) return model.replace(/\s+/g, " ").trim()
  if (/USB\/XLR.*ダイナミック|USB\/XLRマイク/i.test(title)) return "USB/XLR ダイナミックマイク"
  const stripped = title.replace(new RegExp(`^${brand}\\s*`, "i"), "").split(/[|｜]/)[0].trim()
  return stripped.length > 48 ? stripped.slice(0, 45) + "…" : stripped || title.slice(0, 40)
}

function inferConnection(title) {
  if (/YETI GX|Seiren V2 Pro|G-YETI-GX/i.test(title)) return "USB Type-C"
  if (/2\.4\s*GHz|2\.4G|UHF/i.test(title) && /ワイヤレス|wireless|receiver|レシーバー/i.test(title)) {
    if (/USB/i.test(title) && /XLR/i.test(title)) return "2.4GHzワイヤレス / USB / XLR"
    return "2.4GHzワイヤレス"
  }
  if (/USB.*XLR|XLR.*USB/i.test(title)) return "USB / XLR"
  if (/XLR/i.test(title) && /6\.3|標準プラグ|Phone/i.test(title)) return "XLR / 6.3mm"
  if (/XLR/i.test(title)) return "XLR"
  if (/6\.3|標準プラグ|Phone/i.test(title)) return "6.3mm標準プラグ"
  if (/USB-Type-C|USB Type-C|Type-C/i.test(title)) return "USB Type-C"
  if (/USB/i.test(title)) return "USB"
  return DASH
}

function inferPolar(title) {
  if (/ハイパーカーディオイド|hypercardioid|超単一指向/i.test(title)) {
    return "超単一指向性 (ハイパーカーディオイド)"
  }
  if (/スーパーカーディオイド|supercardioid/i.test(title)) return "スーパーカーディオイド"
  if (/全指向性|無指向性|360°|オムニ|omni/i.test(title)) return "全指向性"
  if (/双指向|bidirectional/i.test(title)) return "双指向性"
  if (/カーディオイド|cardioid|単一指向/i.test(title)) return "単一指向性 (カーディオイド)"
  return DASH
}

function inferMicType(title) {
  if (/USB.*XLR|XLR.*USB/i.test(title)) return "USB/XLRダイナミックマイク"
  if (/USB|YETI GX|Seiren V2/i.test(title) && /ダイナミック|dynamic/i.test(title)) {
    return "USBダイナミックマイク"
  }
  if (/2\.4\s*GHz|UHF|ワイヤレス|wireless|receiver/i.test(title)) return "ワイヤレスダイナミックマイク"
  return "ダイナミックマイク"
}

function inferMicFilterTags(title, connection) {
  const tags = ["dynamic"]
  if (/ピンマイク|ラベリア|クリップ/i.test(title)) tags.push("pin")
  if (/2\.4\s*GHz|UHF|ワイヤレス|wireless|receiver/i.test(title)) tags.push("wireless")
  if (/PartyBox|会議用|スピーカーフォン/i.test(title)) tags.push("conference")
  if (/卓上|スタンド|desk|三脚|アーム|arm/i.test(title) && !/スタンド単|アーム単/i.test(title)) tags.push("stand")
  return [...new Set(tags)]
}

function inferPower(connection) {
  if (/2\.4GHz|ワイヤレス|wireless|UHF/i.test(connection) && !/usb|xlr/i.test(connection.toLowerCase())) {
    return "充電式"
  }
  if (/usb|xlr|6\.3mm/i.test(connection.toLowerCase())) return "有線給電"
  return DASH
}

function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function buildGadget(item, idPrefix, rankLabelPrefix) {
  const o = OVERRIDES[item.asin] ?? {}
  const workTitle = o.title ?? item.title
  const brand = o.brand ?? inferBrand(workTitle)
  const name = o.name ?? inferName(workTitle, brand)
  const tagline = o.tagline ?? workTitle.split(/[|｜]/)[0].slice(0, 120)
  const price = o.price ?? item.price ?? null
  const connection = o.connection ?? inferConnection(workTitle)
  const polar = o.polar ?? inferPolar(workTitle)
  const typeLabel = o.type ?? inferMicType(workTitle)
  const micFilterTags = o.micFilterTags ?? inferMicFilterTags(workTitle, connection)
  const terminal = connection.includes("/") ? connection.split("/")[0].trim() : connection
  const sampleRate = o.sampleRate ?? DASH
  const frequency = o.frequency ?? DASH
  const power = o.power ?? inferPower(connection)
  const image = normalizeAmazonImageUrl(o.image ?? item.image)

  const featureRows = []
  if (/ON\/OFF|on.?off|スイッチ/i.test(workTitle)) {
    featureRows.push({ label: "ON/OFFスイッチ", value: "搭載" })
  }
  if (/ノイズキャンセ|noise cancel/i.test(workTitle)) {
    featureRows.push({ label: "ノイズキャンセリング", value: "対応" })
  }
  if (/ミュート|mute/i.test(workTitle)) featureRows.push({ label: "ミュート", value: "対応" })
  if (/ゲイン|音量調整|volume/i.test(workTitle)) {
    featureRows.push({ label: "音量調整", value: "対応" })
  }
  if (/モニタ|monitor/i.test(workTitle)) {
    featureRows.push({ label: "ダイレクトモニタリング", value: "対応" })
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

  const id = `${idPrefix}-${String(item.amazonRank).padStart(3, "0")}`

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
${featureLines ? featureLines + "\n" : ""}          { label: "Amazonランキング", value: "${rankLabelPrefix} #${item.amazonRank}" },
        ],
      },
    ],
  }`
}

function prepareItems(microphones, minRank, maxRank) {
  const byAsin = new Map()
  for (const item of microphones) {
    if (item.amazonRank < minRank || item.amazonRank > maxRank) continue
    if (EXCLUDE_ASINS.has(item.asin)) continue
    const title = OVERRIDES[item.asin]?.title ?? item.title
    if (!isDynamicMicBodyTitle(title)) continue
    const prev = byAsin.get(item.asin)
    if (!prev || item.amazonRank < prev.amazonRank) byAsin.set(item.asin, item)
  }
  return [...byAsin.values()].sort((a, b) => a.amazonRank - b.amazonRank)
}

const rawPath = join(__dirname, "mic-dynamic-bestsellers-raw.json")
if (!existsSync(rawPath)) {
  console.error("Run fetch-mic-dynamic.mjs first")
  process.exit(1)
}

const { microphones } = JSON.parse(readFileSync(rawPath, "utf8"))

const page1Items = prepareItems(microphones, 1, 50)
const page2Items = prepareItems(microphones, 51, 999)

const page1Blocks = page1Items.map((item) => buildGadget(item, "mic-dyn", "ダイナミックマイク"))
const page2Blocks = page2Items.map((item) =>
  buildGadget(item, "mic-dyn2", "ダイナミックマイク 2ページ目"),
)

writeFileSync(
  join(ROOT, "lib", "mic-dynamic-bestsellers.ts"),
  `import type { Gadget } from "./gadgets"

/** Amazon.co.jp ダイナミックマイク売れ筋（2130075051）。マイク本体のみ。 */
export const micDynamicBestsellers: Gadget[] = [
${page1Blocks.join(",\n")}
]
`,
)

writeFileSync(
  join(ROOT, "lib", "mic-dynamic-bestsellers-page2.ts"),
  `import type { Gadget } from "./gadgets"

/** Amazon.co.jp ダイナミックマイク売れ筋 2ページ目（2130075051）。マイク本体のみ。 */
export const micDynamicBestsellersPage2: Gadget[] = [
${page2Blocks.join(",\n")}
]
`,
)

console.log(`Generated page1: ${page1Items.length}, page2: ${page2Items.length}`)
