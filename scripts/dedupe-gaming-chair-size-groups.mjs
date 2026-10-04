/**
 * Remove duplicate "サイズ / 寸法" spec groups from gaming-chair blocks (keep first only).
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join } from "path"

const SIZE_GROUP =
  /\{ title: "サイズ \/ 寸法", rows: \[[\s\S]*?\] \},?\n?/g

let filesChanged = 0
let groupsRemoved = 0

for (const file of readdirSync("lib")) {
  if (!file.startsWith("gaming-chair") || !file.endsWith(".ts")) continue
  const path = join("lib", file)
  const original = readFileSync(path, "utf8")

  const out = original.replace(
    /(\{[\s\S]*?category: "gaming-chair"[\s\S]*?specGroups: \[)([\s\S]*?)(\n    \],[\s\S]*?\n  \})/g,
    (_all, head, body, tail) => {
      const matches = [...body.matchAll(SIZE_GROUP)]
      if (matches.length <= 1) return head + body + tail
      let seen = false
      const cleaned = body.replace(SIZE_GROUP, (m) => {
        if (!seen) {
          seen = true
          return m
        }
        groupsRemoved++
        return ""
      })
      return head + cleaned + tail
    },
  )

  if (out !== original) {
    writeFileSync(path, out)
    filesChanged++
  }
}

console.log(`deduped size groups: removed=${groupsRemoved} files=${filesChanged}`)
