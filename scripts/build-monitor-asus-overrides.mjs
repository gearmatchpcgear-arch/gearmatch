/**
 * Convert browser-fetched Amazon spec JSON → monitor-asus-search-spec-overrides.json
 * Usage: node scripts/build-monitor-asus-overrides.mjs [path-to-cdp-json]
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CDP_PATH =
  process.argv[2] ??
  join(__dirname, "..", ".cursor", "browser-logs", "cdp-response-Runtime.evaluate-2026-08-14T11-31-18-802Z.json")

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
  if (/3440\s*[x×*]\s*1440|UWQHD/i.test(hay)) return "3440 x 1440 (UWQHD)"
  if (/2560\s*[x×*]\s*1440|QHD Wide|WQHD/i.test(hay)) return "2560 x 1440 (QHD)"
  if (/1920\s*[x×*]\s*1200|WUXGA/i.test(hay)) return "1920 x 1200 (WUXGA)"
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
  if (/QD-OLED|WOLED|OLED|Tandem/i.test(hay)) return /WOLED/i.test(hay) ? "WOLED" : "OLED"
  if (/Fast\s*IPS|Rapid\s*IPS/i.test(hay)) return "Fast IPS"
  if (/\bIPS\b/i.test(tech) || /\bIPS\b/i.test(title)) return "IPS"
  if (/\bVA\b/i.test(tech)) return "VA"
  if (/\bTN\b/i.test(tech) || /\bTN\b/i.test(title)) return "TN"
  return null
}

function parseConnection(specs) {
  const raw =
    specs["Connectivity Technology"] ??
    specs["Hardware Connectivity"] ??
    ""
  if (!raw) return null
  const ports = []
  if (/usb[\s-]?type[\s-]?c|usb-c|type-c|thunderbolt/i.test(raw)) ports.push("USB Type-C")
  if (/displayport|\bdp\b/i.test(raw)) ports.push("DisplayPort")
  if (/hdmi/i.test(raw)) ports.push("HDMI")
  if (/d-sub|vga|d-sub/i.test(raw)) ports.push("VGA")
  if (/dvi/i.test(raw)) ports.push("DVI-D")
  if (/aux|earphone|ヘッドフォン/i.test(raw) && ports.length === 0) return null
  return ports.length ? [...new Set(ports)].join(" / ") : null
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

function parseName(specs) {
  return specs["Model Number"] ?? specs["Model Name"] ?? null
}

let cdp
try {
  cdp = JSON.parse(readFileSync(CDP_PATH, "utf8"))
} catch {
  console.error(`Could not read CDP JSON at ${CDP_PATH}`)
  process.exit(1)
}

const data = cdp.result?.value ?? cdp
const overrides = {}

for (const [asin, entry] of Object.entries(data)) {
  if (entry.error || !entry.specs) continue
  const specs = entry.specs
  const o = {}
  const name = parseName(specs)
  if (name && name.length <= 40) o.name = name
  o.brand = "ASUS"
  if (entry.price != null) o.price = entry.price
  if (entry.image) o.image = normalizeAmazonImageUrl(entry.image)

  const screenSize = parseInches(specs["Screen Size"])
  if (screenSize) o.screenSize = screenSize
  const resolution = parseResolution(specs)
  if (resolution) o.resolution = resolution
  const refreshRate = parseRefresh(specs)
  if (refreshRate) o.refreshRate = refreshRate
  const panel = parsePanel(specs, name ?? "")
  if (panel) o.panel = panel
  const connection = parseConnection(specs)
  if (connection) o.connection = connection
  const weight = parseWeight(specs)
  if (weight) o.weight = weight

  overrides[asin] = o
}

// Manual corrections where Amazon listing data conflicts with product title / ASUS specs
if (overrides["B07LH1ZDSL"]) overrides["B07LH1ZDSL"].refreshRate = "75 Hz"
if (overrides["B07MDV2L3S"]) overrides["B07MDV2L3S"].panel = "IPS"
if (overrides["B086ZSRRDB"]) {
  overrides["B086ZSRRDB"].connection = "HDMI / DisplayPort / USB Type-C"
  overrides["B086ZSRRDB"].panel = "IPS"
}
if (overrides["B0F9WJLW45"]) overrides["B0F9WJLW45"].panel = "Fast IPS"
if (overrides["B09TDSC9WS"]) overrides["B09TDSC9WS"].panel = "Fast IPS"
if (overrides["B0813TDWJB"]) {
  overrides["B0813TDWJB"].panel = "TN"
  overrides["B0813TDWJB"].weight = "5,000 g"
}

const OUT = join(__dirname, "monitor-asus-search-spec-overrides.json")
writeFileSync(OUT, JSON.stringify(overrides, null, 2))
console.log(`Wrote ${OUT} (${Object.keys(overrides).length} ASINs)`)
