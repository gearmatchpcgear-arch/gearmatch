/**
 * Count unique mic gadgets after merge (simulates gadgets.ts dedup + accessory filter)
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const DASH = "—"
const fields = ["指向性", "周波数特性", "接続方式", "サンプルレート"]

function parseMics(src) {
  const mics = []
  const re =
    /id: "([^"]+)"[\s\S]*?category: "mic"[\s\S]*?name: "([^"]*)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?highlights: \[([\s\S]*?)\]/g
  let m
  while ((m = re.exec(src))) {
    const hl = m[4]
    const values = {}
    let miss = 0
    for (const label of fields) {
      const hm = hl.match(new RegExp(`label: "${label}", value: "([^"]*)"`))
      const val = hm?.[1] ?? "MISSING"
      values[label] = val
      if (val === DASH || val === "-" || val === "MISSING" || val === "") miss++
    }
    mics.push({ id: m[1], name: m[2], asin: m[3], values, miss })
  }
  return mics
}

const all = []
for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const src = readFileSync(join(ROOT, "lib", file), "utf8")
  if (!src.includes('category: "mic"')) continue
  for (const m of parseMics(src)) all.push({ ...m, file })
}

// Dedup by purchaseUrl (later wins) — same order as gadgets.ts merge
const order = [
  "gadgets.ts",
  "mic-bestsellers.ts",
  "mic-bestsellers-page2.ts",
  "mic-most-gifted.ts",
  "mic-most-gifted-page2.ts",
  "mic-computers-search.ts",
  "mic-computers-search-streaming.ts",
  "mic-condenser-bestsellers.ts",
  "mic-condenser-bestsellers-page2.ts",
  "mic-dynamic-bestsellers.ts",
  "mic-dynamic-bestsellers-page2.ts",
  "mic-dynamic-new-releases.ts",
  "mic-headset-new-releases.ts",
]

const byAsin = new Map()
for (const file of order) {
  for (const m of all.filter((x) => x.file === file)) {
    byAsin.set(m.asin, m)
  }
}

const unique = [...byAsin.values()]
const complete = unique.filter((m) => m.miss === 0)
const threePlus = unique.filter((m) => m.miss >= 3)
const twoMissing = unique.filter((m) => m.miss === 2)
const oneMissing = unique.filter((m) => m.miss === 1)

console.log(
  JSON.stringify(
    {
      uniqueTotal: unique.length,
      complete: complete.length,
      oneMissing: oneMissing.length,
      twoMissing: twoMissing.length,
      threePlus: threePlus.length,
    },
    null,
    2,
  ),
)
