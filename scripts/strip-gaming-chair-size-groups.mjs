/**
 * Strip all "サイズ / 寸法" spec groups from gaming-chair lib files.
 * Re-run apply-gaming-chair-dimensions.mjs afterward.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join } from "path"

const SIZE_GROUP = /\{ title: "サイズ \/ 寸法", rows: \[[\s\S]*?\]\s*\},?\n?/g
let filesChanged = 0
let removed = 0

for (const file of readdirSync("lib")) {
  if (!file.startsWith("gaming-chair") || !file.endsWith(".ts")) continue
  const path = join("lib", file)
  const original = readFileSync(path, "utf8")
  const matches = original.match(SIZE_GROUP)
  if (!matches?.length) continue
  const out = original.replace(SIZE_GROUP, () => {
    removed++
    return ""
  })
  writeFileSync(path, out)
  filesChanged++
}

console.log(`stripped ${removed} size groups from ${filesChanged} files`)
