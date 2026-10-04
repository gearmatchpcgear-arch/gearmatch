/**
 * End-to-end mic card spec pipeline: apply cache → audit-fix → cleanse → verify
 */
import { spawnSync } from "child_process"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

function run(script) {
  console.log(`\n=== ${script} ===`)
  const r = spawnSync("node", [join(ROOT, "scripts", script)], {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
  })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

run("migrate-mic-connection-field.mjs")
run("merge-mic-frequency-known.mjs")
run("apply-mic-frequency-response.mjs")
run("apply-mic-card-specs.mjs")
run("audit-fix-mic-directivity.mjs")
run("audit-fix-mic-card-specs.mjs")
run("remove-mic-insufficient-specs.mjs")
run("count-unique-mic-specs.mjs")
run("verify-mic-card-specs.mjs")

console.log("\nPipeline complete.")
