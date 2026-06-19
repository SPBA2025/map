# 埼玉県公園マップ（parks.html）セットアップガイド

## 概要
埼玉県内の公園でキャッチボールができるかどうかを地図で確認できるマップです。

- **Google Maps** で埼玉県全域を表示
- **マーカークラスタリング** で多数の公園を効率的に表示
- **検索・フィルター** でキャッチボール可否を瞬時に確認
- **Googleフォーム** からユーザー投稿を受け付け、承認後にマップへ反映

公開URL: **https://spba2025.github.io/map/parks.html**

---

## アーキテクチャ概要

```
[公園マップ] ──fetch──> [GAS Web App] ──read──> [スプレッドシート]
   parks.html                                        ↑
       ↑                                             │
       └── parks-data.js（静的データ231件）          │ 自動転記
                                                     │
                                            [Googleフォーム投稿]
```

- **静的データ**: `parks-data.js` に PARKFUL 調査の 231 件
- **動的データ**: GAS Web App 経由で「承認済みデータ」シートから取得
- **デプロイ**: GitHub Pages（main ブランチに push すると自動反映）

---

## API キー運用ルール（重要）

### 現在の方式：HTTP リファラー制限

`parks.html:19` に API キーを直書きしていますが、**Google Cloud Console で HTTP リファラー制限を設定済み** のため、指定ドメイン外からは使用できません。これは静的サイトの業界標準的な運用です。

### Google Cloud Console での設定内容

| 設定項目 | 値 |
|---|---|
| アプリケーションの制限 | HTTPリファラー（ウェブサイト） |
| 許可リファラー | `https://spba2025.github.io/*` |
| 〃 | `http://localhost:*/*` |
| 〃 | `http://127.0.0.1:*/*` |
| API の制限 | Maps JavaScript API、Places API のみ |

### キーが正しく制限されているかの確認方法

サーバーから直接 Places API を叩いてみて、以下のエラーが返れば OK：
```json
{
  "error_message": "API keys with referer restrictions cannot be used with this API.",
  "status": "REQUEST_DENIED"
}
```

ターミナルから：
```powershell
$key = 'YOUR_API_KEY'
Invoke-WebRequest "https://maps.googleapis.com/maps/api/place/textsearch/json?query=park&key=$key"
```

---

## ローカル開発

### 必要なもの
- Git
- Python 3.x（簡易HTTPサーバー用）または Node.js
- GitHub CLI（`gh`）— 推奨

### 初回セットアップ

```powershell
# リポジトリをクローン
gh repo clone SPBA2025/map
cd map
```

API キーは parks.html に既に埋め込まれており、ローカルでも `http://localhost:*` がリファラー許可されているため、**追加の設定は不要** です。

### プレビュー起動

```powershell
python -m http.server 8000
```

ブラウザで http://localhost:8000/parks.html を開く。

---

## データ更新の手順

### A. 既存公園リストに追加・修正（parks-data.js）

`parks-data.js` の `parkData` 配列に追記します。

```js
{ id:300, name:'○○公園', city:'△△市', catchball:true },
```

**ルール：**
- `id` は既存の最大値 + 1（現在は 243 が最大）
- `city` は市区町村名（「市」「町」「村」まで含める）
- `catchball`：`true`（可）/ `false`（不可）/ `null`（不明）
- 緯度経度はマーカー表示時に Google Places API で自動取得（不要）

### B. 詳細情報を付ける（任意）

特定の公園に住所・面積・施設情報を付ける場合は、parks-data.js の該当エントリにフィールドを追加します。

```js
{ id:1, name:'浦和高速下緑地公園', city:'さいたま市', catchball:true,
  lat:35.8666, lng:139.7211, address:'さいたま市浦和区北浦和1',
  area:'約2.5ha', toilet:true, parking:true,
  parkful_url:'https://parkful.net/parks/11201010001' },
```

**ポイント：** `lat`/`lng` を付与した公園は Places API ジオコーディングをスキップし、即座にマップ表示されます（パフォーマンス向上）。

### C. 変更を本番反映

```powershell
git add parks-data.js
git commit -m "feat: ○○公園を追加"
git push
```

push から **30秒〜2分** で GitHub Pages に反映されます。

---

## ユーザー投稿フロー（Googleフォーム → 承認 → マップ反映）

### 仕組み
1. **Googleフォーム** からユーザーが「公園名・キャッチボール可否」を投稿
2. **スプレッドシート**「フォームの回答 1」に自動蓄積
3. GAS メニュー **「① 集計する」** で公園ごとの回答を集計
4. 集計結果シートの **承認列に ✓** を入れる
5. GAS メニュー **「② 承認済みデータを公開」** で「承認済みデータ」シートに転記（緯度経度を自動取得）
6. parks.html が `?action=approved` でデータ取得 → マップ表示

### GAS 再デプロイ手順（コード変更時）

ローカルの `gas_aggregate.js` を修正しただけでは本番には反映されません：

1. Apps Script エディタを開く
2. `gas_aggregate.js` の最新コードを貼り付け
3. 「デプロイ」→「デプロイを管理」→ 既存のデプロイを **編集**
4. バージョンを「新バージョン」にして「デプロイ」

**[重要]** 新規デプロイにすると URL が変わるため必ず既存デプロイの編集にすること

---

## ファイル構成

```
map/
├── parks.html             # 公園マップ本体（HTML+CSS+JS全部入り）
├── parks-data.js          # 公園データ（233件、うち3件は詳細情報付き）
├── parks_catchball.csv    # PARKFUL元データ（編集不要）
├── gas_aggregate.js       # Google Apps Script（参考用、本体は GAS 側）
├── parks.config.example.js # ローカル開発時のテンプレート（現状未使用）
├── admin.html             # 事務局用 承認ページ（公園報告の承認/却下）
├── team-admin.html        # チームデータ管理ツール（ローカル用）
├── index.html             # 埼玉県野球チームマップ（別マップ）
└── SETUP_PARKS.md         # 本ドキュメント
```

---

## トラブルシューティング

### 地図が表示されない
- ブラウザコンソール（F12）でエラーを確認
- `RefererNotAllowedMapError` が出ている場合：
  - Google Cloud Console でリファラー制限に該当ドメインが含まれているか確認
  - 本番（`spba2025.github.io`）とローカル（`localhost`）の両方が必要
- `ApiNotActivatedMapError`：Maps JavaScript API が有効か確認

### マーカーが表示されない
- `parks-data.js` の構文エラー（カンマ抜け等）を確認
- ブラウザコンソールに JS エラーが出ていないか確認

### GAS データが取得できない
- parks.html は 5秒タイムアウトで `parks-data.js` のみ表示にフォールバックする設計
- GAS URL が変わった場合、`parks.html:20` の `GAS_URL` を更新する必要あり

### GitHub Pages に反映されない
- main へ push したか確認：`git log origin/main..main` で差分が無いか
- Actions タブで pages-build-deployment の状況を確認

---

## セキュリティ

| 項目 | 状態 |
|---|---|
| Google Maps API キー | parks.html に直書き / リファラー制限で保護 |
| GAS Web App URL | parks.html に直書き / 読み取り専用エンドポイント、書き込み不可 |
| Googleフォーム投稿 | 承認フローを通過したデータのみマップに反映 |

### 万一の対応

API キーが想定外のドメインから使われている形跡があれば：
1. Google Cloud Console で **当該キーを削除**
2. 新規キーを発行（リファラー制限を最初に設定してから保存）
3. `parks.html:19` を新キーで更新
4. commit & push

---

## 関連リンク

- リポジトリ: https://github.com/SPBA2025/map
- 公園マップ: https://spba2025.github.io/map/parks.html
- 野球チームマップ: https://spba2025.github.io/map/index.html
- Google Cloud Console（APIキー管理）: https://console.cloud.google.com/apis/credentials
