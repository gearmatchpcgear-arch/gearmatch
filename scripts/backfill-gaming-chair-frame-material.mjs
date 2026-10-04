/**
 * lib/gaming-chair*.ts の frameMaterial / フレームの種類 を推論・補完
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { DASH, formatFrameMaterialForCard } from "./amazon-gaming-chair-specs.mjs"
import { resolveGamingChairFrameMaterial } from "./gaming-chair-frame-known.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

function isMissingFrame(block) {
  const hasFrameProp = /frameMaterial: "([^"]+)"/.exec(block)
  const highlightFrame = block.match(/\{ label: "フレームの種類", value: "([^"]+)" \}/)
  const val = hasFrameProp?.[1] || highlightFrame?.[1]
  return !val || val === "—" || val === "-" || val === "フレーム: —" || val === "フレーム: -"
}

function patchBlock(block) {
  if (!block.includes('category: "gaming-chair"')) return block
  if (!isMissingFrame(block)) return block

  const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
  const brand = block.match(/brand: "([^"]+)"/)?.[1] ?? ""
  const hay = block.replace(/\\"/g, '"')
  const material = resolveGamingChairFrameMaterial(asin, hay, brand)
  if (material === DASH) return block

  const display = formatFrameMaterialForCard(material)
  let updated = block

  if (/^\s*frameMaterial:/m.test(updated)) {
    updated = updated.replace(/^\s*frameMaterial:.*$/m, `    frameMaterial: "${material}",`)
  } else {
    updated = updated.replace(/(category: "gaming-chair",\n)/, `$1    frameMaterial: "${material}",\n`)
  }

  updated = updated.replace(
    /\{ label: "フレームの種類", value: "[^"]*" \}/g,
    `{ label: "フレームの種類", value: "${display}" }`,
  )

  return updated
}

function patchFile(filePath) {
  let src = readFileSync(filePath, "utf8")
  let changed = 0
  const blockRe = /(\{\s*\n\s*id: "chair-[^"]+"[\s\S]*?\n  \},)/g

  src = src.replace(blockRe, (block) => {
    const next = patchBlock(block)
    if (next !== block) changed++
    return next
  })

  if (changed > 0) writeFileSync(filePath, src)
  return changed
}

let total = 0
for (const file of readdirSync(LIB).filter((f) => f.startsWith("gaming-chair") && f.endsWith(".ts"))) {
  const n = patchFile(join(LIB, file))
  if (n > 0) {
    console.log(`${file}: ${n}`)
    total += n
  }
}

console.log(`Total patched: ${total}`)
