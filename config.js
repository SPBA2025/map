/**
 * 埼玉県野球協議会マップ - 設定一元管理
 *
 * IDの差し替え方法:
 *   GA4 と Clarity の ID を取得したら、下記の値を実IDに置き換えるだけ。
 *   その他URL等も同様に編集可能。
 *
 * 注意:
 *   - このファイルは index.html / parks.html / privacy.html から読み込まれる
 *   - すべての解析ID・外部URLはここに集約する（保守性のため）
 */
window.APP_CONFIG = {
  // ─── アナリティクス ──────────────────────────
  // GA4 測定ID
  GA4_MEASUREMENT_ID: 'G-FBG0XHM8JM',

  // Microsoft Clarity プロジェクトID
  CLARITY_ID: 'wwgrhkd9ll',

  // ─── 外部URL ─────────────────────────────────
  // 埼玉県野球協議会 本体サイト
  SAITAMA_BASEBALL_URL: 'https://www.saitamabaseball.com',

  // お問い合わせページ
  CONTACT_URL: 'https://www.saitamabaseball.com/contact-8',

  // 協議会ロゴ画像URL（円形デザインの SPBA 公式ロゴ）
  LOGO_URL: 'https://map.saitamabaseball.com/logo.png',

  // 連絡先メール（フッター表示用）
  CONTACT_EMAIL: 'info@saitamabaseball.com',

  // チーム情報修正・追加用Googleフォーム（チームマップ 情報提供フォーム）
  // チーム名欄の entry ID は 1520807350（マップポップアップから自動入力される）
  TEAM_INFO_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSd92jK-e9g52C5ux9Q1a_LMUePVJljIua9HBpP1NwePEOr3Iw/viewform',
  // チームマップ承認システム（クラウドソーシング）
  //   - TEAM_GAS_URL: TeamCode.gs をデプロイしたウェブアプリの /exec URL（空なら差分オーバーレイ無効＝従来どおり）
  //   - 下記 entry ID は、フォームにプリフィルする5項目。フォーム作成後に実IDを設定する
  //       種別=修正/新規 ／ チーム名 ／ 市区町村 ／ 緯度 ／ 経度
  TEAM_GAS_URL: 'https://script.google.com/macros/s/AKfycbyW4Cz8wMpQEadxDxgvcE1c4ynFIEVmqiywFA2bddR-IcvwlT3IZDL8nAbqY5IntvgsZw/exec', // TeamCode.gs ウェブアプリ
  TEAM_FORM_ENTRY_TYPE: 'entry.1594720036', // 種別（修正/新規）
  TEAM_FORM_ENTRY_NAME: 'entry.1520807350', // チーム名
  TEAM_FORM_ENTRY_CITY: 'entry.1217165201', // 市区町村
  TEAM_FORM_ENTRY_LAT:  'entry.2030857014', // 緯度
  TEAM_FORM_ENTRY_LNG:  'entry.1048070123', // 経度
  TEAM_FORM_ENTRY_LOGO: 'entry.1655982944', // チームロゴURL（自動入力・Cloudinary）
  TEAM_FORM_TYPE_EDIT:  '修正',       // 種別フィールドの選択肢ラベル（修正側）
  TEAM_FORM_TYPE_NEW:   '新規',       // 種別フィールドの選択肢ラベル（新規側）

  // 公園情報の提供用Googleフォーム（埼玉県公園マップ 情報提供フォーム・全報告導線で共用）
  //   ① 登録済み公園モーダル / ② グレー未登録ピン → 公園名＋座標を自動入力
  //   ③「公園を報告」→ 地図タップ → 座標を自動入力
  // entry ID: 公園名=837577971 / 緯度=651590452 / 経度=186265272
  PARK_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSdwOG0eAVXRFkIsgplkszA45sMHCYYf3NwseniMI5iP2jG2yw/viewform',
  PARK_FORM_ENTRY_NAME: 'entry.837577971',
  PARK_FORM_ENTRY_LAT: 'entry.651590452',
  PARK_FORM_ENTRY_LNG: 'entry.186265272',
  PARK_FORM_ENTRY_PHOTO: 'entry.1750882233',

  // 写真アップロード（Cloudinary 無署名・無料。カード未登録のため課金なし）
  CLOUDINARY_CLOUD: 'dpzmmr7r8',
  CLOUDINARY_PRESET: 'park_unsigned',

  // SNSアカウント（空文字なら非表示）
  INSTAGRAM_URL: '',
  X_URL: '',

  // ─── サイト本体 ──────────────────────────────
  // 公開URL（canonical等で使用）
  SITE_URL: 'https://map.saitamabaseball.com',

  // ─── 開発用 ──────────────────────────────────
  // true にすると console に解析イベントログを出力（本番では false 推奨）
  DEBUG_ANALYTICS: false,
};
