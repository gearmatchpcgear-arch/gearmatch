/**
 * Fetch Amazon JP monitor body specs via Playwright (bypasses bot blocks on fetch()).
 *
 * Usage:
 *   node scripts/fetch-monitor-body-specs-playwright.mjs --weight-missing
 *   node scripts/fetch-monitor-body-specs-playwright.mjs --retry-failed
 *   node scripts/fetch-monitor-body-specs-playwright.mjs --limit=50
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { chromium } from "playwright"
import { parseAmazonMonitorBodySpecs, DASH } from "./amazon-monitor-body-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "monitor-body-specs-cache.json")

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

const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}

const weightMissing = process.argv.includes("--weight-missing")
const retryFailed = process.argv.includes("--retry-failed")
const limitArg = process.argv.find((a) => a.startsWith("--limit="))
const limit = limitArg ? Number(limitArg.split("=")[1]) : null

let asins = weightMissing ? collectMonitorAsinsMissingWeight() : Object.keys(cache).sort()
if (retryFailed) {
  asins = asins.filter((asin) => cache[asin]?.error === "fetch_failed")
}
if (limit && Number.isFinite(limit)) asins = asins.slice(0, limit)

console.log(`Playwright fetch: ${asins.length} ASINs`)

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  locale: "ja-JP",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
})
const page = await context.newPage()

let fetched = 0
let failed = 0
let withWeight = 0

for (const asin of asins) {
  process.stdout.write(`fetch ${asin}... `)
  await page.waitForTimeout(1500)
  try {
    const res = await page.goto(`https://www.amazon.co.jp/dp/${asin}`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    })
    if (!res?.ok()) {
      console.log("FAILED (http)")
      cache[asin] = {
        ...(cache[asin] ?? {}),
        asin,
        dimensions: cache[asin]?.dimensions ?? DASH,
        weight: cache[asin]?.weight ?? DASH,
        fetchedAt: new Date().toISOString(),
        error: "fetch_failed",
        source: "playwright",
      }
      failed++
      continue
    }
    const html = await page.content()
    if (!html.includes("productTitle") && !html.includes("prodDetSectionEntry")) {
      console.log("FAILED (blocked)")
      cache[asin] = {
        ...(cache[asin] ?? {}),
        asin,
        dimensions: cache[asin]?.dimensions ?? DASH,
        weight: cache[asin]?.weight ?? DASH,
        fetchedAt: new Date().toISOString(),
        error: "fetch_failed",
        source: "playwright",
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
        Object.keys(map).find((k) =>
          /^(商品の重量|商品重量|本体重量|重量|Item Weight|Product Weight)/i.test(k.trim()),
        ) ??
        prev.rawWeightKey ??
        null,
      fetchedAt: new Date().toISOString(),
      error: undefined,
      source: "playwright",
    }
    if (weight !== DASH) withWeight++
    console.log(`${dimensions} / ${weight}`)
    fetched++
  } catch (err) {
    console.log(`FAILED (${err.message?.slice(0, 40)})`)
    cache[asin] = {
      ...(cache[asin] ?? {}),
      asin,
      dimensions: cache[asin]?.dimensions ?? DASH,
      weight: cache[asin]?.weight ?? DASH,
      fetchedAt: new Date().toISOString(),
      error: "fetch_failed",
      source: "playwright",
    }
    failed++
  }

  if ((fetched + failed) % 25 === 0) {
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
await browser.close()
console.log(`Done. fetched=${fetched} failed=${failed} withWeight=${withWeight}`)
