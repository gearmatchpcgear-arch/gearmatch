/**
 * Audit gadget data: duplicate IDs and category mismatches
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const lib = join(__dirname, "..", "lib")
const validCats = new Set([
  "mouse",
  "keyboard",
  "mic",
  "camera",
  "monitor-arm",
  "monitor",
  "gaming-chair",
  "audio-interface",
])
const chairRe = /ゲーミングチェア|gaming\s*chair|オフィスチェア|デスクチェア|デスクチェア|chair/i

function parseGadgetsFromFile(file, text) {
  const items = []
  const re = /\{\s*\n\s*id:\s*"([^"]+)"[\s\S]*?\n\s*category:\s*"([^"]+)"[\s\S]*?\n\s*name:\s*"([^"]+)"/g
  let m
  while ((m = re.exec(text))) {
    items.push({ file, id: m[1], category: m[2], name: m[3] })
  }
  return items
}

const tsFiles = readdirSync(lib).filter(
  (f) =>
    f.endsWith(".ts") &&
    !f.endsWith(".d.ts") &&
    !f.includes("filter") &&
    !f.includes("tags") &&
    f !== "gadgets.ts",
)

const allItems = []
for (const file of tsFiles) {
  const text = readFileSync(join(lib, file), "utf8")
  if (!text.includes('category: "')) continue
  allItems.push(...parseGadgetsFromFile(file, text))
}

const idMap = new Map()
for (const item of allItems) {
  if (!idMap.has(item.id)) idMap.set(item.id, [])
  idMap.get(item.id).push(item)
}

const dupIds = [...idMap.entries()].filter(([, v]) => v.length > 1)
console.log("=== All data files ===")
console.log("Parsed gadgets:", allItems.length)
console.log("Duplicate IDs:", dupIds.length)
for (const [id, entries] of dupIds) {
  console.log(
    `  ${id}:`,
    entries.map((e) => `${e.file}[${e.category}] ${e.name.slice(0, 35)}`).join(" | "),
  )
}

const mismatches = []
for (const item of allItems) {
  if (!validCats.has(item.category)) {
    mismatches.push({ ...item, issue: "invalid-category" })
  }
  if (chairRe.test(item.name) && item.category !== "gaming-chair" && !/マウスパッド|mouse pad/i.test(item.name)) {
    mismatches.push({ ...item, issue: "chair-wrong-category" })
  }
  if (item.category === "mouse" && chairRe.test(item.name) && !/マウスパッド|mouse pad/i.test(item.name)) {
    mismatches.push({ ...item, issue: "chair-in-mouse-category" })
  }
}

console.log("\nCategory mismatches:", mismatches.length)
for (const m of mismatches) {
  console.log(`  [${m.issue}] ${m.file} ${m.id} cat=${m.category} name=${m.name}`)
}

const byCat = {}
for (const item of allItems) {
  byCat[item.category] = (byCat[item.category] || 0) + 1
}
console.log("\nRaw file category counts:", byCat)
