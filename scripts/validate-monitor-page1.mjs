import { gadgets } from "../lib/gadgets.js"
import { inferMonitorFilterTags } from "../lib/monitor-filter-tags.js"

const bs = gadgets.filter(
  (g) =>
    g.category === "monitor" &&
    g.specGroups.some((sg) =>
      sg.rows.some((r) => /Amazon売れ筋/.test(r.label) && /#(\d+)/.test(r.value)),
    ),
)

const ranks = bs
  .map((g) => {
    const row = g.specGroups
      .flatMap((sg) => sg.rows)
      .find((r) => r.label === "Amazon売れ筋")
    const m = row?.value.match(/#(\d+)/)
    return m ? Number(m[1]) : null
  })
  .filter((n) => n != null)
  .sort((a, b) => a - b)

const missing = []
for (let i = 1; i <= 50; i++) if (!ranks.includes(i)) missing.push(i)

console.log("Bestseller page1 in gadgets:", ranks.length)
console.log("Missing ranks:", missing.length ? missing : "none")
console.log("Sample #1:", bs.find((g) => g.id === "mon-bs-001")?.name)
console.log("Sample #50:", bs.find((g) => g.id === "mon-bs-050")?.name)

const sample = bs.find((g) => g.id === "mon-bs-004")
if (sample) {
  console.log("#4 filter tags:", inferMonitorFilterTags(sample).join(", "))
}
