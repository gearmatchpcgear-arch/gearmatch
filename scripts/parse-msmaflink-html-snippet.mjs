/**
 * かんたんリンク HTML から msmaflink({...}) の JSON オブジェクトを抽出。
 * Usage: node scripts/parse-msmaflink-html-snippet.mjs path/to/snippet.html
 *    or: node scripts/parse-msmaflink-html-snippet.mjs --stdin  < snippet.html
 */
import fs from "node:fs"

function readInput(pathArg) {
  if (pathArg === "--stdin") {
    return fs.readFileSync(0, "utf8")
  }
  if (!pathArg) {
    console.error("Usage: node scripts/parse-msmaflink-html-snippet.mjs <file|--stdin>")
    process.exit(1)
  }
  return fs.readFileSync(pathArg, "utf8")
}

function extractMsmaflinkObject(html) {
  const marker = "msmaflink("
  const start = html.indexOf(marker)
  if (start < 0) {
    throw new Error("msmaflink( が見つかりません")
  }

  let i = start + marker.length
  while (i < html.length && /\s/.test(html[i])) i++

  if (html[i] !== "{") {
    throw new Error("msmaflink の引数オブジェクト開始 { が見つかりません")
  }

  let depth = 0
  let inString = false
  let escape = false
  const begin = i

  for (; i < html.length; i++) {
    const ch = html[i]

    if (inString) {
      if (escape) {
        escape = false
        continue
      }
      if (ch === "\\") {
        escape = true
        continue
      }
      if (ch === '"') {
        inString = false
      }
      continue
    }

    if (ch === '"') {
      inString = true
      continue
    }

    if (ch === "{") depth++
    else if (ch === "}") {
      depth--
      if (depth === 0) {
        const raw = html.slice(begin, i + 1)
        // eslint-disable-next-line no-new-func
        return Function(`"use strict"; return (${raw})`)()
      }
    }
  }

  throw new Error("msmaflink オブジェクトの終端 } が見つかりません")
}

const pathArg = process.argv[2]
const html = readInput(pathArg)
const config = extractMsmaflinkObject(html)
process.stdout.write(`${JSON.stringify(config, null, 2)}\n`)
