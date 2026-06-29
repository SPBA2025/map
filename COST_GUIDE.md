# 運用コストガイド（無料運用のために）

埼玉県野球マップ（公園マップ / チームマップ）を**無料で**運用し続けるための注意点。

## 背景（2026-06 の課金事故）
`js/team-map.js` の `runGeocodingAll()` が、訪問者ごとに活動場所名 約370件を `new google.maps.Geocoder()` で座標変換し、**Geocoding API に月¥1,547**課金された。原因＝「すでに座標が分かっている場所を毎回再変換する無駄なループ」。
対策：① ブラウザ側ジオコーディングを無効化（コード）② APIキーを Maps JavaScript API のみに制限（GCP）。座標は静的 `PLACE_COORDS`（371件）に焼き込み済みで充足。

## 最優先（必ず維持）
1. **予算アラート ¥1**（GCP お支払い → 予算とアラート）。1円課金で即通知。最強の保険。
2. **APIキー制限を外さない**：プロジェクト「SPBA-Map」の Maps Platform API Key を
   - APIの制限 = **Maps JavaScript API のみ**（Geocoding / Places を許可しない）
   - アプリの制限 = HTTPリファラー `https://map.saitamabaseball.com/*`（＋ github.io）
3. 月1回、**請求レポート**を確認（Maps JS が ¥0 なら無料枠内）。

## やってはいけない（課金の引き金）
- ブラウザで `google.maps.Geocoder` / `google.maps.places.*` / `DirectionsService` / `DistanceMatrixService` を使う → 代わりに **Nominatim(OSM) + GSI(国土地理院)** を使う（住所検索は既にこれ）。
- Maps JS の読み込みに `libraries=places` を足す（`marker` は無料、`places` は課金）。
- 訪問者ごとに外部APIをループ呼び出し → 結果は**静的データに焼き込む**。
- `runGeocodingAll` の再有効化。
- APIキーの制限・リファラー制限の解除。

## サービス別メモ
- **Google Maps（地図表示, Maps JavaScript API）**：唯一の課金面。無料枠内なら ¥0。アクセス急増時のみ注意（割り当て上限で頭打ち可）。
- **検索・座標化（Nominatim/GSI）**：無料だが作法あり。Nominatim=1req/秒・User-Agent必須・大量一括不可。ユーザー操作ごとの利用は可。
- **Cloudinary（写真・ロゴ）**：カード未登録＝課金され得ない（超過で停止のみ）。cloud=dpzmmr7r8 / preset=park_unsigned。
- **GAS（公園/チーム裏側）**：Apps Script 無料枠。`Maps.newGeocoder` も別無料枠で課金外。
- **GitHub Pages**：公開リポジトリは無料。

## 新機能を足すときの合言葉
「**これは Google Maps Platform の課金SKUを呼ぶ？**」→ Yes なら無料の代替（Nominatim/GSI/自前データ）を先に検討。地図表示(Maps JS)以外の Google 有料APIは使わない。

## 無料枠・利用状況の確認先
- 請求レポート：GCP お支払い → レポート
- 利用回数：GCP → Google Maps Platform → 指標(Metrics)
- 無料枠の最新値：https://mapsplatform.google.com/pricing
