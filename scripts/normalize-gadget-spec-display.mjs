/**
 * Bulk-normalize spec display values in lib/*.ts gadget data files.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  normalizeMicConnectionDisplay,
  normalizeSpecValueByLabel,
} from "./spec-display-normalize.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "lib")

function replaceLabeledValues(src, category) {
  let changed = 0
  const out = src.replace(/(\{ label: "([^"]+)", value: ")([^"]*)(" \})/g, (_full, p1, label, value, p4) => {
    const next = normalizeSpecValueByLabel(value, label, category)
    if (next !== value) changed++
    return `${p1}${next}${p4}`
  })
  return { out, changed }
}

function replaceConnectionField(src, category) {
  if (category !== "mic") return { out: src, changed: 0 }
  let changed = 0
  const out = src.replace(/(connection: ")([^"]*)(")/g, (_full, p1, value, p3) => {
    const next = normalizeMicConnectionDisplay(value)
    if (next !== value) changed++
    return `${p1}${next}${p3}`
  })
  return { out, changed }
}

function normalizeBlock(block, category) {
  let changed = 0
  const r1 = replaceLabeledValues(block, category)
  let next = r1.out
  changed += r1.changed
  const r2 = replaceConnectionField(next, category)
  next = r2.out
  changed += r2.changed
  return { block: next, changed }
}

let totalFiles = 0
let totalChanges = 0

const blockRe =
  /\{[\s\S]*?category: "([^"]+)"[\s\S]*?\n  \}(?:,|\n)/g

for (const file of readdirSync(ROOT)) {
  if (!file.endsWith(".ts")) continue
  const path = join(ROOT, file)
  const src = readFileSync(path, "utf8")
  if (!src.includes('category: "')) continue

  let fileChanges = 0
  const out = src.replace(blockRe, (block, category) => {
    const { block: next, changed } = normalizeBlock(block, category)
    fileChanges += changed
    return next
  })

  if (out !== src) {
    writeFileSync(path, out)
    totalFiles++
    totalChanges += fileChanges
    console.log(`${file}: ${fileChanges} replacements`)
  }
}

console.log(`Done. ${totalFiles} files, ${totalChanges} replacements.`)
