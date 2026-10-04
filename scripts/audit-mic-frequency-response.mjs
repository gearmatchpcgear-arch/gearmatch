/**
 * Audit mic frequency response fill status across lib/*.ts
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const DASH = "—"

function extractMics(src, file) {
  const gadgets = []
  const blockRe =
    /id: "([^"]+)"[\s\S]*?category: "mic"[\s\S]*?name: "([^"]*)"[\s\S]*?brand: "([^"]*)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?highlights: \[([\s\S]*?)\][\s\S]*?specGroups:/g
  let m
  while ((m = blockRe.exec(src)) !== null) {
    const highlights = m[5]
    const hlMatch = highlights.match(/label: "周波数特性", value: "([^"]*)"/)
    const specMatch = src
      .slice(m.index, m.index + 4000)
      .match(/label: "周波数特性", value: "([^"]*)"/g)
    const values = specMatch ? [...new Set(specMatch.map((x) => x.match(/value: "([^"]*)"/)[1]))] : []
    gadgets.push({
      id: m[1],
      name: m[2],
      brand: m[3],
      asin: m[4],
      highlightFreq: hlMatch?.[1] ?? "?",
      allValues: values,
      file,
    })
  }
  return gadgets
}

const all = []
for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const src = readFileSync(join(ROOT, "lib", file), "utf8")
  if (!src.includes('category: "mic"')) continue
  all.push(...extractMics(src, file))
}

const missing = all.filter((g) => g.highlightFreq === DASH || g.highlightFreq === "-")
const filled = all.filter((g) => g.highlightFreq !== DASH && g.highlightFreq !== "-" && g.highlightFreq !== "?")
const asins = new Set(all.map((g) => g.asin))

console.log(`Total mic entries: ${all.length}`)
console.log(`Unique ASINs: ${asins.size}`)
console.log(`Missing frequency response: ${missing.length}`)
console.log(`Filled: ${filled.length}`)
console.log("\nFilled examples:")
for (const g of filled.slice(0, 10)) console.log(`  ${g.id} [${g.brand}] ${g.name}: ${g.highlightFreq}`)
