/** Save browser fetch JSON to browser-spec-batches and re-merge cache. */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { spawnSync } from "child_process"

const __dirname = dirname(fileURLToPath(import.meta.url))
const batchIdx = process.argv[2]
const inFile = process.argv[3]
if (!batchIdx || !inFile) {
  console.error("Usage: node scripts/save-fetch-batch.mjs <batchIndex> <extract.json>")
  process.exit(1)
}

const outDir = join(__dirname, "browser-spec-batches")
const outFile = join(outDir, `fetch-batch-${String(batchIdx).padStart(2, "0")}.json`)
const data = JSON.parse(readFileSync(inFile, "utf8"))
writeFileSync(outFile, JSON.stringify(data, null, 2) + "\n")
console.log(`Saved ${data.length} entries → ${outFile}`)

spawnSync("node", [join(__dirname, "process-all-extract-batches.mjs")], { stdio: "inherit", cwd: join(__dirname, "..") })
spawnSync("node", [join(__dirname, "reconcile-weight-and-buttons.mjs")], {
  stdio: "inherit",
  cwd: join(__dirname, ".."),
  env: { ...process.env, FETCH_LIMIT: "0" },
})
