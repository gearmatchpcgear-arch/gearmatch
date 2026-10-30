import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const categories = [
  "mouse",
  "keyboard",
  "mic",
  "camera",
  "monitor-arm",
  "monitor",
  "gaming-chair",
  "audio-interface",
]

const validPaths = new Set([
  "/",
  "/guide",
  "/about",
  "/contact",
  "/privacy",
  ...categories.map((c) => `/guide/${c}`),
])

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (name === "node_modules" || name === ".next" || name === "out" || name === "scripts") continue
    const st = fs.statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (/\.(tsx|ts|jsx|js|mdx)$/.test(name)) acc.push(full)
  }
  return acc
}

const hrefRe = /href=["'{](\/[^"'{}?#]+)/g
const issues = []

for (const file of walk(root)) {
  const text = fs.readFileSync(file, "utf8")
  for (const m of text.matchAll(hrefRe)) {
    const href = m[1].replace(/\/+$/, "") || "/"
    if (href.startsWith("//")) continue
    if (!validPaths.has(href)) {
      issues.push({ file: path.relative(root, file), href })
    }
  }
}

if (issues.length === 0) {
  console.log("OK: no internal path links outside known routes")
} else {
  console.log("Potential broken internal links:")
  for (const i of issues) console.log(`  ${i.href} in ${i.file}`)
  process.exitCode = 1
}
