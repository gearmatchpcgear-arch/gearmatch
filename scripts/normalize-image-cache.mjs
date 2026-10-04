import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const path = join(__dirname, "mouse-image-cache.json")
const cache = JSON.parse(readFileSync(path, "utf8"))

for (const entry of Object.values(cache)) {
  if (entry.image) entry.image = normalizeAmazonImageUrl(entry.image)
}

writeFileSync(path, JSON.stringify(cache, null, 2) + "\n")
console.log(`Normalized ${Object.keys(cache).length} image URLs`)
