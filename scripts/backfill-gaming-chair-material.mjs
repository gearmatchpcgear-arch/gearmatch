/**
 * Backfill gaming chair upholstery material (素材) from local text + Amazon specs.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseDetailTable } from "./amazon-monitor-body-specs.mjs"
import {
  DASH,
  extractAmazonChairSpecHaystack,
  inferUpholsteryMaterial,
  inferUpholsteryMaterialFromDetailMap,
} from "./amazon-gaming-chair-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const CACHE_PATH = join(__dirname, "gaming-chair-material-cache.json")
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const CHAIR_FILES = readdirSync(LIB)
  .filter((f) => f.startsWith("gaming-chair") && f.endsWith(".ts"))
  .map((f) => join(LIB, f))

const MATERIAL_TAG = {
  "PUレザー": "mat-pu",
  メッシュ: "mat-mesh",
  ファブリック: "mat-fabric",
  本革: "mat-leather",
}

function parseBlocks(source) {
  const blocks = []
  const re = /(\{\s*\n\s*id: "(chair-[^"]+)"[\s\S]*?\n  \},)/g
  let m
  while ((m = re.exec(source))) {
    const block = m[1]
    const id = m[2]
    const name = block.match(/name: "([^"]*)"/)?.[1] ?? ""
    const brand = block.match(/brand: "([^"]*)"/)?.[1] ?? ""
    const tagline = block.match(/tagline: "([^"]*)"/)?.[1] ?? ""
    const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})/)?.[1] ?? null
    const hl = block.match(/\{\s*label: "素材",\s*value: "([^"]*)"\s*\}/)?.[1] ?? "?"
    blocks.push({ id, block, name, brand, tagline, asin, material: hl })
  }
  return blocks
}

function localHaystack(block) {
  return [block.name, block.tagline, block.brand].join(" ")
}

async function fetchPage(asin) {
  for (let i = 0; i < 2; i++) {
    try {
      const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 1500 * (i + 1)))
        continue
      }
      const html = await res.text()
      if (html.includes("productTitle") || html.includes("prodDetSectionEntry")) return html
    } catch {
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)))
    }
  }
  return null
}

function patchBlockMaterial(blockText, material) {
  let next = blockText.replace(/\{\s*label: "素材",\s*value: "[^"]*"\s*\}/g, `{ label: "素材", value: "${material}" }`)
  const tag = MATERIAL_TAG[material]
  if (tag) {
    const tagRe = /gamingChairFilterTags: \[([^\]]*)\]/
    const m = next.match(tagRe)
    if (m) {
      const existing = m[1]
        .split(",")
        .map((s) => s.trim().replace(/"/g, ""))
        .filter(Boolean)
      if (!existing.includes(tag)) {
        const merged = [...existing.filter((t) => !t.startsWith("mat-")), tag]
        next = next.replace(tagRe, `gamingChairFilterTags: [${merged.map((t) => `"${t}"`).join(", ")}]`)
      }
    } else {
      next = next.replace(/(category: "gaming-chair",\n)/, `$1    gamingChairFilterTags: ["${tag}"],\n`)
    }
  }
  return next
}

const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
const resolved = new Map()
let localHits = 0
let amazonHits = 0
let stillDash = 0

const allNeeds = []
const reclassify = []
for (const file of CHAIR_FILES) {
  const source = readFileSync(file, "utf8")
  for (const b of parseBlocks(source)) {
    const inferred = inferUpholsteryMaterial(localHaystack(b))
    if (b.material === "—" || b.material === "-") {
      allNeeds.push({ ...b, file })
      continue
    }
    if (b.material === "ファブリック" && inferred === "メッシュ") {
      reclassify.push({ ...b, file, inferred })
    }
  }
}

console.log(`Missing material: ${allNeeds.length} blocks`)
console.log(`Reclassify fabric->mesh: ${reclassify.length} blocks`)

for (const item of allNeeds) {
  const fromLocal = inferUpholsteryMaterial(localHaystack(item))
  if (fromLocal !== DASH) {
    resolved.set(`${item.file}::${item.id}`, fromLocal)
    localHits++
    continue
  }

  if (item.asin && cache[item.asin]?.material && cache[item.asin].material !== DASH) {
    resolved.set(`${item.file}::${item.id}`, cache[item.asin].material)
    amazonHits++
    continue
  }
}

const needAmazon = allNeeds.filter((item) => {
  const key = `${item.file}::${item.id}`
  if (resolved.has(key)) return false
  return Boolean(item.asin)
})

console.log(`Fetching Amazon for ${needAmazon.length} ASINs...`)

for (const item of needAmazon) {
  const { asin } = item
  if (cache[asin]?.material && cache[asin].material !== DASH) {
    resolved.set(`${item.file}::${item.id}`, cache[asin].material)
    amazonHits++
    continue
  }

  const html = await fetchPage(asin)
  let material = DASH
  if (html) {
    const detailMap = parseDetailTable(html)
    material = inferUpholsteryMaterialFromDetailMap(detailMap)
    if (material === DASH) {
      material = inferUpholsteryMaterial(extractAmazonChairSpecHaystack(html))
    }
  }
  cache[asin] = { material, fetchedAt: new Date().toISOString() }
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
  if (material !== DASH) {
    resolved.set(`${item.file}::${item.id}`, material)
    amazonHits++
  }
  await new Promise((r) => setTimeout(r, 1100))
}

for (const item of allNeeds) {
  const key = `${item.file}::${item.id}`
  if (!resolved.has(key)) stillDash++
}

for (const item of reclassify) {
  resolved.set(`${item.file}::${item.id}`, item.inferred)
}

console.log({ localHits, amazonHits, stillDash, patched: resolved.size })

const blockIndex = new Map()
for (const file of CHAIR_FILES) {
  for (const b of parseBlocks(readFileSync(file, "utf8"))) {
    blockIndex.set(`${file}::${b.id}`, { ...b, file })
  }
}

const filePatches = new Map()
for (const [key, material] of resolved) {
  const item = blockIndex.get(key)
  if (!item) continue
  const patched = patchBlockMaterial(item.block, material)
  if (!filePatches.has(item.file)) filePatches.set(item.file, [])
  filePatches.get(item.file).push({ old: item.block, new: patched, id: item.id, material })
}

for (const [file, patches] of filePatches) {
  let source = readFileSync(file, "utf8")
  for (const p of patches) {
    if (!source.includes(p.old)) {
      console.warn("skip (block not found):", p.id)
      continue
    }
    source = source.replace(p.old, p.new)
    console.log("patched", p.id, "->", p.material)
  }
  writeFileSync(file, source, "utf8")
}

console.log("done")
