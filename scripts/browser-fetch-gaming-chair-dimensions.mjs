/**
 * Browser-based dimension fetch for fetch-failed ASINs.
 * Uses Puppeteer with the same extraction JS as cursor-ide-browser MCP.
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import puppeteer from "puppeteer"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "gaming-chair-dimensions-cache.json")
const RESULTS_PATH = join(__dirname, "gaming-chair-browser-results.json")

const EXTRACT_JS = `(() => {
  const text = [...document.querySelectorAll('table')].map(t=>t.innerText).join('\\n') + '\\n' + document.body.innerText;
  if (/Robot Check|captcha|ショッピングを続け/i.test(text)) return { error: 'blocked' };
  const out = {};
  const prod = text.match(/Product Dimensions\\s*(\\d+(?:\\.\\d+)?)D x (\\d+(?:\\.\\d+)?)W x (\\d+(?:\\.\\d+)?)H cm/i);
  if (prod) out.dimensions = prod[2] + ' × ' + prod[1] + ' × ' + prod[3] + ' cm';
  const item = text.match(/Item Dimensions[^\\d]{0,40}(\\d+(?:\\.\\d+)?)\\s*[x×]\\s*(\\d+(?:\\.\\d+)?)\\s*[x×]\\s*(\\d+(?:\\.\\d+)?)\\s*cm/i);
  if (!out.dimensions && item) out.dimensions = item[1]+' × '+item[2]+' × '+item[3]+' cm';
  const jpDim = text.match(/([\\d.]+\\s*奥行(?:き|)?\\s*[x×]\\s*[\\d.]+\\s*幅\\s*[x×]\\s*[\\d.]+\\s*高(?:さ|)?\\s*cm)/i);
  if (!out.dimensions && jpDim) {
    const m = jpDim[1].match(/([\\d.]+).*?[x×].*?([\\d.]+).*?[x×].*?([\\d.]+)/);
    if (m) out.dimensions = m[1]+' × '+m[2]+' × '+m[3]+' cm';
  }
  const jp = (re) => { const m = text.match(re); return m ? m[1]+' cm' : null; };
  const seatDepth = jp(/(?:座部奥行き|座部奥行|座面の奥行)[^0-9]{0,24}([\\d.]+)\\s*(?:cm|センチ)/i);
  const seatWidth = jp(/(?:座面の長さ|座面の幅)[^0-9]{0,24}([\\d.]+)\\s*(?:cm|センチ)/i);
  const backrestWidth = jp(/(?:椅子の背もたれの幅|背もたれの幅)[^0-9]{0,24}([\\d.]+)\\s*(?:cm|センチ)/i);
  if (seatDepth) out.seatDepth = seatDepth;
  if (seatWidth) out.seatWidth = seatWidth;
  if (backrestWidth) out.backrestWidth = backrestWidth;
  for (const k of Object.keys(out)) if (!out[k]) delete out[k];
  return out;
})()`

const FIELDS = ["dimensions", "seatDepth", "seatWidth", "backrestWidth"]

const cache = JSON.parse(readFileSync(CACHE_PATH, "utf8"))
const failedAsins = Object.entries(cache)
  .filter(([, v]) => v.source === "fetch-failed")
  .map(([asin]) => asin)

const existing = existsSync(RESULTS_PATH) ? JSON.parse(readFileSync(RESULTS_PATH, "utf8")) : {}
const results = { ...existing }
let processed = 0
let extracted = 0
let blocked = 0

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
})
const page = await browser.newPage()
await page.setUserAgent(
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)
await page.setExtraHTTPHeaders({ "Accept-Language": "ja-JP,ja;q=0.9" })

for (const asin of failedAsins) {
  processed++
  process.stdout.write(`[${processed}/${failedAsins.length}] ${asin} ... `)
  try {
    await page.goto(`https://www.amazon.co.jp/dp/${asin}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    })
    await new Promise((r) => setTimeout(r, 1500))
    const out = await page.evaluate(EXTRACT_JS)
    if (out?.error === "blocked") {
      console.log("blocked")
      blocked++
    } else if (out && FIELDS.some((f) => out[f])) {
      results[asin] = out
      extracted++
      console.log("ok", JSON.stringify(out))
    } else {
      console.log("no dims")
    }
  } catch (e) {
    console.log("error", e.message)
  }
  await new Promise((r) => setTimeout(r, 1000))
  if (processed % 10 === 0) {
    writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2) + "\n")
  }
}

await browser.close()
writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2) + "\n")
console.log(JSON.stringify({ processed, extracted, blocked, totalResults: Object.keys(results).length }))
