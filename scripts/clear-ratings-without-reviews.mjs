/**
 * Clear placeholder star ratings when review count is unavailable (reviews: 0).
 * UI hides stars via hasDisplayReviews(); this keeps source data consistent.
 *
 * Usage: npx tsx scripts/clear-ratings-without-reviews.mjs [--apply]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LIB = path.join(__dirname, "..", "lib")
const APPLY = process.argv.includes("--apply")

function parseNumberField(block, field) {
  const m = block.match(new RegExp(`${field}: ([\\d.]+)`))
  return m ? Number(m[1]) : null
}

function replaceScalarField(block, field, value) {
  const re = new RegExp(`(${field}: )([\\d.]+)`, "m")
  if (!re.test(block)) return { block, changed: false }
  const next = block.replace(re, `$1${value}`)
  return { block: next, changed: next !== block }
}

let totalCleared = 0
const byFile = []

for (const file of fs.readdirSync(LIB)) {
  if (!file.endsWith(".ts")) continue
  const filePath = path.join(LIB, file)
  let src = fs.readFileSync(filePath, "utf8")
  if (!src.includes("reviews:")) continue

  const blockRe = /\{[\s\S]*?id: "([^"]+)"[\s\S]*?\n  \}(?:,|\n)/g
  let fileCleared = 0

  src = src.replace(blockRe, (block, id) => {
    const reviews = parseNumberField(block, "reviews")
    const rating = parseNumberField(block, "rating")
    if (reviews !== 0 || rating == null || rating <= 0) return block

    const { block: next, changed } = replaceScalarField(block, "rating", 0)
    if (changed) {
      fileCleared++
      totalCleared++
      if (!APPLY) {
        console.log(`  ${id} | ${file} | rating ${rating} -> 0 (reviews: 0)`)
      }
    }
    return next
  })

  if (fileCleared > 0) {
    byFile.push({ file, blocks: fileCleared })
    if (APPLY) fs.writeFileSync(filePath, src)
  }
}

console.log(APPLY ? "Applied" : "Dry run")
console.log(`Cleared placeholder ratings: ${totalCleared}`)
for (const { file, blocks } of byFile) {
  console.log(`  ${file}: ${blocks}`)
}
if (!APPLY && totalCleared > 0) {
  console.log("\nRe-run with --apply to patch files.")
}
