import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE =
  "https://www.amazon.co.jp/s?k=%E3%82%B2%E3%83%BC%E3%83%9F%E3%83%B3%E3%82%B0%E3%83%81%E3%82%A7%E3%82%A2+amazon"
const PAGE3 = `${BASE}&page=3`
const H = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
  Referer: "https://www.amazon.co.jp/",
  Accept: "text/html",
  Connection: "keep-alive",
}

await fetch(BASE, { headers: H }).then((r) => r.text())
await new Promise((r) => setTimeout(r, 2000))
const html = await fetch(PAGE3, { headers: H }).then((r) => r.text())
writeFileSync(join(__dirname, "page3.html"), html)
console.log("len", html.length, "M6", html.includes("M6"), "G7", html.includes("G7"))

const asins = [...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)].map((m) => m[1])
const uniq = [...new Set(asins.filter((a) => a !== "0000000000"))]
console.log("asins", uniq.length)
for (const a of uniq) {
  const i = html.indexOf(`data-asin="${a}"`)
  const sn = html.slice(i, i + 3000)
  if (/M6|G7 Mesh|AutoFull.*G7/i.test(sn)) {
    const alt = sn.match(/alt="([^"]{20,120})"/)?.[1]
    console.log(a, alt?.slice(0, 100))
  }
}
