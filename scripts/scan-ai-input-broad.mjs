/**
 * Broader scan: combo/XLR/TRRS input inconsistencies in audio interfaces.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

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
const blocks = parseGadgetBlocks(text).filter((b) => /category: "audio-interface"/.test(b))

const comboTitlePlainXlr = []
const trrsInTitleMissing = []
const channelNameXlrMatch = []

for (const b of blocks) {
  const id = b.match(/id: "([^"]+)"/)?.[1]
  const name = b.match(/name: "([^"]+)"/)?.[1]
  const tagline = b.match(/tagline: "([^"]+)"/)?.[1] ?? ""
  const inputs = b.match(/inputs: "([^"]*)"/)?.[1] ?? "—"
  const hay = `${name} ${tagline}`

  if (/combo|コンボ|xlr\/trs|xlr\/1\/4|1\/4.*xlr|xlr\/3\.5/i.test(hay) && /^XLR×\d+$/.test(inputs.replace(/\s/g, ""))) {
    comboTitlePlainXlr.push({ id, name, inputs, hay: hay.slice(0, 80) })
  }
  if (/trrs|3\.5\s*mm.*(input|mic|マイク)/i.test(hay) && !/trrs|3\.5\s*mm/i.test(inputs)) {
    trrsInTitleMissing.push({ id, name, inputs })
  }
  if (/\b(two|duo|twin|2ch|2-ch|2\s*channel)\b/i.test(hay) && /^XLR×2$/i.test(inputs.replace(/\s/g, ""))) {
    channelNameXlrMatch.push({ id, name, inputs })
  }
}

console.log("combo title but plain XLR:", comboTitlePlainXlr.length)
for (const x of comboTitlePlainXlr) console.log(" ", x.id, x.name, x.inputs)

console.log("\nTRRS/3.5mm in title but not inputs:", trrsInTitleMissing.length)
for (const x of trrsInTitleMissing) console.log(" ", x.id, x.name, x.inputs)

console.log("\n2ch name with XLR×2 only:", channelNameXlrMatch.length)
for (const x of channelNameXlrMatch) console.log(" ", x.id, x.name, x.inputs)
