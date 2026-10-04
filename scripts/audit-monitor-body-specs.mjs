/**
 * Audit monitor gadgets missing 寸法 / 重量 in specGroups.
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const DASH = "—"
const MISSING = new Set([DASH, "-", "未設定", "", null, undefined])

function extractGadgetBlocks(src) {
  const blocks = []
  const re = /\{\s*\n\s*id: "([^"]+)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?\n  \},/g
  let m
  while ((m = re.exec(src)) !== null) {
    blocks.push({ id: m[1], asin: m[2], block: m[0] })
  }
  return blocks
}

function hasSpec(block, label) {
  const re = new RegExp(`\\{ label: "${label}", value: "([^"]*)" \\}`)
  const m = block.match(re)
  if (!m) return false
  return !MISSING.has(m[1])
}

function collectMonitorFiles() {
  return readdirSync(join(ROOT, "lib"))
    .filter((f) => f.startsWith("monitor-") && f.endsWith(".ts"))
    .map((f) => join(ROOT, "lib", f))
}

const byAsin = new Map()
for (const file of collectMonitorFiles()) {
  const src = readFileSync(file, "utf8")
  for (const g of extractGadgetBlocks(src)) {
    if (!g.block.includes('category: "monitor"')) continue
    byAsin.set(g.asin, {
      ...g,
      file: file.replace(/\\/g, "/").split("/lib/")[1],
      hasDim: hasSpec(g.block, "寸法"),
      hasWeight: hasSpec(g.block, "重量"),
    })
  }
}

let missDim = 0
let missWeight = 0
let missBoth = 0
for (const g of byAsin.values()) {
  if (!g.hasDim) missDim++
  if (!g.hasWeight) missWeight++
  if (!g.hasDim && !g.hasWeight) missBoth++
}

console.log(`Unique monitor ASINs: ${byAsin.size}`)
console.log(`Missing 寸法: ${missDim}`)
console.log(`Missing 重量: ${missWeight}`)
console.log(`Missing both: ${missBoth}`)

if (process.argv.includes("--list")) {
  for (const g of [...byAsin.values()].filter((x) => !x.hasDim || !x.hasWeight)) {
    console.log(`${g.asin} dim=${g.hasDim ? "ok" : "—"} wt=${g.hasWeight ? "ok" : "—"} ${g.id} (${g.file})`)
  }
}
