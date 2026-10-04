/**
 * Sync audio-interface samplingRate from LOCAL sources only.
 *
 * Sources (in priority order):
 *   1. scripts/audio-interface-specs-known.mjs (AI_SPECS_KNOWN)
 *   2. scripts/audio-interface-sampling-rate-cache.json (pre-existing local cache)
 *   3. Product tagline in lib/audio-interface-bestsellers.ts
 *   4. "—" when unknown
 *
 * Does NOT fetch or scrape Amazon. For manual cache entries, edit the JSON cache
 * or AI_SPECS_KNOWN directly.
 *
 * Usage: node scripts/cleanse-audio-interface-sampling-rates.mjs [--apply]
 *
 * @deprecated Prefer: node scripts/fix-audio-interface-sampling-rates.mjs [--apply]
 */
import { spawnSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const fixScript = path.join(root, "scripts/fix-audio-interface-sampling-rates.mjs")
const args = process.argv.slice(2).filter((a) => a !== "--force-fetch")

console.log(
  "Note: Amazon fetch is disabled. Syncing from AI_SPECS_KNOWN, local cache, and taglines only.\n",
)

const result = spawnSync(process.execPath, [fixScript, ...args], {
  stdio: "inherit",
  cwd: root,
})

process.exit(result.status ?? 1)
