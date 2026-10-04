/** List ASINs still missing weight or button count in cache or gadget data. */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const DASH = "—"
const cache = JSON.parse(readFileSync(join(__dirname, "mouse-specs-cache.json"), "utf8"))

function collectAsins() {
  const asins = []
  for (const f of ["lib/mouse-bestsellers.ts", "lib/mouse-popular-brands.ts", "lib/gadgets.ts"]) {
    for (const m of readFileSync(join(ROOT, f), "utf8").matchAll(
      /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g,
    )) {
      asins.push(m[1])
    }
  }
  return [...new Set(asins)]
}

function isMissingWeight(specs) {
  const w = specs?.highlights?.weight
  return !w || w === DASH
}

function isMissingButton(specs) {
  const row = specs?.sensorRows?.find((r) => r.label === "ボタン数")
  const v = row?.value
  if (v && v !== DASH) return false
  const meta = specs?.meta?.buttonCount
  return !(meta >= 1 && meta <= 20)
}

const all = collectAsins()
const noCache = []
const missW = []
const missB = []

for (const asin of all) {
  const e = cache[asin]
  if (!e?.specs) {
    noCache.push(asin)
    continue
  }
  if (isMissingWeight(e.specs)) missW.push(asin)
  if (isMissingButton(e.specs)) missB.push(asin)
}

const needFetch = [...new Set([...noCache, ...missW, ...missB])]
const out = join(__dirname, "need-fetch-asins.json")
writeFileSync(out, JSON.stringify({ noCache, missW, missB, needFetch }, null, 2) + "\n")
console.log(`noCache: ${noCache.length}, missW: ${missW.length}, missB: ${missB.length}, needFetch: ${needFetch.length}`)
console.log(`Written ${out}`)
