import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { inferUpholsteryMaterial } from "./amazon-gaming-chair-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

const files = readdirSync(LIB)
  .filter((f) => f.startsWith("gaming-chair") && f.endsWith(".ts"))
  .map((f) => join(LIB, f))

const re =
  /id: "(chair-[^"]+)"[\s\S]*?name: "([^"]*)"[\s\S]*?tagline: "([^"]*)"[\s\S]*?\{ label: "素材", value: "([^"]*)" \}/g

const seen = new Set()
for (const file of files) {
  const source = readFileSync(file, "utf8")
  let m
  while ((m = re.exec(source))) {
    const [id, name, tagline, material] = m.slice(1)
    if (material !== "—" || seen.has(id)) continue
    seen.add(id)
    const hay = [name, tagline].join(" ")
    const inferred = inferUpholsteryMaterial(hay)
    console.log(`${id}\t${material}\t${inferred}\t${name.slice(0, 50)}\t${tagline}`)
  }
}
