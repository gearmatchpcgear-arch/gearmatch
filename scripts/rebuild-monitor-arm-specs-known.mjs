import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const { catalog } = JSON.parse(
  readFileSync(join(__dirname, "monitor-arm-bestsellers-catalog.json"), "utf8"),
)

const lines = [
  "/**",
  " * Monitor arm specs by ASIN (Amazon / manufacturer listings)",
  " */",
  "export const MONITOR_ARM_SPECS_KNOWN = {",
]

for (const g of catalog) {
  if (!g.asin) continue
  const entry = {
    name: g.name,
    brand: g.brand,
    supportedSize: g.supportedSize,
    weightCapacity: g.weightCapacity,
    armType: g.armType,
    springType: g.springType,
    mountType: g.mountType,
    vesaStandard: g.vesaStandard,
  }
  if (g.price != null) entry.price = g.price
  lines.push(`  ${g.asin}: ${JSON.stringify(entry, null, 2).replace(/\n/g, "\n  ")},`)
}

lines.push("}")
lines.push("")
lines.push("export const EXTRA_MONITOR_ARM_ASINS = [")
lines.push('  { asin: "B0C7VQPLS1", rank: 999, note: "ELECOM DPA-SS10BK" },')
lines.push('  { asin: "B0G5QFRHR1", rank: 1001, note: "Pixio PS1S Wave Black" },')
lines.push('  { asin: "B07W3KK949", rank: 1048, note: "HUANUO HNDS6 dual" },')
lines.push('  { asin: "B089GPNM5V", rank: 1049, note: "HUANUO HNSS8" },')
lines.push('  { asin: "B096FRBS6P", rank: 1051, note: "suptek MD81SE", price: 2980 },')
lines.push('  { asin: "B01DVGUDX8", rank: 1052, note: "Sanwa 100-LA031", price: 5480 },')
lines.push('  { asin: "B082XBG5QP", rank: 1053, note: "EEX-LAP07 pole mount" },')
lines.push('  { asin: "B0G34JT9GQ", rank: 1054, note: "GREENHOUSE GH-AMDX1-BK" },')
lines.push('  { asin: "B0DCVWK5RY", rank: 1055, note: "suptek MD01A" },')
lines.push('  { asin: "B085Y6W6RS", rank: 1056, note: "HUANUO HNDS8 dual vertical" },')
lines.push('  { asin: "B0CPLJT9FX", rank: 1057, note: "GREENHOUSE GH-AMDP1-BK" },')
lines.push('  { asin: "B082MLVXRR", rank: 1058, note: "BONTEC dual" },')
lines.push('  { asin: "B0FVSGD9GZ", rank: 1059, note: "ErGear single 13-34" },')
lines.push('  { asin: "B0DQ4PS5GD", rank: 1060, note: "EastForce 8-joint long" },')
lines.push("]")

writeFileSync(join(__dirname, "monitor-arm-specs-known.mjs"), lines.join("\n"))
console.log(`Wrote ${catalog.length} entries`)
