import { readFileSync } from "fs"
const g = readFileSync("lib/monitor-bestsellers.ts", "utf8")
const re =
  /id: "mon-bs-(\d+)"[\s\S]*?name: "([^"]+)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]+)"/g
let m
while ((m = re.exec(g))) console.log(`${m[1]}\t${m[3]}\t${m[2]}`)
