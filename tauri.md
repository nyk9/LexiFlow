# Tauri Desktop App Development Guide for LexiFlow

## 📋 Project Overview

LexiFlowの英語学習WebアプリをTauri 2.0を使用してデスクトップアプリに展開するためのガイド。既存のNext.js + React + TypeScriptのフロントエンドを維持しながら、ネイティブデスクトップ体験を提供します。

## 🎯 Development Phases

### Phase 1: Environment Setup (1-2 days)
**目標**: Tauri開発環境の構築

#### 前提条件のインストール

**Rust Installation**:
```bash
# Rustのインストール
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh

# 環境変数の更新
source $HOME/.cargo/env

# インストール確認
rustc --version
cargo --version
```

**macOS Requirements**:
```bash
# Xcode Command Line Toolsのインストール（未インストールの場合）
xcode-select --install

# 確認
xcode-select -p
```

**Tauri CLI Installation**:
```bash
# Tauri CLIのインストール
cargo install tauri-cli@^2.0

# インストール確認
cargo tauri --version
```

#### Node.js Dependencies:
```bash
# Tauri APIクライアントのインストール（プロジェクトディレクトリで実行）
cd web-apps/frontend
pnpm add @tauri-apps/api@^2.0
pnpm add -D @tauri-apps/cli@^2.0
```

### Phase 2: Next.js Integration (2-3 days)
**目標**: 既存Next.jsプロジェクトとTauriの統合

#### Next.js設定の調整

**next.config.ts**の更新:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 既存の設定
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['@prisma/client'],
  
  // Tauri用の静的エクスポート設定
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
```

#### Tauri プロジェクトの初期化

```bash
# プロジェクトルートで実行
cd web-apps/frontend
cargo tauri init

# 設定時の応答例:
# App name: LexiFlow
# Window title: LexiFlow - English Learning
# Web assets location: out
# Dev server URL: http://localhost:3000
# Frontend dev command: pnpm dev
# Frontend build command: pnpm build
```

#### package.jsonスクリプトの追加

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

### Phase 3: Tauri Configuration (1-2 days)
**目標**: Tauriアプリケーションの設定とカスタマイズ

#### tauri.conf.json の設定例

```json
{
  "$schema": "https://schema.tauri.app/config/2.0.0",
  "productName": "LexiFlow",
  "version": "0.1.0",
  "identifier": "com.lexiflow.app",
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "LexiFlow - English Learning",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "webSecurity": false,
        "fileDropEnabled": false
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "identifier": "com.lexiflow.app",
    "publisher": "",
    "copyright": "",
    "category": "Education",
    "shortDescription": "AI-powered English learning application",
    "longDescription": "LexiFlow is an innovative English learning application that combines vocabulary management with AI conversation practice.",
    "appimage": {
      "bundleMediaFramework": false
    },
    "deb": {
      "depends": []
    },
    "macOS": {
      "frameworks": [],
      "minimumSystemVersion": "10.13",
      "exceptionDomain": ""
    },
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": ""
    }
  },
  "build": {
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build",
    "frontendDist": "../out",
    "devUrl": "http://localhost:3000"
  },
  "plugins": {}
}
```

### Phase 4: Desktop Features Implementation (3-4 days)
**目標**: デスクトップ特有機能の実装

#### 基本的なRustコマンドの実装

**src-tauri/src/main.rs**:
```rust
// 基本的なコマンド例
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to LexiFlow!", name)
}

#[tauri::command]
async fn save_vocabulary_offline(word: String, meaning: String) -> Result<String, String> {
    // オフライン単語保存ロジック
    // 将来的にローカルデータベース連携
    Ok(format!("Saved: {} - {}", word, meaning))
}

#[tauri::command]
async fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            save_vocabulary_offline,
            get_app_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### フロントエンドでのTauri API使用例

**React Component Example**:
```typescript
'use client';
import { invoke } from '@tauri-apps/api/tauri';
import { useState, useEffect } from 'react';

export function TauriGreeting() {
  const [greeting, setGreeting] = useState('');
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    // Tauriコマンドの呼び出し
    invoke<string>('greet', { name: 'LexiFlow User' })
      .then(setGreeting)
      .catch(console.error);
      
    invoke<string>('get_app_version')
      .then(setAppVersion)
      .catch(console.error);
  }, []);

  const saveWord = async (word: string, meaning: string) => {
    try {
      const result = await invoke<string>('save_vocabulary_offline', { 
        word, 
        meaning 
      });
      console.log(result);
    } catch (error) {
      console.error('Failed to save word:', error);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold">Tauri Integration</h3>
      <p>{greeting}</p>
      <p className="text-sm text-gray-600">App Version: {appVersion}</p>
      <button 
        onClick={() => saveWord('example', 'an illustration of something')}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test Save Word
      </button>
    </div>
  );
}
```

### Phase 5: Advanced Desktop Features (2-3 days)
**目標**: 高度なデスクトップ機能の実装

#### システム統合機能

**Menu Integration**:
```rust
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

fn create_app_menu() -> Menu {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let close = CustomMenuItem::new("close".to_string(), "Close");
    let submenu = Submenu::new("File", Menu::new().add_item(close).add_item(quit));
    
    Menu::new()
        .add_native_item(MenuItem::Copy)
        .add_native_item(MenuItem::Paste)
        .add_submenu(submenu)
}
```

**System Notifications**:
```typescript
import { sendNotification } from '@tauri-apps/api/notification';

export const showLearningReminder = async () => {
  await sendNotification({
    title: 'LexiFlow Reminder',
    body: 'Time for your daily English practice!',
    icon: '/icons/notification.png'
  });
};
```

**Keyboard Shortcuts**:
```rust
use tauri::GlobalShortcutManager;

// ショートカットの登録例
app.global_shortcut_manager()
    .register("CmdOrCtrl+Shift+L", || {
        println!("LexiFlow shortcut triggered!");
    })
    .unwrap();
```

### Phase 6: Build & Distribution (1-2 days)
**目標**: アプリケーションのビルドと配布準備

#### 開発ワークフロー

```bash
# 開発モード（ホットリロード付き）
pnpm tauri:dev

# プロダクションビルド
pnpm tauri:build

# 特定のターゲット向けビルド
cargo tauri build --target x86_64-apple-darwin
cargo tauri build --target aarch64-apple-darwin
```

#### アプリアイコンの設定

```bash
# アイコンファイルの生成（1024x1024のPNGから）
cargo tauri icon path/to/icon.png
```

#### 配布準備

- **macOS**: `.dmg`ファイルの生成
- **Windows**: `.msi`インストーラーの作成
- **Linux**: `.AppImage`, `.deb`パッケージ

## 🚀 Development Workflow

### 日常的な開発フロー

```bash
# 1. Next.js開発サーバー起動（別ターミナル）
cd web-apps/frontend
pnpm dev

# 2. Tauriアプリケーション起動
pnpm tauri:dev
```

### ビルドとテスト

```bash
# フロントエンドビルドのテスト
pnpm build

# Tauriアプリケーションビルド
pnpm tauri:build
```

## 📱 Future Mobile Expansion Preparation

### iOS/Android対応の準備

Tauri 2.0では将来的にモバイル対応が可能です：

```bash
# iOS用ターゲット追加（macOS環境）
rustup target add aarch64-apple-ios

# Android用ターゲット追加
rustup target add aarch64-linux-android
```

### モバイル用設定の準備

```json
// tauri.conf.json - mobile section
{
  "mobile": {
    "ios": {
      "developmentTeam": "YOUR_TEAM_ID"
    },
    "android": {
      "packageName": "com.lexiflow.app"
    }
  }
}
```

## 🛠 Troubleshooting

### 一般的な問題と解決方法

**1. Rust Compilation Errors**:
```bash
# Rustツールチェーンの更新
rustup update

# キャッシュのクリア
cargo clean
```

**2. Next.js Static Export Issues**:
- 動的ルーティングの確認
- 画像最適化の無効化確認
- API Routesの静的化対応

**3. Development Server Connection Issues**:
- ポート番号の確認（3000番が使用中でないか）
- ファイアウォール設定の確認

## 📊 Performance Considerations

### アプリサイズの最適化

```toml
# Cargo.toml - Rustバイナリの最適化
[profile.release]
panic = "abort"
codegen-units = 1
lto = true
strip = true
```

### ビルド時間の短縮

```bash
# 並列ビルドの活用
export CARGO_BUILD_JOBS=4
```

## 🎯 Success Metrics

- [ ] デスクトップアプリが正常に起動
- [ ] 既存のNext.js機能がすべて動作
- [ ] Tauri APIを通じたネイティブ機能が利用可能
- [ ] ビルドサイズが1MB以下（目標）
- [ ] 起動時間が3秒以下

## 📚 Resources

- [Tauri 2.0 Documentation](https://v2.tauri.app/)
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Tauri + Next.js Examples](https://github.com/tauri-apps/tauri/tree/dev/examples)

---

**Last Updated**: 2025-09-17
**LexiFlow Version**: 0.1.0
**Tauri Target Version**: 2.0.x