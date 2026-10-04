/** Print CDP Runtime.evaluate expression for mic frequency batch index (0-5). */
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const idx = Number(process.argv[2] ?? 0)
const all = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "mic-asins-all.json"), "utf8"),
)
const asins = all.slice(idx * 25, (idx + 1) * 25).map((x) => x.asin)
if (!asins.length) {
  console.error("No batch", idx)
  process.exit(1)
}
const expr = `(async () => { const asins = ${JSON.stringify(asins)}; const out = []; for (const asin of asins) { await new Promise(r => setTimeout(r, 800)); try { const html = await fetch('https://www.amazon.co.jp/dp/' + asin).then(r => r.text()); const title = html.match(/id="productTitle"[^>]*>([\\s\\S]*?)<\\//)?.[1]?.replace(/\\s+/g,' ').trim() || ''; const table = {}; const re = /<th[^>]*prodDetSectionEntry[^>]*>([\\s\\S]*?)<\\/th>\\s*<td[^>]*prodDetAttrValue[^>]*>([\\s\\S]*?)<\\/td>/gi; let m; while ((m = re.exec(html)) !== null) { const key = m[1].replace(/<[^>]+>/g,'').trim(); const val = m[2].replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').trim(); if (key && val) table[key] = val; } out.push({asin, title, table}); } catch(e) { out.push({asin, title: '', table: {}, error: String(e)}); } } return JSON.stringify(out); })()`
console.log(expr)
