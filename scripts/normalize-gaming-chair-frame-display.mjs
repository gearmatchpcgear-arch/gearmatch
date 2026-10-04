/**
 * Normalize フレームの種類 display values (フレーム: 合金鋼 → 合金鋼フレーム).
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { formatFrameMaterialForCard } from "./amazon-gaming-chair-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

const MAP = {
  "フレーム: 合金鋼": "合金鋼フレーム",
  "フレーム: スチール（鋼鉄）": "スチールフレーム（鋼製）",
  "フレーム: 強化プラスチック": "強化樹脂フレーム",
  "フレーム: アルミ合金": "アルミ合金フレーム",
}

let total = 0
for (const file of readdirSync(LIB).filter((f) => f.startsWith("gaming-chair") && f.endsWith(".ts"))) {
  let src = readFileSync(join(LIB, file), "utf8")
  let changed = false
  for (const [oldVal, newVal] of Object.entries(MAP)) {
    const re = new RegExp(`(\\{ label: "フレームの種類", value: ")${oldVal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(" \\})`, "g")
    if (re.test(src)) {
      src = src.replace(re, `$1${newVal}$2`)
      changed = true
    }
  }
  if (changed) {
    writeFileSync(join(LIB, file), src)
    total++
    console.log(file)
  }
}
console.log(`Updated ${total} file(s).`)
