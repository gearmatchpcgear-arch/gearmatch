/**
 * Apply CAMERA_CONNECTION_KNOWN → lib/camera-*.ts
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { CAMERA_CONNECTION_KNOWN } from "./camera-connection-known.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

let blocks = 0
let files = 0

for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.startsWith("camera-") || !file.endsWith(".ts")) continue
  const path = join(ROOT, "lib", file)
  const original = readFileSync(path, "utf8")

  const blockRe =
    /\{[\s\S]*?category: "camera"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?\n  \}(?:,|\n)/g

  let changed = false
  const out = original.replace(blockRe, (block, asin) => {
    const connection = CAMERA_CONNECTION_KNOWN[asin]
    if (!connection) return block

    let next = block
    if (/connection: "—"/.test(next)) {
      next = next.replace(/connection: "—"/, `connection: "${connection}"`)
    } else if (/connection: "-"/.test(next)) {
      next = next.replace(/connection: "-"/, `connection: "${connection}"`)
    } else {
      return block
    }

    next = next.replace(
      /\{ label: "接続端子", value: "—" \}/,
      `{ label: "接続端子", value: "${connection}" }`,
    )
    next = next.replace(
      /\{ label: "接続端子", value: "-" \}/,
      `{ label: "接続端子", value: "${connection}" }`,
    )

    if (next !== block) {
      blocks++
      changed = true
    }
    return next
  })

  if (changed) {
    writeFileSync(path, out)
    files++
  }
}

console.log(`Updated connection on ${blocks} camera blocks in ${files} files`)
