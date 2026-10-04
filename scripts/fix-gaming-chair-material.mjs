/**
 * Set explicit PUレザー on gaming chairs that had material "—" but leather-ish titles.
 */
import fs from "node:fs"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const FILES = [
  "lib/gaming-chairs.ts",
  "lib/gaming-chair-search.ts",
  "lib/gaming-chair-search-page3.ts",
  "lib/gaming-chair-search-page4.ts",
  "lib/gaming-chair-new-releases.ts",
  "lib/gaming-chair-akracing-store.ts",
]

const TARGET_IDS = new Set([
  "chair-bs-055",
  "chair-bs-056",
  "chair-sr-053",
  "chair-sr-060",
  "chair-sr3-098",
  "chair-sr4-098",
])

const MATERIAL = "PUレザー"
const TAGLINE_RE = /tagline: "リクライニング・オットマン付き"/g
const TAGLINE_NEW = 'tagline: "PUレザー・リクライニング・オットマン付き"'

function patchBlock(block) {
  let next = block
  next = next.replace(/\{\s*label:\s*"素材",\s*value:\s*"—"\s*\}/g, `{ label: "素材", value: "${MATERIAL}" }`)
  if (TAGLINE_RE.test(block)) {
    next = next.replace(TAGLINE_RE, TAGLINE_NEW)
  }
  return next
}

let totalBlocks = 0

for (const rel of FILES) {
  const file = path.join(ROOT, rel)
  let source = fs.readFileSync(file, "utf8")
  let changed = false

  const idRe = /id:\s*"(chair-[^"]+)"/g
  let m
  const patches = []

  while ((m = idRe.exec(source))) {
    const id = m[1]
    if (!TARGET_IDS.has(id)) continue
    const start = m.index
    const end = source.indexOf("\n  },", start)
    if (end === -1) continue
    const blockEnd = end + "\n  },".length
    const block = source.slice(start, blockEnd)
    const patched = patchBlock(block)
    if (patched !== block) {
      patches.push({ start, end: blockEnd, patched })
    }
  }

  for (const p of patches.reverse()) {
    source = source.slice(0, p.start) + p.patched + source.slice(p.end)
    changed = true
    totalBlocks++
  }

  if (changed) {
    fs.writeFileSync(file, source, "utf8")
    console.log("updated", rel, patches.length, "blocks")
  }
}

console.log("done:", totalBlocks, "blocks")
