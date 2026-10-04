/**
 * List mic entries still missing frequency response in lib/*.ts
 */
import { readFileSync, readdirSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const DASH = "—"

const missing = []
for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const src = readFileSync(join(ROOT, "lib", file), "utf8")
  if (!src.includes('category: "mic"')) continue
  const re =
    /id: "([^"]+)"[\s\S]*?category: "mic"[\s\S]*?name: "([^"]*)"[\s\S]*?brand: "([^"]*)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?highlights: \[([\s\S]*?)\]/g
  let m
  while ((m = re.exec(src)) !== null) {
    const hl = m[5].match(/label: "周波数特性", value: "([^"]*)"/)
    if (hl && (hl[1] === DASH || hl[1] === "-")) {
      missing.push({ id: m[1], name: m[2], brand: m[3], asin: m[4], file })
    }
  }
}

writeFileSync(join(__dirname, "mic-frequency-missing.json"), JSON.stringify(missing, null, 2))
console.log(`Missing: ${missing.length}`)
for (const x of missing.slice(0, 20)) {
  console.log(`  ${x.asin} ${x.id} [${x.brand}] ${x.name.slice(0, 45)}`)
}
