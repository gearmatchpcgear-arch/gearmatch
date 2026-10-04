import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const DASH = "—"
const seen = new Map()

for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const src = readFileSync(join(ROOT, "lib", file), "utf8")
  if (!src.includes('category: "mic"')) continue
  const re =
    /\{[\s\S]*?category: "mic"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?\n  \}(?:,|\n)/g
  let m
  while ((m = re.exec(src))) {
    const block = m[0]
    const asin = m[1]
    const dir = block.match(/label: "指向性", value: "([^"]*)"/)?.[1] ?? ""
    if (dir !== DASH && dir !== "-") continue
    const name = block.match(/name: "([^"]*)"/)?.[1] ?? ""
    const tagline = block.match(/tagline: "([^"]*)"/)?.[1] ?? ""
    if (!seen.has(asin)) seen.set(asin, { name, tagline, files: [file] })
    else seen.get(asin).files.push(file)
  }
}

console.log(`Unique ASINs missing directivity: ${seen.size}`)
for (const [asin, v] of seen) {
  console.log(`${asin}\t${v.name.slice(0, 60)}\t${v.files.join(",")}`)
}
