# LexiFlow Web App (Phase 1 MVP)

Next.jsベースのWeb版英語学習アプリケーション

## プロジェクト概要

このディレクトリは**Web版（ブラウザベース）**の実装です。Phase 1 MVPとして開発され、将来的にPhase 2でRustバックエンドへの移行が予定されています。

## Web版とTauri版の違い

### Web版（このディレクトリ）の特徴

**制約事項:**

- ✅ ブラウザベースのため、サーバーサイドでのAPIキャッシュが可能
- ✅ Vercel KVなどのマネージドキャッシュサービスを利用可能
- ✅ サーバーレス関数で永続的なキャッシュ管理が可能
- ✅ 複数ユーザー間でキャッシュを共有可能（コスト削減）
- ❌ ブラウザのセキュリティ制約（CORS、ファイルシステムアクセスなし）
- ❌ オフライン動作に制限あり

**推奨キャッシュ戦略:**

- Phase 1: In-memory cache (開発用)
- Phase 2: Vercel KV / Redis (本番用)

### Tauri版（`/frontend-tauri/`）の特徴

**制約事項:**

- ✅ デスクトップアプリとしてのネイティブ機能
- ✅ ファイルシステムへの完全アクセス
- ✅ ローカルSQLiteなどでのキャッシュ可能
- ✅ 完全なオフライン動作
- ❌ サーバーサイドキャッシュは不可（各ユーザーがローカルキャッシュ）
- ❌ キャッシュの共有ができない（API コスト増加の可能性）

**推奨キャッシュ戦略:**

- ローカルストレージ（localStorage / IndexedDB）
- SQLite データベース

## Getting Started

### 環境構築

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.local を編集してAPIキーやデータベースURLを設定

# 開発サーバーの起動
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 主要コマンド

```bash
npm run dev          # 開発サーバー起動（Turbopack）
npm run build        # 本番ビルド
npm run start        # 本番サーバー起動
npm run lint         # ESLint実行
npm run format       # Prettier実行
npm run generate     # Prisma Client生成 + ビルド
```

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証ルート
│   ├── (main)/            # メインアプリルート
│   └── api/               # API Routes（Phase 1）
├── features/              # 機能別モジュール
│   ├── vocabulary/
│   ├── conversation/
│   └── suggestions/
├── components/            # 共有UIコンポーネント
├── lib/                   # ユーティリティ
├── hooks/                 # カスタムフック
└── types/                 # 型定義
```

## 技術スタック

- **Framework**: Next.js 15.4.6 (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS + Shadcn/ui
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **Authentication**: Auth.js (Next-Auth 5.0)
- **AI Provider**: Gemini API
- **Deployment**: Vercel

## Phase 2への移行準備

このWeb版はRustバックエンド（Axum + Diesel）への段階的移行を想定して設計されています。

**移行時の変更点:**

- API Routes → Rust Axum endpoints
- 環境変数 `NEXT_PUBLIC_API_URL` でAPIベースURL切り替え
- 同じNeon PostgreSQLデータベースを継続使用
- フロントエンドコードは基本的に変更不要

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Auth.js Documentation](https://authjs.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
