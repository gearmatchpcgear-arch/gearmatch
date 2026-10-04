import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const LIB = join(ROOT, "lib")

const FIXES = { B0BW8W1VN3: 22182, B0D6QB71XD: 79800 }
const REMOVE = new Set(["B0FGW61ZBD", "B0BNSYF7FK"])

function findBlockBounds(src, idx) {
  const start = src.lastIndexOf("\n  {", idx)
  if (start < 0) return null
  let end = src.indexOf("\n  },", idx)
  let endLen = "\n  },".length
  if (end < 0) {
    end = src.indexOf("\n  }\n", idx)
    endLen = "\n  }".length
  }
  if (end < 0) return null
  return { start, end, endLen }
}

for (const file of readdirSync(LIB).filter(
  (f) => f.startsWith("monitor") && f.endsWith(".ts") && !f.startsWith("monitor-arm"),
)) {
  let src = readFileSync(join(LIB, file), "utf8")
  let changed = false

  for (const [asin, price] of Object.entries(FIXES)) {
    let from = 0
    while (true) {
      const idx = src.indexOf(`/dp/${asin}"`, from)
      if (idx < 0) break
      const b = findBlockBounds(src, idx)
      if (!b) break
      const block = src.slice(b.start, b.end + b.endLen)
      const nb = block.replace(/price: \d+/, `price: ${price}`)
      if (nb !== block) {
        src = src.slice(0, b.start) + nb + src.slice(b.end + b.endLen)
        changed = true
        from = b.start + nb.length
      } else {
        from = idx + 1
      }
    }
  }

  for (const asin of REMOVE) {
    while (true) {
      const idx = src.indexOf(`/dp/${asin}"`)
      if (idx < 0) break
      const b = findBlockBounds(src, idx)
      if (!b) break
      src = src.slice(0, b.start) + src.slice(b.end + b.endLen)
      changed = true
    }
  }

  if (changed) {
    writeFileSync(join(LIB, file), src)
    console.log(`updated ${file}`)
  }
}
