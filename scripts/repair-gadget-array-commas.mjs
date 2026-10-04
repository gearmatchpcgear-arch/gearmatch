/**
 * Repair comma separators between gadget objects after purge deletions.
 * Fixes `}{` patterns left when a block was removed.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const libDir = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), "lib")
let fixedFiles = 0
let fixedCount = 0

for (const file of fs.readdirSync(libDir).filter((name) => name.endsWith(".ts"))) {
  const filePath = path.join(libDir, file)
  const original = fs.readFileSync(filePath, "utf8")
  const next = original.replace(/\}\{\s*\n(\s*)id:/g, (_, indent) => {
    fixedCount++
    return `},\n${indent}{\n${indent}id:`
  })
  if (next !== original) {
    fs.writeFileSync(filePath, next, "utf8")
    fixedFiles++
  }
}

console.log(`Fixed ${fixedCount} separators in ${fixedFiles} files`)
