# リファクタリング計画

長期運用に耐えるコードベースにするための段階的リファクタリング計画。
**各フェーズ終了時点で必ずデプロイ可能な状態を保つ**こと。

## 現状の課題（2026-05 計測）

| 指標 | 計測値 |
|---|---|
| index.html | 4,759行 / 389KB（うちインラインGeoJSON 約98KB） |
| parks.html | 2,064行 / 106KB |
| `window.*` グローバル関数 | 76個 |
| インライン `style="..."` | 220箇所 |
| `!important` | 34箇所 |
| z-index の種類 | 19種類（1〜99999） |
| 両HTMLのヘッダー/フッター | ほぼ完全に重複 |

## 原則

1. 各フェーズ終了時点で本番デプロイ可能
2. Phase 1〜3 は挙動完全不変
3. フェーズ開始前に git tag、1テーマ1コミット
4. 各フェーズ後に docs/SMOKE_TEST.md を実施
5. フレームワーク・ビルドツールは導入しない（静的配信を維持）

## Phase 0: 安全網（完了）

- [x] git tag `pre-refactor`
- [x] docs/SMOKE_TEST.md（手動テストチェックリスト）
- [x] scripts/validate-data.js（データ整合性チェック）

## Phase 1: 死蔵コードの削除

- [ ] parks.html: 旧 Places API 実装（placeRegisteredParks / searchParksInView）の関数本体削除
- [ ] index.html / parks.html: 非表示フローティングUI（float-kpi / float-legend / float-insights）の DOM・CSS・JS 削除
- [ ] parks.config.example.js 削除
- [ ] 経緯コメント（revert・廃止の履歴的記述）の掃除
- 完了条件: 対象 grep 0件・スモークテスト全パス

## Phase 2: アセットの外部化

- [ ] CSS を css/（tokens / common / team-map / parks-map）に分離
- [ ] インライン GeoJSON を data/geo-cities.js / data/geo-wards.js に分離
- [ ] インライン JS を js/（common / team-map / parks-map）に分離
- [ ] teams-data.js / parks-data.js を data/ に移動
- [ ] 全 script/link に `?v=日付` のキャッシュバスティング付与
- 完了条件: index.html 600行以下・スモークテスト全パス

## Phase 3: 二重実装の統合

- [ ] ヘッダー/フッターを common.js による injection に統一（1定義）
- [ ] カラー・z-index・ブレークポイントを tokens.css の CSS 変数に集約
- [ ] z-index をスケール化（map:1 / float:500 / panel:2000 / modal:3000 / nav:5000 / toast:9000 / consent:9500）
- [ ] ブレークポイントを 768px / 1100px の2段に統一
- [ ] URL・キー類のハードコードを config.js に集約
- 完了条件: ヘッダー文言変更が1箇所で両マップに反映・スモークテスト全パス

## Phase 4: JS モジュール境界の整理

- [ ] window.* 76個 → 名前空間（TeamMap / ParksMap）に集約、最終的に直下10個以下
- [ ] InfoWindow モンキーパッチ → PopupManager クラスに置換
- [ ] team-map.js を state / map-layers / popups / panels / geocode に分割
- [ ] 3回以上重複するインラインstyleのクラス化
- 完了条件: スモークテスト全パス（中間でも実施）

## Phase 5: 品質ゲート

- [ ] ESLint + Prettier 導入（ローカル実行）
- [ ] validate-data.js をデータ更新時の必須手順として README に明記
- [ ] docs/ARCHITECTURE.md 作成（構成図・不変条件）
- 完了条件: `npx eslint js/` エラー0

## Phase 6:（任意・着手未定)

- ES Modules 化 / esbuild バンドル / JSDoc 型注釈 / Playwright 自動テスト

## データ品質の既知課題

- 公園座標の完全重複 13ペア（ジオコーディングのフォールバックによる市中心点集中）
  → 個別再ジオコーディング or 手動修正で解消予定
