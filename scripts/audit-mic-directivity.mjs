/**
 * Audit mic directivity values for common misclassification patterns.
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { existsSync } from "fs"
import { parseAmazonMicCardSpecs } from "./amazon-mic-card-specs.mjs"
import { MIC_CARD_SPECS_KNOWN, DASH } from "./mic-card-specs-known.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const CACHE_PATH = join(dirname(fileURLToPath(import.meta.url)), "mic-card-specs-cache.json")
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}

const issues = {
  lineGunFalsePositive: [],
  pinWrongDir: [],
  missingDir: [],
  cacheMismatch: [],
}

for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const src = readFileSync(join(ROOT, "lib", file), "utf8")
  if (!src.includes('category: "mic"')) continue

  const blockRe =
    /\{[\s\S]*?category: "mic"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?\n  \}(?:,|\n)/g

  let m
  while ((m = blockRe.exec(src))) {
    const block = m[0]
    const asin = m[1]
    const name = block.match(/name: "([^"]*)"/)?.[1] ?? ""
    const tagline = block.match(/tagline: "([^"]*)"/)?.[1] ?? ""
    const hay = `${name} ${tagline}`
    const dir = block.match(/label: "指向性", value: "([^"]*)"/)?.[1] ?? ""
    const tags = block.match(/micFilterTags: \[([^\]]*)\]/)?.[1] ?? ""
    const isPin = /"pin"/.test(tags) || /ピン|ラベリア|clip|lavali/i.test(hay)
    const isShotgun = /ショットガン|shotgun|ガンマイク|AT875|NTG-|VMM|deity.*shot/i.test(hay)

    if (/ライン\+ガン/.test(dir) && !isShotgun) {
      issues.lineGunFalsePositive.push({ asin, file, name: name.slice(0, 50), dir })
    }
    if (isPin && /全指向|無指向|360|omni/i.test(hay) && /単一指向|超単一|cardioid/i.test(dir)) {
      issues.pinWrongDir.push({ asin, file, name: name.slice(0, 50), dir })
    }
    if ((dir === DASH || dir === "-") && /コンデンサ|condenser|卓上|desk|USBマイク|マイクロホン/i.test(hay)) {
      issues.missingDir.push({ asin, file, name: name.slice(0, 50) })
    }

    const html = cache[asin]?.html
    if (html) {
      const reparsed = parseAmazonMicCardSpecs(html)["指向性"]
      const known = MIC_CARD_SPECS_KNOWN[asin]?.["指向性"]
      const expected = known ?? reparsed
      if (expected && dir !== expected && dir !== DASH) {
        issues.cacheMismatch.push({ asin, file, current: dir, expected, name: name.slice(0, 40) })
      }
    }
  }
}

for (const [key, list] of Object.entries(issues)) {
  console.log(`\n=== ${key}: ${list.length} ===`)
  for (const x of list.slice(0, 50)) console.log(JSON.stringify(x))
}
