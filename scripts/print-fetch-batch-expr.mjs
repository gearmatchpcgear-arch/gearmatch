/**
 * Print CDP fetch expression for a batch index from fetch-batches.json.
 * node scripts/print-fetch-batch-expr.mjs 0
 */
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const idx = Number(process.argv[2] || 0)
const batches = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "fetch-batches.json"), "utf8"))
const asins = batches.batches[idx]
if (!asins) {
  console.error("No batch", idx)
  process.exit(1)
}
const expr = `(async () => { const asins = ${JSON.stringify(asins)}; const out = []; for (const asin of asins) { await new Promise(r => setTimeout(r, 800)); try { const html = await fetch('https://www.amazon.co.jp/dp/' + asin).then(r => r.text()); const title = html.match(/id="productTitle"[^>]*>([\\s\\S]*?)<\\//)?.[1]?.replace(/\\s+/g,' ').trim() || ''; const map = {}; const re = /<th[^>]*prodDetSectionEntry[^>]*>([\\s\\S]*?)<\\/th>\\s*<td[^>]*prodDetAttrValue[^>]*>([\\s\\S]*?)<\\/td>/gi; let m; while ((m = re.exec(html)) !== null) { const key = m[1].replace(/<[^>]+>/g,'').trim(); const val = m[2].replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').trim(); if (key && val) map[key] = val; } const bullets = [...html.matchAll(/<span class="a-list-item">([\\s\\S]*?)<\\/span>/gi)].map(x=>x[1].replace(/<[^>]+>/g,'').trim()).filter(t=>t.length>4).slice(0,35).join('\\n'); const desc = (html.match(/id="productDescription"[^>]*>([\\s\\S]*?)<\\/div>/i)?.[1] || '').replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').slice(0,3000); const img = html.match(/id="landingImage"[^>]+data-old-hires="([^"]+)"/)?.[1] || html.match(/"hiRes":"([^"]+)"/)?.[1] || ''; out.push({asin, title, map, bullets, desc, img}); } catch(e) { out.push({asin, error: String(e)}); } } return JSON.stringify(out); })()`
console.log(expr)
