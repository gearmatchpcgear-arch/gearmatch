import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

const files = readdirSync(LIB).filter((f) => f.startsWith("gaming-chair") && f.endsWith(".ts"))
const asinMap = new Map()

for (const file of files) {
  const source = readFileSync(join(LIB, file), "utf8")
  const re = /id: "(chair-[^"]+)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})[\s\S]*?\{ label: "素材", value: "([^"]*)" \}/g
  let m
  while ((m = re.exec(source))) {
    const [, id, asin, material] = m
    if (!asinMap.has(asin)) asinMap.set(asin, [])
    asinMap.get(asin).push({ id, material })
  }
}

for (const [asin, items] of asinMap) {
  const mats = [...new Set(items.map((i) => i.material))]
  if (mats.length > 1 || mats[0] === "—") {
    console.log(asin, mats.join("|"), items.map((i) => i.id).join(", "))
  }
}
