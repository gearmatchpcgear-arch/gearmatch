import excludedIds from "@/data/repository-excluded-gadget-ids.json"

const EXCLUDED_SET = new Set(
  excludedIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0),
)

/** ゴミ箱で除外し、一覧・件数から外す ID（ソース purge 前の一時除外も含む） */
export function isRepositoryExcludedGadgetId(id: string): boolean {
  return EXCLUDED_SET.has(id)
}

export function getRepositoryExcludedGadgetIds(): string[] {
  return [...EXCLUDED_SET]
}
