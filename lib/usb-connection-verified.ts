/**
 * Amazon / メーカー公式仕様で端子規格を確認済みの製品のみ記載。
 * 判別不能な製品はここに追加せず「有線 USB」表記のままにする。
 */
export const VERIFIED_USB_CONNECTIONS: Record<string, string> = {
  /** Razer公式: 本体 USB Type-C / 着脱式 Type-A to Type-C ケーブル / 8000Hz */
  "k-gbs-081": "有線 USB Type-C (着脱式, 8000Hz)",
  /** ELECOM公式・Amazon: コネクター形状 USB(A)オス */
  "k-bs-002": "有線 USB Type-A",
}

export function getVerifiedUsbConnection(gadgetId: string): string | undefined {
  return VERIFIED_USB_CONNECTIONS[gadgetId]
}
