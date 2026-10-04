import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const LIB = join(dirname(fileURLToPath(import.meta.url)), "..", "lib")
const remove = [
  "B01IALGW2U",
  "B01L8H204W",
  "B078XXYDWZ",
  "B01LY1A3ER",
  "B075ZWRH6Z",
  "B071D1HN9Y",
  "B073S5HDGY",
  "B078XYFG2V",
  "B071DB2KQZ",
  "B0791XQDZS",
  "B0787HV5XP",
  "B0721XWT78",
]

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

let total = 0
for (const f of readdirSync(LIB).filter(
  (x) => x.startsWith("monitor") && x.endsWith(".ts") && !x.startsWith("monitor-arm"),
)) {
  let src = readFileSync(join(LIB, f), "utf8")
  for (const asin of remove) {
    while (true) {
      const idx = src.indexOf(`/dp/${asin}"`)
      if (idx < 0) break
      const b = findBlockBounds(src, idx)
      if (!b) break
      src = src.slice(0, b.start) + src.slice(b.end + b.endLen)
      total++
    }
  }
  writeFileSync(join(LIB, f), src)
}
console.log("removed blocks:", total)
