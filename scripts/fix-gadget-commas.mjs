import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const libDir = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), "lib")
let fixedFiles = 0

for (const file of fs.readdirSync(libDir)) {
  if (!file.endsWith(".ts")) continue
  const p = path.join(libDir, file)
  const content = fs.readFileSync(p, "utf8")
  const fixed = content.replace(/\}(\s*)\{(\s*\n\s*id:)/g, "},$1{$2")
  if (fixed !== content) {
    fs.writeFileSync(p, fixed, "utf8")
    fixedFiles++
  }
}

console.log(`Fixed ${fixedFiles} files`)
