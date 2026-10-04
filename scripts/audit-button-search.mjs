/** Find missing button counts recoverable from search JSON full titles. */
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { extractButtonCountFromText } from "./amazon-mouse-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

const search = JSON.parse(readFileSync(join(__dirname, "popular-brand-search.json"), "utf8"))
const byAsin = new Map(search.items.map((i) => [i.asin, i.title]))

const content = readFileSync(join(ROOT, "lib", "mouse-popular-brands.ts"), "utf8")
const re = /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]+)"[\s\S]*?specGroups: (\[[\s\S]*?\]),/g
let m
let recoverable = 0

while ((m = re.exec(content)) !== null) {
  const asin = m[1]
  const specGroups = JSON.parse(m[2])
  const sensor = specGroups.find((g) => /センサー|入力/.test(g.title))
  const row = sensor?.rows.find((r) => r.label === "ボタン数")
  if (row?.value && row.value !== "—") continue

  const fullTitle = byAsin.get(asin)
  if (!fullTitle) continue
  const count = extractButtonCountFromText(fullTitle)
  if (count) {
    console.log(`${asin}: ${count} ← ${fullTitle.slice(0, 80)}`)
    recoverable++
  }
}

console.log(`\nRecoverable from search JSON: ${recoverable}`)
