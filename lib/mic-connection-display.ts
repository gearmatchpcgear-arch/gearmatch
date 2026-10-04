import { UNSPECIFIED_SPEC, type Gadget } from "@/lib/gadgets"
import { resolveMicInterfaceValue } from "@/lib/card-spec-field-resolvers"
import { normalizeMicConnectionDisplay } from "@/lib/spec-display-normalize"

export { normalizeMicConnectionDisplay as formatMicConnectionDisplay }

function pickBestConnection(sources: (string | undefined | null)[]): string {
  let best = UNSPECIFIED_SPEC
  let bestCount = 0
  for (const src of sources) {
    if (!src || src === UNSPECIFIED_SPEC || src === "-") continue
    const formatted = normalizeMicConnectionDisplay(src)
    const count = formatted.split(" / ").filter(Boolean).length
    if (count > bestCount || (count === bestCount && formatted.length > best.length)) {
      best = formatted
      bestCount = count
    }
  }
  return best
}

/** マイクカード「接続方式」表示（複数インターフェースをすべて列挙） */
export function getMicConnectionDisplay(gadget: Gadget): string {
  if (gadget.category !== "mic") return UNSPECIFIED_SPEC

  if (gadget.connection) {
    const fromConnection = normalizeMicConnectionDisplay(gadget.connection)
    if (fromConnection !== UNSPECIFIED_SPEC) return fromConnection
  }

  const fromHighlight = gadget.highlights.find(
    (h) => h.label === "接続方式" || h.label === "端子",
  )?.value

  const fromSpec = gadget.specGroups
    .flatMap((g) => g.rows)
    .find((r) => r.label === "接続方式")?.value

  const fromInterface = resolveMicInterfaceValue(gadget)

  return pickBestConnection([fromInterface, fromHighlight, fromSpec])
}
