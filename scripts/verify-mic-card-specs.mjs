/**
 * Verify all remaining mic cards have at most 2 unknown specs (no 3+ dashes).
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const DASH = "—"
const FIELDS = ["指向性", "周波数特性", "接続方式", "サンプルレート"]

const bad = []
for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const src = readFileSync(join(ROOT, "lib", file), "utf8")
  if (!src.includes('category: "mic"')) continue
  const re =
    /id: "([^"]+)"[\s\S]*?category: "mic"[\s\S]*?name: "([^"]*)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?highlights: \[([\s\S]*?)\]/g
  let m
  while ((m = re.exec(src))) {
    const hl = m[4]
    const missing = []
    for (const label of FIELDS) {
      const hm = hl.match(new RegExp(`label: "${label}", value: "([^"]*)"`))
      const val = hm?.[1] ?? "MISSING"
      if (val === DASH || val === "-" || val === "MISSING" || val === "") missing.push(label)
    }
    if (missing.length >= 3) {
      bad.push({ id: m[1], asin: m[3], name: m[2], missing, file })
    }
  }
}

if (bad.length) {
  console.error(`FAIL: ${bad.length} mic(s) with 3+ missing specs`)
  for (const x of bad.slice(0, 30)) {
    console.error(`${x.asin} | ${x.missing.join(",")} | ${x.name.slice(0, 40)} (${x.file})`)
  }
  process.exit(1)
}

console.log("OK: no mic entries with 3+ missing card specs")
