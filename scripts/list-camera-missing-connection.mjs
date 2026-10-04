import { readFileSync } from "fs"

const blockRe =
  /\{[\s\S]*?category: "camera"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?\n  \}/g

for (const file of ["lib/camera-bestsellers.ts", "lib/camera-streaming-search.ts"]) {
  const t = readFileSync(file, "utf8")
  for (const block of t.matchAll(blockRe)) {
    const b = block[0]
    const conn = b.match(/connection: "([^"]*)"/)?.[1]
    if (conn !== "—" && conn !== "-") continue
    const asin = block[1]
    const name = b.match(/name: "([^"]*)"/)?.[1]
    const brand = b.match(/brand: "([^"]*)"/)?.[1]
    console.log([asin, brand, name, file].join("\t"))
  }
}
