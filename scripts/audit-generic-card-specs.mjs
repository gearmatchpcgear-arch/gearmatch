/**
 * モニター / マイクのカードスペックで同一値が異常に多い汎用デフォルトを検出
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

function countLabels(category, label) {
  const counts = new Map()
  let total = 0
  for (const file of readdirSync(LIB).filter((f) => f.endsWith(".ts"))) {
    const src = readFileSync(join(LIB, file), "utf8")
    if (!src.includes(`category: "${category}"`)) continue
    const re = new RegExp(`\\{ label: "${label}", value: "([^"]*)" \\}`, "g")
    let m
    while ((m = re.exec(src))) {
      total++
      counts.set(m[1], (counts.get(m[1]) ?? 0) + 1)
    }
  }
  return { total, counts }
}

function report(title, category, label, warnRatio = 0.4) {
  const { total, counts } = countLabels(category, label)
  console.log(`\n=== ${title} (${total} cards) ===`)
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  for (const [val, n] of sorted.slice(0, 8)) {
    const ratio = total ? n / total : 0
    const flag = ratio >= warnRatio && val !== "—" ? " ⚠️" : ""
    console.log(`  ${n}x (${Math.round(ratio * 100)}%) ${val}${flag}`)
  }
}

report("Monitor refresh", "monitor", "リフレッシュ")
report("Monitor resolution", "monitor", "解像度")
report("Mic sample rate", "mic", "サンプルレート")
report("Mic frequency", "mic", "周波数特性")
