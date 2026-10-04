/**
 * ゲーミングチェアの maxRecliningAngle / highlights 整合性監査
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { resolveGamingChairReclineAngle } from "./gaming-chair-recline-known.mjs"
import { DASH, formatMaxRecliningAngleForCard } from "./amazon-gaming-chair-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

function collectBlocks() {
  const rows = []
  for (const file of readdirSync(LIB).filter((f) => f.startsWith("gaming-chair") && f.endsWith(".ts"))) {
    const src = readFileSync(join(LIB, file), "utf8")
    const blockRe = /(\{\s*\n\s*id: "chair-[^"]+"[\s\S]*?\n  \},)/g
    let m
    while ((m = blockRe.exec(src))) {
      const block = m[1]
      if (!block.includes('category: "gaming-chair"')) continue
      const id = block.match(/id: "(chair-[^"]+)"/)?.[1]
      const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
      const name = block.match(/name: "([^"]+)"/)?.[1] ?? ""
      const brand = block.match(/brand: "([^"]+)"/)?.[1] ?? ""
      const angle = block.match(/maxRecliningAngle: "([^"]+)"/)?.[1] ?? DASH
      const hi =
        block.match(/\{ label: "最大リクライニング角度", value: "([^"]*)" \}/)?.[1] ?? DASH
      const resolved = resolveGamingChairReclineAngle(asin, block.replace(/\\"/g, '"'))
      const expectedHi = resolved !== DASH ? formatMaxRecliningAngleForCard(resolved) : DASH
      rows.push({ file, id, asin, name, brand, angle, hi, resolved, expectedHi })
    }
  }
  return rows
}

const rows = collectBlocks()
const dash = rows.filter((r) => r.angle === DASH || r.hi === DASH)
const wrong180 = rows.filter((r) => r.angle === "180°" || r.resolved === "180°")
const stale = rows.filter(
  (r) => r.resolved !== DASH && (r.angle !== r.resolved || r.hi !== r.expectedHi),
)

console.log("=== Gaming chair recline audit ===")
console.log("Total:", rows.length)
console.log("Dash (missing):", dash.length)
console.log("180° entries:", wrong180.length)
console.log("Stale vs known resolver:", stale.length)

if (wrong180.length) {
  console.log("\n--- 180° ---")
  for (const r of wrong180) {
    console.log(`${r.asin}\t${r.brand}\tlib=${r.angle}\tresolved=${r.resolved}\t${r.name.slice(0, 45)}`)
  }
}

if (stale.length) {
  console.log("\n--- Stale (first 40) ---")
  for (const r of stale.slice(0, 40)) {
    console.log(
      `${r.asin}\t${r.file}\tlib=${r.angle}\tresolved=${r.resolved}\thi=${r.hi}\t${r.name.slice(0, 40)}`,
    )
  }
}

if (dash.length) {
  console.log("\n--- Dash (first 30) ---")
  for (const r of dash.slice(0, 30)) {
    console.log(`${r.asin}\t${r.brand}\t${r.name.slice(0, 45)}`)
  }
}
