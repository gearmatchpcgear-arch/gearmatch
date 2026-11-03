import moshimoAffiliateConfig from "@/data/moshimo-affiliate-config.json"

export type MoshimoAmazonAffiliateParams = {
  a_id: string
  p_id: string
  pc_id: string
  pl_id: string
}

type MoshimoAffiliateConfigFile = {
  enabled: boolean
  amazon: MoshimoAmazonAffiliateParams
}

const config = moshimoAffiliateConfig as MoshimoAffiliateConfigFile

/** かんたんリンク「Amazonで見る」ボタンと同じもしも計測パラメータ */
export function getDefaultMoshimoAmazonAffiliateParams(): MoshimoAmazonAffiliateParams | null {
  if (!config.enabled) return null
  const { a_id, p_id, pc_id, pl_id } = config.amazon
  if (!a_id?.trim()) return null
  return {
    a_id: process.env.NEXT_PUBLIC_MOSHIMO_A_ID?.trim() || a_id.trim(),
    p_id: p_id.trim(),
    pc_id: pc_id.trim(),
    pl_id: pl_id.trim(),
  }
}

export function buildMoshimoAmazonClickUrl(
  destinationUrl: string,
  params: MoshimoAmazonAffiliateParams,
): string {
  const click = new URL("https://af.moshimo.com/af/c/click")
  click.searchParams.set("a_id", params.a_id)
  click.searchParams.set("p_id", params.p_id)
  click.searchParams.set("pc_id", params.pc_id)
  click.searchParams.set("pl_id", params.pl_id)
  click.searchParams.set("url", destinationUrl)
  return click.toString()
}
