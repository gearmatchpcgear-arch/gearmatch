/**
 * Audit monitor refresh rate data (missing / inconsistent).
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

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

function inferMaxHz(text) {
  const rates = [...String(text).matchAll(/(\d{2,3})\s*hz/gi)].map((m) => Number(m[1]))
  if (rates.length === 0) {
    if (/mobile monitor|モバイル|ポータブル/i.test(text)) return 60
    return 0
  }
  return Math.max(...rates)
}

function parseStoredHz(value) {
  if (!value || value === "—") return 0
  const m = value.match(/(\d{2,3})/)
  return m ? Number(m[1]) : 0
}

const missing = []
const inconsistent = []

for (const file of MONITOR_FILES) {
  const source = readFileSync(file, "utf8")
  for (const b of parseBlocks(source)) {
    const hay = [b.name, b.tagline, b.block].join(" ")
    const inferred = inferMaxHz(hay)
    const stored = parseStoredHz(b.hl !== "—" ? b.hl : b.spec)
    const isMissing = b.hl === "—" && b.spec === "—"

    if (isMissing) {
      missing.push({
        id: b.id,
        name: b.name.slice(0, 50),
        file: file.split(/[/\\]/).pop(),
        inferred: inferred || null,
      })
    } else if (inferred > 0 && stored > 0 && stored !== inferred) {
      inconsistent.push({
        id: b.id,
        name: b.name.slice(0, 50),
        file: file.split(/[/\\]/).pop(),
        stored: b.hl !== "—" ? b.hl : b.spec,
        inferred,
      })
    }
  }
}

console.log(`Monitor files: ${MONITOR_FILES.length}`)
console.log(`Missing refresh: ${missing.length}`)
console.log(`Inconsistent refresh: ${inconsistent.length}`)
console.log("\nMissing (first 20):")
for (const row of missing.slice(0, 20)) console.log(row)
console.log("\nInconsistent (first 30):")
for (const row of inconsistent.slice(0, 30)) console.log(row)
