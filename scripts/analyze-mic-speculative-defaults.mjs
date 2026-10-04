/**
 * Analyze mic entries with suspicious default frequency / sample rate values.
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { MIC_CARD_SPECS_KNOWN } from "./mic-card-specs-known.mjs"
import { MIC_FREQUENCY_KNOWN } from "./mic-frequency-known.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const cache = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "mic-frequency-response-cache.json"), "utf8"),
)

const DEFAULT_FREQ = /^20\s*Hz[-–]20\s*kHz$/i
const DEFAULT_SR =
  /^(48\s*kHz\s*\/\s*16\s*bit|48kHz\/16bit|16\s*bit\s*\/\s*48\s*kHz|24bit\s*\/\s*48kHz)$/i

const items = []
for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const src = readFileSync(join(ROOT, "lib", file), "utf8")
  if (!src.includes('category: "mic"')) continue
  const re =
    /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?highlights: \[([\s\S]*?)\]/g
  let m
  while ((m = re.exec(src))) {
    const asin = m[1]
    const hl = m[2]
    const freq = hl.match(/label: "周波数特性", value: "([^"]*)"/)?.[1]
    const sr = hl.match(/label: "サンプルレート", value: "([^"]*)"/)?.[1]
    items.push({ asin, freq, sr, file })
  }
}

const defFreq = items.filter((i) => DEFAULT_FREQ.test(i.freq || ""))
const defSr = items.filter((i) => DEFAULT_SR.test(i.sr || ""))

const verifiedFreq = new Set(Object.keys(MIC_FREQUENCY_KNOWN))
for (const [asin, d] of Object.entries(cache)) {
  if (d.highlight && d.highlight !== "—" && d.source && !["body", null].includes(d.source)) {
    verifiedFreq.add(asin)
  }
}

const verifiedSr = new Set(
  Object.entries(MIC_CARD_SPECS_KNOWN)
    .filter(([, s]) => s["サンプルレート"] && s["サンプルレート"] !== "—")
    .map(([a]) => a),
)

console.log("total mic highlight blocks", items.length)
console.log("default freq 20-20k", defFreq.length)
console.log("default sr 48/16", defSr.length)
console.log("def freq not in verifiedFreq", defFreq.filter((i) => !verifiedFreq.has(i.asin)).length)
console.log("def sr not in verifiedSr", defSr.filter((i) => !verifiedSr.has(i.asin)).length)
console.log(
  "unverified freq ASINs",
  [...new Set(defFreq.filter((i) => !verifiedFreq.has(i.asin)).map((i) => i.asin))].slice(0, 30),
)
console.log(
  "unverified sr ASINs",
  [...new Set(defSr.filter((i) => !verifiedSr.has(i.asin)).map((i) => i.asin))].slice(0, 30),
)
