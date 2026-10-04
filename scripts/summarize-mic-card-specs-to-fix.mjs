import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const missing = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "mic-card-specs-missing.json"), "utf8"),
)
const DASH = "—"

function isDigitalConnection(conn, values) {
  const t = `${conn} ${values["端子"]}`.toLowerCase()
  return /usb|type-c|lightning|bluetooth|2\.4|wireless/i.test(t) && !/^xlr$/i.test(values["端子"]?.trim())
}

const needsFix = missing.map((item) => {
  const fix = { ...item, shouldFix: [] }
  for (const field of item.missing) {
    if (field === "サンプルレート") {
      if (isDigitalConnection("", item.values)) fix.shouldFix.push(field)
    } else {
      fix.shouldFix.push(field)
    }
  }
  return fix
}).filter((x) => x.shouldFix.length)

writeFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "mic-card-specs-to-fix.json"),
  JSON.stringify(needsFix, null, 2),
)

console.log("needs fix:", needsFix.length)
const byField = {}
for (const x of needsFix) {
  for (const f of x.shouldFix) byField[f] = (byField[f] ?? 0) + 1
}
console.log("by field:", byField)
for (const x of needsFix) {
  console.log(`${x.asin} | ${x.shouldFix.join(",")} | ${x.name.slice(0, 45)}`)
}
