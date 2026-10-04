/**
 * Find mice whose stored power conflicts with rechargeable signals in title/cache.
 */
import { readFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE = join(__dirname, "mouse-specs-cache.json")
const cache = JSON.parse(readFileSync(CACHE, "utf8"))

const RECHARGEABLE = /充電式|リチャージ|rechargeable|usb[- ]?c.*充電|type[- ]?c.*充電|usb充電|内蔵リチウム|リチウムイオン二次|lithium\s*ion|li-po|充電ケーブル|充電用ケーブル|繰り返し充電|built-in.*batter/i
const DISPOSABLE_ONLY = /単[1234]形.*(アルカリ|マンガン|乾電池)|電池交換不要.*単|単3形.*1本|単4形.*1本|aa\s*battery|1\s*x\s*aa|単三|単四/i
const DISPOSABLE_POWER = /^(電池式|単[1234]形|バッテリー式)/

function getPower(entry) {
  const row = entry.specs?.powerRows?.find((r) => r.label === "電源")
  return row?.value ?? entry.specs?.highlights?.power ?? "—"
}

const wrong = []
const fixable = []

for (const [asin, entry] of Object.entries(cache)) {
  const title = entry.title ?? ""
  const power = getPower(entry)
  const ctx = `${title} ${entry.specs?.meta?.movementRaw ?? ""}`
  const rechargeableCtx = RECHARGEABLE.test(ctx)
  const disposableCtx = DISPOSABLE_ONLY.test(ctx) && !/充電式|rechargeable|内蔵リチウム/i.test(ctx)
  const disposablePower = DISPOSABLE_POWER.test(power) && !/充電式/.test(power)

  if (disposablePower && rechargeableCtx && !disposableCtx) {
    wrong.push({ asin, power, title: title.slice(0, 90) })
    fixable.push(asin)
  }
}

console.log(`Wrong rechargeable marked as disposable: ${wrong.length}`)
for (const w of wrong) {
  console.log(`${w.asin} | ${w.power}`)
  console.log(`  ${w.title}`)
}
