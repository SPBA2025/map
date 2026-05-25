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

  // チーム情報修正・追加用Googleフォーム（埼玉県競技者人口マップ 情報提供フォーム）
  // チーム名欄の entry ID は 1520807350（マップポップアップから自動入力される）
  TEAM_INFO_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSd92jK-e9g52C5ux9Q1a_LMUePVJljIua9HBpP1NwePEOr3Iw/viewform',

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
