import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { buildAsinMetaIndex } from "./build-asin-meta-index.mjs"

const report = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "gadget-image-mismatch-report.json"), "utf8"))
const index = buildAsinMetaIndex()

const CHAIR = /チェア|chair|オットマン|gaming chair|ゲーミングチェア/i
const MON = /モニター|monitor|display|ディスプレイ|インチ|液晶/i

for (const item of report.titleMismatchItems) {
  const meta = index.get(item.asin)
  const title = item.amazonTitle || meta?.title || ""
  const amazonCat = CHAIR.test(title) ? "chair" : MON.test(title) ? "monitor" : "other"
  const cardCat = item.category
  if (amazonCat !== "other" && amazonCat !== cardCat.replace("gaming-chair", "chair").replace("monitor-arm", "monitor")) {
    console.log(item.id, item.category, "->", amazonCat, title.slice(0, 60))
  }
}
