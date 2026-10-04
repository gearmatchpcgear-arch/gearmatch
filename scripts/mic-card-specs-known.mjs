/**
 * Official / Amazon mic card specs (ASIN → highlights format)
 * Only set fields that should override missing values.
 */

export const DASH = "—"

/** @type {Record<string, Partial<Record<"指向性"|"周波数特性"|"接続方式"|"サンプルレート", string>>>} */
export const MIC_CARD_SPECS_KNOWN = {
  B0002E4Z8M: { サンプルレート: DASH }, // SM7B XLR
  B0006H92QK: { サンプルレート: DASH }, // AT2020 XLR
  B0002D0BQ8: { サンプルレート: DASH }, // AT4040 XLR
  B000NAXCC0: { 指向性: "超単一指向性", 周波数特性: "40Hz-18kHz", 接続方式: "XLR", サンプルレート: DASH },
  B0000AQ6SC: { サンプルレート: DASH }, // SM58
  B000BQ79W0: { 指向性: "超単一指向性 (ライン+ガン)", サンプルレート: DASH }, // AT875R
  B0002KZAKS: { 指向性: "単一指向性", 接続方式: "XLR" }, // XM8500
  B0002ERG6K: { 指向性: "単一指向性", 接続方式: "XLR" }, // AT-X3
  B000R8KFUU: { 指向性: "単一指向性" }, // CM-2000
  B001TOYV4M: { サンプルレート: DASH }, // PRO35 XLR
  B0014THK5E: { サンプルレート: DASH }, // AT9901
  B002T45X1G: { 接続方式: "XLR (ファントム48V)" }, // AT2035
  B004KVIZFM: { 指向性: "全指向性", 接続方式: "3.5mm モノラルプラグ", サンプルレート: DASH }, // ECM-TL3
  B005M2HDA6: { 指向性: "全指向性", サンプルレート: DASH }, // ECM-PCV80U
  B007GLWQS61: { 指向性: "単一指向性", サンプルレート: "48kHz/16bit" }, // AU-A04
  B013SYV6P2: { サンプルレート: "48kHz/16bit" }, // MM-MCU01BK
  B075PJ7V3V: { サンプルレート: "48kHz/16bit" }, // K669B
  B07GCHX2YS: { 接続方式: "XLR" }, // XS 1
  B07GLWQS61: { 指向性: "単一指向性", サンプルレート: "48kHz/16bit" },
  B07KT8X3XQ: { 接続方式: "3.5mm モノラルプラグ" }, // ECM-999
  B07MJZ7XQ5: { 指向性: "全指向性" },
  B07MW2Z1CD: { 指向性: "単一指向性" }, // ANM-865
  B07NZZZ746: { サンプルレート: "48kHz/16bit" }, // QuadCast
  B0822PMBTZ: { サンプルレート: "48kHz/16bit" }, // Blue Yeti
  B0822PSXCN: { サンプルレート: "48kHz/16bit" }, // Snowball iCE
  B08G8WH435: { サンプルレート: "48kHz/16bit" }, // QuadCast S
  B08G7T3Q9S: { サンプルレート: "44.1kHz/24bit" }, // MV88+
  B08KY7G1GV: { サンプルレート: "24bit / 48kHz" }, // MV7
  B08P411XR5: { サンプルレート: "48kHz/24bit" }, // Am7
  B08V8S2NJQ: { 接続方式: "XLR" }, // AKG D5
  B09BN9N1P3: { 指向性: "全指向性", サンプルレート: "48kHz/16bit" }, // HS-MC09UBK
  B09VGCZHG4: { 指向性: "2モード (全/単一指向性)", サンプルレート: "96kHz/24bit" }, // JBL Quantum Stream
  B09XDH2P6P: { サンプルレート: "48kHz/16bit" }, // K690
  B09XQVB4XC: { サンプルレート: "48kHz/16bit" }, // SoloCast white
  B0B119XZBK: { 指向性: "4パターン (単一/双/全/ステレオ)", サンプルレート: "48kHz/16bit" }, // DuoCast
  B0B823S1NR: { 指向性: "単一指向性", サンプルレート: "96kHz/24bit" }, // AT2020USB-X
  B0BTPYCD86: { サンプルレート: "48kHz/24bit" }, // Sennheiser Profile USB
  B0C32W4ZH7: { サンプルレート: "48kHz/16bit" }, // GamerWave
  B0CHV2QZX7: { サンプルレート: "48kHz/16bit" },
  B0CL9BTQRF: { サンプルレート: "48kHz/16bit" },
  B0CRV2C7HD: { 指向性: "単一指向性", サンプルレート: "48kHz/24bit" }, // Yeti Orb
  B0CTSX8HFS: { 指向性: "単一指向性", サンプルレート: "96kHz/24bit" }, // Quantum Stream Talk
  B0CYYZ78NJ: {
    指向性: "単一指向性",
    周波数特性: "50Hz-16kHz",
    接続方式: "USB Type-C / XLR",
    サンプルレート: "24bit / 48kHz",
  },
  B0DDP2HT3F: { サンプルレート: "24bit / 48kHz" }, // MV6
  B0DG9X4WHW: { サンプルレート: "48kHz/16bit" }, // QuadCast 2S
  B0DJR3CHKM: { サンプルレート: "192kHz/24bit" },
  B0DNJGTMBK: { サンプルレート: "192kHz/24bit" }, // K688
  B0DXW278KB: { サンプルレート: "48kHz/16bit" }, // QuadCast 2
  B0FLKJ7FH7: { サンプルレート: "48kHz/16bit" }, // SoloCast 2
  B0FKM9BS9H: { サンプルレート: "192kHz/24bit" },
  B0FKMLH98W: { サンプルレート: "192kHz/24bit" },
  B0GQRSQ86L: { サンプルレート: "96kHz/24bit" }, // Wave:3
  B0GJZ1TCQP: { サンプルレート: "48kHz/16bit" }, // U30K (Amazon listing)
  B0G39C97WQ: { 指向性: "全指向性" },
  B0GWXVJQ9N: { 指向性: "単一指向性" },
  B0H6MV2KPH: { サンプルレート: "192kHz/24bit" },
  B0H3TD27ZS: {
    指向性: "全指向性",
    接続方式: "2.4GHz ワイヤレス",
  },
  B0FGJYCPRT: { 指向性: "単一指向性" },
  B0FG7DVV62: { 接続方式: "USB Type-C", サンプルレート: "96kHz/24bit" },
  B0F9FM4MVH: { 接続方式: "USB", サンプルレート: "48kHz/16bit" },
  B0CXHQHW4R: { 周波数特性: "50Hz-15kHz", サンプルレート: "—" }, // PartyBox wireless analog
  B0CX8H5XYW: { サンプルレート: "192kHz/24bit" }, // MAONO PD200XS
  B0CCVBQRFX: { サンプルレート: "192kHz/24bit" }, // TONOR TD510
  B0CCSVYWMH: { サンプルレート: DASH },
  B0DP2C53RF: { 指向性: "単一指向性", サンプルレート: "192kHz/24bit" },
  B0F2HR9SZT: { サンプルレート: "192kHz/24bit" },
  B0F1F3PZJF: { サンプルレート: "192kHz/24bit" }, // PD100XS
  B0GJP76J2M: { サンプルレート: "192kHz/24bit" },
  B0G5D9JT5G: { 周波数特性: "100Hz-10kHz" }, // TKY-93
  B08762VJFD: { 指向性: "単一指向性", 接続方式: "6.3mm / XLR" },
  B08X41Z9WC: { 指向性: "全指向性", 周波数特性: "50Hz-16kHz" }, // K380S wireless
  B09TZWQBMM: { 周波数特性: "50Hz-16kHz" },
  B0D8KF3PV2: { 指向性: "単一指向性", 周波数特性: "50Hz-15kHz" },
  B0D83QTHHV: { 指向性: "単一指向性", 周波数特性: "50Hz-15kHz" },
  B0G34LCW2F: { 周波数特性: "100Hz-10kHz", 接続方式: "XLR" }, // FT-DM7
  B0GX7GK558: { サンプルレート: "192kHz/24bit" },
  B00TTQM94Q: { サンプルレート: "48kHz/16bit" }, // Shure D10 USB
  B0051O2Y72: { サンプルレート: "48kHz/16bit" },
  B01GJ9IUNY: { 指向性: "単一指向性", サンプルレート: "48kHz/16bit" }, // MPM-2000U
  B079HRX2ZP: { サンプルレート: "48kHz/16bit" }, // K670
  B092JB6XR3: { サンプルレート: "48kHz/16bit" },
  B093LFS9QF: { サンプルレート: "48kHz/16bit" }, // TM-250U
  B099NY1425: { 指向性: "全指向性", 周波数特性: "100Hz-10kHz" }, // HM-100
  B0BXSNMYG7: { 指向性: "単一指向性" }, // MM-MCU03BKN
  B0GJD41V2J: { 指向性: "単一指向性" }, // MM-MCTC02NC
  B0DHCGFBPN: { 指向性: "単一指向性" }, // Elgato Wave:3
  B09BZXP8Y1: { 指向性: "指向性切替対応 (マルチパターン)" }, // Shure MV88+
  // --- Directivity fixes (missing / verified from Amazon) ---
  B0BXSPQL3W: { 指向性: "単一指向性" }, // MM-MCU06BKN
  B0CMTRDWLL: { 指向性: "超単一指向性 (スーパーカーディオイド)" }, // Razer Seiren V3 Mini
  B00Q3K32I8: { 指向性: "単一指向性" }, // AT2020USB+
  B0C8MGHR2C: { 指向性: "単一指向性" }, // AT2020USB-XP
  B0C8LTKWLG: { 指向性: "単一指向性" }, // AT2020USB-XP bundle
  B08KDVW9Z3: { 指向性: "単一指向性" }, // ATR2100x-USB
  B09F2FM43B: { 指向性: "2モード (単一/全指向性)" }, // AKG Ara dual pattern
  B0D9LXG8LH: { 指向性: "単一指向性" }, // RODE PodMic USB
  B0DM12LT7Q: { 指向性: "単一指向性" }, // FEELWORLD VM1
  B0GTXG96MZ: { 指向性: "単一指向性" }, // MAILANGSHI dynamic USB/XLR
  B09DSRLKBT: { 指向性: "指向性切替対応 (マルチパターン)" }, // Thronmax MDrill One Pro
  B09DS9CQRH: { 指向性: "指向性切替対応 (マルチパターン)" }, // Thronmax Mdrill Zero Plus
  B0F8B1NBWF: { 指向性: "単一指向性" }, // tegongse gaming USB
  B0FQCP4X2N: { 指向性: "単一指向性" },
  B0G1CBLZM7: { 指向性: "単一指向性" },
  B0DFGMHM4B: { 指向性: "全指向性" }, // DUNGZDUZ USB-C lavalier
  B0CNVZ27YH: { 指向性: "全指向性" }, // DUNGZDUZ USB mini desk mic
  B0FP5534M6: { 指向性: "全指向性" }, // USB-C mini mic
  B0DW8NRNBH: { 指向性: "単一指向性" }, // Seiko STM30 guitar pickup
  B07ZQB2VF3: { 指向性: "全指向性" }, // Cubilux USB-C clip lavalier
}

export function toSpecFormat(highlightValue, label) {
  if (!highlightValue || highlightValue === DASH) return DASH
  if (label === "周波数特性") {
    return highlightValue
      .replace(/(\d+)kHz/gi, "$1 kHz")
      .replace(/(\d+)Hz/gi, "$1 Hz")
      .replace(/-/g, "–")
  }
  if (label === "サンプルレート") {
    return highlightValue
      .replace(/\s*\/\s*/g, " / ")
      .replace(/(\d+)kHz/gi, "$1 kHz")
      .replace(/(\d+)bit/gi, "$1 bit")
  }
  return highlightValue
}
