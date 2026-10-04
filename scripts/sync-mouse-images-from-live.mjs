/**
 * Sync mouse gadget card images from live Amazon product pages (purchaseUrl ASIN).
 * Updates image URLs only — does not change purchaseUrl ASINs.
 *
 * Usage:
 *   node scripts/sync-mouse-images-from-live.mjs
 *   node scripts/sync-mouse-images-from-live.mjs --dry-run
 */
import { execSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const dryRun = process.argv.includes("--dry-run")
const args = [
  "scripts/sync-gadget-images-from-live.mjs",
  dryRun ? "" : "--apply",
  "--category=mouse",
  "--refresh",
].filter(Boolean)

execSync(`node ${args.join(" ")}`, { cwd: ROOT, stdio: "inherit" })
