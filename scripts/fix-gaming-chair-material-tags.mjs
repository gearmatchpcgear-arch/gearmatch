/**
 * gamingChairFilterTags の素材タグ（mat-*）を CSV/素材フィールドに合わせて修正
 *
 * npx tsx scripts/fix-gaming-chair-material-tags.mjs           # dry-run
 * npx tsx scripts/fix-gaming-chair-material-tags.mjs --apply
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  filterGadgetsByCategory,
  gadgets,
  getListableGadgets,
} from "../lib/gadgets.ts"
import {
  GAMING_CHAIR_MATERIAL_FILTER_TAGS,
  getCanonicalGamingChairMaterialTag,
} from "../lib/gaming-chair-filter-tags.ts"
import { parseGadgetBlocks } from "./used-refurbished-lib.mjs"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const libDir = path.join(root, "lib")
const apply = process.argv.includes("--apply")
const MAT_TAGS = new Set(GAMING_CHAIR_MATERIAL_FILTER_TAGS)

const chairs = filterGadgetsByCategory(getListableGadgets(gadgets, false), "gaming-chair")
const canonicalById = new Map(
  chairs.map((g) => [g.id, getCanonicalGamingChairMaterialTag(g)]),
)

function formatFilterTagsArray(tags) {
  if (tags.length === 0) return null
  return `gamingChairFilterTags: [${tags.map((t) => `"${t}"`).join(", ")}],`
}

function patchBlock(block, id) {
  const canonical = canonicalById.get(id)
  const tagLine = block.match(/^\s*gamingChairFilterTags:\s*\[([^\]]*)\],?\s*$/m)
  if (!tagLine) {
    if (!canonical) return block
    const insertAfter = block.match(/\n(\s*)category:\s*"gaming-chair",\n/)
    if (!insertAfter) return block
    const indent = insertAfter[1]
    return block.replace(
      insertAfter[0],
      `${insertAfter[0]}${indent}gamingChairFilterTags: ["${canonical}"],\n`,
    )
  }

  const inner = tagLine[1]
  const existing = [...inner.matchAll(/"([^"]+)"/g)].map((m) => m[1])
  const nonMaterial = existing.filter((t) => !MAT_TAGS.has(t))
  const nextTags = canonical ? [...nonMaterial, canonical] : nonMaterial
  const unique = [...new Set(nextTags)]

  if (unique.length === 0) {
    return block.replace(/^\s*gamingChairFilterTags:\s*\[[^\]]*\],?\s*\n/m, "")
  }

  const replacement = formatFilterTagsArray(unique)
  return block.replace(/^\s*gamingChairFilterTags:\s*\[[^\]]*\],?\s*$/m, `    ${replacement}`)
}

let changedBlocks = 0

for (const file of fs
  .readdirSync(libDir)
  .filter(
    (name) =>
      name.endsWith(".ts") &&
      (name.startsWith("gaming-chair") || name === "gaming-chairs.ts"),
  )) {
  const filePath = path.join(libDir, file)
  let source = fs.readFileSync(filePath, "utf8")
  const blocks = parseGadgetBlocks(source)
  const patches = []

  for (const block of blocks) {
    if (!/category:\s*"gaming-chair"/.test(block.text)) continue
    const id = block.text.match(/id:\s*"(chair-[^"]+)"/)?.[1]
    if (!id || !canonicalById.has(id)) continue
    const patched = patchBlock(block.text, id)
    if (patched !== block.text) {
      patches.push({ start: block.start, end: block.end, patched })
      changedBlocks++
      console.log(`${file}: ${id} -> ${canonicalById.get(id) ?? "(no material tag)"}`)
    }
  }

  if (patches.length === 0) continue
  if (apply) {
    let next = source
    for (const p of patches.sort((a, b) => b.start - a.start)) {
      next = next.slice(0, p.start) + p.patched + next.slice(p.end)
    }
    fs.writeFileSync(filePath, next, "utf8")
  }
}

console.log(`${apply ? "Updated" : "Would update"} ${changedBlocks} block(s)`)
if (!apply && changedBlocks > 0) {
  console.log("Re-run with --apply to write files")
}
