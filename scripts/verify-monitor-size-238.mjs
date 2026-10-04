import { pathToFileURL } from "url"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const { gadgets } = await import(pathToFileURL(join(ROOT, "lib/gadgets.ts")).href)
const { hasMonitorFilterTag, getMonitorScreenInches, MONITOR_FILTER_TAG_LABELS } =
  await import(pathToFileURL(join(ROOT, "lib/monitor-filter-tags.ts")).href)

const monitors = gadgets.filter((g) => g.category === "monitor")
const hits = monitors.filter((g) => hasMonitorFilterTag(g, "size-238"))
const mobile = hits.filter((g) => {
  const i = getMonitorScreenInches(g)
  return i != null && i < 23.5
})
const excluded24 = monitors.filter((g) => getMonitorScreenInches(g) === 24)
const falsePos = excluded24.filter((g) => hasMonitorFilterTag(g, "size-238"))

console.log("Label:", MONITOR_FILTER_TAG_LABELS["size-238"])
console.log("23.8以下 total:", hits.length, "mobile/small:", mobile.length)
console.log("24inch excluded correctly:", excluded24.length - falsePos.length, "/", excluded24.length)
console.log("Sample mobile:", mobile.slice(0, 3).map((g) => `${g.name} (${getMonitorScreenInches(g)}in)`))
