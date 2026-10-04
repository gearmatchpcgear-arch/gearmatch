/**
 * Scan lib keyboard sources for misleading case/cover titles on keyboard-body products.
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  isCaseOnlyKeyboardProduct,
  normalizeKeyboardBodyName,
} from "./keyboard-display-name.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const LIB = join(ROOT, "lib")

const KEYBOARD_FILES = readdirSync(LIB).filter(
  (f) => f.startsWith("keyboard") && f.endsWith(".ts"),
)

function parseBlocks(filePath) {
  const txt = readFileSync(filePath, "utf8")
  const blocks = txt.split(/\{\s*\n\s*id:/).slice(1)
  return blocks.map((block) => {
    const id = block.match(/^ "([^"]+)"/)?.[1]
    const name = block.match(/name:\s*"([^"]+)"/)?.[1]
    const tagline = block.match(/tagline:\s*"([^"]+)"/)?.[1]
    const asin = block.match(
      /purchaseUrl:\s*"https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/,
    )?.[1]
    return { id, name, tagline, asin }
  }).filter((g) => g.id && g.name)
}

const issues = []

for (const file of KEYBOARD_FILES) {
  for (const g of parseBlocks(join(LIB, file))) {
    const hay = g.tagline ?? ""
    if (isCaseOnlyKeyboardProduct(g.name, hay)) {
      issues.push({
        type: "case-only-product",
        file,
        ...g,
      })
      continue
    }

    if (!/キーボードケース|キーボードカバー|保護カバー/i.test(g.name)) continue

    const suggested = normalizeKeyboardBodyName(g.name, g.tagline ?? g.name, hay)
    if (!suggested || suggested === g.name) {
      issues.push({
        type: "unresolved-case-title",
        file,
        ...g,
        suggested,
      })
      continue
    }

    issues.push({
      type: "misleading-case-title",
      file,
      ...g,
      suggested,
    })
  }
}

console.log(`Scanned ${KEYBOARD_FILES.length} keyboard source files`)
console.log(`Issues found: ${issues.length}\n`)

for (const issue of issues) {
  console.log(`[${issue.type}] ${issue.file} ${issue.id} ${issue.asin ?? ""}`)
  console.log(`  name: ${JSON.stringify(issue.name)}`)
  if (issue.suggested) console.log(`  suggested: ${JSON.stringify(issue.suggested)}`)
}

process.exit(issues.length > 0 ? 1 : 0)
