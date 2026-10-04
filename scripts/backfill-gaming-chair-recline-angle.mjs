/**
 * lib/gaming-chair*.ts の maxRecliningAngle / 最大リクライニング角度 を推論・補完
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  DASH,
  formatMaxRecliningAngleForCard,
} from "./amazon-gaming-chair-specs.mjs"
import { resolveGamingChairReclineAngle } from "./gaming-chair-recline-known.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

function patchBlock(block) {
  if (!block.includes('category: "gaming-chair"')) return block

  const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
  const angle = resolveGamingChairReclineAngle(asin, block.replace(/\\"/g, '"'))
  if (angle === DASH) return block

  const display = formatMaxRecliningAngleForCard(angle)
  let updated = block

  if (/^\s*maxRecliningAngle:/m.test(updated)) {
    updated = updated.replace(/^\s*maxRecliningAngle:.*$/m, `    maxRecliningAngle: "${angle}",`)
  } else {
    updated = updated.replace(
      /(category: "gaming-chair",\n)/,
      `$1    maxRecliningAngle: "${angle}",\n`,
    )
  }

  updated = updated.replace(
    /\{ label: "最大リクライニング角度", value: "[^"]*" \}/g,
    `{ label: "最大リクライニング角度", value: "${display}" }`,
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
