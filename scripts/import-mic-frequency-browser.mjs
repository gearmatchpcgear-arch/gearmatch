/**
 * Import browser-extracted mic frequency rows → mic-frequency-response-cache.json
 *
 * Batch file shape:
 * [{ "asin": "B000...", "title": "...", "table": { "Minimum Frequency": "20 Hz", ... } }]
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  parseFrequencyRange,
  formatFrequencyResponse,
  parseAmazonMicFrequencyResponse,
  MIC_FREQ_OVERRIDES,
  DASH,
} from "./amazon-mic-frequency-response.mjs"
import { MIC_FREQUENCY_KNOWN } from "./mic-frequency-known.mjs"

const ALL_OVERRIDES = { ...MIC_FREQUENCY_KNOWN, ...MIC_FREQ_OVERRIDES }

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "mic-frequency-response-cache.json")
const BATCH_DIR = join(__dirname, "mic-frequency-batches")

const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}

function parseFromTable(table) {
  if (!table || typeof table !== "object") return null

  for (const [key, val] of Object.entries(table)) {
    if (/^(Frequency Range|周波数範囲|周波数帯域)$/i.test(key)) {
      const range = parseFrequencyRange(val)
      if (range) return { ...formatFrequencyResponse(range), source: "browser-range" }
    }
  }

  const minKey = Object.keys(table).find((k) =>
    /^(Minimum Frequency|最低周波数|最小周波数)$/i.test(k),
  )
  const maxKey = Object.keys(table).find((k) =>
    /^(Maximum Frequency|最高周波数|最大周波数)$/i.test(k),
  )
  if (minKey && maxKey) {
    const range = parseFrequencyRange(`${table[minKey]} - ${table[maxKey]}`)
    if (range) return { ...formatFrequencyResponse(range), source: "browser-minmax" }
  }

  for (const [key, val] of Object.entries(table)) {
    if (/^(周波数特性|周波数応答|Frequency Response)$/i.test(key)) {
      const range = parseFrequencyRange(val)
      if (range) return { ...formatFrequencyResponse(range), source: "browser-freq" }
    }
  }
  return null
}

function importBatch(items) {
  let added = 0
  for (const item of items) {
    const asin = item.asin
    if (!asin) continue
    let result = parseFromTable(item.table)
    if (!result) {
      const fakeHtml = Object.entries(item.table ?? {})
        .map(([k, v]) => `<th class="prodDetSectionEntry">${k}</th><td class="prodDetAttrValue">${v}</td>`)
        .join("")
      result = parseAmazonMicFrequencyResponse(`<table>${fakeHtml}</table>`)
    }
    if (result.highlight === DASH && ALL_OVERRIDES[asin]) {
      result = { ...formatFrequencyResponse(ALL_OVERRIDES[asin]), source: "known" }
    }
    cache[asin] = {
      ...result,
      title: item.title ?? cache[asin]?.title,
      fetchedAt: new Date().toISOString(),
    }
    added++
  }
  return added
}

const arg = process.argv[2]
let total = 0

if (arg) {
  const items = JSON.parse(readFileSync(arg, "utf8"))
  total = importBatch(items)
} else if (existsSync(BATCH_DIR)) {
  for (const file of readdirSync(BATCH_DIR).filter((f) => f.startsWith("results-"))) {
    total += importBatch(JSON.parse(readFileSync(join(BATCH_DIR, file), "utf8")))
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
const filled = Object.values(cache).filter((v) => v.highlight && v.highlight !== DASH).length
console.log(`Imported ${total} entries. Cache ${filled}/${Object.keys(cache).length} filled.`)
