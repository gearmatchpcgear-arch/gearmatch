/**
 * Verify all keyboard gadgets expose the 4 standard card specs.
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { pathToFileURL } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

async function loadGadgetsFromFile(filePath) {
  const mod = await import(pathToFileURL(filePath).href)
  const key = Object.keys(mod).find((k) => Array.isArray(mod[k]))
  return mod[key] ?? []
}

const STANDARD = ["レイアウト", "内部構造", "キーキャップ", "電源"]
const { getCardHighlights } = await import(
  pathToFileURL(join(ROOT, "lib", "gadgets.ts")).href
)

let total = 0
const issues = []

for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.startsWith("keyboard") || !file.endsWith(".ts")) continue
  const gadgets = await loadGadgetsFromFile(join(ROOT, "lib", file))
  for (const gadget of gadgets) {
    total++
    const highlights = getCardHighlights(gadget)
    const labels = highlights.map((h) => h.label)
    if (labels.join("|") !== STANDARD.join("|")) {
      issues.push({ file, id: gadget.id, labels })
    }
    for (const label of STANDARD) {
      const row = highlights.find((h) => h.label === label)
      if (!row || row.value == null || row.value === "") {
        issues.push({ file, id: gadget.id, label, problem: "missing value" })
      }
    }
  }
}

console.log(`Checked ${total} keyboard gadgets`)
console.log(`Issues: ${issues.length}`)
for (const issue of issues.slice(0, 20)) {
  console.log(issue)
}

process.exit(issues.length > 0 ? 1 : 0)
