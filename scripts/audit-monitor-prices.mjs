/** Audit monitor gadgets with missing display prices (price: 0 or null). */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const LIB = join(ROOT, "lib")

const files = readdirSync(LIB).filter(
  (f) => f.startsWith("monitor") && f.endsWith(".ts") && !f.startsWith("monitor-arm"),
)

const missing = []

for (const file of files) {
  const src = readFileSync(join(LIB, file), "utf8")
  if (!src.includes("purchaseUrl:")) continue

  const re =
    /name: "([^"]*)"[\s\S]*?price: (null|\d+)[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
  let m
  while ((m = re.exec(src)) !== null) {
    const [, name, price, asin] = m
    if (price === "null" || price === "0") {
      missing.push({ file, asin, name, price })
    }
  }
}

console.log(`Monitor missing prices: ${missing.length}`)
const byFile = {}
for (const x of missing) {
  byFile[x.file] = (byFile[x.file] ?? 0) + 1
}
console.log("By file:", JSON.stringify(byFile, null, 2))
for (const x of missing) {
  console.log(`${x.asin}\t${x.price}\t${x.name.slice(0, 70)}\t${x.file}`)
}
