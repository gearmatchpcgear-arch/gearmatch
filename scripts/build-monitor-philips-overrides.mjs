/**
 * Convert browser-fetched Amazon spec JSON → monitor-philips-search-spec-overrides.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { inferConnection } from "./amazon-monitor-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CDP_PATH =
  process.argv[2] ??
  "C:\\Users\\mnmap\\.cursor\\browser-logs\\cdp-response-Runtime.evaluate-2026-08-14T11-38-14-561Z.json"
const RAW_PATH = join(__dirname, "monitor-philips-search-raw.json")

function parseInches(screenSize, title) {
  const fromTitle = title.match(/([\d.]+)\s*(?:インチ|型|inch|in\.)/i)
  if (fromTitle) return `${fromTitle[1]} インチ`
  const m = String(screenSize ?? "").match(/([\d.]+)/)
  return m ? `${m[1]} インチ` : null
}

function parseResolution(specs, title) {
  const max = specs["Display Resolution Maximum"] ?? specs["Native Resolution"] ?? ""
  const res = specs.Resolution ?? ""
  const hay = `${max} ${res} ${title}`
  if (/5120\s*[x×*]\s*1440/i.test(hay)) return "5120 x 1440 (DQHD)"
  if (/3840\s*[x×*]\s*2160|4K UHD|4K/i.test(hay)) return "3840 x 2160 (4K UHD)"
  if (/3440\s*[x×*]\s*1440|UWQHD/i.test(hay)) return "3440 x 1440 (UWQHD)"
  if (/2560\s*[x×*]\s*1440|QHD Wide|WQHD/i.test(hay)) return "2560 x 1440 (QHD)"
  if (/1920\s*[x×*]\s*1200|WUXGA/i.test(hay)) return "1920 x 1200 (WUXGA)"
  if (/1920\s*[x×*]\s*1080|FHD|1080p/i.test(hay)) return "1920 x 1080 (FHD)"
  return null
}

function parseRefresh(specs, title) {
  const r = specs["Refresh Rate"]
  if (r) {
    const m = r.match(/([\d.]+)/)
    if (m) return `${m[1]} Hz`
  }
  const fromTitle = title.match(/(\d{2,3})\s*Hz/i)
  return fromTitle ? `${fromTitle[1]} Hz` : null
}

function parsePanel(specs, title) {
  const tech = specs["Display Technology"] ?? ""
  const type = specs["Display Type"] ?? ""
  const hay = `${tech} ${type} ${title}`
  if (/Fast\s*IPS|Rapid\s*IPS/i.test(hay)) return "Fast IPS"
  if (/\bIPS\b/i.test(tech) || /\bIPS\b/i.test(title)) return "IPS"
  if (/\bVA\b/i.test(tech) || /\bVA\b/i.test(title)) return "VA"
  if (/\bTN\b/i.test(tech) || /\bTN\b/i.test(title)) return "TN"
  return null
}

function parseConnection(specs, title) {
  const raw =
    specs["Connectivity Technology"] ??
    specs["Hardware Connectivity"] ??
    ""
  const ports = []
  const hay = `${raw} ${title}`
  if (/usb[\s-]?type[\s-]?c|usb-c|type-c|thunderbolt/i.test(hay)) ports.push("USB Type-C")
  if (/displayport|\bdp\b/i.test(hay)) ports.push("DisplayPort")
  if (/hdmi/i.test(hay)) ports.push("HDMI")
  if (/d-sub|vga|d-sub/i.test(hay)) ports.push("VGA")
  if (/dvi/i.test(hay)) ports.push("DVI-D")
  if (/micro hdmi/i.test(hay)) ports.push("Micro HDMI")
  if (ports.length) return [...new Set(ports)].join(" / ")
  const inferred = inferConnection(title)
  return inferred !== "—" ? inferred : null
}

function parseWeight(specs) {
  const w = specs["Item Weight"]
  if (!w) return null
  const kg = w.match(/([\d.]+)\s*Kilograms?/i)
  if (kg) return `${Math.round(Number(kg[1]) * 1000).toLocaleString("en-US")} g`
  const g = w.match(/([\d,.]+)\s*(?:g|grams?)/i)
  if (g) return `${Number(g[1].replace(/,/g, "")).toLocaleString("en-US")} g`
  return null
}

function normalizePhilipsName(raw) {
  if (!raw || /^philips$/i.test(String(raw).trim())) return null
  let n = String(raw).trim()
  if (/monitor|モニター|wide lcd/i.test(n)) return null
  n = n.replace(/\s+/g, "")
  if (/^243v7$/i.test(n)) return "243V7"
  if (/^(\d{3})v7/i.test(n)) return n.replace(/^(\d{3})v7/i, "$1V7")
  return n.length <= 28 ? n : null
}

function parseName(specs, title) {
  const fromSpecs = normalizePhilipsName(specs["Model Number"] ?? specs["Model Name"])
  if (fromSpecs) return fromSpecs
  const m =
    title.match(/\b(\d{3}V7[A-Z0-9/]*)\b/i) ??
    title.match(/\b(\d{2,3}[A-Z0-9]{1,6}\/\d+)\b/i) ??
    title.match(/\b(\d{2}E\d[N]\d+[A-Z0-9/]+)\b/i) ??
    title.match(/\b(\d{3}B\d[^/\s]*\/\d+)\b/i) ??
    title.match(/\b(\d{3}S\d[A-Z0-9/]+)\b/i) ??
    title.match(/\b(243V7)\b/i)
  return m ? m[1].toUpperCase().replace(/^243V7$/i, "243V7") : null
}

const cdp = JSON.parse(readFileSync(CDP_PATH, "utf8"))
const titlesByAsin = existsSync(RAW_PATH)
  ? Object.fromEntries(
      JSON.parse(readFileSync(RAW_PATH, "utf8")).monitors.map((m) => [m.asin, m.title]),
    )
  : {}

const data = cdp.result?.value ?? cdp
const overrides = {}

for (const [asin, entry] of Object.entries(data)) {
  if (entry.error || !entry.specs) continue
  const specs = entry.specs
  const title = titlesByAsin[asin] ?? ""
  const o = {}
  const name = parseName(specs, title)
  if (name) o.name = name
  o.brand = "PHILIPS"
  if (entry.price != null) o.price = entry.price
  if (entry.image) o.image = normalizeAmazonImageUrl(entry.image)

  const screenSize = parseInches(specs["Screen Size"], title)
  if (screenSize) o.screenSize = screenSize
  const resolution = parseResolution(specs, title)
  if (resolution) o.resolution = resolution
  const refreshRate = parseRefresh(specs, title)
  if (refreshRate) o.refreshRate = refreshRate
  const panel = parsePanel(specs, title)
  if (panel) o.panel = panel
  const connection = parseConnection(specs, title)
  if (connection) o.connection = connection
  const weight = parseWeight(specs)
  if (weight) o.weight = weight

  overrides[asin] = o
}

if (overrides["B0GZSG3ZB8"]) {
  overrides["B0GZSG3ZB8"].name = "243V7"
  overrides["B0GZSG3ZB8"].screenSize = "23.8 インチ"
  overrides["B0GZSG3ZB8"].panel = "IPS"
  overrides["B0GZSG3ZB8"].connection = "DisplayPort / HDMI / VGA"
}
if (overrides["B09PQHH6ST"]) {
  overrides["B09PQHH6ST"].connection = "DisplayPort / HDMI / VGA"
}
if (overrides["B0FH22XCQL"]) overrides["B0FH22XCQL"].panel = "VA"
if (overrides["B0DCNN7G7V"]) overrides["B0DCNN7G7V"].panel = "VA"
if (overrides["B0G91LKMV9"]) overrides["B0G91LKMV9"].panel = "VA"
if (overrides["B0CNQ2743P"]) overrides["B0CNQ2743P"].panel = "VA"
if (overrides["B0GZSQ3NC8"]) {
  overrides["B0GZSQ3NC8"].name = "273V7QDAB/11"
  overrides["B0GZSQ3NC8"].panel = "IPS"
  overrides["B0GZSQ3NC8"].connection = "HDMI / DVI-D / VGA"
}

const OUT = join(__dirname, "monitor-philips-search-spec-overrides.json")
writeFileSync(OUT, JSON.stringify(overrides, null, 2))
console.log(`Wrote ${OUT} (${Object.keys(overrides).length} ASINs)`)
