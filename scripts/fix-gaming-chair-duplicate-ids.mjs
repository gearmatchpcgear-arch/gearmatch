/**
 * Fix duplicate gadget IDs in gaming-chair search TS files (append ASIN suffix).
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..", "lib")

function asinFromUrl(url) {
  return url?.match(/\/dp\/([A-Z0-9]{10})/)?.[1] ?? null
}

function fixFile(relPath) {
  const path = join(ROOT, relPath)
  let text = readFileSync(path, "utf8")
  const seen = new Map()
  let fixes = 0

  text = text.replace(
    /id:\s*"([^"]+)"([\s\S]*?purchaseUrl:\s*"([^"]+)")/g,
    (block, id, middle, url) => {
      const asin = asinFromUrl(url)
      if (!seen.has(id)) {
        seen.set(id, asin)
        return block
      }
      const newId = asin ? `${id}-${asin.toLowerCase()}` : `${id}-dup${seen.get(id) ? "2" : ""}`
      fixes += 1
      seen.set(newId, asin)
      return `id: "${newId}"${middle}`
    },
  )

  if (fixes > 0) {
    writeFileSync(path, text, "utf8")
    console.log(`Fixed ${fixes} duplicate IDs in ${relPath}`)
  } else {
    console.log(`No duplicate IDs in ${relPath}`)
  }
}

fixFile("gaming-chair-search.ts")
fixFile("gaming-chair-search-page3.ts")
