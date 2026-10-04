/**
 * Playwright で Amazon から最大リクライニング角度を取得 → gaming-chair-recline-cache.json
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { chromium } from "playwright"
import { parseDetailTable } from "./amazon-monitor-body-specs.mjs"
import { inferMaxRecliningAngle, DASH } from "./amazon-gaming-chair-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "gaming-chair-recline-cache.json")

function collectAsins() {
  const asins = new Map()
  for (const f of readdirSync(join(ROOT, "lib"))) {
    if (!f.startsWith("gaming-chair") || !f.endsWith(".ts")) continue
    const src = readFileSync(join(ROOT, "lib", f), "utf8")
    const blockRe = /(\{\s*\n\s*id: "chair-[^"]+"[\s\S]*?\n  \},)/g
    let m
    while ((m = blockRe.exec(src))) {
      const block = m[1]
      if (!block.includes('category: "gaming-chair"')) continue
      const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})/)?.[1]
      if (asin) asins.set(asin, block)
    }
  }
  return asins
}

function extractTitle(html) {
  return (
    html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/i)?.[1]?.replace(/<[^>]+>/g, " ").trim() ??
    ""
  )
}

const only = process.argv.slice(2)
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
const allAsins = collectAsins()
const targets = only.length ? only : [...allAsins.keys()].sort()

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  locale: "ja-JP",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
})
const page = await context.newPage()

let fetched = 0
let filled = 0

for (let i = 0; i < targets.length; i++) {
  const asin = targets[i]
  process.stdout.write(`[${i + 1}/${targets.length}] ${asin} `)
  try {
    await page.goto(`https://www.amazon.co.jp/dp/${asin}`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    })
    await page.waitForTimeout(1200)
    const html = await page.content()
    const overviewText = await page
      .evaluate(() => {
        const parts = []
        for (const sel of ["#productOverview_feature_div", "#feature-bullets", "#prodDetails"]) {
          const el = document.querySelector(sel)
          if (el?.innerText) parts.push(el.innerText)
        }
        return parts.join("\n")
      })
      .catch(() => "")
    const title = extractTitle(html)
    const detailMap = parseDetailTable(html)
    const angle = inferMaxRecliningAngle(
      `${title}\n${overviewText}\n${html.slice(0, 80000)}`,
      detailMap,
    )
    cache[asin] = {
      title: title.slice(0, 200),
      maxRecliningAngle: angle,
      fetchedAt: new Date().toISOString(),
      source: "playwright",
    }
    fetched++
    if (angle !== DASH) filled++
    console.log(angle, title.slice(0, 60))
  } catch (err) {
    cache[asin] = {
      error: String(err.message ?? err),
      fetchedAt: new Date().toISOString(),
      source: "playwright",
    }
    console.log("FAIL", err.message)
  }
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
  await page.waitForTimeout(900)
}

await browser.close()
console.log({ total: targets.length, fetched, filled, cached: Object.keys(cache).length })
