import { readFileSync, readdirSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const DASH = "—"
const fields = ["指向性", "周波数特性", "接続方式", "サンプルレート"]

const items = []
for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const src = readFileSync(join(ROOT, "lib", file), "utf8")
  if (!src.includes('category: "mic"')) continue
  const re =
    /id: "([^"]+)"[\s\S]*?category: "mic"[\s\S]*?name: "([^"]*)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?highlights: \[([\s\S]*?)\]/g
  let m
  while ((m = re.exec(src))) {
    const hlBlock = m[4]
    const row = { id: m[1], name: m[2], asin: m[3], file, missing: [], values: {} }
    for (const label of fields) {
      const hm = hlBlock.match(new RegExp(`label: "${label}", value: "([^"]*)"`))
      const val = hm?.[1] ?? "MISSING"
      row.values[label] = val
      if (val === DASH || val === "-" || val === "MISSING" || val === "") {
        row.missing.push(label)
      }
    }
    if (row.missing.length) items.push(row)
  }
}

const stats = Object.fromEntries(
  fields.map((f) => [f, items.filter((i) => i.missing.includes(f)).length]),
)
console.log("items with any missing:", items.length)
console.log("by field:", stats)
for (const x of items) {
  console.log(`${x.asin} | ${x.missing.join(",")} | ${x.name.slice(0, 50)}`)
}
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), "mic-card-specs-missing.json"), JSON.stringify(items, null, 2))
