/** List gadgets with price: null */
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const files = [
  "lib/gadgets.ts",
  "lib/mouse-bestsellers.ts",
  "lib/mouse-gaming-bestsellers.ts",
  "lib/mouse-popular-brands.ts",
]
const specCache = JSON.parse(
  readFileSync(join(ROOT, "scripts/mouse-specs-cache.json"), "utf8"),
)
const overrides = JSON.parse(
  readFileSync(join(ROOT, "scripts/mouse-overrides.json"), "utf8"),
)

const nulls = []
for (const rel of files) {
  const src = readFileSync(join(ROOT, rel), "utf8")
  const blockRe =
    /\{[\s\S]*?id: "([^"]+)"[\s\S]*?name: "([^"]+)"[\s\S]*?price: (null|\d+)[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
  let m
  while ((m = blockRe.exec(src)) !== null) {
    if (m[3] !== "null") continue
    const asin = m[4]
    nulls.push({
      file: rel,
      id: m[1],
      name: m[2].slice(0, 70),
      asin,
      cachedPrice: specCache[asin]?.price ?? null,
      overridePrice: overrides[asin]?.price ?? null,
    })
  }
}

console.log(`null price count: ${nulls.length}`)
for (const x of nulls) {
  console.log(
    `${x.asin}\t${x.cachedPrice ?? "—"}\t${x.overridePrice ?? "—"}\t${x.id}\t${x.name}`,
  )
}
