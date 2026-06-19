# 公開・運用ガイド

埼玉県野球協議会マップ（`map.saitamabaseball.com`）の公開準備・運用手順をまとめたドキュメント。

---

## ファイル構成

```
/
├── index.html            メインマップ（埼玉県野球競技者人口マップ）
├── parks.html            公園マップ
├── privacy.html          プライバシーポリシー
├── config.js             [重要] ID・URLを一元管理（取得後にここを差し替える）
├── analytics.js          GA4初期化＋12イベント送信関数
├── cookie-consent.js     Cookie同意バナー（SPBAクリーム配色）
├── onboarding.js         初回訪問時の3ステップヒントオーバーレイ
├── toast.js              ミニトースト通知（info/success/warn/error）
├── teams-data.js         チームデータ 2143件（index.html から外部化）
├── parks-data.js         公園データ
├── parks_catchball.csv   公園元データ
├── gas_aggregate.js      GAS集計（参考。本体はGAS側）
├── parks.config.example.js
├── admin.html            管理ページ
├── sitemap.xml           検索エンジン向けサイトマップ
├── robots.txt            クローラー制御
├── SETUP_PARKS.md        公園マップセットアップガイド
└── DEPLOYMENT.md         本ファイル
```

将来追加するファイル:
- `CNAME` … サブドメイン公開時に追加（DNS設定後に push）
- `og-image.png` … OGP用 1200×630px のシェア画像（チームマップ用）
- `og-image-parks.png` … 公園マップ用 OGP 画像

---

## 公開フロー

### Step 1：事務局側で取得・設定する作業

| 項目 | 方法 |
|---|---|
| GA4 測定ID | https://analytics.google.com → 管理 → プロパティ作成 → ストリーム |
| Clarity ID | https://clarity.microsoft.com → 新規プロジェクト |
| Search Console 所有確認 | https://search.google.com/search-console |
| Wix DNS で CNAME 追加 | `map` → `spba2025.github.io`（TTL:Auto） |
| チーム情報フォーム | Googleフォームを作成しURLを `TEAM_INFO_FORM_URL` に設定（任意） |
| OG画像 | 1200×630px の `og-image.png` / `og-image-parks.png` を作成しリポジトリ直下に配置（任意） |

### Step 2：config.js を差し替え

`config.js` を編集し、以下を実IDに置き換える：

```js
GA4_MEASUREMENT_ID: 'G-XXXXXXXXXX',  // ← 実IDに
CLARITY_ID: 'YYYYYYYYYY',            // ← 実IDに
LOGO_URL: '',                         // ← ロゴ画像URLに（任意）
TEAM_INFO_FORM_URL: '',               // ← Googleフォーム URL（任意）
```

### Step 3：CNAME ファイルを追加（DNS完了確認後）

リポジトリ直下に `CNAME` ファイルを作成して以下の1行のみ：

```
map.saitamabaseball.com
```

GitHubに push すると **Settings → Pages のカスタムドメインが自動更新** され、HTTPS が有効化される。

### Step 4：動作確認

- `https://map.saitamabaseball.com` でアクセスできること
- HTTPS（鍵マーク）が表示されること
- ヘッダーのロゴ・テキストをクリックで協議会本体に遷移

---

## テスト項目チェックリスト

### 機能テスト

- [ ] `https://map.saitamabaseball.com` にアクセスできる
- [ ] ヘッダーのロゴ・テキストをクリックで協議会本体に遷移
- [ ] フッターのお問い合わせ・プライバシーポリシーリンクが動作
- [ ] スマホでヘッダーが固定表示・タップ44px以上を確保
- [ ] Cookie同意バナーが初回訪問時に表示（クリーム配色・赤アクセント）
- [ ] 「同意する」「同意しない」が正しく動作・再訪時は表示されない
- [ ] プライバシーポリシーページが表示される
- [ ] フッターの「Cookie設定」リンクで同意状態をリセット可能

### UX 機能テスト（Session 1-6 で追加）

- [ ] 初回訪問時にオンボーディングモーダルが表示される（3ステップ）
- [ ] 「はじめる」または ESC で閉じられ、次回以降は表示されない
- [ ] フッター「使い方を見る」で再表示できる
- [ ] マップを移動して再訪すると前回位置で復元される（24時間以内）
- [ ] 絞込ゼロ件時に「絞込をリセット」ボタンが表示される
- [ ] PC でサイドバー右端のチェブロンを押すと折りたたみ可能
- [ ] 折りたたみ時にフローティング凡例・KPI・インサイトが表示される
- [ ] 性別・キャッチボール絞込変更時にミニトーストが表示される
- [ ] チームポップアップ末尾の「情報の修正を提案」が動作する
- [ ] 「共有」ボタンで URL がクリップボードにコピーされる（または OS シェアシート）
- [ ] 共有された URL を開くと絞込状態が復元される
- [ ] 初期表示時にスケルトンが表示され、地図準備完了でフェードアウト
- [ ] ESC キーでモーダル・パネル類が閉じられる

### GA4 リアルタイムレポート確認

GA4 → 報告 → リアルタイム で以下を確認：

| イベント | 発火操作 |
|---|---|
| `team_pin_click` | チームピンをクリック |
| `park_pin_click` | 公園ピンをクリック |
| `filter_change` | カテゴリ/性別/指標/表示スタイル/キャッチボール可フィルター切替 |
| `keyword_search` | チーム名/公園名で検索 |
| `map_zoom` | 地図ズーム・パン |
| `external_link` | HP/X/Instagram/PARKFUL リンククリック |
| `municipality_view` | 市町村ポップアップを開く |
| `modal_open` | 詳細グラフ/市町村比較/公園詳細モーダル |
| `city_compare` | 市町村比較モーダルで2市町村選択 |
| `list_item_click` | チーム/公園一覧から項目クリック |
| `empty_result` | 検索結果0件 |
| `gps_use` | 現在地ボタンクリック |
| `info_missing_report` | チームポップアップの「情報の修正を提案」/公園「情報を提供する」クリック |
| `cta_apply` | 体験申込CTA（将来のチームHP連携用、現状未配線） |

### Clarity ダッシュボード確認

- [ ] セッション録画が記録されている
- [ ] ヒートマップ用のクリックデータが収集されている

### レスポンシブテスト

- [ ] iPhone Safari で正常動作
- [ ] Android Chrome で正常動作
- [ ] iPad で正常動作
- [ ] PC（Chrome / Edge / Safari / Firefox）で正常動作

### Cookie 同意テスト

- [ ] 同意前は GA4 デバッグビューに何も流れない（DEBUG_ANALYTICS=true 時もconsole.logは「(blocked)」表示）
- [ ] 同意後にイベントが送信される
- [ ] localStorage.cookieConsent が `true` / `false` で永続化

---

## 🔧 設定値リファレンス（差し替え箇所）

| 設定 | ファイル | キー | 内容 |
|---|---|---|---|
| GA4測定ID | `config.js` | `GA4_MEASUREMENT_ID` | `G-XXXXXXXXXX` を実IDに |
| Clarity ID | `config.js` | `CLARITY_ID` | `YYYYYYYYYY` を実IDに |
| 協議会サイトURL | `config.js` | `SAITAMA_BASEBALL_URL` | 変更時はここのみ |
| お問い合わせURL | `config.js` | `CONTACT_URL` | 変更時はここのみ |
| ロゴ画像URL | `config.js` | `LOGO_URL` | 空＝Material Symbols + テキスト表示。URL指定で画像差替 |
| チーム情報フォームURL | `config.js` | `TEAM_INFO_FORM_URL` | 空＝CONTACT_URLにフォールバック |
| サイトURL | `config.js` | `SITE_URL` | canonical 用（参考） |
| デバッグログ | `config.js` | `DEBUG_ANALYTICS` | true でブラウザコンソールにイベントログ出力 |

---

## よくあるトラブルシューティング

### GA4 にイベントが流れない

- `config.js` の `GA4_MEASUREMENT_ID` がプレースホルダー（`XXXX` を含む）のままだと **何も送信されない**
- Cookie同意バナーで「同意する」を選んだか確認（localStorage.cookieConsent = "true"）
- DEBUG_ANALYTICS = true にして console を見ると、`[Analytics] team_pin_click {...}` のようにログが出る

### Clarity にデータが入らない

- 同上：`CLARITY_ID` がプレースホルダー（`YYYY` を含む）ではダメ
- Clarity 側のプロジェクト URL設定で `map.saitamabaseball.com` が登録済みか確認

### サブドメインでアクセスできない

- Wix DNS で CNAME（`map` → `spba2025.github.io`）が反映されるまで 5分〜数時間かかる
- GitHub Settings → Pages で「カスタムドメイン」欄に `map.saitamabaseball.com` が入っているか
- 「Enforce HTTPS」のチェックは DNS 検証完了後に自動 ON になる

### ヘッダーのロゴが文字になる

- これは仕様：`config.js` の `LOGO_URL` が空の場合、Material Symbols + テキストで仮表示
- 実画像URLを `LOGO_URL` に設定すると自動で `<img>` 表示に切り替わる

### チーム情報修正リンクが「お問い合わせ」に飛ぶ

- これは仕様：`TEAM_INFO_FORM_URL` が空の場合のフォールバック
- Googleフォームを作成 → URL を `TEAM_INFO_FORM_URL` に設定するとそちらに飛ぶ

### OGP 画像が表示されない

- `og-image.png` / `og-image-parks.png` が未配置の場合は SNS シェア時にデフォルトの白背景になる
- 1200×630px の PNG を作成しリポジトリ直下に配置 → push で反映

---

## 第3層（事業判断データ）の使い方

3ヶ月程度データが溜まったら、以下をLooker Studio等で可視化：

| 戦略質問 | 使うイベント |
|---|---|
| 「需要があるのにチームが少ない市町村は？」 | `empty_result` + `municipality_view` |
| 「比較されている市町村ペアは？」 | `city_compare` |
| 「離脱が多いポップアップは？」 | `team_pin_click`/`park_pin_click` → 次イベントなし |
| 「モバイルでの利用パターンは？」 | `gps_use` + デバイス情報（GA4標準） |
| 「データ穴のある検索クエリは？」 | `empty_result` クエリ別集計 |
| 「修正報告の多いチームは？」 | `info_missing_report` を entity_id 別に集計 |

これらが L-FRIENDS事業の新規誘致候補リスト・LIONS LIGA Saitama 加盟誘致の優先順位付けに直結する。

---

## メンテナンス

- **イベント追加時**: `analytics.js` に関数追加 → 該当箇所から呼び出し
- **ロゴ・URL等の差し替え**: `config.js` のみ編集
- **プライバシーポリシー文面変更**: `privacy.html` を直接編集
- **Cookie同意バナーの文言変更**: `cookie-consent.js` 内の HTML を編集
- **チームデータ更新**: `teams-data.js` の `window.TEAM_DATA_RAW` を編集
- **公園データ追加**: `parks-data.js` の `parkData` 配列に追記
- **オンボーディング文言変更**: `onboarding.js` の `COPY` オブジェクトを編集
- **インサイトカードの計算ロジック変更**: `index.html` 内の `_computeInsights()` を編集

---

## 残タスク（フォローアップ推奨）

| タスク | 優先度 | 備考 |
|---|---|---|
| OG画像生成（チーム/公園） | 中 | 1200×630px / SPBAブランド色 |
| 公園マップ 緯度経度230件事前埋め込み | 高 | Places API 実行＋データ取得スクリプトが必要 |
| チーム情報フォーム作成 | 中 | Googleフォーム → config.js に URL設定 |
| DNS 設定 + CNAME ファイル追加 | 高 | サブドメイン公開の前提 |
| GA4 / Clarity ID 取得 → config.js 反映 | 高 | 取得後すぐ反映可能 |
| 「体験申込」CTA（`cta_apply`）配線 | 低 | チームHPの申込ボタン経由の発火を後日設計 |
