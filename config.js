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
  // GA4 測定ID（未取得時はプレースホルダー。取得したら下記を実IDに差し替え）
  GA4_MEASUREMENT_ID: 'G-XXXXXXXXXX',

  // Microsoft Clarity プロジェクトID（未取得時はプレースホルダー）
  CLARITY_ID: 'YYYYYYYYYY',

  // ─── 外部URL ─────────────────────────────────
  // 埼玉県野球協議会 本体サイト
  SAITAMA_BASEBALL_URL: 'https://www.saitamabaseball.com',

  // お問い合わせページ
  CONTACT_URL: 'https://www.saitamabaseball.com/contact-8',

  // 協議会ロゴ画像URL（取得したら実URLに差し替え。未設定時は Material Symbols + テキスト表示）
  LOGO_URL: '',

  // ─── サイト本体 ──────────────────────────────
  // 公開URL（canonical等で使用）
  SITE_URL: 'https://map.saitamabaseball.com',

  // ─── 開発用 ──────────────────────────────────
  // true にすると console に解析イベントログを出力（本番では false 推奨）
  DEBUG_ANALYTICS: false,
};
