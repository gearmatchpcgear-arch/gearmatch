import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { inferMonitorVesaStandardFromText } from "./monitor-vesa-standard.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")
let vesaInText = 0
let inferred = 0
for (const file of readdirSync(LIB).filter((f) => f.startsWith("monitor") && f.endsWith(".ts"))) {
  const src = readFileSync(join(LIB, file), "utf8")
  for (const m of src.matchAll(/tagline: "([^"]*)"/g)) {
    if (/vesa|壁掛け|VESA/i.test(m[1])) {
      vesaInText++
      const inf = inferMonitorVesaStandardFromText(m[1])
      if (inf !== "—") inferred++
    }
  }
}
console.log({ vesaInText, inferred })
