import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const file = path.join(root, "lib/audio-interface-bestsellers.ts")
const text = fs.readFileSync(file, "utf8")

const categoryCount = (text.match(/category: "audio-interface"/g) ?? []).length
const pcCount = (text.match(/label: "PC接続"/g) ?? []).length
console.log("category count:", categoryCount, "PC接続 rows:", pcCount)

const emptyPc = []
for (const m of text.matchAll(/id: "([^"]+)"[\s\S]*?category: "audio-interface"[\s\S]*?name: "([^"]+)"[\s\S]*?connectionType: "([^"]*)"[\s\S]*?specGroups:[\s\S]*?label: "PC接続", value: "([^"]*)"/g)) {
  if (!m[4]) emptyPc.push({ id: m[1], name: m[2], connectionType: m[3] })
}
console.log("\nempty PC接続:", emptyPc.length)
emptyPc.forEach((r) => console.log(`  ${r.id} ${r.name} | ${r.connectionType}`))
