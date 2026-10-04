/**
 * Apply inferred micFeatureTags to all mic gadget blocks in lib/*.ts
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { inferMicFeatureTags } from "./mic-feature-tags-infer.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

function parseGadgetBlock(block) {
  const id = block.match(/id: "([^"]+)"/)?.[1]
  const category = block.match(/category: "([^"]+)"/)?.[1]
  const name = block.match(/name: "([^"]*)"/)?.[1]
  const brand = block.match(/brand: "([^"]*)"/)?.[1]
  const tagline = block.match(/tagline:\s*\n?\s*"([^"]*)"/)?.[1] ?? block.match(/tagline: "([^"]*)"/)?.[1] ?? ""
  const connection = block.match(/connection: "([^"]*)"/)?.[1] ?? ""
  const purchaseUrl = block.match(/purchaseUrl: "([^"]+)"/)?.[1] ?? ""
  const micFilterTagsRaw = block.match(/micFilterTags: \[([^\]]*)\]/)?.[1] ?? ""
  const micFilterTags = [...micFilterTagsRaw.matchAll(/"([^"]+)"/g)].map((m) => m[1])
  const micUseTagsRaw = block.match(/micUseTags: \[([^\]]*)\]/)?.[1] ?? ""
  const micUseTags = [...micUseTagsRaw.matchAll(/"([^"]+)"/g)].map((m) => m[1])

  const highlights = []
  const hlBlock = block.match(/highlights: \[([\s\S]*?)\]/)?.[1] ?? ""
  for (const m of hlBlock.matchAll(/label: "([^"]+)", value: "([^"]*)"/g)) {
    highlights.push({ label: m[1], value: m[2] })
  }

  const specGroups = []
  for (const group of block.matchAll(/title: "([^"]+)"[\s\S]*?rows: \[([\s\S]*?)\]/g)) {
    const rows = []
    for (const m of group[2].matchAll(/label: "([^"]+)", value: "([^"]*)"/g)) {
      rows.push({ label: m[1], value: m[2] })
    }
    specGroups.push({ title: group[1], rows })
  }

  return {
    id,
    category,
    name,
    brand,
    tagline,
    connection,
    purchaseUrl,
    micFilterTags,
    micUseTags,
    highlights,
    specGroups,
    compat: [],
  }
}

function formatMicFeatureTags(tags) {
  if (tags.length === 0) return "    micFeatureTags: [],"
  const items = tags.map((t) => `"${t}"`).join(", ")
  return `    micFeatureTags: [${items}],`
}

function applyToSource(src) {
  let updated = 0
  const blockRe =
    /\{[\s\S]*?category: "mic"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/[A-Z0-9]{10}"[\s\S]*?\n  \}(?:,|\n)/g

  const out = src.replace(blockRe, (block) => {
    const gadget = parseGadgetBlock(block)
    if (!gadget.category) return block

    const tags = inferMicFeatureTags(gadget)
    const formatted = formatMicFeatureTags(tags)

    let next = block
    if (/micFeatureTags:/.test(block)) {
      next = block.replace(/micFeatureTags: \[[^\]]*\],?\n?/, `${formatted}\n`)
    } else if (/micUseTags:/.test(block)) {
      next = block.replace(/(micUseTags: \[[^\]]*\],?\n)/, `$1${formatted}\n`)
    } else if (/micFilterTags:/.test(block)) {
      next = block.replace(/(micFilterTags: \[[^\]]*\],?\n)/, `$1${formatted}\n`)
    } else if (/connection:/.test(block)) {
      next = block.replace(/(connection: "[^"]*",\n)/, `$1${formatted}\n`)
    } else {
      return block
    }

    if (next !== block) updated++
    return next
  })

  return { src: out, updated }
}

let total = 0
for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const path = join(ROOT, "lib", file)
  const src = readFileSync(path, "utf8")
  if (!src.includes('category: "mic"')) continue
  const { src: next, updated } = applyToSource(src)
  if (updated > 0) {
    writeFileSync(path, next)
    console.log(`${file}: ${updated} blocks`)
    total += updated
  }
}

console.log(`Total: ${total} mic blocks updated`)
