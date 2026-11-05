/** トップ一覧の製品詳細モーダル用クエリ（共有リンク・履歴と同期） */
export const GADGET_DETAIL_QUERY_PARAM = "product"

export function getGadgetIdFromSearchParams(searchParams: URLSearchParams): string | null {
  const id = searchParams.get(GADGET_DETAIL_QUERY_PARAM)?.trim()
  return id || null
}

export function getGadgetIdFromLocation(href = typeof window === "undefined" ? "" : window.location.href): string | null {
  if (!href) return null
  try {
    return getGadgetIdFromSearchParams(new URL(href).searchParams)
  } catch {
    return null
  }
}

export function buildPathWithGadgetId(pathname: string, search: string, gadgetId: string | null): string {
  const params = new URLSearchParams(search)
  if (gadgetId) params.set(GADGET_DETAIL_QUERY_PARAM, gadgetId)
  else params.delete(GADGET_DETAIL_QUERY_PARAM)
  const qs = params.toString()
  return qs ? `${pathname}?${qs}` : pathname
}
