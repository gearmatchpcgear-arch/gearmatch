import { readFileSync } from "fs"
import { mousePopularBrands } from "../lib/mouse-popular-brands.js"
import { mouseBestsellers } from "../lib/mouse-bestsellers.js"
import { passesMouseListFilter } from "./mouse-list-filter.mjs"

const bestsellerUrls = new Set(mouseBestsellers.map((g) => g.purchaseUrl))
const popularUnique = mousePopularBrands.filter((g) => !bestsellerUrls.has(g.purchaseUrl))
const visible = popularUnique.filter(passesMouseListFilter)
console.log(`Popular: ${mousePopularBrands.length}, unique vs bestsellers: ${popularUnique.length}, visible: ${visible.length}`)
