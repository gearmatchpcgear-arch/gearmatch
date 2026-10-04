import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const data = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "missing-frame-material.json"), "utf8"))
const unique = [...new Map(data.missing.map((x) => [x.asin, x])).values()]
for (const x of unique) {
  console.log(`${x.asin} | ${x.brand} | ${x.name}`)
}
