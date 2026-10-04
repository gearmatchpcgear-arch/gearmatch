/**
 * フレームの種類が未設定のゲーミングチェアを集計
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { inferFrameMaterial, DASH } from "./amazon-gaming-chair-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

const missing = []
const inferrable = []

for (const file of readdirSync(LIB).filter((f) => f.startsWith("gaming-chair") && f.endsWith(".ts"))) {
  const src = readFileSync(join(LIB, file), "utf8")
  const blocks = src.match(/\{\s*\n\s*id: "chair-[^"]+"[\s\S]*?\n  \},/g) ?? []
  for (const block of blocks) {
    if (!block.includes('category: "gaming-chair"')) continue
    const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
    const id = block.match(/id: "(chair-[^"]+)"/)?.[1]
    const name = block.match(/name: "([^"]{0,80})/)?.[1]
    const brand = block.match(/brand: "([^"]+)"/)?.[1]
    const hasFrameProp = /frameMaterial: "([^"]+)"/.exec(block)
    const highlightFrame = block.match(/\{ label: "フレームの種類", value: "([^"]+)" \}/)
    const val = hasFrameProp?.[1] || highlightFrame?.[1]
    const isMissing =
      !val || val === "—" || val === "-" || val === "フレーム: —" || val === "フレーム: -"
    if (!isMissing) continue

    const hay = block.replace(/\\"/g, '"')
    const inferred = inferFrameMaterial(hay, {}, brand ?? "")
    const entry = { file, asin, id, name, brand, inferred }
    missing.push(entry)
    if (inferred !== DASH) inferrable.push(entry)
  }
}

console.log("Total missing:", missing.length)
console.log("Inferrable from block text:", inferrable.length)
console.log("Unique ASINs missing:", new Set(missing.map((m) => m.asin)).size)
console.log("\nInferrable samples:")
for (const e of inferrable.slice(0, 20)) {
  console.log(`${e.asin} -> ${e.inferred} | ${e.name}`)
}

import { writeFileSync } from "fs"
writeFileSync(
  join(__dirname, "missing-frame-material.json"),
  JSON.stringify({ missing, inferrable }, null, 2),
)
