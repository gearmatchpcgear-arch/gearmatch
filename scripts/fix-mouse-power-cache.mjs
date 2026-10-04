/**
 * Normalize power values in mouse-specs-cache.json using title context.
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { formatPowerDisplay, isWiredUsbProduct, sanitizeCommunicationInterface } from "./amazon-mouse-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "mouse-specs-cache.json")
const OVERRIDES_PATH = join(__dirname, "power-overrides.json")

const cache = JSON.parse(readFileSync(CACHE_PATH, "utf8"))
const overrides = JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"))

function resolveFromBatteryContext(row, entry) {
  const ctx = entry.specs?.meta?.batteryContext
  if (!ctx || ctx.confidence < 80) return null
  const powerSize = row.value.match(/単([1234])形/)?.[1]
  if (!powerSize || powerSize === ctx.size) return null
  if (ctx.included || /付属/.test(row.value)) return `単${ctx.size}形 乾電池（付属）`
  return `電池式（単${ctx.size}形乾電池 ${ctx.count ?? "1"}本）`
}

let updated = 0

for (const [asin, entry] of Object.entries(cache)) {
  const title = entry.title ?? ""
  const override = overrides[asin]?.power
  const rows = entry.specs?.powerRows
  if (!rows?.length) continue

  const map = { 型番: entry.specs?.meta?.modelNumber ?? "" }
  const wired =
    isWiredUsbProduct(title, map) ||
    (/有線|wired/i.test(title) && !/wireless|ワイヤレス|無線/i.test(title))

  for (const row of rows) {
    if (row.label === "電源") {
      const next =
        override ??
        (wired ? "有線給電" : null) ??
        resolveFromBatteryContext(row, entry) ??
        formatPowerDisplay(row.value, title, map)
      if (next && next !== row.value) {
        row.value = next
        updated++
      }
      continue
    }

    if (row.label === "通信インターフェース（Amazon記載）" && wired) {
      const next = sanitizeCommunicationInterface(row.value, title, map)
      if (next && next !== row.value) {
        row.value = next
        updated++
      }
    }
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
console.log(`Updated ${updated} power rows in cache`)
