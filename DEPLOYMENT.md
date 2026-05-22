# 公開・運用ガイド

埼玉県野球協議会マップ（`map.saitamabaseball.com`）の公開準備・運用手順をまとめたドキュメント。

---

## 📦 ファイル構成

```
/
├── index.html            メインマップ（埼玉県野球競技者人口マップ）
├── parks.html            公園マップ
├── privacy.html          プライバシーポリシー
├── config.js             ⚠️ ID・URLを一元管理（取得後にここを差し替える）
├── analytics.js          GA4初期化＋12イベント送信関数
├── cookie-consent.js     Cookie同意バナー
├── parks-data.js         公園データ
├── parks_catchball.csv   公園元データ
├── gas_aggregate.js      GAS集計（参考。本体はGAS側）
├── parks.config.example.js
├── admin.html            管理ページ
├── SETUP_PARKS.md        公園マップセットアップガイド
└── DEPLOYMENT.md         本ファイル
```

将来追加するファイル:
- `CNAME` … サブドメイン公開時に追加（DNS設定後に push）

---

## 🚀 公開フロー

### Step 1：事務局側で取得・設定する作業

| 項目 | 方法 |
|---|---|
| GA4 測定ID | https://analytics.google.com → 管理 → プロパティ作成 → ストリーム |
| Clarity ID | https://clarity.microsoft.com → 新規プロジェクト |
| Search Console 所有確認 | https://search.google.com/search-console |
| Wix DNS で CNAME 追加 | `map` → `spba2025.github.io`（TTL:Auto） |

### Step 2：config.js を差し替え

`config.js` を編集し、以下を実IDに置き換える：

```js
GA4_MEASUREMENT_ID: 'G-XXXXXXXXXX',  // ← 実IDに
CLARITY_ID: 'YYYYYYYYYY',            // ← 実IDに
LOGO_URL: '',                         // ← ロゴ画像URLに（任意）
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

## ✅ テスト項目チェックリスト

### 機能テスト

- [ ] `https://map.saitamabaseball.com` にアクセスできる
- [ ] ヘッダーのロゴ・テキストをクリックで協議会本体に遷移
- [ ] フッターのお問い合わせ・プライバシーポリシーリンクが動作
- [ ] スマホでヘッダーが固定表示・タップ44px以上を確保
- [ ] Cookie同意バナーが初回訪問時に表示
- [ ] 「同意する」「同意しない」が正しく動作・再訪時は表示されない
- [ ] プライバシーポリシーページが表示される
- [ ] フッターの「Cookie設定」リンクで同意状態をリセット可能

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

| 設定 | ファイル | 行 | 内容 |
|---|---|---|---|
| GA4測定ID | `config.js` | `GA4_MEASUREMENT_ID` | `G-XXXXXXXXXX` を実IDに |
| Clarity ID | `config.js` | `CLARITY_ID` | `YYYYYYYYYY` を実IDに |
| 協議会サイトURL | `config.js` | `SAITAMA_BASEBALL_URL` | 変更時はここのみ |
| お問い合わせURL | `config.js` | `CONTACT_URL` | 変更時はここのみ |
| ロゴ画像URL | `config.js` | `LOGO_URL` | 空＝Material Symbols + テキスト表示。URL指定で画像差替 |
| サイトURL | `config.js` | `SITE_URL` | canonical 用（参考） |
| デバッグログ | `config.js` | `DEBUG_ANALYTICS` | true でブラウザコンソールにイベントログ出力 |

---

## 🛠️ よくあるトラブルシューティング

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

- これは仕様：`config.js` の `LOGO_URL` が空の場合、Material Symbols ⚾ + テキストで仮表示
- 実画像URLを `LOGO_URL` に設定すると自動で `<img>` 表示に切り替わる

---

## 📊 第3層（事業判断データ）の使い方

3ヶ月程度データが溜まったら、以下をLooker Studio等で可視化：

| 戦略質問 | 使うイベント |
|---|---|
| 「需要があるのにチームが少ない市町村は？」 | `empty_result` + `municipality_view` |
| 「比較されている市町村ペアは？」 | `city_compare` |
| 「離脱が多いポップアップは？」 | `team_pin_click`/`park_pin_click` → 次イベントなし |
| 「モバイルでの利用パターンは？」 | `gps_use` + デバイス情報（GA4標準） |
| 「データ穴のある検索クエリは？」 | `empty_result` クエリ別集計 |

これらが L-FRIENDS事業の新規誘致候補リスト・LIONS LIGA Saitama 加盟誘致の優先順位付けに直結する。

---

## 📝 メンテナンス

- イベント追加時は `analytics.js` に関数追加 → 該当箇所から呼び出し
- ロゴ・URL等の差し替えは `config.js` のみ編集
- プライバシーポリシー文面変更は `privacy.html` を直接編集
- Cookie同意バナーの文言変更は `cookie-consent.js` 内の HTML を編集
