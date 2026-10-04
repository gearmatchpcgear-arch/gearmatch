/**
 * Resolve ASINs for bestseller gap ranks via Amazon search (model number).
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

async function fetchText(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) {
      console.warn(`HTTP ${res.status} for ${url}`)
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
      continue
    }
    const html = await res.text()
    if (html.includes("/dp/") || html.includes("data-asin")) return html
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
  }
  return null
}

function findAsin(html, hints = []) {
  const asins = [
    ...new Set(
      [...html.matchAll(/\/dp\/([A-Z0-9]{10})/gi)].map((m) => m[1].toUpperCase()),
    ),
  ]
  for (const hint of hints) {
    const re = new RegExp(hint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    for (const asin of asins) {
      const block = html.split(`/dp/${asin}`)[1]?.slice(0, 2000) ?? ""
      if (re.test(block)) return asin
    }
  }
  return asins[0] ?? null
}

const gaps = JSON.parse(
  readFileSync(join(ROOT, "scripts", "bestseller-gaps.json"), "utf8"),
)
const existing = JSON.parse(
  readFileSync(join(ROOT, "scripts", "bestseller-gap-asins.json"), "utf8"),
)

const map = { ...existing }
for (const gap of gaps) {
  const key = String(gap.rank)
  if (map[key] && !map[key].includes("Y8Y8")) {
    console.log(`rank ${gap.rank}: keep ${map[key]}`)
    continue
  }
  console.log(`rank ${gap.rank}: search "${gap.search}"`)
  const html = await fetchText(
    `https://www.amazon.co.jp/s?k=${encodeURIComponent(gap.search)}`,
  )
  if (!html) {
    console.warn(`  failed`)
    continue
  }
  const hints = gap.search.split(/\s+/).filter((w) => w.length >= 4)
  const asin = findAsin(html, hints)
  if (asin) {
    map[key] = asin
    console.log(`  -> ${asin}`)
  } else {
    console.warn(`  no ASIN`)
  }
  await new Promise((r) => setTimeout(r, 1500))
}

writeFileSync(
  join(ROOT, "scripts", "bestseller-gap-asins.json"),
  JSON.stringify(map, null, 2) + "\n",
)
console.log("done", Object.keys(map).length)
