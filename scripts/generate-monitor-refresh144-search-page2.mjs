/**
 * monitor-refresh144-search-page2-raw.json → lib/monitor-refresh144-search-page2.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { spawnSync } from "child_process"
import {
  extractAmazonMainImage,
  cacheAmazonImageFromHtml,
  normalizeAmazonImageUrl,
} from "./amazon-image.mjs"
import { normalizeImportedPrice, parseAmazonPrice } from "./amazon-price.mjs"
import {
  buildGadgetsFromRaw,
  writeMonitorTs,
} from "./monitor-new-releases-generate-lib.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const RAW_PATH = join(__dirname, "monitor-refresh144-search-page2-raw.json")
const CACHE_PATH = join(__dirname, "monitor-refresh144-search-page2-image-cache.json")
const OUT_PATH = join(ROOT, "lib", "monitor-refresh144-search-page2.ts")
const OVERRIDES_PATH = join(__dirname, "monitor-refresh144-search-page2-spec-overrides.json")

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const imageCache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}
const overrides = existsSync(OVERRIDES_PATH)
  ? JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"))
  : {}

async function fetchPage(asin, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await new Promise((r) => setTimeout(r, 900 * (i + 1)))
      const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
      if (!res.ok) continue
      const html = await res.text()
      if (html.includes("productTitle") || html.includes("prodDetSectionEntry")) return html
    } catch {
      /* retry */
    }
  }
  return null
}

async function enrichMonitors(monitors) {
  const enriched = []
  for (let i = 0; i < monitors.length; i++) {
    const item = { ...monitors[i] }
    const o = overrides[item.asin] ?? {}
    process.stdout.write(`[${i + 1}/${monitors.length}] ${item.asin} ... `)

    const html = await fetchPage(item.asin)
    if (html) {
      const pageTitle = html.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span>/)?.[1]
      if (pageTitle) item.title = pageTitle.replace(/<[^>]+>/g, "").trim()
      const livePrice = parseAmazonPrice(html)
      if (livePrice && o.price == null) item.price = livePrice
      cacheAmazonImageFromHtml(imageCache, item.asin, html)
      const fetchedImg = extractAmazonMainImage(html)
      if (fetchedImg) item.image = fetchedImg
    }

    item.image = normalizeAmazonImageUrl(item.image || o.image || "")
    item.price = normalizeImportedPrice(item.price, item.asin, overrides)
    enriched.push({ ...item, ...o })
    console.log(`${item.title.slice(0, 50)} | ¥${item.price ?? "?"}`)
  }
  writeFileSync(CACHE_PATH, JSON.stringify(imageCache, null, 2))
  return enriched
}

async function main() {
  if (!existsSync(RAW_PATH)) {
    console.error("Run import-monitor-refresh144-search-page2-browser-data.mjs first")
    process.exit(1)
  }

  const { monitors } = JSON.parse(readFileSync(RAW_PATH, "utf8"))
  const merged = await enrichMonitors(monitors)
  const entries = buildGadgetsFromRaw(merged, overrides, "mon-hfr144-p2")

  for (const entry of entries) {
    const listingGroup = entry.gadget.specGroups.find((g) => g.title === "ディスプレイ")
    const rankRow = listingGroup?.rows.find((r) => r.label === "Amazon検索")
    if (rankRow) {
      rankRow.value = `PCモニター #${entry.rank} (144–240Hz / 2ページ目)`
    } else if (listingGroup) {
      listingGroup.rows.push({
        label: "Amazon検索",
        value: `PCモニター #${entry.rank} (144–240Hz / 2ページ目)`,
      })
    }
  }

  writeMonitorTs(
    OUT_PATH,
    "monitorRefresh144SearchPage2",
    "/** Amazon.co.jp ディスプレイ検索 2ページ目（18.0～25.9インチ / 144–240Hz）。 */",
    entries,
    "Amazon検索",
  )

  spawnSync(process.execPath, [join(__dirname, "apply-monitor-body-specs.mjs")], {
    stdio: "inherit",
  })

  console.log(`Wrote ${OUT_PATH} (${entries.length} monitors)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
