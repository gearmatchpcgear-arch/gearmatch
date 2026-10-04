/**
 * Replace card highlight/spec label アームレスト/保証 → フレームの種類 with frame values.
 * Usage: node scripts/fix-gaming-chair-armrest-to-frame-spec.mjs [--write]
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { DASH, formatFrameMaterialForCard } from "./amazon-gaming-chair-specs.mjs"
import { resolveGamingChairFrameMaterial } from "./gaming-chair-frame-known.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")
const WRITE = process.argv.includes("--write")

function extractFrameMaterial(block) {
  const prop = block.match(/\bframeMaterial:\s*"([^"]+)"/)?.[1]
  if (prop && prop !== DASH && prop !== "—") return prop

  const row = block.match(/\{ label: "フレームの種類", value: "([^"]+)" \}/)?.[1]
  if (row) {
    const cleaned = row.replace(/^フレーム:\s*/, "").replace(/フレーム$/, "")
    if (cleaned && cleaned !== DASH && cleaned !== "—") {
      if (/合金鋼|スチール|強化|アルミ|樹脂|プラスチック|ナイロン/.test(cleaned)) {
        if (/合金鋼/.test(cleaned)) return "合金鋼"
        if (/スチール|鋼製/.test(cleaned)) return "スチール（鋼鉄）"
        if (/強化|樹脂|プラスチック|ナイロン/.test(cleaned)) return "強化プラスチック"
        if (/アルミ/.test(cleaned)) return "アルミ合金"
      }
    }
  }

  const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
  const brand = block.match(/brand: "([^"]+)"/)?.[1] ?? ""
  return resolveGamingChairFrameMaterial(asin, block.replace(/\\"/g, '"'), brand)
}

function patchBlock(block) {
  if (!block.includes('category: "gaming-chair"')) return block
  if (!block.includes("アームレスト/保証")) return block

  const material = extractFrameMaterial(block)
  if (material === DASH) return block

  const display = formatFrameMaterialForCard(material)
  let next = block

  next = next.replace(
    /\{ label: "アームレスト\/保証", value: "[^"]*" \}/g,
    `{ label: "フレームの種類", value: "${display}" }`,
  )

  if (!/\bframeMaterial:/.test(next)) {
    next = next.replace(
      /(category: "gaming-chair",\n)/,
      `$1    frameMaterial: "${material}",\n`,
    )
  }

  return next
}

function patchFile(filePath) {
  const src = readFileSync(filePath, "utf8")
  const blockRe = /(\{\s*\n\s*id: "chair-[^"]+"[\s\S]*?\n  \},)/g
  let changed = 0
  const out = src.replace(blockRe, (block) => {
    const next = patchBlock(block)
    if (next !== block) changed++
    return next
  })

  if (changed && WRITE) writeFileSync(filePath, out)
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

console.log(`${total} block(s) ${WRITE ? "updated" : "would update"}.`)
if (!WRITE) console.log("Re-run with --write to apply.")
