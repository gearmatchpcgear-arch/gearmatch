import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ids = JSON.parse(fs.readFileSync(path.join(__dirname, "monitor-red-delete-ids.json"), "utf8")).ids
const LIB = path.join(__dirname, "..", "lib")

const remaining = []
for (const id of ids) {
  for (const file of fs.readdirSync(LIB)) {
    if (!file.endsWith(".ts")) continue
    const src = fs.readFileSync(path.join(LIB, file), "utf8")
    if (src.includes(`id: "${id}"`)) {
      remaining.push({ id, file })
    }
  }
}
console.log("remaining", remaining.length, remaining)
