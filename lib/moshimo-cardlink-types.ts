/** もしも「かんたんリンク（カードリンク）」msmaflink ウィジェット設定 */

export type MoshimoCardLinkButton = {
  id: number
  u_tx: string
  u_bc: string
  u_url: string
  a_id: number
  p_id: number
  pl_id: number
  pc_id: number
  s_n: string
  u_so: number
}

export type MoshimoCardLinkConfig = {
  n: string
  b: string
  t: string
  d: string
  c_p: string
  p: string[]
  u: { u: string; t: string; r_v: string }
  v: string
  b_l: MoshimoCardLinkButton[]
  eid: string
  s: string
}

export const MOSHIMO_CARDLINK_SCRIPT_SRC =
  "https://dn.msmstatic.com/site/cardlink/bundle.js?20220329"

export const MOSHIMO_CARDLINK_SCRIPT_ID = "msmaflink"
