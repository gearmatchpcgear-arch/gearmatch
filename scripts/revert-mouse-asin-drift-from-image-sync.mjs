/**
 * Revert purchaseUrl ASIN changes made by fix-gadget-link-image-live image sync.
 * Keeps image-only updates where ASIN was unchanged.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const REPORT = join(__dirname, "gadget-link-image-live-fix-report.json")

const report = JSON.parse(readFileSync(REPORT, "utf8"))
const asinReverts = report.fixList.filter((f) => f.oldAsin !== f.newAsin)

const fileChanges = new Map()

for (const fix of asinReverts) {
  const filePath = join(LIB, fix.file)
  let src = fileChanges.get(filePath) ?? readFileSync(filePath, "utf8")
  const blockRe = new RegExp(
    `(\\{\\s*\\n\\s*id: "${fix.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]*?\\n  \\},)`,
  )
  const match = src.match(blockRe)
  if (!match) {
    console.warn(`Block not found: ${fix.file} ${fix.id}`)
    continue
  }
  let block = match[1]
  block = block.replace(
    /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/[A-Z0-9]{10}"/,
    `purchaseUrl: "https://www.amazon.co.jp/dp/${fix.oldAsin}"`,
  )
  block = block.replace(/image: "[^"]*"/, `image: "${fix.oldImage}"`)
  src = src.replace(match[1], block)
  fileChanges.set(filePath, src)
  console.log(`Reverted ${fix.id}: ${fix.newAsin} -> ${fix.oldAsin}`)
}

for (const [filePath, content] of fileChanges) {
  writeFileSync(filePath, content)
}

console.log(`Reverted ${asinReverts.length} ASIN drifts in ${fileChanges.size} files`)
