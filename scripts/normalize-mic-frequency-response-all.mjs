/**
 * Normalize all stored 周波数特性 values in lib/*.ts to unified format (e.g. 20Hz-17kHz).
 * Usage: npx tsx scripts/normalize-mic-frequency-response-all.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { normalizeMicFrequencyResponseDisplay } from "../lib/mic-frequency-display.ts"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const DASH = "—"
const FREQ_RE = /(\{ label: "周波数特性", value: ")([^"]*)(" \})/g

function normalizeStored(value) {
  if (!value || value === DASH || value === "-") return value
  const next = normalizeMicFrequencyResponseDisplay(value)
  return next || value
}

function applyToSource(src) {
  let replacements = 0
  const out = src.replace(FREQ_RE, (match, p1, value, p3) => {
    const next = normalizeStored(value)
    if (next === value) return match
    replacements++
    return `${p1}${next.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}${p3}`
  })
  return { src: out, replacements }
}

let total = 0
for (const file of fs.readdirSync(path.join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const filePath = path.join(ROOT, "lib", file)
  const src = fs.readFileSync(filePath, "utf8")
  if (!src.includes('label: "周波数特性"')) continue
  const { src: next, replacements } = applyToSource(src)
  if (replacements > 0) {
    fs.writeFileSync(filePath, next)
    console.log(`${file}: ${replacements} values normalized`)
    total += replacements
  }
}

console.log(`Total replacements: ${total}`)
