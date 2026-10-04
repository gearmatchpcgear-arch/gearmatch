/**
 * Fetch Amazon JP monitor body specs (寸法・重量) → monitor-body-specs-cache.json
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseAmazonMonitorBodySpecs, DASH } from "./amazon-monitor-body-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "monitor-body-specs-cache.json")
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

function collectMonitorAsins() {
  const asins = new Set()
  for (const file of readdirSync(join(ROOT, "lib"))) {
    if (!file.startsWith("monitor-") || !file.endsWith(".ts")) continue
    const src = readFileSync(join(ROOT, "lib", file), "utf8")
    for (const m of src.matchAll(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g)) {
      asins.add(m[1])
    }
  }
  const gadgetsSrc = readFileSync(join(ROOT, "lib", "gadgets.ts"), "utf8")
  for (const m of gadgetsSrc.matchAll(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g)) {
    asins.add(m[1])
  }
  return [...asins].sort()
}

function collectMonitorAsinsMissingWeight() {
  const asins = new Set()
  const blockRe =
    /id: "[^"]+"[\s\S]*?category: "monitor"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g

  for (const file of readdirSync(join(ROOT, "lib"))) {
    if (!file.endsWith(".ts")) continue
    const src = readFileSync(join(ROOT, "lib", file), "utf8")
    if (!src.includes('category: "monitor"')) continue
    let m
    while ((m = blockRe.exec(src))) {
      const block = m[0]
      const weights = [...block.matchAll(/label: "重量", value: "([^"]*)"/g)].map((x) => x[1])
      const isMissing =
        weights.length === 0 ||
        weights.every((v) => v === DASH || v === "-" || v === "" || v === "―")
      if (isMissing) asins.add(m[1])
    }
  }
  return [...asins].sort()
}

async function fetchPage(asin, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
        continue
      }
      const html = await res.text()
      if (html.includes("productTitle") || html.includes("prodDetSectionEntry")) return html
    } catch {
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
    }
  }
  return null
}

const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}
const refresh = process.argv.includes("--refresh")
const onlyMissing = process.argv.includes("--missing")
const weightMissing = process.argv.includes("--weight-missing")
const vesaOnly = process.argv.includes("--vesa-only")
const retryFailed = process.argv.includes("--retry-failed")
const limitArg = process.argv.find((a) => a.startsWith("--limit="))
const limit = limitArg ? Number(limitArg.split("=")[1]) : null

let asins = weightMissing ? collectMonitorAsinsMissingWeight() : collectMonitorAsins()
if (limit && Number.isFinite(limit)) asins = asins.slice(0, limit)

console.log(
  `Monitor ASINs: ${asins.length}, cached: ${Object.keys(cache).length}${vesaOnly ? " (vesa-only)" : ""}${weightMissing ? " (weight-missing)" : ""}`,
)

let fetched = 0
let failed = 0
let skipped = 0

for (const asin of asins) {
  const existing = cache[asin]
  if (!weightMissing) {
    if (retryFailed && existing?.error !== "fetch_failed") {
      skipped++
      continue
    }
    if (vesaOnly) {
      if (existing?.vesaStandard && existing.vesaStandard !== DASH) {
        skipped++
        continue
      }
    } else if (!refresh && existing?.fetchedAt && !existing?.error) {
      if (onlyMissing && existing.dimensions === DASH && existing.weight === DASH) {
        // re-fetch unknowns
      } else if (!onlyMissing) {
        skipped++
        continue
      }
    }
  }

  const isRetry = existing?.error === "fetch_failed"
  const delay = isRetry ? 3500 : 1200

  process.stdout.write(`fetch ${asin}... `)
  await new Promise((r) => setTimeout(r, delay))
  const html = await fetchPage(asin)
  if (!html) {
    console.log("FAILED")
    cache[asin] = {
      ...(cache[asin] ?? {}),
      asin,
      dimensions: cache[asin]?.dimensions ?? DASH,
      weight: cache[asin]?.weight ?? DASH,
      fetchedAt: new Date().toISOString(),
      error: "fetch_failed",
    }
    failed++
    continue
  }

  const { dimensions, weight, vesaStandard, map } = parseAmazonMonitorBodySpecs(html)
  const prev = cache[asin] ?? {}
  cache[asin] = {
    ...prev,
    asin,
    dimensions: dimensions !== DASH ? dimensions : prev.dimensions ?? DASH,
    weight: weight !== DASH ? weight : prev.weight ?? DASH,
    vesaStandard:
      vesaStandard !== DASH ? vesaStandard : prev.vesaStandard ?? DASH,
    rawDimKey:
      Object.keys(map).find((k) => /寸法|dimensions/i.test(k)) ?? prev.rawDimKey ?? null,
    rawWeightKey:
      Object.keys(map).find((k) => /^(商品の重量|商品重量|本体重量|重量|Item Weight|Product Weight)/i.test(k.trim())) ??
      prev.rawWeightKey ??
      null,
    rawVesaKey:
      Object.keys(map).find((k) => /vesa|壁掛け/i.test(k)) ?? prev.rawVesaKey ?? null,
    fetchedAt: new Date().toISOString(),
    error: undefined,
  }
  console.log(`${dimensions} / ${weight} / ${vesaStandard}`)
  fetched++

  if (fetched % 20 === 0) {
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
console.log(`Done. fetched=${fetched} failed=${failed} skipped=${skipped}`)
