"use client"

import { useCallback, useEffect, useRef } from "react"
import type { Gadget } from "@/lib/gadgets"
import {
  buildPathWithGadgetId,
  getGadgetIdFromLocation,
} from "@/lib/gadget-detail-url"

type ResolveGadget = (id: string) => Gadget | undefined

/**
 * 製品詳細モーダルと URL / History API を同期する。
 * 開くとき pushState、戻る操作では popstate でモーダルを閉じる。
 */
export function useGadgetDetailHistory(
  setOpenGadget: (gadget: Gadget | null) => void,
  resolveGadget: ResolveGadget,
) {
  const pushedEntryRef = useRef(false)

  const syncOpenFromUrl = useCallback(() => {
    const id = getGadgetIdFromLocation()
    if (!id) {
      setOpenGadget(null)
      return
    }
    const gadget = resolveGadget(id)
    setOpenGadget(gadget ?? null)
  }, [resolveGadget, setOpenGadget])

  useEffect(() => {
    syncOpenFromUrl()
  }, [syncOpenFromUrl])

  useEffect(() => {
    const onPopState = () => {
      const id = getGadgetIdFromLocation()
      if (id) {
        const gadget = resolveGadget(id)
        setOpenGadget(gadget ?? null)
        pushedEntryRef.current = true
      } else {
        setOpenGadget(null)
        pushedEntryRef.current = false
      }
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [resolveGadget, setOpenGadget])

  const openGadgetDetail = useCallback(
    (id: string) => {
      const gadget = resolveGadget(id)
      if (!gadget) return

      setOpenGadget(gadget)

      if (typeof window === "undefined") return

      const currentId = getGadgetIdFromLocation()
      if (currentId === id) return

      const { pathname, search } = window.location
      const next = buildPathWithGadgetId(pathname, search, id)
      window.history.pushState({ gadgetDetail: id }, "", next)
      pushedEntryRef.current = true
    },
    [resolveGadget, setOpenGadget],
  )

  const closeGadgetDetail = useCallback(() => {
    setOpenGadget(null)

    if (typeof window === "undefined") return

    const hasProductInUrl = Boolean(getGadgetIdFromLocation())
    if (!hasProductInUrl) {
      pushedEntryRef.current = false
      return
    }

    if (pushedEntryRef.current) {
      pushedEntryRef.current = false
      window.history.back()
      return
    }

    const { pathname, search } = window.location
    const next = buildPathWithGadgetId(pathname, search, null)
    window.history.replaceState(window.history.state, "", next)
  }, [setOpenGadget])

  return { openGadgetDetail, closeGadgetDetail }
}
