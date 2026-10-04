/** Quick audit: missing button counts vs recoverable from title text. */
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { extractButtonCountFromText } from "./amazon-mouse-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

function parseGadgetBlocks(content) {
  const blocks = []
  const re = /\{\s*\n\s*id:\s*"([^"]+)"[\s\S]*?\n\s*\},?\n(?=\s*\{|\s*\])/g
  let m
  while ((m = re.exec(content)) !== null) {
    const block = m[0]
    const id = m[1]
    const name = block.match(/name:\s*"((?:\\.|[^"\\])*)"/)?.[1]?.replace(/\\"/g, '"') ?? ""
    const tagline =
      block.match(/tagline:\s*"((?:\\.|[^"\\])*)"/)?.[1]?.replace(/\\"/g, '"') ?? ""
    const category = block.match(/category:\s*"([^"]+)"/)?.[1] ?? ""
    const specGroupsRaw = block.match(/specGroups:\s*(\[[\s\S]*?\]),\s*\n\s*(?:mouseFilterTags|compat)/)
    if (category !== "mouse" || !specGroupsRaw) continue
    let specGroups
    try {
      specGroups = JSON.parse(specGroupsRaw[1])
    } catch {
      continue
    }
    blocks.push({ id, name, tagline, specGroups })
  }
  return blocks
}

function hasButtonCount(gadget) {
  const sensorGroup = gadget.specGroups?.find((g) => /センサー|入力/i.test(g.title))
  const row = sensorGroup?.rows.find((r) => r.label === "ボタン数")
  const raw = row?.value?.trim()
  return raw && raw !== "—" && raw !== "-" && raw !== "未設定"
}

const content = readFileSync(join(ROOT, "lib", "mouse-popular-brands.ts"), "utf8")
const blocks = parseGadgetBlocks(content)
const missing = []
const recoverable = []

for (const b of blocks) {
  if (hasButtonCount(b)) continue
  const count = extractButtonCountFromText(`${b.name} ${b.tagline}`)
  if (count) recoverable.push({ id: b.id, name: b.name.slice(0, 70), count })
  else missing.push({ id: b.id, name: b.name.slice(0, 70) })
}

console.log(`Total mice: ${blocks.length}`)
console.log(`With button count: ${blocks.length - missing.length - recoverable.length}`)
console.log(`Missing (no text hint): ${missing.length}`)
console.log(`Recoverable but still missing: ${recoverable.length}`)
if (recoverable.length) {
  console.log("\nRecoverable samples:")
  for (const r of recoverable.slice(0, 15)) console.log(`  ${r.id}: ${r.count} ← ${r.name}`)
}
