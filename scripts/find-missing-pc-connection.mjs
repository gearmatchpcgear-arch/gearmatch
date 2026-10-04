import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const text = fs.readFileSync(path.join(root, "lib/audio-interface-bestsellers.ts"), "utf8")

let depth = 0
let start = -1
const gadgets = []

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

const missing = []
for (const block of gadgets) {
  if (!/category: "audio-interface"/.test(block)) continue
  const id = block.match(/id: "([^"]+)"/)?.[1]
  const name = block.match(/name: "([^"]+)"/)?.[1]
  const connectionType = block.match(/connectionType: "([^"]*)"/)?.[1] ?? ""
  const connection = block.match(/connection: "([^"]*)"/)?.[1] ?? ""
  const hasPc = /label: "PC接続"/.test(block)
  if (!hasPc) missing.push({ id, name, connectionType, connection })
}

console.log("audio-interface gadgets:", gadgets.filter((b) => /category: "audio-interface"/.test(b)).length)
console.log("missing PC接続:", missing.length)
missing.forEach((r) => console.log(JSON.stringify(r)))
