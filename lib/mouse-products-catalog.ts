import type { Gadget } from "@/lib/gadgets"
import {
  MOUSE_CATALOG_EXCLUDED_ID_SET,
  MOUSE_PRODUCTS_CSV_BY_ID,
} from "@/lib/mouse-products-catalog.generated"

/** `data/mouse_products.csv` の I 列（除外フラグ「〇」）で一覧から外す */
export function isMouseCatalogListExcluded(gadget: Gadget): boolean {
  if (gadget.category !== "mouse") return false
  return MOUSE_CATALOG_EXCLUDED_ID_SET.has(gadget.id)
}

/** マウス一覧表示（CSV 除外フラグ） */
export function passesMouseCatalogListFilter(gadget: Gadget): boolean {
  if (gadget.category !== "mouse") return true
  return !isMouseCatalogListExcluded(gadget)
}

/** 一覧カード・詳細の商品説明を CSV「商品説明」で上書き */
export function withMouseProductsCsvOverlay(gadget: Gadget): Gadget {
  if (gadget.category !== "mouse") return gadget
  const row = MOUSE_PRODUCTS_CSV_BY_ID[gadget.id]
  if (!row?.description?.trim()) return gadget
  return { ...gadget, tagline: row.description.trim() }
}

export function getMouseProductsCsvRow(gadgetId: string) {
  return MOUSE_PRODUCTS_CSV_BY_ID[gadgetId]
}
