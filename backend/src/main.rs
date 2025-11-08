use anyhow::Context;
use shuttle_axum::{
    axum::{
        http::Method,
        middleware::from_fn_with_state,
        routing::{get, post},
        Router,
    },
    ShuttleAxum,
};
use shuttle_runtime::SecretStore;
use tower_http::cors::{Any, CorsLayer};

mod auth_middleware;
mod handlers;
mod models;

use models::AppState;

use auth_middleware::auth::auth_middleware;
use handlers::ai_handler::{
    analyze_conversation_handler, vocabulary_help_handler, word_suggestions_handler,
};
use handlers::auth_handler::{get_current_user, github_oauth_callback, google_oauth_callback};
use handlers::word_handler::{
    create_word_handler, delete_word_handler, get_word_handler, get_words_handler,
    update_word_handler,
};

async fn health_check() -> &'static str {
    "OK"
}

#[shuttle_runtime::main]
async fn main(
    #[shuttle_shared_db::Postgres] connection_string: String,
    #[shuttle_runtime::Secrets] secrets: SecretStore,
) -> ShuttleAxum {
    // 開発環境でのみ.envファイルを読み込み
    #[cfg(debug_assertions)]
    {
        if let Err(e) = dotenvy::dotenv() {
            eprintln!("Warning: Could not load .env file: {}", e);
        }
    }

    // Retrieve all secrets from SecretStore
    let auth_secret = secrets
        .get("AUTH_SECRET")
        .context("AUTH_SECRET not found")?;

    let github_client_id = secrets
        .get("AUTH_GITHUB_ID")
        .context("AUTH_GITHUB_ID not found")?;

    let github_client_secret = secrets
        .get("AUTH_GITHUB_SECRET")
        .context("AUTH_GITHUB_SECRET not found")?;

    let google_client_id = secrets
        .get("AUTH_GOOGLE_ID")
        .context("AUTH_GOOGLE_ID not found")?;

    let google_client_secret = secrets
        .get("AUTH_GOOGLE_SECRET")
        .context("AUTH_GOOGLE_SECRET not found")?;

    let gemini_api_key = secrets
        .get("GEMINI_API_KEY")
        .context("GEMINI_API_KEY not found")?;

    // Log that secrets were loaded successfully (without revealing the actual values)
    println!("✓ AUTH_SECRET loaded");
    println!("✓ GitHub OAuth credentials loaded");
    println!("✓ Google OAuth credentials loaded");
    println!("✓ Gemini API key loaded");

    // データベース接続プールを作成
    let pool = sqlx::PgPool::connect(&connection_string)
        .await
        .context("Failed to connect to database")?;

    // マイグレーションを実行
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .context("Failed to run migrations")?;

    // Create AppState with all the necessary components
    let app_state = AppState::new(
        pool,
        auth_secret,
        github_client_id,
        github_client_secret,
        google_client_id,
        google_client_secret,
        gemini_api_key,
    );

    // CORS設定
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_origin(Any)
        .allow_headers(Any);

    // 認証不要のルート
    let public_routes = Router::new()
        .route("/health", get(health_check))
        .route("/api/auth/oauth/github", post(github_oauth_callback))
        .route("/api/auth/oauth/google", post(google_oauth_callback))
        .with_state(app_state.clone());

    // 認証必要のルート
    let protected_routes = Router::new()
        .route("/api/auth/me", get(get_current_user))
        .route(
            "/api/words",
            get(get_words_handler).post(create_word_handler),
        )
        .route(
            "/api/words/{id}",
            get(get_word_handler)
                .put(update_word_handler)
                .delete(delete_word_handler),
        )
        .route(
            "/api/conversation-analysis",
            post(analyze_conversation_handler),
        )
        .route("/api/vocabulary-help", post(vocabulary_help_handler))
        .route("/api/word-suggestions", post(word_suggestions_handler))
        .layer(from_fn_with_state(app_state.clone(), auth_middleware));

    let router = Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .layer(cors)
        .with_state(app_state);

    Ok(router.into())
}
