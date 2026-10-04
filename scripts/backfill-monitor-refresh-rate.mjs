/**
 * Backfill monitor refresh rate from local text + optional Amazon fetch.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { inferRefreshRate } from "./amazon-monitor-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const CACHE_PATH = join(__dirname, "monitor-refresh-rate-cache.json")
const DRY = process.argv.includes("--dry-run")
const FETCH = !process.argv.includes("--no-fetch")

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const MONITOR_FILES = readdirSync(LIB)
  .filter(
    (f) =>
      f.startsWith("monitor-") &&
      f.endsWith(".ts") &&
      !f.includes("arm") &&
      !f.includes("filter") &&
      !f.includes("detail") &&
      !f.includes("vesa"),
  )
  .map((f) => join(LIB, f))

const REFRESH_TAGS = ["refresh-60", "refresh-75", "refresh-100", "refresh-144-plus", "refresh-240-plus"]

function parseBlocks(source) {
  const blocks = []
  const re = /(\{\s*\n\s*id: "(mon-[^"]+)"[\s\S]*?\n  \},)/g
  let m
  while ((m = re.exec(source))) {
    const block = m[1]
    const id = m[2]
    const name = block.match(/name: "([^"]*)"/)?.[1] ?? ""
    const tagline = block.match(/tagline: "([^"]*)"/)?.[1] ?? ""
    const asin =
      block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})/)?.[1] ??
      null
    const hl =
      block.match(/\{\s*label: "リフレッシュ",\s*value: "([^"]*)"\s*\}/)?.[1] ?? "—"
    const spec =
      block.match(/\{\s*label: "リフレッシュレート",\s*value: "([^"]*)"\s*\}/)?.[1] ??
      "—"
    blocks.push({ id, block, name, tagline, asin, hl, spec })
  }
  return blocks
}

function parseHz(value) {
  if (!value || value === "—") return 0
  const m = value.match(/(\d{2,3})/)
  return m ? Number(m[1]) : 0
}

function formatRefresh(hz) {
  return `${hz}Hz`
}

function inferRefreshTags(hz) {
  const tags = []
  if (hz <= 60) tags.push("refresh-60")
  else if (hz === 75) tags.push("refresh-75")
  else if (hz < 144) tags.push("refresh-100")
  if (hz >= 144) tags.push("refresh-144-plus")
  if (hz >= 240) tags.push("refresh-240-plus")
  return tags
}

function fileContextDefault(filePath) {
  const base = filePath.split(/[/\\]/).pop() ?? ""
  if (/refresh144/.test(base)) return 144
  if (/search-22-120/.test(base)) return 120
  return 0
}

function defaultBusinessRefresh(block) {
  const hay = `${block.name} ${block.tagline}`.toLowerCase()
  if (
    /gaming|ゲーミング|legion|\b144\b|\b240\b|\b165\b|\b180\b|curved|湾曲|hz|y27|r27|y32|qf-|qc-/.test(
      hay,
    )
  ) {
    return 0
  }
  if (
    /thinkvision|thinkcentre|business|office|tiny-in-one|プロフェッショナル|液晶ディスプレイ|lcd display|led monitor|flat panel|wled lcd/.test(
      hay,
    )
  ) {
    return 60
  }
  return 0
}

function blockHaystack(block) {
  return block.block
    .replace(/image: "https:[^"]+"/g, "")
    .replace(/https:\/\/[^\s"]+/g, "")
    .replace(/\{\s*label: "リフレッシュ[^}]+\}/g, "")
    .replace(/\{\s*label: "リフレッシュレート[^}]+\}/g, "")
}

function localHaystack(block) {
  return [block.name, block.tagline, blockHaystack(block)].join(" ")
}

function needsPatch(block) {
  const stored = parseHz(block.hl !== "—" ? block.hl : block.spec)
  const inferredFromText = parseHz(inferRefreshRate(localHaystack(block)))
  const isMissing = block.hl === "—" && block.spec === "—"
  if (!isMissing) return null
  if (inferredFromText > 0) return { hz: inferredFromText, reason: "missing+local" }
  return { hz: 0, reason: "missing" }
}

function patchBlockRefresh(blockText, hz) {
  const formatted = formatRefresh(hz)
  let next = blockText
  next = next.replace(
    /\{\s*label: "リフレッシュ",\s*value: "[^"]*"\s*\}/g,
    `{ label: "リフレッシュ", value: "${formatted}" }`,
  )
  next = next.replace(
    /\{\s*label: "リフレッシュレート",\s*value: "[^"]*"\s*\}/g,
    `{ label: "リフレッシュレート", value: "${formatted}" }`,
  )

  const newRefreshTags = inferRefreshTags(hz)
  const tagRe = /monitorFilterTags: \[([^\]]*)\]/
  const m = next.match(tagRe)
  if (m) {
    const existing = m[1]
      .split(",")
      .map((s) => s.trim().replace(/"/g, ""))
      .filter(Boolean)
      .filter((t) => !REFRESH_TAGS.includes(t))
    const merged = [...existing, ...newRefreshTags]
    next = next.replace(tagRe, `monitorFilterTags: [${merged.map((t) => `"${t}"`).join(",")}]`)
  }

  return next
}

async function fetchAmazonHaystack(asin) {
  for (let i = 0; i < 2; i++) {
    try {
      const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 1200 * (i + 1)))
        continue
      }
      const html = await res.text()
      if (html.includes("productTitle") || html.includes("prodDetSectionEntry")) {
        return extractAmazonHaystack(html)
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1200 * (i + 1)))
    }
  }
  return null
}

function extractAmazonHaystack(html) {
  const title =
    html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/i)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ??
    html.slice(0, 500)
  const specChunk = html.match(/prodDetSectionEntry[\s\S]{0,80000}/i)?.[0] ?? ""
  return `${title} ${specChunk}`.slice(0, 100000)
}

let cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}

const patches = []

for (const file of MONITOR_FILES) {
  let source = readFileSync(file, "utf8")
  let changed = false

  for (const block of parseBlocks(source)) {
    let need = needsPatch(block)
    if (!need || need.hz === 0) {
      if (need?.reason === "missing" && block.asin && FETCH) {
        let hay = cache[block.asin]
        if (!hay) {
          hay = await fetchAmazonHaystack(block.asin)
          if (hay) {
            cache[block.asin] = hay
            writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
          }
          await new Promise((r) => setTimeout(r, 800))
        }
        if (hay) {
          const extracted = hay.includes("productTitle") ? extractAmazonHaystack(hay) : hay
          const hz = parseHz(inferRefreshRate(extracted))
          if (hz > 0) need = { hz, reason: "amazon" }
        }
      }
      if ((!need || need.hz === 0) && need?.reason === "missing") {
        const fallback = defaultBusinessRefresh(block) || fileContextDefault(file)
        if (fallback > 0) {
          need = {
            hz: fallback,
            reason: fallback === 60 ? "default-business-60" : "default-file-context",
          }
        }
      }
    }

    if (!need || need.hz === 0) continue

    const stored = parseHz(block.hl !== "—" ? block.hl : block.spec)
    if (stored === need.hz) continue

    const nextBlock = patchBlockRefresh(block.block, need.hz)
    if (nextBlock === block.block) continue

    source = source.replace(block.block, nextBlock)
    block.block = nextBlock
    changed = true
    patches.push({
      id: block.id,
      file: file.split(/[/\\]/).pop(),
      from: stored || "—",
      to: need.hz,
      reason: need.reason,
    })
  }

  if (changed && !DRY) writeFileSync(file, source)
}

console.log(`${DRY ? "[dry-run] " : ""}Patched ${patches.length} monitor(s)`)
for (const p of patches) {
  console.log(`${p.id} (${p.file}): ${p.from} → ${p.to}Hz [${p.reason}]`)
}
