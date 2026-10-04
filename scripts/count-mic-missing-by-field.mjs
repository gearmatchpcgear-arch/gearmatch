import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const DASH = "—"
const fields = ["指向性", "周波数特性", "接続方式", "サンプルレート"]

const byField = Object.fromEntries(fields.map((f) => [f, 0]))
const byAsin = new Map()

for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const src = readFileSync(join(ROOT, "lib", file), "utf8")
  if (!src.includes('category: "mic"')) continue
  const re =
    /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?highlights: \[([\s\S]*?)\]/g
  let m
  while ((m = re.exec(src))) {
    const asin = m[1]
    const hl = m[2]
    if (byAsin.has(asin)) continue
    const missing = []
    for (const label of fields) {
      const hm = hl.match(new RegExp(`label: "${label}", value: "([^"]*)"`))
      const val = hm?.[1] ?? "MISSING"
      if (val === DASH || val === "-" || val === "MISSING" || val === "") {
        missing.push(label)
        byField[label]++
      }
    }
    byAsin.set(asin, missing)
  }
}

console.log("unique ASINs:", byAsin.size)
console.log("missing by field:", byField)
console.log("need fetch:", [...byAsin.values()].filter((m) => m.length > 0).length)
