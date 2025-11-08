# LexiFlow Desktop App (Tauri版)

Tauriベースのデスクトップ版英語学習アプリケーション

## プロジェクト概要

このディレクトリは**Tauri版（デスクトップアプリ）**の実装予定地です。現在は開発準備中で、Web版（`/web-apps/frontend/`）の安定後に本格開発を開始します。

## Tauri版とWeb版の違い

### Tauri版（このディレクトリ）の特徴

**利点:**

- ✅ デスクトップアプリとしてのネイティブ機能
- ✅ ファイルシステムへの完全アクセス
- ✅ ローカルSQLiteなどでのキャッシュ可能
- ✅ 完全なオフライン動作
- ✅ システムトレイ、通知などのOS統合機能
- ✅ より高速な起動とパフォーマンス

**制約事項:**

- ❌ サーバーサイドキャッシュは不可（各ユーザーがローカルキャッシュを持つ）
- ❌ キャッシュの共有ができない（API コスト増加の可能性）
- ❌ バックエンドAPI Routesが使えない（Rustで独自実装が必要）
- ❌ プラットフォーム別のビルドが必要（macOS、Windows、Linux）

**推奨キャッシュ戦略:**

- **ローカルストレージ**: localStorage / IndexedDB（小規模データ）
- **SQLite**: 大規模な会話履歴やキャッシュデータ
- **ファイルベース**: 音声ファイルなどのメディアキャッシュ

### Web版（`/web-apps/frontend/`）の特徴

**利点:**

- ✅ ブラウザベースのため、サーバーサイドでのAPIキャッシュが可能
- ✅ Vercel KVなどのマネージドキャッシュサービスを利用可能
- ✅ サーバーレス関数で永続的なキャッシュ管理が可能
- ✅ 複数ユーザー間でキャッシュを共有可能（コスト削減）
- ✅ デプロイが簡単（Vercel等）
- ✅ プラットフォーム非依存

**制約事項:**

- ❌ ブラウザのセキュリティ制約（CORS、ファイルシステムアクセスなし）
- ❌ オフライン動作に制限あり
- ❌ ネイティブ機能の制限

## 開発ロードマップ

### Phase 1（現在）
- Web版の完成とテスト
- コア機能の安定化

### Phase 2（将来）
- Tauri版の開発開始
- Web版のReactコンポーネントを再利用
- Rustバックエンドとの統合

### Phase 3（オプション）
- プラットフォーム固有の最適化
- オフライン機能の強化
- ネイティブ機能の追加

## 技術スタック（予定）

- **Framework**: Tauri 2.0
- **Frontend**: React/Next.js（Web版と共通コンポーネント）
- **Backend**: Rust（Tauri commands）
- **Database**: SQLite（ローカル）
- **AI Provider**: Gemini API（Web版と共通）

## キャッシュ実装の違い

### Web版のキャッシュ戦略

```typescript
// Next.js API Route（サーバーサイド）
import { kv } from '@vercel/kv';

export async function POST(request: Request) {
  const cacheKey = generateCacheKey(userData);

  // Vercel KV（Redis）でキャッシュ
  const cached = await kv.get(cacheKey);
  if (cached) return cached;

  const result = await callGeminiAPI();
  await kv.set(cacheKey, result, { ex: 3600 });
  return result;
}
```

### Tauri版のキャッシュ戦略（予定）

```rust
// Tauri command（ローカル）
use tauri::command;
use rusqlite::Connection;

#[command]
async fn get_ai_suggestion(user_words: Vec<Word>) -> Result<Suggestion, Error> {
    let cache_key = generate_cache_key(&user_words);

    // ローカルSQLiteでキャッシュ
    let conn = Connection::open("cache.db")?;
    if let Some(cached) = get_from_cache(&conn, &cache_key)? {
        return Ok(cached);
    }

    let result = call_gemini_api(&user_words).await?;
    save_to_cache(&conn, &cache_key, &result)?;
    Ok(result)
}
```

## API コスト管理の注意点

### Web版の利点
- 複数ユーザーが同じキャッシュを共有
- 例: 100人のユーザーが同じ単語リストを持っていれば、API呼び出しは1回だけ

### Tauri版の課題
- 各ユーザーが独自のローカルキャッシュを持つ
- 例: 100人のユーザーがそれぞれAPI呼び出しを行う（100回）

### 対策案
1. **初回キャッシュの長期化**: TTLを長く設定（7日間など）
2. **共通辞書データの同梱**: よく使われる単語はアプリに事前インストール
3. **オンデマンドキャッシュ**: ユーザーがリクエストしたものだけキャッシュ
4. **ローカルLLMオプション**: Gemini API の代わりにローカルモデルを提供

## ディレクトリ構造（予定）

```
frontend/
├── src/                       # Reactフロントエンド
│   ├── components/           # Web版と共有可能なコンポーネント
│   ├── features/
│   └── lib/
├── src-tauri/                # Tauriバックエンド（Rust）
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands/         # Tauri commands
│   │   ├── cache/            # ローカルキャッシュ管理
│   │   ├── db/               # SQLite操作
│   │   └── services/         # 外部API連携
│   ├── Cargo.toml
│   └── tauri.conf.json
└── README.md                 # このファイル
```

## 開発開始時の準備

```bash
# Tauri CLI のインストール
cargo install tauri-cli

# プロジェクトのセットアップ
cd frontend/
npm install

# Tauri開発サーバーの起動
cargo tauri dev

# ビルド
cargo tauri build
```

## 参考リンク

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Tauri 2.0 Migration Guide](https://v2.tauri.app/start/migrate/)
- [SQLite with Rust](https://github.com/rusqlite/rusqlite)

## 重要な設計判断

**なぜWeb版とTauri版を分けるのか？**

1. **キャッシュ戦略の違い**: サーバーサイド vs ローカル
2. **API制約の違い**: CORS制約 vs ネイティブアクセス
3. **デプロイ方法の違い**: Vercel vs アプリストア配布
4. **コスト構造の違い**: 共有キャッシュによるAPI節約 vs 個別キャッシュ

両方のバージョンを提供することで、ユーザーに最適な選択肢を提供します。
