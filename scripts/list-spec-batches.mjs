/**
 * List ASIN batches for browser spec fetch.
 * node scripts/list-spec-batches.mjs [batchSize]
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const batchSize = Number(process.argv[2] || 15)

function isMouse(title) {
  const h = title.toLowerCase()
  if (!/mouse|マウス|トラックボール|trackball|marble|\bmaus\b/i.test(h)) return false
  if (
    /mouse sole|webcam|mouthpiece|マウスピース|keycap|keyboard|chromebook|bundle|calculator|電卓|adapter only|hyperpolling.*adapter|presenter|touchpad|foot pedal|ring mouse|air mouse|bungee|charging dock only|receiver only|レシーバー|microphone|kettle|t-shirt|pop!|applique|fan|knife|stand|controller storage|laptop stand|プリンタ|printer|keychain|foot switch|タッチパッド|touchpad|pen -|surface pen|wedge touch|coupler|presenter|water kettle|tefal|disney|mickey.*fan|mickey.*keychain|bolt usb receiver|mousepad|マウスパッド/i.test(
      h,
    )
  )
    return false
  return true
}

const search = JSON.parse(
  readFileSync(join(__dirname, "popular-brand-search.json"), "utf8"),
)
const cache = JSON.parse(
  readFileSync(join(__dirname, "mouse-specs-cache.json"), "utf8"),
)

const mice = search.items.filter((i) => isMouse(i.title))
const need = mice.filter((i) => !cache[i.asin]?.specs).map((i) => i.asin)
const batches = []
for (let i = 0; i < need.length; i += batchSize) {
  batches.push(need.slice(i, i + batchSize))
}
const payload = { total: need.length, batches: batches.length, asinBatches: batches }
writeFileSync(join(__dirname, "batch-list.json"), JSON.stringify(payload, null, 2))
console.log(JSON.stringify(payload))
