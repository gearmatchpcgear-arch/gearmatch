import { gadgets } from "../lib/gadgets.ts"

const mouse = gadgets.filter((g) => g.category === "mouse")
const ids = new Map()
for (const g of mouse) {
  if (!ids.has(g.id)) ids.set(g.id, [])
  ids.get(g.id).push(g.name.slice(0, 40))
}
const dups = [...ids.entries()].filter(([, v]) => v.length > 1)
console.log("mouse count", mouse.length, "dup ids", dups.length)
for (const [id, names] of dups.slice(0, 20)) console.log(id, names)

const chairRe = /チェア|chair|リクライニング|オットマン|GTRACING|GTPLAYER/i
const chairInMouse = mouse.filter((g) => chairRe.test(`${g.name} ${g.tagline}`))
console.log("chairs in mouse category", chairInMouse.length)
for (const g of chairInMouse.slice(0, 10)) console.log(g.id, g.name)

const allIds = new Map()
for (const g of gadgets) {
  if (!allIds.has(g.id)) allIds.set(g.id, [])
  allIds.get(g.id).push({ category: g.category, name: g.name.slice(0, 35) })
}
const allDups = [...allIds.entries()].filter(([, v]) => v.length > 1)
console.log("\nAll duplicate ids:", allDups.length)
for (const [id, entries] of allDups) {
  console.log(id, entries.map((e) => `${e.category}:${e.name}`).join(" | "))
}
