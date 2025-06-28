use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    routing::{get, post, put, delete},
    Router,
};
use shuttle_axum::ShuttleAxum;
use shuttle_shared_db::Postgres;
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use tracing::{info, Level};
use tracing_subscriber;

mod config;
mod database;
mod errors;
mod handlers;
mod middleware;
mod models;
mod services;
mod utils;

use database::connection::create_pool;
use errors::AppError;

pub type AppState = Arc<database::connection::DbPool>;

#[shuttle_runtime::main]
async fn main(
    #[shuttle_shared_db::Postgres] db: sqlx::PgPool,
) -> ShuttleAxum {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_max_level(Level::INFO)
        .init();

    info!("Starting LexiFlow backend server");

    // Create database connection pool
    let pool = create_pool().await.map_err(|e| {
        eprintln!("Failed to create database pool: {}", e);
        std::process::exit(1);
    }).unwrap();

    let state = Arc::new(pool);

    let app = Router::new()
        .route("/health", get(health_check))
        .nest("/api", create_api_routes())
        .layer(
            CorsLayer::new()
                .allow_origin("http://localhost:3000".parse().unwrap())
                .allow_methods([
                    axum::http::Method::GET,
                    axum::http::Method::POST,
                    axum::http::Method::PUT,
                    axum::http::Method::DELETE,
                ])
                .allow_headers([axum::http::header::CONTENT_TYPE]),
        )
        .with_state(state);

    info!("Server configured successfully");
    Ok(app.into())
}

fn create_api_routes() -> Router<AppState> {
    Router::new()
        .route("/words", get(handlers::words::get_words))
        .route("/words", post(handlers::words::create_word))
        .route("/words/:id", get(handlers::words::get_word))
        .route("/words/:id", put(handlers::words::update_word))
        .route("/words/:id", delete(handlers::words::delete_word))
        .route("/categories", get(handlers::words::get_categories))
        .route("/statistics", get(handlers::statistics::get_statistics))
        .route("/statistics", post(handlers::statistics::record_activity))
}

async fn health_check() -> Result<Json<serde_json::Value>, AppError> {
    Ok(Json(serde_json::json!({
        "status": "healthy",
        "service": "lexiflow-backend",
        "version": "0.1.0"
    })))
}