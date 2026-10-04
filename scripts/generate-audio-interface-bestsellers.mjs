/**
 * Amazon.co.jp オーディオIF売れ筋 → lib/audio-interface-bestsellers.ts
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { AUDIO_INTERFACE_BESTSELLER_CATALOG } from "./audio-interface-bestsellers-catalog.mjs"
import { AUDIO_INTERFACE_SEARCH_PAGE1_CATALOG } from "./audio-interface-search-page1-catalog.mjs"
import { AUDIO_INTERFACE_SEARCH_PAGE2_CATALOG } from "./audio-interface-search-page2-catalog.mjs"
import { AUDIO_INTERFACE_SEARCH_PAGE3_CATALOG } from "./audio-interface-search-page3-catalog.mjs"
import { AUDIO_INTERFACE_SEARCH_PAGE4_CATALOG } from "./audio-interface-search-page4-catalog.mjs"
import { AUDIO_INTERFACE_SEARCH_PAGE5_CATALOG } from "./audio-interface-search-page5-catalog.mjs"
import { AUDIO_INTERFACE_SEARCH_PAGE6_CATALOG } from "./audio-interface-search-page6-catalog.mjs"
import {
  AUDIO_INTERFACE_SEARCH_PAGE7_CATALOG,
  AUDIO_INTERFACE_MANUAL_CATALOG,
} from "./audio-interface-search-page7-catalog.mjs"
import { AUDIO_INTERFACE_STREAMING_SEARCH_CATALOG } from "./audio-interface-streaming-search-catalog.mjs"
import { isAudioInterfaceAccessoryTitle } from "./audio-interface-accessory-title.mjs"
import { AI_SPECS_KNOWN, DASH } from "./audio-interface-specs-known.mjs"
import { normalizeAudioInterfaceInputs } from "./audio-interface-inputs-lib.mjs"
import {
  resolvePcConnectionFromSource,
  shortPcConnection,
} from "./audio-interface-pc-connection-lib.mjs"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, "..", "lib", "audio-interface-bestsellers.ts")

const DUPLICATE_ASINS = new Set([
  "B08D93XF5F", // 並行輸入M2（正規 B0815V2N4X と重複）
  "B00U891AUM", // iRig 2（正規 B00UV71Y4I と重複）
  "B0DBPKL3G5", // TOPPING E1X2 OTG 白（B0DBPFVTBM と同色違い）
  "B0GGYXY67H", // Wave XLR MK.2 並行（正規 B0GQS4D34B）
  "B09738CKKX", // Wave XLR 旧版（MK.2 B0GQS4D34B と機能重複）
  "B0CDWSCXL3", // Wave XLR 旧版 USB-C（MK.2 B0GQS4D34B）
  "B0FWJYRZX5", // AG03MK2 B 重複（B09VFF9L5P）
  "B0GYQ667CL", // Azmio ギター変換アダプター（本体IFではない）
  "B0F5Q2KQBL", // AT-UMX3 重複（B0CS6S8GBH）
  "B0F5PYZ6N9",
  "B0F5Q16XSW",
  "B0F5PXFP59",
  "B0F5PZZ94T",
  "B0F5PXSXF1",
  "B084QTLLR2", // iRig Pro Duo 重複（B084PP4DT8）
  "B00NHLB0IU", // TAC-2R 重複（B00R2IPLSY）
])

/** マイク同梱セット等（ランキングタイトルにセット表記がない場合） */
const EXCLUDED_SET_ASINS = new Set([
  "B0CJ4N5X5H", // MAONO 25mm Large Capsule Microphone 同梱セット
  "B0FMJLP783", // MAONO All-in-One Podcast Set + XLR Microphone
  "B0H45KFYB3", // P17 ポッドキャストマイクセット
  "B0GF21X1RY", // ポッドキャスト機材セット + P15 マイク
  "B0FFGJ61T9", // AG06MK2 + AT2020 iPhone 配信セット
  "B09WL54TTJ", // AG03MK2 + AT2020 Android セット
  "B0FWK4KDVV", // AG03MK2 配信スターターセット + ダイナミックマイク
])

const BRANDS = [
  "Focusrite",
  "Audio Technica",
  "オーディオテクニカ",
  "M-Audio",
  "Yamaha",
  "YAMAHA",
  "ヤマハ",
  "MOTU",
  "ZOOM",
  "Zoom",
  "RME",
  "Arturia",
  "Solid State Logic",
  "SSL",
  "Roland",
  "BEHRINGER",
  "Behringer",
  "Steinberg",
  "Shure",
  "IK Multimedia",
  "MAONO",
  "PreSonus",
  "Audient",
  "TASCAM",
  "Elgato",
  "Universal Audio",
  "Fender",
  "TOPPING",
  "Antelope",
  "Blackstar",
  "iConnectivity",
  "Sonnect",
  "LEWITT",
  "Lewitt",
  "NearStream",
  "FIFINE",
  "Fifine",
  "Synido",
  "Sonicake",
  "HyperX",
  "Saramonic",
  "Positive Grid",
  "Fluid Audio",
  "Vestax",
  "ESI",
  "ART",
  "RODE",
  "BOMGE",
  "Reloop",
  "TC-HELICON",
  "TC Helicon",
  "KORG",
  "Teenage Engineering",
  "TONOR",
  "Cubilux",
  "DILVO",
  "BitTradeOne",
  "Ueteto",
  "Maker hart",
]

function inferBrand(title) {
  for (const b of BRANDS) {
    if (title.includes(b)) {
      if (/^YAMAHA|^Yamaha|^ヤマハ/.test(b)) return "YAMAHA"
      if (/Audio Technica|オーディオテクニカ/.test(b)) return "オーディオテクニカ"
      if (/BEHRINGER|Behringer/.test(b)) return "Behringer"
      if (/ZOOM|Zoom/.test(b)) return "ZOOM"
      if (/Solid State Logic|SSL/.test(b)) return "SSL"
      if (/RODE Microphones|RODE/.test(b)) return "RODE"
      if (/LEWITT|Lewitt/.test(b)) return "LEWITT"
      return b
    }
  }
  return DASH
}

function inferName(title, brand) {
  const patterns = [
    /Scarlett Solo 4th Generation|Scarlett Solo \(3rd Gen\)|Scarlett Solo 第4世代|Scarlett Solo 第3世代|Scarlett 18i20 \(4th Gen\)/i,
    /UR22C|UR22MK3W/i,
    /AG06MK2/i,
    /BRIDGE CAST ONE|BRIDGE CAST X|BRIDGE CAST/i,
    /iD14mkII|iD14 mkII/i,
    /iRig USB/i,
    /AT-UMX3/i,
    /M-Track Solo/i,
    /AG03MK2\s*W?/i,
    /\bM2\b/i,
    /\bZG02\b/i,
    /AMS-22/i,
    /Babyface Pro FS/i,
    /MiniFuse 1|MiniFuse 2/i,
    /Maonocaster E2|AU-E2/i,
    /Wave XLR MK\.2|Wave XLR/i,
    /AMS-24|AMS-44/i,
    /SC8|FIFINE SC/i,
    /MicroAUDIO 22|MicroAUDIO 722/i,
    /AMIX40U|AMIX20U/i,
    /UR22MK3|UR12MK3/i,
    /UR-RT2|UR-RT4|UR242/i,
    /US-2X2HR|102i|208i/i,
    /MiNiSTUDIO|US-42W|US-32W/i,
    /\biXZ\b/i,
    /MVX2U|MVI\b/i,
    /CONNECT 6/i,
    /IXO12|IXO22/i,
    /GO TWIN/i,
    /Amber i4/i,
    /SRI-2/i,
    /MV-Mixer/i,
    /Apollo Twin MKII/i,
    /M4\b/i,
    /BOOM/i,
    /RIFF/i,
    /Sonic Cube II/i,
    /U-44/i,
    /Komplete Audio 1/i,
    /828\b/i,
    /AudioBox USB 96/i,
    /AG03\b/i,
    /HyperX Audio Mixer/i,
    /Volt 876/i,
    /UR44/i,
    /UM2 U-PHORIA|\bUM2\b/i,
    /Mini 2 Channel|Mini 2ch/i,
    /SSL2\+MKII|SSL2\+ MKII/i,
    /BRIDGE CAST X|BRIDGE CAST/i,
    /URX22C|URX44V/i,
    /UR22MK3W|UR12MK3/i,
    /UR22mkII/i,
    /\bUM2\b/i,
    /UCA222|UCA202/i,
    /Rubix24/i,
    /UMC1820/i,
    /MVX2U/i,
    /iRig 2|iRig Pro I\/O|iRig HD X/i,
    /P4 Next/i,
    /Revelator io24/i,
    /UAC-232/i,
    /CONNECT 2/i,
    /US-366|US-4X4HR/i,
    /Road Caster Pro II/i,
    /VOLT 176/i,
    /AudioBox Go|Quantum LT2/i,
    /E2x2 OTG|E1X2 OTG|Rubix22|Rubix44|UMC404HD|UMC202HD|UMC204HD|XENYX 502S|XENYX 802S|XENYX 302|UltraLite mk5|Zenith 2|GO:MIXER STUDIO|Scarlett 2i2|Quantum LT4|Quantum LT 16|PlayAUDIO1U|POLAR GO|iD24|iD44mkII|AXE I\/O ONE|XLR Dock MK\.2|U202P|EVO4|EVO 16|FLUX DVS|GO XLR MINI|MicroAUDIO 722|MiniFuse 2 OTG|iRig Pro Duo|Volt 476P|TX-6|TAC-2R|TAC2R|U24XL|MAYA44USB|Phono Plus|Vocaster Two|Apollo Solo/i,
    /iD4mkII/i,
    /GIGAPORT eX/i,
    /MixMate/i,
  ]
  for (const re of patterns) {
    const m = title.match(re)
    if (m) return m[0].replace(/Scarlett Solo 4th Generation/i, "Scarlett Solo 第4世代").replace(/Scarlett Solo \(3rd Gen\)/i, "Scarlett Solo 第3世代")
  }
  const stripped = title.replace(new RegExp(`^${brand}\\s*`, "i"), "").split(/[|｜]/)[0].trim()
  return stripped.length > 48 ? stripped.slice(0, 45) + "…" : stripped || DASH
}

function inferConnectionType(title) {
  if (/thunderbolt/i.test(title)) return "Thunderbolt"
  if (/usb 3\.1|usb3\.1|usb 3\.0|usb3\.0/i.test(title)) return "USB Type-C (USB 3.1)"
  if (/usb type-c|usb-c|type-c/i.test(title)) return "USB Type-C"
  if (/usb 2\.0|usb2\.0/i.test(title)) return "USB Type-C (USB 2.0)"
  if (/trrs|4極|3\.5mm.*iphone|lightning|ios/i.test(title)) return "3.5mm TRRS / iOS"
  if (/usb/i.test(title)) return "USB"
  return DASH
}

function inferInputs(title) {
  const xlrs = (title.match(/XLR/gi) || []).length
  const combos = /combo|コンボ|XLR\/TRS|XLR\/TS/i.test(title)
  if (/4XLR|4 Mic|4Mic|4IN/i.test(title)) return "XLR×4"
  if (/18 Inputs|18in/i.test(title)) return "XLR/LINE 最大18入力"
  if (/2 Channel|2in|2-in|2x2|2 IN/i.test(title) && combos) return "XLR/TRSコンボ×2"
  if (xlrs >= 2 && combos) return "XLR/TRSコンボ×2"
  if (xlrs >= 2) return "XLR×2"
  if (xlrs === 1 || /single input|1in/i.test(title)) return combos ? "XLR/TRSコンボ×1" : "XLR×1"
  if (/RCA/i.test(title)) return "RCA IN×2"
  if (/6\.35|6\.3mm|ギター|guitar|ベース|bass/i.test(title)) return "6.35mm×1"
  if (/guitar interface|iRig/i.test(title)) return "6.35mm ギターIN×1"
  return DASH
}

function inferPhantom(title) {
  if (/\+48\s*v|48v|phantom|ファンタム/i.test(title) && !/非対応|なし|no phantom/i.test(title)) {
    return "対応 (+48V)"
  }
  if (/UCA202|UCA222|iRig 2|iRig HD|sound card/i.test(title)) return "非対応"
  return DASH
}

function inferDirectMonitoring(title) {
  if (/direct monitor|ダイレクトモニタ|monitor mix|dspmix/i.test(title)) return "対応"
  if (/UCA202|UCA222/i.test(title)) return "—"
  if (/interface|インターフェ|mixer|ミキサー/i.test(title)) return "対応"
  return DASH
}

function inferLoopback(title) {
  if (/loopback|ループバック|loop back/i.test(title)) return "対応"
  if (/streaming mixer|配信|BRIDGE CAST|ZG02|AG03|Revelator io24|Zoom P4/i.test(title)) return "対応"
  return DASH
}

function inferSystemRequirements(title) {
  const parts = []
  if (/windows|win/i.test(title)) parts.push("Win")
  if (/mac|macos/i.test(title)) parts.push("Mac")
  if (/ios|iphone|ipad/i.test(title)) parts.push("iOS")
  if (/android/i.test(title)) parts.push("Android")
  if (parts.length) return parts.join(" / ")
  if (/interface|インターフェ|mixer|ミキサー/i.test(title)) return "Win / Mac"
  return DASH
}

function inferPrimaryUses(title) {
  const uses = []
  if (/streaming|配信|gaming|game|podcast|voip|bridge cast|zg02|live/i.test(title)) uses.push("ライブ配信・VoIP")
  if (/vocal|ボーカル|vocalist|microphone|マイク|歌/i.test(title)) uses.push("歌唱・ボーカル録音")
  if (/guitar|ギター|instrument|楽器|band|hi-z/i.test(title)) uses.push("楽器録音・バンド")
  if (/dtm|daw|music production|制作|recording|rec/i.test(title)) uses.push("DTM・楽曲制作")
  if (!uses.length) return []
  return uses
}

function inferSamplingRate(title) {
  if (/192\s*khz|192khz/i.test(title)) return "192kHz"
  if (/96\s*khz|96khz/i.test(title)) return "96kHz"
  if (/48\s*khz|48khz/i.test(title)) return "48kHz"
  if (/44\.1/i.test(title)) return "44.1kHz"
  return DASH
}

function inferBitDepth(title) {
  if (/32[\s-]?bit\s*float|32bit float|32-bit float/i.test(title)) return "32-bit float"
  if (/24[\s-]?bit|24bit|24-bit/i.test(title)) return "24-bit"
  if (/16[\s-]?bit|16bit|16-bit/i.test(title)) return "16-bit"
  return DASH
}

function formatSamplingRateCard(bitDepth, samplingRate) {
  const hasBit = bitDepth && bitDepth !== DASH
  const hasRate = samplingRate && samplingRate !== DASH
  if (!hasBit && !hasRate) return DASH
  const rate = hasRate ? (/khz/i.test(samplingRate) ? samplingRate : `${samplingRate}kHz`) : null
  if (hasBit && rate) return `${bitDepth} / ${rate}`
  if (hasBit) return bitDepth
  return rate
}

function shortConnection(pcConnection) {
  return shortPcConnection(pcConnection)
}

function shortCard(value, label) {
  if (!value || value === DASH) return DASH
  if (label === "サンプリングレート") {
    return value
  }
  if (label === "ファンタム電源") {
    if (/非対応/.test(value)) return "非対応"
    if (/対応/.test(value)) return "+48V対応"
    return value
  }
  if (label === "システム要件") {
    return value
      .replace(/Windows 10\/11|Windows|Win/gi, "Win")
      .replace(/macOS[^,]*/gi, "Mac")
      .replace(/iOS[^,]*/gi, "iOS")
      .replace(/Android[^,]*/gi, "Android")
      .replace(/,\s*/g, " / ")
  }
  if (label === "入力端子と数") {
    return value.length > 28 ? value.slice(0, 25) + "…" : value
  }
  return value
}

function esc(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function buildGadget(item, idx) {
  const known = AI_SPECS_KNOWN[item.asin] ?? {}
  const title = item.title
  const brand = known.brand ?? inferBrand(title)
  const name = known.name ?? inferName(title, brand)
  const price = item.price ?? null
  const deviceConnectionType = known.connectionType ?? inferConnectionType(title)
  const pcConnection = resolvePcConnectionFromSource({
    asin: item.asin,
    connectionType: deviceConnectionType,
  })
  const inputs = normalizeAudioInterfaceInputs(known.inputs ?? inferInputs(title))
  const phantomPower = known.phantomPower ?? inferPhantom(title)
  const systemRequirements = known.systemRequirements ?? inferSystemRequirements(title)
  const directMonitoring = known.directMonitoring ?? inferDirectMonitoring(title)
  const loopback = known.loopback ?? inferLoopback(title)
  const primaryUses = known.primaryUses ?? inferPrimaryUses(title)
  const samplingRate = known.samplingRate ?? inferSamplingRate(title)
  const bitDepth = known.bitDepth ?? inferBitDepth(title)
  const samplingRateCard = formatSamplingRateCard(bitDepth, samplingRate)
  const image = normalizeAmazonImageUrl(item.image)
  const tagline = title.length > 120 ? title.slice(0, 117) + "…" : title

  const highlights = [
    { label: "入力端子と数", value: shortCard(inputs, "入力端子と数") },
    { label: "サンプリングレート", value: shortCard(samplingRateCard, "サンプリングレート") },
    { label: "ファンタム電源", value: shortCard(phantomPower, "ファンタム電源") },
    { label: "システム要件", value: shortCard(systemRequirements, "システム要件") },
  ]

  const specRows = [
    ["入力端子", inputs],
    ["PC接続", pcConnection],
    ["ファンタム電源", phantomPower],
    ["ダイレクトモニタリング", directMonitoring],
    ["ループバック", loopback],
    ["システム要件", systemRequirements],
    ["サンプリングレート", samplingRate],
    ["ビット深度", bitDepth],
  ].filter(([, v]) => v && v !== DASH)

  const primaryUsesTs = `[${primaryUses.map((u) => `"${esc(u)}"`).join(", ")}]`

  return `  {
    id: "${item.id}",
    category: "audio-interface",
    name: "${esc(name)}",
    brand: "${esc(brand)}",
    tagline: "${esc(tagline)}",
    price: ${price ?? null},
    rating: ${item.rating ?? 4.0},
    reviews: ${item.reviews ?? 0},
    image: "${esc(image)}",
    connection: "${esc(shortConnection(pcConnection))}",
    connectionType: "${esc(pcConnection)}",
    inputs: "${esc(inputs)}",
    phantomPower: "${esc(phantomPower)}",
    systemRequirements: "${esc(systemRequirements)}",
    directMonitoring: "${esc(directMonitoring)}",
    loopback: "${esc(loopback)}",
    primaryUses: ${primaryUsesTs},
    samplingRate: "${esc(samplingRate)}",
    bitDepth: "${esc(bitDepth)}",
    purchaseUrl: "https://www.amazon.co.jp/dp/${item.asin}",
    highlights: [
      { label: "入力端子と数", value: "${esc(highlights[0].value)}" },
      { label: "サンプリングレート", value: "${esc(highlights[1].value)}" },
      { label: "ファンタム電源", value: "${esc(highlights[2].value)}" },
      { label: "システム要件", value: "${esc(highlights[3].value)}" },
    ],
    compat: [],
    specGroups: [
      {
        title: "スペック",
        rows: [
${specRows.map(([l, v]) => `          { label: "${esc(l)}", value: "${esc(v)}" },`).join("\n")}
        ],
      },
    ],
  }`
}

function mergeCatalogs() {
  const priceByAsin = new Map()
  for (const item of [...AUDIO_INTERFACE_SEARCH_PAGE1_CATALOG, ...AUDIO_INTERFACE_SEARCH_PAGE2_CATALOG, ...AUDIO_INTERFACE_SEARCH_PAGE3_CATALOG, ...AUDIO_INTERFACE_SEARCH_PAGE4_CATALOG, ...AUDIO_INTERFACE_SEARCH_PAGE5_CATALOG, ...AUDIO_INTERFACE_SEARCH_PAGE6_CATALOG, ...AUDIO_INTERFACE_SEARCH_PAGE7_CATALOG, ...AUDIO_INTERFACE_MANUAL_CATALOG, ...AUDIO_INTERFACE_STREAMING_SEARCH_CATALOG]) {
    if (item.price) priceByAsin.set(item.asin, item.price)
  }

  const seen = new Set()
  const merged = []

  for (const item of AUDIO_INTERFACE_BESTSELLER_CATALOG) {
    if (seen.has(item.asin)) continue
    seen.add(item.asin)
    merged.push({
      ...item,
      id: `ai-rank-${String(item.rank).padStart(3, "0")}`,
      price: priceByAsin.get(item.asin) ?? item.price,
    })
  }

  const searchCatalogs = [
    AUDIO_INTERFACE_SEARCH_PAGE1_CATALOG,
    AUDIO_INTERFACE_SEARCH_PAGE2_CATALOG,
    AUDIO_INTERFACE_SEARCH_PAGE3_CATALOG,
    AUDIO_INTERFACE_SEARCH_PAGE4_CATALOG,
    AUDIO_INTERFACE_SEARCH_PAGE5_CATALOG,
    AUDIO_INTERFACE_SEARCH_PAGE6_CATALOG,
    AUDIO_INTERFACE_SEARCH_PAGE7_CATALOG,
    AUDIO_INTERFACE_MANUAL_CATALOG,
    AUDIO_INTERFACE_STREAMING_SEARCH_CATALOG,
  ]
  let searchIdx = 0
  for (const catalog of searchCatalogs) {
    for (const item of catalog) {
      if (seen.has(item.asin)) continue
      if (isAudioInterfaceAccessoryTitle(item.title) || DUPLICATE_ASINS.has(item.asin) || EXCLUDED_SET_ASINS.has(item.asin)) continue
      seen.add(item.asin)
      searchIdx += 1
      merged.push({
        ...item,
        rank: item.searchRank,
        id: `ai-search-${String(searchIdx).padStart(3, "0")}`,
      })
    }
  }

  return merged
}

function main() {
  const all = mergeCatalogs()
  const bodies = all
    .filter((item) => !isAudioInterfaceAccessoryTitle(item.title) && !DUPLICATE_ASINS.has(item.asin) && !EXCLUDED_SET_ASINS.has(item.asin))
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))

  const excluded = [
    ...AUDIO_INTERFACE_BESTSELLER_CATALOG.filter(
      (item) => isAudioInterfaceAccessoryTitle(item.title) || DUPLICATE_ASINS.has(item.asin) || EXCLUDED_SET_ASINS.has(item.asin),
    ),
    ...AUDIO_INTERFACE_SEARCH_PAGE1_CATALOG.filter(
      (item) =>
        (isAudioInterfaceAccessoryTitle(item.title) || DUPLICATE_ASINS.has(item.asin) || EXCLUDED_SET_ASINS.has(item.asin)) &&
        !AUDIO_INTERFACE_BESTSELLER_CATALOG.some((b) => b.asin === item.asin),
    ),
    ...AUDIO_INTERFACE_SEARCH_PAGE2_CATALOG.filter(
      (item) =>
        (isAudioInterfaceAccessoryTitle(item.title) || DUPLICATE_ASINS.has(item.asin) || EXCLUDED_SET_ASINS.has(item.asin)) &&
        !AUDIO_INTERFACE_BESTSELLER_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE1_CATALOG.some((b) => b.asin === item.asin),
    ),
    ...AUDIO_INTERFACE_SEARCH_PAGE3_CATALOG.filter(
      (item) =>
        (isAudioInterfaceAccessoryTitle(item.title) || DUPLICATE_ASINS.has(item.asin) || EXCLUDED_SET_ASINS.has(item.asin)) &&
        !AUDIO_INTERFACE_BESTSELLER_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE1_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE2_CATALOG.some((b) => b.asin === item.asin),
    ),
    ...AUDIO_INTERFACE_SEARCH_PAGE4_CATALOG.filter(
      (item) =>
        (isAudioInterfaceAccessoryTitle(item.title) || DUPLICATE_ASINS.has(item.asin) || EXCLUDED_SET_ASINS.has(item.asin)) &&
        !AUDIO_INTERFACE_BESTSELLER_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE1_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE2_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE3_CATALOG.some((b) => b.asin === item.asin),
    ),
    ...AUDIO_INTERFACE_SEARCH_PAGE5_CATALOG.filter(
      (item) =>
        (isAudioInterfaceAccessoryTitle(item.title) || DUPLICATE_ASINS.has(item.asin) || EXCLUDED_SET_ASINS.has(item.asin)) &&
        !AUDIO_INTERFACE_BESTSELLER_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE1_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE2_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE3_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE4_CATALOG.some((b) => b.asin === item.asin),
    ),
    ...AUDIO_INTERFACE_SEARCH_PAGE6_CATALOG.filter(
      (item) =>
        (isAudioInterfaceAccessoryTitle(item.title) || DUPLICATE_ASINS.has(item.asin) || EXCLUDED_SET_ASINS.has(item.asin)) &&
        !AUDIO_INTERFACE_BESTSELLER_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE1_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE2_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE3_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE4_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE5_CATALOG.some((b) => b.asin === item.asin),
    ),
    ...AUDIO_INTERFACE_SEARCH_PAGE7_CATALOG.filter(
      (item) =>
        (isAudioInterfaceAccessoryTitle(item.title) || DUPLICATE_ASINS.has(item.asin) || EXCLUDED_SET_ASINS.has(item.asin)) &&
        !AUDIO_INTERFACE_BESTSELLER_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE1_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE2_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE3_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE4_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE5_CATALOG.some((b) => b.asin === item.asin) &&
        !AUDIO_INTERFACE_SEARCH_PAGE6_CATALOG.some((b) => b.asin === item.asin),
    ),
  ]

  console.log(
    `Bestsellers: ${AUDIO_INTERFACE_BESTSELLER_CATALOG.length}, Search p1: ${AUDIO_INTERFACE_SEARCH_PAGE1_CATALOG.length}, Search p2: ${AUDIO_INTERFACE_SEARCH_PAGE2_CATALOG.length}, Search p3: ${AUDIO_INTERFACE_SEARCH_PAGE3_CATALOG.length}, Search p4: ${AUDIO_INTERFACE_SEARCH_PAGE4_CATALOG.length}, Search p5: ${AUDIO_INTERFACE_SEARCH_PAGE5_CATALOG.length}, Search p6: ${AUDIO_INTERFACE_SEARCH_PAGE6_CATALOG.length}, Search p7: ${AUDIO_INTERFACE_SEARCH_PAGE7_CATALOG.length}, Manual: ${AUDIO_INTERFACE_MANUAL_CATALOG.length}, Streaming: ${AUDIO_INTERFACE_STREAMING_SEARCH_CATALOG.length}, merged bodies: ${bodies.length}, excluded: ${excluded.length}`,
  )
  for (const x of excluded) {
    const tag = x.rank ? `#${x.rank}` : `#s${x.searchRank}`
    console.log(`  [EX] ${tag} ${x.asin}`)
  }
  const searchOnly = bodies.filter((b) => b.id.startsWith("ai-search-"))
  console.log(`  Search-only added: ${searchOnly.length} (${searchOnly.map((b) => b.asin).join(", ")})`)

  const blocks = bodies.map((item) => buildGadget(item))
  const src = `import type { Gadget } from "./gadgets"

/** Amazon.co.jp オーディオIF（売れ筋ランキング + 検索1〜7 + 配信検索 + 手動追加分）本体のみ ${bodies.length}件 */
export const audioInterfaceBestsellers: Gadget[] = [
${blocks.join(",\n")}
]
`

  writeFileSync(OUT, src, "utf8")
  console.log(`Wrote ${OUT} (${bodies.length} gadgets)`)
}

main()
