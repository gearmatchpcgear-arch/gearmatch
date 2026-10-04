import { readFileSync } from "fs"
import { inferConnector, inferDimensionsWeight } from "./amazon-camera-specs.mjs"

const files = process.argv.slice(2)
for (const arg of files) {
  const [asin, path] = arg.split("=")
  const html = readFileSync(path, "utf8")
  const titleMatch = html.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)
  const title = titleMatch?.[1]?.replace(/\s+/g, " ").trim() ?? ""
  const { detailMap } = inferDimensionsWeight(html, title)
  const conn = inferConnector(`${title} ${html.slice(0, 80000)}`, detailMap)
  const usbRows = Object.entries(detailMap).filter(([k, v]) =>
    /usb|接続|interface|インタ/i.test(`${k} ${v}`),
  )
  console.log(JSON.stringify({ asin, conn, usbRows, title: title.slice(0, 80) }))
}
