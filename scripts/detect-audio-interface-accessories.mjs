/**
 * Scan lib/audio-interface-bestsellers.ts for adapter/accessory titles.
 * Usage: node scripts/detect-audio-interface-accessories.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { isAudioInterfaceAccessoryTitle } from "./audio-interface-accessory-title.mjs"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const target = path.join(root, "lib/audio-interface-bestsellers.ts")

function parseGadgetBlocks(text) {
  const gadgets = []
  let depth = 0
  let start = -1

  for (let i = 0; i < text.length; i++) {
    if (text.startsWith("{", i) && /[\s,\[]/.test(text[i - 1] ?? "[")) {
      if (depth === 0) start = i
      depth++
    } else if (text[i] === "}") {
      depth--
      if (depth === 0 && start >= 0) {
        gadgets.push(text.slice(start, i + 1))
        start = -1
      }
    }
  }
  return gadgets
}

const text = fs.readFileSync(target, "utf8")
const blocks = parseGadgetBlocks(text)
const hits = []

for (const block of blocks) {
  if (!/category: "audio-interface"/.test(block)) continue
  const id = block.match(/id: "([^"]+)"/)?.[1] ?? ""
  const name = block.match(/name: "([^"]+)"/)?.[1] ?? ""
  const tagline = block.match(/tagline: "([^"]+)"/)?.[1] ?? ""
  const asin = block.match(/purchaseUrl: "[^"]+\/dp\/([A-Z0-9]{10})"/)?.[1] ?? ""
  const title = `${name} ${tagline}`
  if (isAudioInterfaceAccessoryTitle(title)) {
    hits.push({ id, asin, name, tagline })
  }
}

console.log(`Accessory scan: ${hits.length} / ${blocks.length}`)
for (const h of hits) {
  console.log(`${h.asin} ${h.id} | ${h.name}`)
}
