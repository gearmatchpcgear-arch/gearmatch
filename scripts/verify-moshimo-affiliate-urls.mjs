/**
 * UI 一覧 1819 件の purchaseUrl がもしも計測 URL に解決できるか検証。
 * Usage: npm run verify:moshimo-affiliate
 */
import { gadgets, getListableGadgets } from "../lib/gadgets.ts"
import { isTrackedAffiliatePurchaseUrl } from "../lib/affiliate-purchase-url.ts"
import { resolveGadgetShopUrl } from "../lib/resolve-gadget-shop-url.ts"

const list = getListableGadgets(gadgets, false)
let plainAmazon = 0
let tracked = 0

for (const gadget of list) {
  const resolved = resolveGadgetShopUrl(gadget)
  if (isTrackedAffiliatePurchaseUrl(resolved)) {
    tracked++
  } else if (/amazon\.co\.jp\/dp\//i.test(resolved)) {
    plainAmazon++
    console.warn(`Plain Amazon URL: ${gadget.id} ${gadget.name}`)
  }
}

console.log(`Listable: ${list.length}`)
console.log(`Moshimo/tracked URLs: ${tracked}`)
console.log(`Plain Amazon (should be 0): ${plainAmazon}`)

if (plainAmazon > 0) process.exit(1)
