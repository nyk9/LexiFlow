use shuttle_axum::axum::{extract::State, http::StatusCode};
use sqlx::PgPool;

pub async fn db_health_check(
    // main.rsのwith_stateからPgPoolを受け取る
    State(pool): State<PgPool>,
) -> StatusCode {
    // `SELECT 1` を実行してデータベースの応答を確認
    sqlx::query("SELECT 1").fetch_one(&pool).await.map_or_else(
        // エラーが発生した場合
        |e| {
            eprint!("Database health check failed: {:?}", e);
            StatusCode::SERVICE_UNAVAILABLE
        },
        // 成功した場合
        |_| StatusCode::OK,
    )
}
