# 埼玉県公園マップ（parks.html）セットアップガイド

## 概要
埼玉県内の公園でキャッチボールができるかどうかを地図で確認できるマップです。

- 🗺️ **Google Maps** で埼玉県全域を表示
- 📌 **マーカークラスタリング** で6000+の公園を効率的に表示
- 🔍 **検索・フィルター** でキャッチボール可否を瞬時に確認

---

## セットアップ（3ステップ）

### Step 1: Google Maps API キーを取得

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新規プロジェクトを作成
3. **Maps JavaScript API** を有効化
4. **認証情報** から **API キー** を生成
5. **HTTP リファラー制限** を設定（`http://localhost/*` など）

### Step 2: parks.config.js を作成

```bash
# parks.config.example.js をコピー
cp parks.config.example.js parks.config.js
```

### Step 3: API キーを設定

`parks.config.js` を編集して、以下を置き換えてください：

```js
const API_KEY = 'YOUR_API_KEY_HERE';
      ↓
const API_KEY = 'AIzaSy...（取得したキー）';
```

---

## 動作確認

ブラウザで `parks.html` を開いてください：

```
file:///c:/Users/k.iwama/Box/【部署】_コミュニティ創生部_野球振興（コーチ含む）/01 埼玉県野球協議会/★マップ/map/parks.html
```

✅ Google Maps が表示される  
✅ マーカーが表示される  
✅ フィルター・検索が動作する

---

## セキュリティ注意事項

⚠️ **parks.config.js は GitHub に上げないでください**

- `.gitignore` で自動的に除外されます
- このファイルには API キーが含まれるため、公開するとセキュリティリスクになります
- `parks.config.example.js`（テンプレート）のみ GitHub に公開されます

---

## 開発・運用

### ローカル開発
```bash
# ローカルで parks.config.js を作成して開発
```

### GitHub にアップロード
```bash
git add .
git commit -m "Add parks.html"
git push
```

parks.config.js は自動的に除外されます（.gitignore で設定）

### 他のユーザーが使う場合
1. リポジトリを clone
2. parks.config.example.js を parks.config.js にコピー
3. API キーを入力
4. parks.html を開く

---

## トラブルシューティング

### 地図が表示されない
- ✅ parks.config.js が存在するか確認
- ✅ API キーが正しく入力されているか確認
- ✅ Google Cloud Console で Maps JavaScript API が有効になっているか確認
- ✅ ブラウザコンソール（F12）でエラーを確認

### マーカーが表示されない
- ✅ parks.html にデータが入力されているか確認
- ✅ 緯度・経度が正しい形式か確認（例: 35.8666, 139.7211）

---

## ドキュメント

- [parks.html の機能説明](README.md)
- [API キー取得方法](#step-1-google-maps-api-キーを取得)
- [GitHub セキュリティ設定](../../../.gitignore)
