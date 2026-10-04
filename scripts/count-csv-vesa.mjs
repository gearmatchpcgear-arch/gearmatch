import fs from "node:fs"

let t = fs.readFileSync("monitors.csv", "utf8")
if (t.charCodeAt(0) === 0xfeff) t = t.slice(1)

function parseLine(line) {
  const out = []
  let cur = ""
  let q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
        continue
      }
      if (c === '"') {
        q = false
        continue
      }
      cur += c
      continue
    }
    if (c === '"') {
      q = true
      continue
    }
    if (c === ",") {
      out.push(cur)
      cur = ""
      continue
    }
    cur += c
  }
  out.push(cur)
  return out
}

const lines = t.split(/\r?\n/).filter(Boolean)
const hdr = parseLine(lines[0])
const vi = hdr.indexOf("VESA規格")
let dash = 0
let emdash = 0
let other = 0

for (let i = 1; i < lines.length; i++) {
  const v = parseLine(lines[i])[vi]?.trim() ?? ""
  if (v === "-") dash++
  else if (v === "—") emdash++
  else other++
}

console.log({ rows: lines.length - 1, vi, dash, emdash, other })
