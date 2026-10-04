/**
 * Bulk-convert 重量 fields from kg to g in lib/*.ts and mouse-specs-cache.json.
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

function formatWeightDisplay(value) {
  if (!value || value === "—") return value
  return value.replace(/(約\s*)?([\d.,]+)\s*kg\b/gi, (_, prefix = "", numStr) => {
    const num = Number(numStr.replace(/,/g, ""))
    if (!Number.isFinite(num) || num <= 0) return `${prefix}${numStr} kg`
    const grams = Math.round(num * 1000)
    const formatted = grams >= 1000 ? grams.toLocaleString("ja-JP") : String(grams)
    return `${prefix}${formatted} g`
  })
}

function convertWeightFieldsInSource(src) {
  let count = 0
  const next = src.replace(
    /(label:\s*"重量"|"label":"重量")([^}]*?)(value:\s*"([^"]+)"|"value":"([^"]+)")/g,
    (match, labelPart, middle, valuePart, v1, v2) => {
      const raw = v1 ?? v2
      const converted = formatWeightDisplay(raw)
      if (converted === raw) return match
      count++
      return match.replace(raw, converted)
    },
  )
  return { next, count }
}

function convertCache(cache) {
  let count = 0
  for (const entry of Object.values(cache)) {
    const specs = entry?.specs
    if (!specs) continue

    if (specs.highlights?.weight) {
      const converted = formatWeightDisplay(specs.highlights.weight)
      if (converted !== specs.highlights.weight) {
        specs.highlights.weight = converted
        count++
      }
    }

    if (specs.weight) {
      const converted = formatWeightDisplay(specs.weight)
      if (converted !== specs.weight) {
        specs.weight = converted
        count++
      }
    }

    for (const rows of [
      specs.sizeRows,
      specs.sizeWeight?.rows,
      specs.highlights?.rows,
    ]) {
      if (!Array.isArray(rows)) continue
      for (const row of rows) {
        if (row?.label === "重量" && row.value) {
          const converted = formatWeightDisplay(row.value)
          if (converted !== row.value) {
            row.value = converted
            count++
          }
        }
      }
    }
  }
  return count
}

let total = 0
for (const file of [
  join(ROOT, "lib", "gadgets.ts"),
  join(ROOT, "lib", "mouse-bestsellers.ts"),
  join(ROOT, "lib", "mouse-popular-brands.ts"),
]) {
  const src = readFileSync(file, "utf8")
  const { next, count } = convertWeightFieldsInSource(src)
  if (count) {
    writeFileSync(file, next)
    console.log(`${file}: ${count} weight fields converted`)
    total += count
  }
}

const cachePath = join(__dirname, "mouse-specs-cache.json")
if (existsSync(cachePath)) {
  const cache = JSON.parse(readFileSync(cachePath, "utf8"))
  const cacheCount = convertCache(cache)
  if (cacheCount) {
    writeFileSync(cachePath, JSON.stringify(cache, null, 2) + "\n")
    console.log(`mouse-specs-cache.json: ${cacheCount} entries updated`)
    total += cacheCount
  }
}

console.log(`Done. Total conversions: ${total}`)
