# 語彙学習アプリケーション開発プロジェクト

## プロジェクト概要
モダンなフルスタック語彙学習ウェブアプリケーション「LexiFlow」の開発。デスクトップアプリケーションの機能をウェブ版として再実装し、単語管理、学習進捗追跡、データの永続化機能を提供します。

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 15+ (App Router)
- **言語**: TypeScript 5+
- **スタイリング**: Tailwind CSS 4+ + Shadcn/ui
- **状態管理**: React Query/TanStack Query
- **フォーム処理**: React Hook Form + Zod validation
- **認証**: カスタム認証フック（Rust JWT連携）
- **デプロイ**: Vercel

### バックエンド
- **フレームワーク**: Rust + Shuttle.rs
- **ウェブフレームワーク**: Axum 0.7+
- **データベース**: PostgreSQL 15+
- **ORM**: Diesel 2+ with diesel-async
- **認証**: JWT + Argon2 (Rust実装)
- **デプロイ**: Shuttle

### Rust依存関係 (主要クレート)
```toml
[dependencies]
axum = "0.7"
shuttle-axum = "0.47"
shuttle-runtime = "0.47"
shuttle-shared-db = { version = "0.47", features = ["postgres"] }
diesel = { version = "2.1", features = ["postgres", "chrono", "uuid"] }
diesel-async = { version = "0.4", features = ["postgres", "deadpool"] }
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
jsonwebtoken = "9"
argon2 = "0.5"
uuid = { version = "1.0", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
validator = { version = "0.16", features = ["derive"] }
tower-http = { version = "0.5", features = ["cors", "trace"] }
tracing = "0.1"
tracing-subscriber = "0.3"
thiserror = "1.0"
anyhow = "1.0"
```

## ディレクトリ構造(案)

```
vocabulary-app/
├── frontend/                    # Next.jsフロントエンド
│   ├── src/
│   │   ├── app/                # App Routerページ
│   │   │   ├── (auth)/         # 認証関連ページグループ
│   │   │   ├── words/          # 単語管理ページ
│   │   │   ├── dashboard/      # ダッシュボード
│   │   │   └── api/            # API Routes (必要に応じて)
│   │   ├── components/         # 共通Reactコンポーネント
│   │   │   ├── ui/             # Shadcn/ui基本コンポーネント
│   │   │   └── layout/         # レイアウトコンポーネント
│   │   ├── features/           # 機能別ディレクトリ
│   │   │   ├── auth/           # 認証機能
│   │   │   ├── words/          # 単語管理機能
│   │   │   └── dashboard/      # ダッシュボード機能
│   │   ├── hooks/              # React カスタムフック
│   │   ├── lib/                # ユーティリティとAPI
│   │   │   ├── api.ts          # API クライアント
│   │   │   ├── auth.ts         # 認証ヘルパー
│   │   │   ├── utils.ts        # 共通ユーティリティ
│   │   │   └── validations.ts  # Zodスキーマ
│   │   └── types/              # TypeScript型定義
├── backend/                     # Rust APIサーバー
│   ├── src/
│   │   ├── main.rs             # アプリケーションエントリーポイント
│   │   ├── lib.rs              # ライブラリルート
│   │   ├── config/             # 設定管理
│   │   │   └── mod.rs
│   │   ├── models/             # データモデル（Diesel）
│   │   │   ├── mod.rs
│   │   │   ├── word.rs
│   │   │   ├── user.rs
│   │   │   └── activity.rs
│   │   ├── handlers/           # APIハンドラー
│   │   │   ├── mod.rs
│   │   │   ├── auth.rs
│   │   │   ├── words.rs
│   │   │   └── statistics.rs
│   │   ├── middleware/         # 認証・CORS等のミドルウェア
│   │   │   ├── mod.rs
│   │   │   ├── auth.rs
│   │   │   └── cors.rs
│   │   ├── services/           # ビジネスロジック
│   │   │   ├── mod.rs
│   │   │   ├── auth_service.rs
│   │   │   └── word_service.rs
│   │   ├── database/           # DB接続・マイグレーション
│   │   │   ├── mod.rs
│   │   │   └── connection.rs
│   │   ├── errors/             # カスタムエラー定義
│   │   │   └── mod.rs
│   │   └── utils/              # ユーティリティ関数
│   │       └── mod.rs
│   ├── migrations/             # Dieselマイグレーション
│   ├── tests/                  # 統合テスト
│   ├── Cargo.toml
│   ├── Shuttle.toml
│   └── diesel.toml
└── README.md
```

## 主要機能要件

### 1. 認証システム
- **ユーザー登録・ログイン**: JWT + Argon2による安全な認証
- **セッション管理**: トークン更新とセキュアな状態管理
- **パスワードリセット**: セキュアなパスワード変更機能

### 2. 単語管理システム
- **CRUD操作**: 単語の作成、読み取り、更新、削除
- **データフィールド**: 単語、意味、翻訳、カテゴリ、品詞、例文
- **検索・フィルタリング**: リアルタイム検索、カテゴリ別フィルター
- **一括操作**: 複数選択による一括削除・編集
- **データ検証**: Zodスキーマによるフロントエンド・バックエンド連携検証

### 3. 学習進捗トラッキング
- **統計情報**: 学習活動の可視化（チャート表示）
- **進捗表示**: カテゴリ別学習進捗、連続学習日数
- **アクティビティログ**: 日次学習記録の管理

### 4. UI/UX機能
- **レスポンシブデザイン**: モバイルファースト設計
- **ダークモード**: ライト/ダークテーマ切り替え
- **アクセシビリティ**: WCAG準拠のUI設計
- **リアルタイム更新**: 即座のフィードバックとローディング状態

## API設計

### 認証エンドポイント
```
POST   /api/auth/register       # ユーザー登録
POST   /api/auth/login          # ログイン
POST   /api/auth/refresh        # トークン更新
POST   /api/auth/logout         # ログアウト
GET    /api/auth/me             # ユーザー情報取得
```

### 単語管理エンドポイント
```
GET    /api/words               # 単語一覧（ページネーション/フィルタ付き）
POST   /api/words               # 新規単語作成
GET    /api/words/:id           # 特定単語取得
PUT    /api/words/:id           # 単語更新
DELETE /api/words/:id           # 単語削除
GET    /api/categories          # カテゴリ一覧
```

### 統計・アクティビティエンドポイント
```
GET    /api/statistics          # 学習統計取得
POST   /api/statistics          # 学習活動記録
GET    /api/activities          # アクティビティ履歴
```

## データベース設計

### テーブル構造
1. **users**: ユーザー情報（id, email, password_hash, created_at, updated_at）
2. **words**: 単語情報（id, user_id, word, meaning, translation, category, part_of_speech, example, created_at, updated_at）
3. **categories**: カテゴリ管理（id, user_id, name, description, created_at）
4. **learning_activities**: 学習記録（id, user_id, activity_type, date, count, created_at）

## Rust開発のベストプラクティス

### エラーハンドリング
- **Result<T, E>パターン**: 型安全なエラー処理
- **thiserror**: カスタムエラー型の定義
- **anyhow**: 簡潔なエラー処理とエラーチェーン

### 非同期処理
- **tokio**: 非同期ランタイム
- **async/await**: 非同期API設計
- **diesel-async**: 非同期データベース操作

### 型安全性
- **serde**: JSONシリアライゼーション
- **validator**: データバリデーション
- **diesel**: 型安全なORM操作

### セキュリティ
- **argon2**: セキュアなパスワードハッシュ化
- **jsonwebtoken**: JWT実装
- **tower-http**: CORS・セキュリティミドルウェア

## 環境設定

### フロントエンド (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=LexiFlow
```

### バックエンド (.env)
```bash
DATABASE_URL=postgresql://username:password@localhost/vocabulary_db
RUST_LOG=debug
JWT_SECRET=your-secure-jwt-secret-key-here
CORS_ORIGIN=http://localhost:3000
```

## 開発ワークフロー

### Phase 1: プロジェクト初期化とセットアップ
1. ディレクトリ構造の作成
2. Rust依存関係のセットアップ（Cargo.toml）
3. Next.js プロジェクト初期化
4. 基本設定ファイルの作成

### Phase 2: バックエンド基盤開発
1. Shuttle.rs + Axumサーバーセットアップ
2. PostgreSQL + Dieselデータベース設定
3. 基本的なエラーハンドリングとログ設定
4. CORS・セキュリティミドルウェア実装

### Phase 3: 認証システム実装
1. Rustでの JWT + Argon2 認証実装
2. ユーザー登録・ログインAPI
3. 認証ミドルウェアとトークン検証
4. フロントエンド認証状態管理

### Phase 4: 単語管理機能実装
1. 単語CRUD API実装
2. データベースマイグレーション
3. バリデーションとエラーハンドリング
4. フロントエンド単語管理UI

### Phase 5: フロントエンド統合
1. Shadcn/ui + Tailwind CSSセットアップ
2. React Query によるAPI統合
3. フォーム処理とバリデーション
4. レスポンシブデザイン実装

### Phase 6: 学習機能・統計実装
1. 学習アクティビティ追跡API
2. 統計データ生成とチャート表示
3. ダッシュボード機能実装

### Phase 7: 最適化とテスト
1. パフォーマンス最適化
2. エラーハンドリングの改善
3. 統合テストとE2Eテスト
4. セキュリティ監査

## 特記事項

## 会話ルール
- **プロンプト**: 会話は全て英語で行う、日本語のプロンプトが来た場合は断るようにする
- **返答**: 英語の出力と、簡単な日本語の翻訳を同時に出力するようにする
- **意識**: 開発者の英語学習の一環で英語アプリを開発しているので、開発も積極的に英語学習要素を取り入れる

### Rust学習を活かした開発指針
- **所有権システム**: メモリ安全性を活かしたデータ管理
- **パターンマッチング**: エラーハンドリングでの積極活用
- **トレイト**: 共通インターフェースの適切な定義
- **モジュールシステム**: 機能別の清潔な分割設計

### 型安全なフロントエンド・バックエンド連携
- **共通型定義**: TypeScript ↔ Rust 型整合性の確保
- **API仕様**: OpenAPI仕様の活用検討
- **バリデーション**: Zod ↔ validator クレート連携

### パフォーマンス最適化
- **データベース**: 適切なインデックス設定とクエリ最適化
- **キャッシング**: React Query + Redis（将来的拡張）
- **バンドル**: Next.js の最適化機能活用

### セキュリティ考慮事項
- **HTTPS**: 本番環境での必須設定
- **CORS**: 適切なオリジン制限
- **レート制限**: API エンドポイントの保護
- **入力検証**: 全てのユーザー入力の検証

### 拡張機能候補
- **データエクスポート/インポート**: CSV/JSON形式対応
- **高度な検索**: 正規表現、タグベース検索
- **学習アルゴリズム**: スペースドリピティション実装
- **多言語対応**: i18n国際化対応
- **オフライン機能**: PWA実装
- **AI機能**: 単語の自動分類や例文生成

このプロジェクトは、Rustの学習成果を実践的に活用しながら、モダンなウェブ技術スタックで構築する実用的な語彙学習ツールです。各フェーズで段階的に機能を実装し、Rustの強力な型システムと安全性を活かした堅牢なアプリケーションの構築を目指します