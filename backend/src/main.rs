// 新しく作成したモジュールを宣言
mod database;
mod handlers;

use shuttle_axum::axum::{routing::get, Router};
use shuttle_runtime::SecretStore;
use sqlx::PgPool;

#[shuttle_runtime::main]
async fn main(
    // Secrets.tomlから情報を取得
    #[shuttle_runtime::Secrets] secret_store: SecretStore,
) -> shuttle_axum::ShuttleAxum {
    // データベースのURLを Secrets から取得
    let database_url = secret_store
        .get("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    // データベース接続プールを作成
    let pool = database::create_pool(&database_url)
        .await
        .expect("Failed to create database pool");

    // (後でここにルーターを追加します)

    // ルーターを作成し、接続プールを共有（Stateとして渡す）
    let router = Router::new()
        .route("/health", get(handlers::db_health_check))
        .with_state(pool); // <- ここでプールを共有

    Ok(router.into())
}
