import fs from "node:fs"
import path from "node:path"

const out = path.join(process.cwd(), "out")
const files = [
  "index.html",
  "guide.html",
  "about.html",
  "contact.html",
  "privacy.html",
  "guide/mouse.html",
  "guide/gaming-chair.html",
]

let missing = 0
for (const f of files) {
  const html = fs.readFileSync(path.join(out, f), "utf8")
  const m = html.match(/rel="canonical" href="([^"]+)"/)
  if (!m) {
    console.log(f, "NO CANONICAL")
    missing++
  } else {
    console.log(f, m[1])
  }
}
if (missing) process.exitCode = 1
