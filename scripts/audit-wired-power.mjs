/**
 * Detect wired USB mice whose power is still marked as battery/disposable.
 */
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { isWiredUsbProduct } from "./amazon-mouse-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "mouse-specs-cache.json")
const cache = JSON.parse(readFileSync(CACHE_PATH, "utf8"))

const BATTERY_POWER = /^(電池式|単[1234]形|バッテリー式|充電式)/
const bad = []

for (const [asin, entry] of Object.entries(cache)) {
  const title = entry.title ?? ""
  const map = { 型番: entry.specs?.meta?.modelNumber ?? "" }
  if (!isWiredUsbProduct(title, map)) continue

  const power = entry.specs?.powerRows?.find((r) => r.label === "電源")?.value ?? ""
  const iface =
    entry.specs?.powerRows?.find((r) => r.label === "通信インターフェース（Amazon記載）")
      ?.value ?? ""

  if (BATTERY_POWER.test(power) && power !== "有線給電") {
    bad.push({ asin, kind: "power", value: power, title: title.slice(0, 70) })
  }
  if (/無線|2\.4\s*ghz|bluetooth|wireless/i.test(iface)) {
    bad.push({ asin, kind: "interface", value: iface, title: title.slice(0, 70) })
  }
}

console.log(`Wired USB spec issues: ${bad.length}`)
for (const b of bad) {
  console.log(`${b.asin} [${b.kind}] ${b.value}`)
  console.log(`  ${b.title}`)
}

process.exit(bad.length > 0 ? 1 : 0)
