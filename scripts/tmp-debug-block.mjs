import { readFileSync } from "fs"
import { resolveMonitorVesaKnown } from "./monitor-vesa-known.mjs"

const src = readFileSync("lib/monitor-lenovo-search-26plus-page2.ts", "utf8")
const blockRe = /(\{\s*\n\s*id: "[^"]+"[\s\S]*?\n  \},)/g
let m
while ((m = blockRe.exec(src))) {
  if (!m[1].includes("B0GWDVFYBY")) continue
  const block = m[1]
  const asin = "B0GWDVFYBY"
  const name = block.match(/^\s*name:\s*"([^"]*)"/m)?.[1] ?? ""
  const tagline = block.match(/^\s*tagline:\s*"([^"]*)"/m)?.[1] ?? ""
  const hay = `${name} ${tagline} ${block.replace(/\\"/g, '"').replace(/\n/g, " ")}`
  const vesa = resolveMonitorVesaKnown(asin, hay)
  console.log({ vesa, hasVesaLine: /vesaStandard:/.test(block), blockLen: block.length })
}
