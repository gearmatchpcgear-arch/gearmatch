import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const LIB = join(dirname(fileURLToPath(import.meta.url)), "..", "lib")

function parseInches(text) {
  if (!text || text === "—") return null
  const unescaped = text.replace(/\\"/g, '"')
  const m = unescaped.match(/([\d.]+)\s*(?:インチ|"|型|inch)/i)
  return m ? Number(m[1]) : null
}

const issues = []
for (const file of readdirSync(LIB).filter((f) => f.startsWith("monitor") && f.endsWith(".ts") && !f.startsWith("monitor-arm"))) {
  const src = readFileSync(join(LIB, file), "utf8").replace(/\r\n/g, "\n")
  for (const block of src.split(/(?=\n  \{\n    id: "mon-)/).slice(1)) {
    const id = block.match(/id: "(mon-[^"]+)"/)?.[1]
    const name = block.match(/name: "([^"]*)"/)?.[1] ?? ""
    const highlight = block.match(/\{ label: "画面サイズ", value: "((?:[^"\\]|\\.)*)"/)?.[1]?.replace(/\\"/g, '"')
    const rank = block.match(/label: "Amazon検索", value: "PCモニター #(\d+)"/)?.[1]
    const h = parseInches(highlight)
    const r = rank ? Number(rank) : null
    if (h == null) continue
    if (h >= 60 || (r != null && Math.abs(h - r) < 0.01)) {
      issues.push({ file, id, name: name.slice(0, 50), h, r })
    }
  }
}
console.log(JSON.stringify(issues, null, 2))
console.error(`issues: ${issues.length}`)
