/**
 * Build ASIN metadata index from raw scrape JSON + asin-title-cache.
 */
import { readFileSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCRIPTS = __dirname
const CACHE_PATH = join(SCRIPTS, "asin-title-cache.json")

/** @returns {Map<string, { asin: string, title: string, image: string, sources: string[] }>} */
export function buildAsinMetaIndex() {
  /** @type {Map<string, { asin: string, title: string, image: string, sources: string[] }>} */
  const index = new Map()

  function upsert(asin, partial, source) {
    if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) return
    const prev = index.get(asin) ?? { asin, title: "", image: "", sources: [] }
    if (partial.title && (!prev.title || partial.title.length > prev.title.length)) {
      prev.title = partial.title
    }
    if (partial.image) prev.image = normalizeAmazonImageUrl(partial.image)
    if (!prev.sources.includes(source)) prev.sources.push(source)
    index.set(asin, prev)
  }

  for (const file of readdirSync(SCRIPTS)) {
    if (!file.endsWith(".json")) continue
    if (file === "asin-title-cache.json") continue
    const path = join(SCRIPTS, file)
    let data
    try {
      data = JSON.parse(readFileSync(path, "utf8"))
    } catch {
      continue
    }

    const items = []
    if (Array.isArray(data)) items.push(...data)
    else if (Array.isArray(data.monitors)) items.push(...data.monitors)
    else if (Array.isArray(data.items)) items.push(...data.items)
    else if (Array.isArray(data.products)) items.push(...data.products)
    else if (Array.isArray(data.entries)) items.push(...data.entries)
    else if (Array.isArray(data.gamingChairs)) items.push(...data.gamingChairs)
    else if (Array.isArray(data.keyboards)) items.push(...data.keyboards)

    for (const item of items) {
      const asin = item.asin ?? item.ASIN
      if (!asin) continue
      upsert(
        asin,
        {
          title: item.title ?? item.name ?? "",
          image: item.image ?? item.imageUrl ?? "",
        },
        file,
      )
    }
  }

  if (existsSync(CACHE_PATH)) {
    const cache = JSON.parse(readFileSync(CACHE_PATH, "utf8"))
    for (const [asin, meta] of Object.entries(cache)) {
      if (meta?.source === "live" && meta.title) {
        index.set(asin, {
          asin,
          title: meta.title,
          image: normalizeAmazonImageUrl(meta.image ?? ""),
          sources: ["asin-title-cache.json:live"],
        })
        continue
      }
      upsert(asin, { title: meta.title ?? "", image: meta.image ?? "" }, "asin-title-cache.json")
    }
  }

  return index
}

if (process.argv[1]?.endsWith("build-asin-meta-index.mjs")) {
  const index = buildAsinMetaIndex()
  console.log(`ASIN index: ${index.size} entries`)
  console.log(`With title: ${[...index.values()].filter((v) => v.title).length}`)
  console.log(`With image: ${[...index.values()].filter((v) => v.image).length}`)
}
