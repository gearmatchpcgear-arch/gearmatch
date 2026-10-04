/**
 * Browser CDP product data → keyboard-gpro-page3-spec-overrides.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  extractBrand,
  inferConnectionFromTitle,
  inferLayoutFromText,
  inferStructureFromText,
  inferKeycapsFromText,
  inferPowerFromText,
  sanitizeKeyboardWeight,
  shortProductName,
} from "./amazon-keyboard-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CDP_PATH =
  process.argv[2] ?? join(__dirname, "keyboard-gpro-page3-cdp-specs.json")
const RAW_PATH = join(__dirname, "keyboard-gpro-page3-raw.json")
const OUT_PATH = join(__dirname, "keyboard-gpro-page3-spec-overrides.json")

function formatWeight(flat, title) {
  const raw = flat["Item Weight"] ?? flat["商品の重量"]
  const sanitized = sanitizeKeyboardWeight(raw)
  if (sanitized) return sanitized
  const fromTitle = title.match(/(\d{2,4})\s*g\b/i)?.[1]
  if (fromTitle) return `${fromTitle} g`
  if (raw) {
    const m = String(raw).match(/([\d.]+)\s*(?:grams?|グラム|g)/i)
    if (m) return `${Math.round(Number(m[1]))} g`
  }
  return null
}

function inferBacklight(title, flat) {
  const hay = `${title} ${Object.values(flat).join(" ")}`
  if (/lightsync rgb|lightsync/i.test(hay)) return "LIGHTSYNC RGB"
  if (/chroma rgb|razer chroma/i.test(hay)) return "Chroma RGB"
  if (/rgb backlight|rgbバックライト|rgb バックライト|per-key rgb/i.test(hay)) return "RGB対応"
  if (/バックライトなし|no rgb|non.?rgb|no rgb light/i.test(hay)) return "なし"
  if (/rgb/i.test(hay)) return "RGB対応"
  return "—"
}

function inferFormFactor(title, flat) {
  const hay = `${title} ${flat["Style Name"] ?? ""} ${flat["Model Name"] ?? ""}`
  if (/フットスイッチ|foot switch|foot pedal|3キー.*ショートカット/i.test(hay)) return "マクロキー / フットスイッチ"
  if (/98%|98キー|g512.?x.?98/i.test(hay)) return "98%レイアウト"
  if (/75%|g512.?x.?75|75 gaming keyboard/i.test(hay)) return "75%レイアウト"
  if (/65%|60%|mini keyboard/i.test(hay)) return "コンパクト"
  if (/tenkeyless|テンキーレス|tkl|numeric keyless|テンキーなし/i.test(hay)) return "テンキーレス (TKL)"
  if (/フルサイズ|full.?size|108キー|104キー/i.test(hay)) return "フルサイズ"
  return "—"
}

function inferName(title, brand) {
  const patterns = [
    /G-PKB-[A-Z0-9-]+/i,
    /G512X-[0-9]+-[A-Z]+/i,
    /G515-WL-[A-Z]+/i,
    /G-PKB-60-[A-Z0-9-]+/i,
    /K70 PRO TKL[^,]*/i,
    /PCMK 2HE TKL/i,
    /eS HE 70/i,
    /MATAKI/i,
  ]
  for (const re of patterns) {
    const m = title.match(re)
    if (m) return m[0].trim()
  }
  return shortProductName(title)
}

const cdp = existsSync(CDP_PATH) ? JSON.parse(readFileSync(CDP_PATH, "utf8")) : {}
const data = cdp.result?.value ?? cdp
const raw = existsSync(RAW_PATH) ? JSON.parse(readFileSync(RAW_PATH, "utf8")) : { keyboards: [] }
const overrides = {}

for (const item of raw.keyboards) {
  const entry = data[item.asin] ?? {}
  const title = entry.title ?? item.title
  const flat = entry.specs ?? {}
  const hay = `${title} ${Object.values(flat).join(" ")}`
  const brand = extractBrand(title)
  const conn = inferConnectionFromTitle(title)
  const layout = inferLayoutFromText(hay) ?? "—"
  const structure = inferStructureFromText(hay, flat["Switch Type"] ?? flat["Style Name"], title) ?? "—"
  const keycaps = inferKeycapsFromText(hay) ?? "—"
  const power = inferPowerFromText(hay, conn) ?? "—"

  const o = {
    brand,
    name: inferName(title, brand),
    price: entry.price ?? item.price ?? undefined,
    connection: conn,
    layout,
    internalStructure: structure,
    keycaps,
    power,
    backlight: inferBacklight(title, flat),
    formFactor: inferFormFactor(title, flat),
    weight: formatWeight(flat, title),
  }

  if (/rapid trigger|ラピッドトリガー|mgx|magnetic|磁気|hall effect|8000hz/i.test(hay)) {
    o.hasRapidTrigger = true
  }
  if (/g-pkb-002ln|002ln/i.test(title)) {
    o.name = "G PRO G-PKB-002LNd"
    o.layout = "日本語配列 (JIS)"
    o.internalStructure = "メカニカル（赤軸）"
    o.formFactor = "テンキーレス (TKL)"
    o.connection = "有線 USB (着脱式)"
    o.backlight = "LIGHTSYNC RGB"
  }
  if (/k70 pro tkl/i.test(title)) {
    o.name = "K70 PRO TKL"
    o.layout = "日本語配列 (JIS)"
    o.internalStructure = "磁気式 (CORSAIR MGX / ラピッドトリガー)"
    o.formFactor = "テンキーレス (TKL)"
    o.connection = "有線 USB"
    o.hasRapidTrigger = true
  }
  if (/g-pkb-60/i.test(title)) {
    o.name = "G PRO X 60"
    o.formFactor = "60% / コンパクト"
    o.layout = "日本語配列 (JIS)"
    o.internalStructure = "メカニカル (GX Linear)"
    o.connection = "2.4GHz (LIGHTSPEED) / Bluetooth"
    o.power = "充電式（内蔵バッテリー）"
    o.backlight = "LIGHTSYNC RGB"
  }
  if (/g515/i.test(title)) {
    o.name = "G515 LIGHTSPEED TKL"
    o.formFactor = "テンキーレス (TKL)"
    o.layout = "日本語配列 (JIS)"
    o.connection = "2.4GHz (LIGHTSPEED) / Bluetooth"
    o.power = "充電式（内蔵バッテリー）"
    o.backlight = "LIGHTSYNC RGB"
  }
  if (/g512.?x.?75/i.test(title)) {
    o.name = "G512 X 75"
    o.formFactor = "75%レイアウト"
    o.layout = "日本語配列 (JIS)"
    o.hasRapidTrigger = true
  }
  if (/g512.?x.?98/i.test(title)) {
    o.name = "G512 X 98"
    o.formFactor = "98%レイアウト"
    o.layout = "日本語配列 (JIS)"
    o.hasRapidTrigger = true
  }
  if (/pcmk 2he/i.test(title)) {
    o.name = "PCMK 2HE TKL"
    o.formFactor = "テンキーレス (TKL)"
    o.layout = "日本語配列 (JIS)"
    o.internalStructure = "磁気スイッチ (Hall Effect)"
    o.connection = "有線 USB (8000Hz)"
    o.hasRapidTrigger = true
  }
  if (/es he 70/i.test(title)) {
    o.name = "eS HE 70"
    o.formFactor = "70%レイアウト"
    o.layout = "英語配列 (ANSI)"
    o.internalStructure = "磁気スイッチ (Hall Effect)"
    o.connection = "有線 USB (8000Hz)"
    o.hasRapidTrigger = true
  }
  if (/mataki/i.test(title)) {
    o.name = "AIM1 MATAKI"
    o.formFactor = "75%レイアウト"
    o.layout = "英語配列"
    o.internalStructure = "磁気式 (ラピッドトリガー)"
    o.connection = "有線 USB (8000Hz)"
    o.hasRapidTrigger = true
  }
  if (/k\/da/i.test(title)) {
    o.name = "G PRO K/DA TKL"
    o.formFactor = "テンキーレス (TKL)"
    o.layout = "日本語配列 (JIS)"
    o.internalStructure = "メカニカル (GX Tactile)"
    o.connection = "有線 USB"
    o.backlight = "LIGHTSYNC RGB"
  }

  if (/8000hz|8k polling|8000 hz/i.test(hay)) o.pollingRate = "8,000 Hz"

  if (entry.image) o.image = entry.image.replace(/\._AC_[^.]+_\./, "._AC_SL1500_.")

  overrides[item.asin] = Object.fromEntries(
    Object.entries(o).filter(([, v]) => v != null && v !== "—" && v !== undefined && v !== false),
  )
  if (o.hasRapidTrigger) overrides[item.asin].hasRapidTrigger = true
}

writeFileSync(OUT_PATH, JSON.stringify(overrides, null, 2) + "\n")
console.log(`Wrote ${OUT_PATH} (${Object.keys(overrides).length} ASINs)`)
