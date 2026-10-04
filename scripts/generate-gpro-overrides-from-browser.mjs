/**
 * Browser CDP product data → mouse-g-pro-search-spec-overrides.json (全ASIN)
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { formatWeight } from "./amazon-mouse-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CDP_PATH =
  process.argv[2] ??
  "C:\\Users\\mnmap\\.cursor\\browser-logs\\cdp-response-Runtime.evaluate-2026-08-14T11-47-31-814Z.json"
const RAW_PATH = join(__dirname, "mouse-g-pro-search-raw.json")
const OUT_PATH = join(__dirname, "mouse-g-pro-search-spec-overrides.json")

function extractGppd(title) {
  const m = title.match(/G-PPD-[A-Z0-9-]+|GPROXSL-WLDEX[A-Z]*/i)
  return m ? m[0].toUpperCase() : null
}

function extractWeight(title, flat) {
  const fromTitle = title.match(/(\d{2,3})\s*g\b/i)?.[1]
  if (fromTitle) return `${fromTitle} g`
  const oz = title.match(/([\d.]+)\s*oz\s*\(([\d.]+)\s*g\)/i)
  if (oz) return `${Math.round(Number(oz[2]))} g`
  const w = flat["Item Weight"] ?? flat["商品の重量"]
  if (w) {
    const fmt = formatWeight(w)
    if (fmt && fmt !== "—") return fmt
  }
  return null
}

function inferReading(title, flat) {
  const hay = `${title} ${flat["センサー"] ?? ""} ${flat["Pattern"] ?? ""} ${flat["Movement Detection"] ?? ""}`
  if (/hero\s*44k|hero44k/i.test(hay)) return "光学式（HERO 44K）"
  if (/hero\s*2\b|hero2|002xwl|004wl|superstrike|superlight 2|004wlco|004wlse/i.test(hay)) {
    return "光学式（HERO 2）"
  }
  if (/hero\s*25k|hero25k|001t|001r|003wl|002wlr/i.test(hay)) return "光学式（HERO 25K）"
  if (/hero\s*16k|hero16k|002wl\b/i.test(hay)) return "光学式（HERO 16K）"
  if (/hero\s*12k|hero12k|\bg304\b/i.test(hay)) return "光学式（HERO 12K）"
  if (/optical|光学/i.test(hay)) return "光学式"
  return "—"
}

function inferConnection(title, flat) {
  const hay = `${title} ${flat["Connectivity Technology"] ?? ""}`
  const parts = []
  if (/lightspeed|2\.4\s*ghz|wireless receiver|ワイヤレス/i.test(hay) && !/wired only/i.test(hay)) {
    parts.push("2.4GHz (LIGHTSPEED)")
  }
  if (/bluetooth/i.test(hay)) parts.push("Bluetooth")
  if (/usb-c|type-c|usb type-c/i.test(hay)) parts.push("USB-C")
  if (/micro-usb|micro usb/i.test(hay)) parts.push("Micro-USB")
  if (
    (/有線|wired|corded|usb接続/i.test(hay) || flat["Power Source"] === "Corded Electric") &&
    !/wireless|ワイヤレス|lightspeed/i.test(hay)
  ) {
    return "有線 USB"
  }
  if (parts.length) return parts.join(" / ")
  if (/lightspeed wireless/i.test(flat["Connectivity Technology"] ?? "")) {
    return "2.4GHz (LIGHTSPEED)"
  }
  return "—"
}

function inferPower(title, flat) {
  const hay = `${title} ${flat["Power Source"] ?? ""} ${flat["Number of Batteries"] ?? ""}`
  if (/単3|aa battery|1 aa|単3形/i.test(hay)) return "単3形乾電池×1本"
  if (/corded|有線給電|wired/i.test(hay) && !/wireless|ワイヤレス/i.test(title)) {
    return "有線給電"
  }
  if (/usb-c|type-c/i.test(hay)) return "充電式 (USB-C)"
  if (/micro-usb|micro usb/i.test(hay)) return "充電式 (Micro-USB)"
  if (/rechargeable|充電式|battery powered/i.test(hay) && !/aa/i.test(hay)) {
    return "充電式（内蔵バッテリー）"
  }
  return "—"
}

function inferButtons(title, flat) {
  const qty = flat["Button Quantity"] ?? flat["ボタン数"]
  const n = qty ? Number(String(qty).match(/(\d+)/)?.[1]) : null
  if (n && n >= 2 && n <= 12) return String(n)
  const fromTitle = title.match(/(\d+)\s*(?:programmable\s*)?buttons?/i)?.[1]
  if (fromTitle) return fromTitle
  if (/002xwl|002wl|001t|001r/i.test(title)) return "6"
  if (/004wl|003wl|superlight|superstrike|004wlco|004wlse|gprox/i.test(title)) return "5"
  if (/g304/i.test(title)) return "6"
  return "—"
}

function inferName(title, flat) {
  const model = flat["Model Number"] ?? flat["Model Name"]
  const gppd = extractGppd(title)
  if (gppd?.startsWith("G-PPD")) {
    if (/004WLSE/i.test(gppd)) return `G PRO X SUPERLIGHT 2 SE ${gppd}`
    if (/004WL-STRK/i.test(gppd)) return `PRO X2 SUPERSTRIKE ${gppd}`
    if (/004WLCO/i.test(gppd)) return `PRO X SUPERLIGHT 2c ${gppd}`
    if (/002XWL/i.test(gppd)) return `G PRO 2 LIGHTSPEED ${gppd}`
    if (/004WL/i.test(gppd)) return `G PRO X SUPERLIGHT 2 ${gppd}`
    if (/003WL/i.test(gppd)) return `G PRO X SUPERLIGHT ${gppd}`
    if (/002WL/i.test(gppd)) return `G PRO LIGHTSPEED ${gppd}`
    if (/001t/i.test(gppd)) return gppd
    return gppd
  }
  if (/GPROXSL-WLDEX/i.test(title)) {
    const m = title.match(/GPROXSL-WLDEX[A-Z]*/i)
    return m ? `G PRO X SUPERLIGHT 2 DEX ${m[0]}` : "G PRO X SUPERLIGHT 2 DEX"
  }
  if (/g304x/i.test(title)) return "G304X Superlight"
  if (/\bg304\b/i.test(title) || model === "G304") return "G304 LIGHTSPEED"
  if (model && model.length <= 20) return model
  return null
}

const MODEL_DEFAULTS = {
  "G-PPD-002XWL": { reading: "光学式（HERO 2）", weight: "80 g", buttonCount: "8", connection: "2.4GHz (LIGHTSPEED) / USB-C", power: "充電式 (USB-C)" },
  "G-PPD-004WL-STRK": { reading: "光学式（HERO 2）", weight: "61 g", buttonCount: "5", connection: "2.4GHz (LIGHTSPEED) / USB-C", power: "充電式 (USB-C)" },
  "G-PPD-004WL": { reading: "光学式（HERO 2）", weight: "60 g", buttonCount: "5", connection: "2.4GHz (LIGHTSPEED) / USB-C", power: "充電式 (USB-C)" },
  "G-PPD-004WLSE": { reading: "光学式（HERO 2）", weight: "60 g", buttonCount: "5", connection: "2.4GHz (LIGHTSPEED) / USB-C", power: "充電式 (USB-C)" },
  "G-PPD-004WLCO": { reading: "光学式（HERO 2）", weight: "51 g", buttonCount: "5", connection: "2.4GHz (LIGHTSPEED) / USB-C", power: "充電式 (USB-C)" },
  "G-PPD-003WL": { reading: "光学式（HERO 25K）", weight: "63 g", buttonCount: "5", connection: "2.4GHz (LIGHTSPEED) / Micro-USB", power: "充電式 (Micro-USB)" },
  "G-PPD-002WL": { reading: "光学式（HERO 25K）", weight: "80 g", buttonCount: "8", connection: "2.4GHz (LIGHTSPEED) / Micro-USB", power: "充電式 (Micro-USB)" },
  "G-PPD-001": { reading: "光学式（HERO 25K）", weight: "83 g", buttonCount: "6", connection: "有線 USB", power: "有線給電" },
  G304: { reading: "光学式（HERO 12K）", weight: "99 g", buttonCount: "6", connection: "2.4GHz (LIGHTSPEED)", power: "単3形乾電池×1本" },
  G304X: { reading: "光学式（HERO 44K）", weight: "59 g", buttonCount: "6", connection: "2.4GHz (LIGHTSPEED) / USB-C", power: "充電式 (USB-C)" },
}

function modelDefaults(title) {
  if (/004WL-STRK/i.test(title)) return MODEL_DEFAULTS["G-PPD-004WL-STRK"]
  if (/004WLSE/i.test(title)) return MODEL_DEFAULTS["G-PPD-004WLSE"]
  if (/004WLCO/i.test(title)) return MODEL_DEFAULTS["G-PPD-004WLCO"]
  if (/002XWL/i.test(title)) return MODEL_DEFAULTS["G-PPD-002XWL"]
  if (/004WL/i.test(title)) return MODEL_DEFAULTS["G-PPD-004WL"]
  if (/003WL/i.test(title)) return MODEL_DEFAULTS["G-PPD-003WL"]
  if (/002WL/i.test(title)) return MODEL_DEFAULTS["G-PPD-002WL"]
  if (/001t|001r/i.test(title)) return MODEL_DEFAULTS["G-PPD-001"]
  if (/g304x/i.test(title)) return MODEL_DEFAULTS.G304X
  if (/\bg304\b/i.test(title)) return MODEL_DEFAULTS.G304
  if (/GPROXSL-WLDEX/i.test(title)) return MODEL_DEFAULTS["G-PPD-004WL"]
  return {}
}

const cdp = JSON.parse(readFileSync(CDP_PATH, "utf8"))
const data = cdp.result?.value ?? cdp
const raw = existsSync(RAW_PATH) ? JSON.parse(readFileSync(RAW_PATH, "utf8")) : { mice: [] }
const overrides = {}

for (const item of raw.mice) {
  const entry = data[item.asin]
  const title = entry?.title ?? item.title
  const flat = entry?.specs ?? {}
  const defs = modelDefaults(title)

  const o = {
    brand: "Logicool G",
    name: inferName(title, flat) ?? item.title.slice(0, 40),
    price: entry?.price ?? item.price ?? undefined,
    connection: inferConnection(title, flat),
    reading: inferReading(title, flat),
    power: inferPower(title, flat),
    weight: extractWeight(title, flat),
    buttonCount: inferButtons(title, flat),
  }

  // Known G-PPD / G304 models: manufacturer defaults beat noisy Amazon spec tables
  for (const [k, v] of Object.entries(defs)) {
    o[k] = v
  }

  // G-PPD-001t: Amazon Button Quantity=1 is wrong
  if (/001t/i.test(title)) o.buttonCount = "6"

  if (entry?.image) o.image = entry.image.replace(/\._AC_[^.]+_\./, "._AC_SL1500_.")

  overrides[item.asin] = Object.fromEntries(
    Object.entries(o).filter(([, v]) => v != null && v !== "—" && v !== undefined),
  )
}

writeFileSync(OUT_PATH, JSON.stringify(overrides, null, 2) + "\n")
console.log(`Wrote ${OUT_PATH} (${Object.keys(overrides).length} ASINs)`)
