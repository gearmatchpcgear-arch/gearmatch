import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { resolveGamingChairFrameMaterial } from "./gaming-chair-frame-known.mjs"
import { DASH } from "./amazon-gaming-chair-specs.mjs"

const LIB = join(dirname(fileURLToPath(import.meta.url)), "..", "lib")

const still = []
for (const file of readdirSync(LIB).filter((f) => f.startsWith("gaming-chair") && f.endsWith(".ts"))) {
  const src = readFileSync(join(LIB, file), "utf8")
  const blocks = src.match(/\{\s*\n\s*id: "chair-[^"]+"[\s\S]*?\n  \},/g) ?? []
  for (const block of blocks) {
    if (!block.includes('category: "gaming-chair"')) continue
    const highlightFrame = block.match(/\{ label: "フレームの種類", value: "([^"]+)" \}/)
    const val = highlightFrame?.[1]
    if (val && val !== "—" && val !== "フレーム: —") continue
    const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
    const brand = block.match(/brand: "([^"]+)"/)?.[1] ?? ""
    const resolved = resolveGamingChairFrameMaterial(asin, block.replace(/\\"/g, '"'), brand)
    if (resolved !== DASH) {
      still.push({ asin, brand, resolved, wouldPatch: true })
    }
  }
}

console.log("Resolvable without file patch:", still.length)
for (const x of still.slice(0, 30)) console.log(`${x.asin} -> ${x.resolved} (${x.brand})`)
