import { chromium } from "playwright"
import { parseDetailTable } from "./amazon-monitor-body-specs.mjs"
import { resolveGamingChairReclineAngle } from "./gaming-chair-recline-known.mjs"

const ASINS = [
  "B094QHNK83",
  "B0D1QLTD5G",
  "B0CZ943PLQ",
  "B0D4LLT6FC",
  "B0GXDRY84Q",
  "B0B6NP6CNX",
  "B0H2LQ86PL",
  "B0FZ13KWGV",
  "B096TR8VKB",
]

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ locale: "ja-JP" })

for (const asin of ASINS) {
  await page.goto(`https://www.amazon.co.jp/dp/${asin}`, {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  })
  await page.waitForTimeout(2000)
  const html = await page.content()
  if (/Page Not Found|お探しのページ/i.test(html)) {
    console.log(asin, "NOT_FOUND")
    continue
  }
  const title =
    html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/i)?.[1]?.replace(/<[^>]+>/g, " ").trim() ??
    asin
  if (!/akracing|エーケーレーシング/i.test(title + html.slice(0, 8000))) {
    console.log(asin, "SKIP", title.slice(0, 60))
    continue
  }
  const price = html.match(/class="a-price-whole">([\d,]+)/)?.[1] ?? "?"
  const variants = [
    ...new Set(
      [...html.matchAll(/data-asin="([A-Z0-9]{10})"/gi)].map((m) => m[1].toUpperCase()),
    ),
  ].filter((a) => a.startsWith("B"))
  const detailMap = parseDetailTable(html)
  const recline = resolveGamingChairReclineAngle(asin, `${title} ${JSON.stringify(detailMap)} ${html.slice(0, 80000)}`)
  console.log(`\n${asin} ¥${price} recline=${recline}`)
  console.log(" ", title.slice(0, 130))
  console.log("  variants:", variants.filter((v) => v !== asin).join(", ") || "none")
}

await browser.close()
