/**
 * Sync monitorFilterTags refresh-* tags from stored refresh rate values.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")
const DRY = process.argv.includes("--dry-run")

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

function parseHz(value) {
  if (!value || value === "—") return 0
  const m = value.match(/(\d{2,3})/)
  return m ? Number(m[1]) : 0
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

function parseBlocks(source) {
  const blocks = []
  const re = /(\{\s*\n\s*id: "(mon-[^"]+)"[\s\S]*?\n  \},)/g
  let m
  while ((m = re.exec(source))) {
    blocks.push({ id: m[2], block: m[1] })
  }
  return blocks
}

function patchTags(blockText, hz) {
  const newTags = inferRefreshTags(hz)
  const tagRe = /monitorFilterTags: \[([^\]]*)\]/
  const m = blockText.match(tagRe)
  if (!m) return blockText
  const existing = m[1]
    .split(",")
    .map((s) => s.trim().replace(/"/g, ""))
    .filter(Boolean)
    .filter((t) => !REFRESH_TAGS.includes(t))
  const merged = [...existing, ...newTags]
  return blockText.replace(tagRe, `monitorFilterTags: [${merged.map((t) => `"${t}"`).join(",")}]`)
}

let count = 0
for (const file of MONITOR_FILES) {
  let source = readFileSync(file, "utf8")
  let changed = false
  for (const b of parseBlocks(source)) {
    const hl = b.block.match(/\{\s*label: "リフレッシュ",\s*value: "([^"]*)"\s*\}/)?.[1] ?? "—"
    const spec =
      b.block.match(/\{\s*label: "リフレッシュレート",\s*value: "([^"]*)"\s*\}/)?.[1] ?? "—"
    const hz = parseHz(hl !== "—" ? hl : spec)
    if (hz <= 0) continue
    const next = patchTags(b.block, hz)
    if (next !== b.block) {
      source = source.replace(b.block, next)
      b.block = next
      changed = true
      count++
    }
  }
  if (changed && !DRY) writeFileSync(file, source)
}
console.log(`${DRY ? "[dry-run] " : ""}Synced refresh tags on ${count} monitor(s)`)
