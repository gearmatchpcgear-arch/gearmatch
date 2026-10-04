/**
 * 配信用カメラ検索結果から「カメラ本体以外」を厳格に除外
 */
import { isCameraAccessory as isRankingAccessory } from "./fetch-camera-bestsellers.mjs"

/** タイトルに含まれていれば無条件で除外（カメラ本体ではない） */
const HARD_EXCLUDE_RE =
  /防犯カメラ|セキュリティカメラ|監視カメラ|ワイヤレスカメラ\d+台|NVR|録画機|キャプチャーボード|キャプチャカード|ビデオキャプチャ|hdmiキャプチャ|ゲーミングマイク|コンデンサーマイク|ラベリアマイク|ピンマイク|マイクスタンド|用クランプマウント|クランプマウント|デスクマウント(?:のみ|単)|フレキシブルアーム(?:のみ|単)|粘着ヘルメット|アクションカメラ用.*マウント|スマホ用自撮りモニター|自撮りモニター(?:用|スクリーン)|スマホリングライト|スマホ用.*レンズ|スマホスタンド|スマホ.*三脚|phone\s*stand|女優ライト|撮影用ライト(?:キット|セット)?(?:$|[^a-zA-Z0-9])|LED.*撮影用ライト|照明キット|ビデオライト(?:スタンド|キット)?(?:$|[^カ])|産業用カメラ(?:モジュール)?|カメラモジュール|ラズベリーパイ|for Raspberry|IMX230搭載|グリップキット|アルミグリップ|キャプチャーボード/i

/** 先頭付近がアクセサリー単体（Evershop スマホ撮影スタンド 等） */
const ACCESSORY_HEAD_RE =
  /^(?:LUXSURE|NEEWER|EMART|TELESIN|Kimwood|UTEBIT|K&F CONCEPT|Qiilu|Moman|COMICA|Cuifati|Zaahir)\s/i

const RING_LIGHT_ONLY_RE =
  /^リングライト|^LEDリングライト|^リングライト付き撮影スタンド|^撮影用ライト\s|^LED.*リングライト|^Amazonベーシック\s*撮影用ライト/i

const CAMERA_BODY_RE =
  /webカメラ|ウェブカメラ|webcam|配信用.*カメラ|配信(?:用|カメラ)|yolocam|yololiv|link\s*2|obsbot|insta360|emeet|nexigo|nearstream|nearity|facecam|ptz|会議用.*カメラ|360[°度].*カメラ|360度|書画カメラ|実物投影|conference|eptz|ビデオ会議.*カメラ/i

/** リングライト一体型ウェブカメラ等（本体） */
const INTEGRATED_CAMERA_RE =
  /(?:webカメラ|ウェブカメラ|webcam).{0,40}(?:リングライト|ライト一体)|(?:リングライト|ライト一体).{0,40}(?:webカメラ|ウェブカメラ|webcam)/i

export function isStreamingCameraAccessory(title) {
  const t = String(title).trim()
  if (isRankingAccessory(t)) return true
  if (INTEGRATED_CAMERA_RE.test(t)) return false
  if (HARD_EXCLUDE_RE.test(t)) return true
  if (ACCESSORY_HEAD_RE.test(t)) return true
  if (RING_LIGHT_ONLY_RE.test(t)) return true
  if (/^(?:カメラ三脚|三脚\s)/i.test(t) && !CAMERA_BODY_RE.test(t)) return true
  if (/スタンド(?:のみ|単)|三脚(?:のみ|単)/i.test(t) && !CAMERA_BODY_RE.test(t)) return true
  if (/スマホ|iphone|スマートフォン/i.test(t) && /スタンド|ホルダ|自撮/i.test(t) && !CAMERA_BODY_RE.test(t)) {
    return true
  }
  if (/マウント|アーム|ホルダー/i.test(t) && /用(?:クランプ|マウント|ホルダー)/i.test(t) && !/^webカメラ|^ウェブカメラ/i.test(t)) {
    return true
  }
  return false
}

export function isStreamingCameraBody(title) {
  const t = String(title).trim()
  if (isStreamingCameraAccessory(t)) return false
  return CAMERA_BODY_RE.test(t) || /c920|c922|c960|c950|brio|powerconf|finecam|ucam-/i.test(t)
}
