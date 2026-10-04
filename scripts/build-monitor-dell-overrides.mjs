/**
 * Convert browser-fetched Amazon spec JSON → monitor-dell-search-spec-overrides.json
 * Usage: node scripts/build-monitor-dell-overrides.mjs [path-to-cdp-json]
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { inferConnection } from "./amazon-monitor-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CDP_PATH =
  process.argv[2] ??
  "C:\\Users\\mnmap\\.cursor\\browser-logs\\cdp-response-Runtime.evaluate-2026-08-14T11-35-22-499Z.json"
const RAW_PATH = join(__dirname, "monitor-dell-search-raw.json")

function parseInches(screenSize) {
  const m = String(screenSize ?? "").match(/([\d.]+)/)
  return m ? `${m[1]} インチ` : null
}

function parseResolution(specs) {
  const max = specs["Display Resolution Maximum"] ?? specs["Native Resolution"] ?? ""
  const res = specs.Resolution ?? ""
  const hay = `${max} ${res}`
  if (/3840\s*[x×*]\s*2160|4K UHD|4K/i.test(hay)) return "3840 x 2160 (4K UHD)"
  if (/5120\s*[x×*]\s*2880|6K/i.test(hay)) return "5120 x 2880 (5K)"
  if (/3440\s*[x×*]\s*1440|UWQHD|WQHD/i.test(hay)) return "3440 x 1440 (UWQHD)"
  if (/2560\s*[x×*]\s*1440|QHD Wide|WQHD/i.test(hay)) return "2560 x 1440 (QHD)"
  if (/1920\s*[x×*]\s*1200|WUXGA/i.test(hay)) return "1920 x 1200 (WUXGA)"
  if (/1280\s*[x×*]\s*1024|SXGA/i.test(hay)) return "1280 x 1024 (SXGA)"
  if (/1920\s*[x×*]\s*1080|FHD|1080p/i.test(hay)) return "1920 x 1080 (FHD)"
  return null
}

function parseRefresh(specs) {
  const r = specs["Refresh Rate"]
  if (!r) return null
  const m = r.match(/([\d.]+)/)
  return m ? `${m[1]} Hz` : null
}

function parsePanel(specs, title) {
  const tech = specs["Display Technology"] ?? ""
  const type = specs["Display Type"] ?? ""
  const hay = `${tech} ${type} ${title}`
  if (/QD-OLED/i.test(hay)) return "QD-OLED"
  if (/WOLED|OLED|Tandem/i.test(hay)) return /WOLED/i.test(hay) ? "WOLED" : "OLED"
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
  if (/d-sub|vga/i.test(hay)) ports.push("VGA")
  if (/dvi/i.test(hay)) ports.push("DVI-D")
  if (ports.length) return [...new Set(ports)].join(" / ")
  const inferred = inferConnection(title)
  return inferred !== "—" ? inferred : null
}

function parseWeight(specs) {
  const w = specs["Item Weight"]
  if (!w) return null
  const kg = w.match(/([\d.]+)\s*Kilograms?/i)
  if (kg) return `${Math.round(Number(kg[1]) * 1000).toLocaleString("en-US")} g`
  const g = w.match(/([\d,.]+)\s*g/i)
  if (g) return `${Number(g[1].replace(/,/g, "")).toLocaleString("en-US")} g`
  return null
}

function parseName(specs, title) {
  const mn = specs["Model Number"] ?? specs["Model Name"]
  if (mn && mn.length <= 24 && !/monitor|モニター|series|professional|frameless/i.test(mn)) {
    return mn
  }
  const dell = title.match(/\b(P\d{4}[A-Z0-9-]*|S\d{4}[A-Z0-9-]*|SE\d{4}[A-Z0-9-]*|E\d{4}[A-Z0-9-]*|U\d{4}[A-Z0-9-]*|AW\d{4}[A-Z0-9-]*|C\d{4}[A-Z0-9-]*)\b/i)
  if (dell) return dell[1].toUpperCase()
  return null
}

let cdp
try {
  cdp = JSON.parse(readFileSync(CDP_PATH, "utf8"))
} catch {
  console.error(`Could not read CDP JSON at ${CDP_PATH}`)
  process.exit(1)
}

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
  o.brand = "Dell"
  if (entry.price != null) o.price = entry.price
  if (entry.image) o.image = normalizeAmazonImageUrl(entry.image)

  const screenSize = parseInches(specs["Screen Size"])
  if (screenSize) o.screenSize = screenSize
  const resolution = parseResolution(specs)
  if (resolution) o.resolution = resolution
  const refreshRate = parseRefresh(specs)
  if (refreshRate) o.refreshRate = refreshRate
  const panel = parsePanel(specs, title)
  if (panel) o.panel = panel
  const connection = parseConnection(specs, title)
  if (connection) o.connection = connection
  const weight = parseWeight(specs)
  if (weight) o.weight = weight

  overrides[asin] = o
}

// Dell official / listing corrections
if (overrides["B0G6JV85HG"]) overrides["B0G6JV85HG"].panel = "Fast IPS"
if (overrides["B07F8Z2WFL"]) {
  overrides["B07F8Z2WFL"].brand = "Dell"
  overrides["B07F8Z2WFL"].name = "P2219H"
}
if (overrides["B0C3ZV4H7L"]) overrides["B0C3ZV4H7L"].panel = "Fast IPS"
if (overrides["B0GR4Q6FL4"]) overrides["B0GR4Q6FL4"].panel = "VA"
if (overrides["B0H6J2QR7N"]) overrides["B0H6J2QR7N"].panel = "VA"
if (overrides["B0F23FHHRK"]) overrides["B0F23FHHRK"].panel = "VA"
if (overrides["B0F23DY221"]) overrides["B0F23DY221"].panel = "QD-OLED"
if (overrides["B0GR9F5TNY"]) overrides["B0GR9F5TNY"].panel = "QD-OLED"

const OUT = join(__dirname, "monitor-dell-search-spec-overrides.json")
writeFileSync(OUT, JSON.stringify(overrides, null, 2))
console.log(`Wrote ${OUT} (${Object.keys(overrides).length} ASINs)`)
