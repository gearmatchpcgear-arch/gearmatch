/**
 * Amazon モニター商品タイトル・スペックからアプリ用フィールドを推論
 */
import { inferMonitorVesaStandardFromText } from "./monitor-vesa-standard.mjs"

export const DASH = "—"

const BRAND_PATTERNS = [
  ["Acer", /^acer\b/i],
  ["XUNDEFINED", /^xundefined/i],
  ["FeuVision", /^feuvision/i],
  ["iiyama", /^iiyama/i],
  ["Pixio", /^pixio/i],
  ["LG", /^lg\b/i],
  ["Samsung", /^samsung/i],
  ["AOC", /^aoc\b/i],
  ["Gawfolk", /^gawfolk/i],
  ["ViewSonic", /^viewsonic/i],
  ["ASRock", /^asrock/i],
  ["Greenhouse", /^greenhouse/i],
  ["SANSUI", /^sansui/i],
  ["GTek", /^gtek/i],
  ["ArcticPro", /^arcticpro/i],
  ["Vimonic", /^vimonic/i],
  ["MAGICRAVEN", /^magicraven/i],
  ["Minifire", /^minifire/i],
  ["JAPANNEXT", /^japannext/i],
  ["SKitphrati", /^skitphrati/i],
  ["MESWAO", /^meswao/i],
  ["ZZA", /^zza\b/i],
  ["KEY TO COMBAT", /^key to combat/i],
  ["TITAN ARMY", /^titan army/i],
  ["KOORUI", /^koorui/i],
  ["EVICIV", /^eviciv/i],
  ["KEEPTIME", /^keeptime/i],
  ["KTC", /^ktc\b/i],
  ["Dell", /^dell\b/i],
  ["ASUS", /^asus|【amazon\.co\.jp exclusive】asus/i],
  ["MSI", /^msi\b/i],
  ["IO DATA", /^io\s*data|i-o\s*data/i],
  ["IODATA", /^iodata/i],
  ["Xiaomi", /^xiaomi/i],
  ["Amzfast", /^amzfast/i],
  ["PHILIPS", /^philips/i],
  ["IRIS OHYAMA", /^iris\s*ohyama/i],
  ["MAXZEN", /^maxzen/i],
  ["UPERFECT", /^uperfect/i],
  ["Lenovo", /^lenovo/i],
  ["REGZA", /^regza/i],
  ["TERRA", /^terra\b/i],
  ["InnoView", /^innoview|mobile monitor 15\.6 inches innoview/i],
  ["BenQ", /^benq/i],
  ["INNOCN", /^innocn/i],
  ["HAILESI", /^hailesi/i],
]

export function extractBrand(title) {
  const t = String(title).trim()
  for (const [brand, re] of BRAND_PATTERNS) {
    if (re.test(t)) return brand
  }
  const m = t.match(/^【[^】]+】\s*([A-Za-z][A-Za-z0-9+\- ]{1,20}?)\b/)
  if (m) return m[1].trim()
  const head = t.match(/^([A-Z][A-Za-z0-9+\- ]{1,18}?)\s+(?:Monitor|モニター|Mobile|Gaming|LCD|ディスプレイ)/i)
  if (head) return head[1].trim()
  return DASH
}

export function shortProductName(title, brand) {
  const t = String(title)
    .replace(/^【Amazon\.co\.jp Exclusive】/i, "")
    .replace(/^【Amazon\.co\.jp 限定】/i, "")
    .trim()

  const modelPatterns = [
    /\b(EVC-\d+[A-Z]*)\b/i,
    /\b(H\d{2}[A-Z0-9]+)\b/,
    /\b(S\d{4}[A-Z]+)\b/,
    /\b(SE\d{4}[A-Z]*)\b/,
    /\b(VY\d+[A-Z]+)\b/i,
    /\b(SE\d{4}[A-Z0-9]+)\b/i,
    /\b(S\d{4}[A-Z0-9]+)\b/i,
    /\b(AW\d{4}[A-Z0-9-]+)\b/i,
    /\b(P\d{4}[A-Z0-9-]+)\b/i,
    /\b(E\d{4}[A-Z0-9-]+)\b/i,
    /\b(U\d{4}[A-Z0-9-]+)\b/i,
    /\b(C\d{4}[A-Z0-9-]+)\b/i,
    /\b(\d{2,3}[A-Z0-9]{1,8}\/\d+)\b/i,
    /\b(\d{3}V7[A-Z0-9/]*)\b/i,
    /\b(243V7)\b/i,
    /\b(PRO\s+MP\d+)\b/i,
    /\b(MAG\s+\d+[A-Z]+)\b/i,
    /\b(VG\d+[A-Z0-9]+)\b/i,
    /\b(A24i)\b/i,
    /\b(RM-G\d+[A-Z]+)\b/i,
    /\b(LCD-[A-Z0-9]+)\b/i,
    /\b(DT-[A-Z0-9-]+)\b/i,
    /\b(24E1N\d+[A-Z]*)\b/i,
    /\b(MGM\d+[A-Z0-9]+)\b/i,
    /\b(L24-\d+[a-z]?)\b/i,
    /\b(Legion\s*24-15)\b/i,
    /\b(Legion\s*R24e)\b/i,
    /\b(R25[fip]-30)\b/i,
    /\b(G25-20)\b/i,
    /\b(G24e-20)\b/i,
    /\b(Y25[fgs]-30)\b/i,
    /\b(T24-40)\b/i,
    /\b(P24QD-40)\b/i,
    /\b(S24e-20)\b/i,
    /\b(T23d-10)\b/i,
    /\b(Tiny-in-One\s*24\s*Gen\s*4)\b/i,
    /\b(2441W)\b/,
    /\b(EX\d+)\b/i,
    /\b(25G2G)\b/i,
    /\b(S123E)\b/i,
    /\b(EX-GDU\d+[A-Z]+)\b/i,
    /\b(AF\d+[A-Z0-9]+)\b/i,
  ]
  for (const re of modelPatterns) {
    const m = t.match(re)
    if (m) return m[1].replace(/\s+/g, " ")
  }

  if (/mobile monitor|モバイルモニター|ポータブルモニター/i.test(t)) {
    const inch = inferScreenInches(t)
    if (inch) return `${inch}型 モバイルモニター`
    return "モバイルモニター"
  }

  const cleaned = t
    .replace(new RegExp(`^${brand}\\s*`, "i"), "")
    .replace(/monitor|モニター|gaming monitor|lcd display|ディスプレイ/gi, "")
    .replace(/\s+/g, " ")
    .trim()
  return cleaned.slice(0, 48) || t.slice(0, 48)
}

export function inferScreenInches(text) {
  const hay = String(text)
  const m =
    hay.match(/([\d.]+)\s*-?\s*(?:インチ|"|型|inch|in\.)/i) ??
    hay.match(/(\d{2}(?:\.\d)?)\s*(?:Inch|Inches)/i)
  return m ? Number(m[1]) : null
}

export function inferResolution(text) {
  const hay = String(text)
  if (/5120\s*[x×*]\s*2160|5k2k|5k\s*2k/i.test(hay)) return "5120 x 2160 (5K2K)"
  if (/5120\s*[x×*]\s*1440|5k\s*dqhd|\bdqhd\b/i.test(hay)) return "5120 x 1440 (5K DQHD)"
  if (/3840\s*[x×*]\s*2160|4k\s*uhd|\b4k\b/i.test(hay)) return "3840 x 2160 (4K UHD)"
  if (/3440\s*[x×*]\s*1440|uwqhd|ultra-?wide\s*qhd/i.test(hay)) return "3440 x 1440 (UWQHD)"
  if (/2560\s*[x×*]\s*1440|wqhd|1440p/i.test(hay)) return "2560 x 1440 (QHD)"
  if (/1920\s*[x×*]\s*1080|\bfhd\b|1080p|full\s*hd/i.test(hay)) return "1920 x 1080 (FHD)"
  return DASH
}

export function inferRefreshRate(text) {
  const hay = String(text)
  const rates = [...hay.matchAll(/(\d{2,3})\s*hz(?![a-z0-9])(?:\s*\(?(?:oc|gtg|mprt)\)?)?/gi)].map(
    (m) => Number(m[1]),
  )
  if (rates.length === 0) {
    if (/mobile monitor|モバイル|ポータブル/i.test(hay)) return "60 Hz"
    return DASH
  }
  const unique = [...new Set(rates)].sort((a, b) => b - a)
  if (unique.length >= 2 && unique[0] >= unique[1] * 1.8) {
    return `${unique[1]} Hz`
  }
  const max = unique[0]
  const oc = /120hz\s*\(oc\)|210oc/i.test(hay) && max === 120
  return oc ? `${max} Hz (OC)` : `${max} Hz`
}

export function inferPanel(text) {
  const hay = String(text)
  if (/miniled/i.test(hay)) return "MiniLED"
  if (/fast\s*ips|rapid\s*ips/i.test(hay)) return "Fast IPS"
  if (/\bva\b|va panel/i.test(hay)) return /hdr/i.test(hay) ? "VA / HDR" : "VA"
  if (/\bips\b|ips panel|ips lcd/i.test(hay)) {
    if (/非光沢|non-?glossy|matte|ノングレア|matt/i.test(hay)) return "IPS 非光沢"
    return "IPS"
  }
  if (/ads panel/i.test(hay)) return "ADS 非光沢"
  if (/oled/i.test(hay)) return "OLED"
  return DASH
}

export function inferConnection(text) {
  const hay = String(text).toLowerCase()
  const ports = []
  if (/usb[\s-]?type[\s-]?c|usb-c|type-c|thunderbolt/i.test(hay)) ports.push("USB Type-C")
  if (/displayport|\bdp\b|display port/i.test(hay)) ports.push("DisplayPort")
  if (/hdmi/i.test(hay)) ports.push("HDMI")
  if (/mini hdmi/i.test(hay)) ports.push("Mini HDMI")
  if (/vga|d-sub|analog rgb/i.test(hay)) ports.push("VGA")
  if (/dvi/i.test(hay)) ports.push("DVI-D")
  if (ports.length === 0) return DASH
  return [...new Set(ports)].join(" / ")
}

export function inferWeight(text) {
  const m = String(text).match(/(\d{2,4})\s*g\b/i)
  return m ? `${Number(m[1]).toLocaleString("en-US")} g` : DASH
}

export function inferMonitorFilterTags(gadget) {
  const tags = []
  const hay = `${gadget.name} ${gadget.tagline} ${gadget.connection} ${gadget.highlights.map((h) => h.value).join(" ")} ${gadget.specGroups.flatMap((g) => g.rows.map((r) => r.value)).join(" ")}`.toLowerCase()

  const inches = inferScreenInches(
    gadget.highlights.find((h) => h.label === "画面サイズ")?.value ??
      gadget.specGroups.flatMap((g) => g.rows).find((r) => r.label === "画面サイズ")?.value ??
      hay,
  )
  if (inches != null) {
    if (inches <= 23.8) tags.push("size-238")
    else if (inches >= 24 && inches < 26.5) tags.push("size-24")
    else if (inches >= 26.5 && inches < 30) tags.push("size-27")
    if (inches >= 31.5) tags.push("size-315-plus")
  }

  if (/5120\s*[x×]\s*2160|5k2k/i.test(hay)) tags.push("res-5k2k")
  else if (/5120\s*[x×]\s*1440|5k\s*dqhd|\bdqhd\b/i.test(hay)) tags.push("res-dqhd")
  else if (/3840\s*[x×]\s*2160|\b4k\b/i.test(hay)) tags.push("res-4k")
  else if (/3440\s*[x×]\s*1440|uwqhd/i.test(hay)) tags.push("res-uwqhd")
  else if (/2560\s*[x×]\s*1440|wqhd|1440p/i.test(hay)) tags.push("res-wqhd")
  else if (/1920\s*[x×]\s*1080|\bfhd\b|1080p/i.test(hay)) tags.push("res-fhd")

  const hzMatch = [...hay.matchAll(/(\d{2,3})\s*hz(?![a-z0-9])/gi)].map((m) => Number(m[1]))
  const hz = hzMatch.length ? Math.max(...hzMatch) : /mobile|モバイル|ポータブル/.test(hay) ? 60 : 0
  if (hz > 0) {
    if (hz <= 60) tags.push("refresh-60")
    else if (hz === 75) tags.push("refresh-75")
    else if (hz < 144) tags.push("refresh-100")
    if (hz >= 144) tags.push("refresh-144-plus")
    if (hz >= 240) tags.push("refresh-240-plus")
  }

  if (/hdmi|mini hdmi/i.test(hay)) tags.push("port-hdmi")
  if (/displayport|\bdp\b/i.test(hay)) tags.push("port-dp")
  if (/usb[\s-]?type[\s-]?c|usb-c|type-c|thunderbolt/i.test(hay)) tags.push("port-usb-c")
  if (/usb[\s-]?c|type[\s-]?c|thunderbolt/i.test(hay) && /給電|pd|65w|90w|100w|power delivery/i.test(hay)) {
    tags.push("port-usb-c-pd")
  }

  return [...new Set(tags)]
}

export function buildMonitorGadget(item, index, override = {}) {
  const title = item.title ?? ""
  const brand = override.brand ?? extractBrand(title)
  const name = override.name ?? shortProductName(title, brand)
  const hay = title

  const screenInches = override.screenSize
    ? inferScreenInches(override.screenSize)
    : inferScreenInches(hay)
  const screenSize =
    override.screenSize ??
    (screenInches ? `${screenInches} インチ` : DASH)
  const resolution = override.resolution ?? inferResolution(hay)
  const refreshRate = override.refreshRate ?? inferRefreshRate(hay)
  const panel = override.panel ?? inferPanel(hay)
  const connection = override.connection ?? inferConnection(hay)
  const weight = override.weight ?? inferWeight(hay)

  const sizeDisplay = screenInches ? `${screenInches}"` : DASH

  let gadget = {
    id: `mon-bs-${String(index + 1).padStart(3, "0")}`,
    category: "monitor",
    name,
    brand,
    tagline: override.tagline ?? title.slice(0, 80),
    price: override.price ?? item.price ?? 0,
    rating: item.rating ?? 4.0,
    reviews: item.reviews ?? 0,
    image: item.image ?? "",
    connection,
    purchaseUrl: `https://www.amazon.co.jp/dp/${item.asin}`,
    highlights: [
      { label: "画面サイズ", value: sizeDisplay },
      { label: "解像度", value: resolution.includes("(") ? resolution.match(/\(([^)]+)\)/)?.[1] ?? resolution : resolution },
      { label: "リフレッシュ", value: refreshRate },
      { label: "重量", value: weight },
    ],
    compat: [],
    specGroups: [
      {
        title: "ディスプレイ",
        rows: [
          { label: "画面サイズ", value: screenSize },
          { label: "解像度", value: resolution },
          { label: "パネル", value: panel },
          { label: "リフレッシュレート", value: refreshRate },
        ],
      },
      {
        title: "接続端子",
        rows: connection === DASH
          ? [{ label: "接続端子", value: DASH }]
          : connection.split(" / ").map((p) => ({ label: p.trim(), value: "対応" })),
      },
    ],
  }

  if (weight !== DASH) {
    gadget.specGroups.push({
      title: "その他",
      rows: [{ label: "重量", value: weight }],
    })
  }

  const explicitTags = override.monitorFilterTags
  const inferredTags = inferMonitorFilterTags(gadget)
  gadget.monitorFilterTags = [...new Set([...(explicitTags ?? []), ...inferredTags])]
  gadget.vesaStandard =
    override.vesaStandard ?? inferMonitorVesaStandardFromText(`${title} ${connection} ${weight}`)

  return gadget
}
