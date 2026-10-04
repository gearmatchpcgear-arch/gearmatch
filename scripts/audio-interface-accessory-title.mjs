/**
 * オーディオIF売れ筋ランキングから除外するタイトル判定（本体のみ残す）
 */
export function isAudioInterfaceAccessoryTitle(title) {
  const t = title

  if (
    /I2S|INMP441|PCM5102|PCM5122|DACモジュール|dac module|sensor module|デジタル出力センサー|基板|モジュール\s*\(\d+\s*pcs?\)|arduino|raspberry pi hat|Voice Player Board|DAC Decoder Module|Interface I2S IIS/i.test(
      t,
    ) &&
    !/audio interface|オーディオインターフェ|ミキサー|mixer/i.test(t)
  ) {
    return true
  }

  if (/PCM5102|Voice Player Board|DAC Decoder Module|Interface I2S IIS Lossless/i.test(t)) {
    return true
  }

  if (/コンデンサーマイク|condenser microphone|ダイナミックマイク|dynamic microphone|マイク\s*単体|microphone only/i.test(t) && !/interface|インターフェ|ミキサー|mixer|iRig|MVX/i.test(t)) {
    return true
  }

  if (/AT2020.*set|set.*AT2020|Scarlett Solo Studio|Solo Studio 3rd Gen|for iPhone Users Streaming\/DTM Set|Vocal set and CONNECT|RAY and CONNECT 2 set|LCT 240 PRO Vocal set|マイク.*セット|microphone.*set|streaming equipment set|equipment set.*microphone|set purchase|セット購入|& case set|semi-hard case set|case set|soft shell case set|& Soft Shell Case/i.test(t)) {
    return true
  }

  // ポッドキャスト/配信フルセット（マイク同梱）
  if (/G10 Live Distribution Set|TENLAMP.*G10|P17.*ポッドキャスト|P17 Podcast Microphone Set|ポッドキャストマイクセット|ポッドキャスト機材セット|Podcast Equipment Set Includes|Sound Card Kit for Podcast|All-in-One Podcast Set|with XLR Microphone|with 25mm Large Capsule Microphone|Large Capsule Microphone Suitable|Condenser Microphone,.*Microphone Cable|Pop Blocker.*Arm Stand|Android Users Distributed\/DTM Set|AG06MK2 AT2020 iPhone Distribution Set|Distribution Starter Set|Boom Arm Stand Included/i.test(t)) {
    return true
  }

  if (/USB Digital Interface DDC|Digital Bridge|USB-C to XLR.*Converter|DAC Cable Interface|ADA8200.*Converter|A\/D D\/A Converter|Amplifier Board|Audio Amplifier Board|live sound card converter|サウンドカードコンバータ|Sound Card Kit/i.test(t)) {
    return true
  }

  if (/streaming equipment with.*microphone|Compact Streaming Equipment with.*Microphone/i.test(t) && !/^MAONO Audio Interface Audio Mixer XLR Input Routing/i.test(t)) {
    return true
  }

  // ケーブル単体・セット内ケーブル主体
  if (/mic cable|xlr cable|cannon mic cable|ケーブル.*セット|set.*cable only/i.test(t) && !/audio interface|オーディオインターフェ|ミキサー|mixer/i.test(t)) {
    return true
  }

  if (/ヘッドホン単|イヤホン単|earphone only|headphone only|headphones only/i.test(t)) {
    return true
  }

  if (/マイクスタンド単|mic stand only|ポップガード単|pop filter only|pop blocker only|ショックマウント単|shock mount only|boom arm only|microphone stand/i.test(t) && !/interface|インターフェ|ミキサー|mixer/i.test(t)) {
    return true
  }

  if (/\(case only\)|case only|storage case compatible|収納ケース|キャリングケース|hard eva.*case|Tourmate Hard Case|Hard Case Replacement|Mixer Case Only/i.test(t)) {
    return true
  }

  if (/Ultra Encode|HDMI.*Encoder|High Performance Encoder|NDI\|HX/i.test(t) && !/audio interface|オーディオインターフェ/i.test(t)) {
    return true
  }

  if (/DMX Interface|SoundSwitch Micro|USB-DMX/i.test(t)) {
    return true
  }

  if (/Stage Box|S32 Stage Box|AES50 Connection/i.test(t) && !/usb audio interface|オーディオインターフェ/i.test(t)) {
    return true
  }

  if (/Banana Plug|banana insulated|Banana Insulated Safety|Connector for Multimeter/i.test(t)) {
    return true
  }

  if (/Inline Attachment Switch|A15AS/i.test(t)) {
    return true
  }

  if (/USB MIDI Interface MIDIMATE|MIDI Interface MIDIMATE eX|Cable Integrated USB MIDI/i.test(t) && !/audio interface|オーディオ/i.test(t)) {
    return true
  }

  if (/\bMONITOR1\b|Monitor Controller/i.test(t) && !/audio interface|インターフェ/i.test(t)) {
    return true
  }

  if (/guitar interface converter|interface converter tuner|tuner audio cable for iphone|converter cable/i.test(t) && !/usb audio interface|オーディオインターフェ/i.test(t)) {
    return true
  }

  if (/(?:^|[^a-z])(?:xlr cable|usb cable|audio cable|延長ケーブル|ケーブル単)(?:$|[^a-z])/i.test(t) && !/interface|インターフェ|ミキサー|mixer/i.test(t)) {
    return true
  }

  if (/top handle unit|トップハンドル|XLR-H1/i.test(t) && !/interface|インターフェ/i.test(t)) {
    return true
  }

  if (/video switcher|hdmi video switcher|Road Caster Video S/i.test(t) && !/podcast recorder|audio interface|オーディオインターフェ/i.test(t)) {
    return true
  }

  if (/option card|オプションカード|X-DANTE|DANTEネットワーク用インターフェース.*X32/i.test(t)) {
    return true
  }

  if (/home karaoke set|カラオケセット|dj mixer set.*microphone stand|sound card male and female voice changer.*microphone stand/i.test(t)) {
    return true
  }

  if (/multi effector|マルチエフェクター|GP-200 Multi Effector/i.test(t) && !/audio interface|オーディオインターフェ/i.test(t)) {
    return true
  }

  // USB録音ケーブル / サウンドカード型アダプタ（Cubilux CB5 等）
  if (/cubilux.*cb5|cb5 audio interface for usb recording|usb audio capture sound card|マイク分岐|分岐ケーブル|録音用ケーブル/i.test(t)) {
    return true
  }

  // モバイル用USBオーディオコンバータ（本体IFではない）
  if (/usb audio converter for mobile|adbmmuad|portable built-in recording sound card/i.test(t) && !/xlr\/trs|コンボ×/i.test(t)) {
    return true
  }

  // アナログミキサー単体（USB IF機能なし）
  if (/gaming chair|ゲーミングチェア/i.test(t)) {
    return true
  }

  // アナログミキサー単体（USB IF機能なし）
  if (/mixmate|ミュージックオーディオミキサー/i.test(t) && !/usb|interface|インターフェ/i.test(t)) {
    return true
  }

  if (/OPEN DMX|PC-DMX interface|70303 PC-DMX/i.test(t)) {
    return true
  }

  if (/LCT 40.*コンデンサ|コンデンサーマイク XLR レコーディング/i.test(t) && !/interface|インターフェ/i.test(t)) {
    return true
  }

  if (/mioXC.*MIDI Interface|MIDI Interface MIDIMATE/i.test(t) && !/audio interface|オーディオ/i.test(t)) {
    return true
  }

  if (/Big Knob Studio|Monitor Speaker Controller/i.test(t) && !/audio interface|オーディオインターフェ/i.test(t)) {
    return true
  }

  if (/AT-UMX3 AT2020 Distribution Set|Distribution Set Arm Stand Pop Guard/i.test(t)) {
    return true
  }

  if (/Scarlett 2i2 Studio.*Gen|2i2 Studio 3rd Gen/i.test(t)) {
    return true
  }

  if (/Studio 24c.*Condenser Microphone|Condenser Microphone Shock Cloak/i.test(t)) {
    return true
  }

  if (/Aero Caster VRC-01.*delivery system|delivers authentic recording and live distribution on your iPad/i.test(t)) {
    return true
  }

  if (/Ueteto Guitar Audio Interface.*Portable Built-in Recording Sound Card/i.test(t)) {
    return true
  }

  if (/Storage Case Compatible.*GoStream|Carrying Case Compatible with Osee GoStream/i.test(t)) {
    return true
  }

  if (/Extended Fader Unit.*X-TOUCH|X-TOUCH EXTENDER/i.test(t) && !/audio interface|オーディオインターフェ/i.test(t)) {
    return true
  }

  if (/Seymour Duncan.*Pickup|Jazz Bass Pickup/i.test(t)) {
    return true
  }

  if (/Digirig Mobile.*Amateur Radio|Integrated Digital Mode Interface for Amateur/i.test(t)) {
    return true
  }

  if (/Roland Cloud Connect WC-1|Wireless Adapter.*ModelExpansion/i.test(t)) {
    return true
  }

  if (/X32用オプションカード|X-LIVE.*X32|option card.*X32/i.test(t)) {
    return true
  }

  if (/FaderPort.*Control Surface|USB Control Surface/i.test(t) && !/audio interface|オーディオインターフェ/i.test(t)) {
    return true
  }

  if (/MONITOR2USB|Monitor Controller.*USB Audio Interface/i.test(t) && !/2 x 2 usb audio interface/i.test(t)) {
    return true
  }

  if (/ARC USB.*Limited Edition/i.test(t)) {
    return true
  }

  if (/IXO Podcast Pack|Podcast Pack.*Microphone Pop Guard Tripod Set/i.test(t)) {
    return true
  }

  // キャプチャボード / ビデオキャプチャ主体（BRIDGE CAST 本体は除外しない）
  if (/4K Capture Board|Video Capture Interface|MainStream Live Distribution Video Capture|STREAMERX|Streamer X 4K Capture/i.test(t)) {
    return true
  }

  // スマホ配信ボックス（USBオーディオIF単体ではない）
  if (/GO:\s*LIVECAST|Go:\s*Livecast|GO: LIVECAST/i.test(t)) {
    return true
  }

  // ポッドキャストレコーダー（Zoom P4 等）
  if (/P4 Next Podcast Recorder|Podcast Recorder with.*XLR/i.test(t) && !/audio interface|オーディオインターフェ/i.test(t)) {
    return true
  }

  // ボイスチェンジャー単体（Zoom V3 等）
  if (/Zoom V3 Credited Voice Changer|Vocal Effects \| Audio interface, voice conversion/i.test(t)) {
    return true
  }

  // 汎用ブランド不明の配信サウンドカード
  if (/ライブ配信オーディオカード|ライブストリーーミングサウンドカード/i.test(t) && !/Zoom|ZOOM|Yamaha|YAMAHA|Roland|Focusrite|M-Audio|Steinberg|TASCAM|Elgato|Razer|MAONO|Behringer|MOTU|Shure|Apogee|Arturia|Audient|Universal Audio|PreSonus|IK Multimedia|HyperX|NearStream|FIFINE|Fifine|TONOR|TOPPING|KORG|TC Helicon|TC HELICON|Lewitt|LEWITT|BOMGE|ESI|Native Instruments|Synido|Sonicake|Fluid Audio|Saramonic|Positive Grid|Vestax/i.test(t)) {
    return true
  }

  // クリップ型内部音声キャプチャ（USB IF ではない）
  if (/クリップ型サウンドカード|クリップ式音声カード|クリップ装着型|クリップオーディオカード|クリップ固定オーディオカード|クリップ式オーディオカード|クリップ搭載サウンドカード|クリップユニット|クリップサウンドカード/i.test(t)) {
    return true
  }

  // ブランド不明の汎用配信ミキサー
  if (/^Gaming Audio Mixer, Audio Interface|^USB Audio Mixer, Audio Interface, Distribution Equipment|^USB audio interface, music production software included|^Distribution Mixer, 48V Phantom Power Supply, Credit Sound Card/i.test(t)) {
    return true
  }

  // 効果音ボード / ボイスデスク
  if (/Sound Effects Board|Sound Effect Board|Voice Changer Board|Voice Card Mixer Portable Voice Desk/i.test(t)) {
    return true
  }

  // カラオケ向け
  if (/Sound Blaster R3.*Karaoke|USBライブサウンドカード.*カラオケ|Karaoke Recording Internet Delivery|Home Karaoke Set DJ Mixer|F998 Live Sound Card/i.test(t)) {
    return true
  }

  // GO:MIXER 配信セット（マイクスタンド同梱）
  if (/GO:\s*MIXER PRO-X Easy Distribution Set|GO: MIXER PRO-X Easy Distribution Set/i.test(t)) {
    return true
  }

  // 信号分配 / アダプタ単体
  if (/アイソレーションスプリッター|信号分配器|1入力3出力オーディオ信号|オーディオインターフェースアダプター\/Type-C|Adapter\/Type-C 対応 32bit/i.test(t)) {
    return true
  }

  // 変換アダプター / 変換ケーブル / 変換プラグ（本体IFではない）
  if (/変換アダプター|変換ケーブル|変換プラグ|変換アダプタ/i.test(t)) {
    return true
  }

  // ギター変換ケーブル型（Azmio 等）
  if (/Azmio/i.test(t)) {
    return true
  }

  if (/ギター.*ベース.*(変換|アダプター|adapter)|guitar.*interface.*converter|interface converter tuner|converter cable|tuner audio cable for iphone/i.test(t) && !/usb audio interface|オーディオインターフェ/i.test(t)) {
    return true
  }

  // 「アダプター」単体（XLR-USB 等の本体IFは除外しない）
  if (/(?:^|[^a-z])(?:アダプター|adapter)(?:$|[^a-z])/i.test(t)) {
    const isKnownInterfaceBody =
      /audio interface|オーディオインターフェ|xlr-usb conversion adapter|conversion adapter with headphone output|mvx2u|mvi\b|stream deck.*xlr dock|irig pro|irig hd|irig stream/i.test(t)
    if (!isKnownInterfaceBody) {
      return true
    }
  }

  // BGMダッキング機器
  if (/オーディオ信号ミキサー マイクダッ機能|BGM音量をマイク検知時/i.test(t)) {
    return true
  }

  // ケーブルセット
  if (/AT-UMX3 Audio Interface & BX3|AT-UMX3.*Microphone Cable/i.test(t)) {
    return true
  }

  // 低品質汎用ブランド
  if (/^(LOL-FUN|TISHITA|predolo|Benboo|Colaxi|Deevoka|Simhoa|kowaku|Hellery|Asixxsix|URCET|KALLORY|AWHAO|XXA5|Cubilux|Pyle|Depusheng|LEKATO|Tachiuwa|Prettyia|zmart)\b/i.test(t)) {
    return true
  }

  // 日本語汎用タイトル（メーカー名なし）
  if (/^オーディオインターフェース デバイス|^オーディオインターフェイス 多機能 ウェブキャス|^オーディオミキサー オーディオインターフェース 配信機器|^サウンドカード オーディオミキサー 配信インターフェース|^USBオーディオインターフェース コンパクト USBミキシングコンソール|^USB Audio Interface 32-bit\/384kHz USB Mixing Console|^USBライブサウンドカード 24bit/i.test(t)) {
    return true
  }

  // デジタルオーディオブリッジ（DAC/SPDIF）
  if (/Douk Audio U2 PRO USB Digital Interface|USB Digital Interface DDC|Optical Digital Monitor Function/i.test(t) && !/TOPPING E/i.test(t)) {
    return true
  }

  // 汎用サウンドカード / 配信ミキサー（メーカー名なし）
  if (/^サウンドカード |^Sound Card,|^Audio Mixer, Audio Interface, Live Broadcast|^Gaming Audio Mixer Audio Interface Live Sound Card|^ライブ配信用サウンドカード|^配信用ミキサー /i.test(t)) {
    return true
  }

  if (/^オーディオインターフェース 32bit|^オーディオインターフェース USB接続 32bit|^オーディオインターフェース 外部USB|^USBオーディオインターフェイス ループバック|^USBオーディオインターフェース 32-bit|^USBオーディオインターフェース 堅牢|^オーディオミキサー オーディオインターフェース 録音機器|^オーディオミキサー オーディオインターフェース 配信機器/i.test(t)) {
    return true
  }

  if (/Prettyia/i.test(t)) {
    return true
  }

  return false
}
