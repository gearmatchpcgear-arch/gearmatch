/** Count missing refresh fixable from block text (excl. image URLs). */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { inferRefreshRate } from "./amazon-monitor-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")
const files = readdirSync(LIB).filter(f=>f.startsWith("monitor-")&&f.endsWith(".ts")&&!f.includes("arm")&&!f.includes("filter")&&!f.includes("detail")&&!f.includes("vesa"))

function blockHaystack(block){
  return block
    .replace(/image: "https:[^"]+"/g,"")
    .replace(/https:\/\/[^\s"]+/g,"")
    .replace(/\{\s*label: "リフレッシュ[^}]+\}/g,"")
    .replace(/\{\s*label: "リフレッシュレート[^}]+\}/g,"")
}

let missing=0, fixable=0
for(const f of files){
  const src=readFileSync(join(LIB,f),"utf8")
  const re=/(\{\s*\n\s*id: "(mon-[^"]+)"[\s\S]*?\n  \},)/g
  let m
  while((m=re.exec(src))){
    const block=m[1]
    const hl=block.match(/\{\s*label: "リフレッシュ",\s*value: "([^"]*)"\s*\}/)?.[1]??"—"
    const spec=block.match(/\{\s*label: "リフレッシュレート",\s*value: "([^"]*)"\s*\}/)?.[1]??"—"
    if(hl!=="—"||spec!=="—") continue
    missing++
    const name=block.match(/name: "([^"]*)"/)?.[1]??""
    const tagline=block.match(/tagline: "([^"]*)"/)?.[1]??""
    const hz=inferRefreshRate(name+" "+tagline+" "+blockHaystack(block))
    if(hz!=="—") fixable++
  }
}
console.log({missing, fixable})
