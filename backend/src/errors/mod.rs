use shuttle_axum::axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] diesel::result::Error),
    
    #[error("Connection pool error: {0}")]
    Pool(#[from] deadpool_diesel::PoolError),
    
    #[error("Async pool error: {0}")]
    AsyncPool(#[from] diesel_async::pooled_connection::deadpool::PoolError),
    
    #[error("Validation error: {0}")]
    Validation(#[from] validator::ValidationErrors),
    
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Bad request: {0}")]
    BadRequest(String),
    
    #[error("Internal server error: {0}")]
    Internal(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match &self {
            AppError::Database(diesel::result::Error::NotFound) => {
                (StatusCode::NOT_FOUND, "Resource not found".to_string())
            }
            AppError::Database(_) => {
                tracing::error!("Database error: {}", self);
                (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
            }
            AppError::Pool(_) => {
                tracing::error!("Connection pool error: {}", self);
                (StatusCode::INTERNAL_SERVER_ERROR, "Database connection error".to_string())
            }
            AppError::AsyncPool(_) => {
                tracing::error!("Async connection pool error: {}", self);
                (StatusCode::INTERNAL_SERVER_ERROR, "Database connection error".to_string())
            }
            AppError::Validation(errors) => {
                let error_messages: Vec<String> = errors
                    .field_errors()
                    .iter()
                    .map(|(field, errors)| {
                        format!("{}: {}", field, errors[0].message.as_ref().unwrap_or(&"Invalid value".into()))
                    })
                    .collect();
                (StatusCode::BAD_REQUEST, error_messages.join(", "))
            }
            AppError::Serialization(_) => {
                tracing::error!("Serialization error: {}", self);
                (StatusCode::INTERNAL_SERVER_ERROR, "Serialization error".to_string())
            }
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::Internal(msg) => {
                tracing::error!("Internal error: {}", msg);
                (StatusCode::INTERNAL_SERVER_ERROR, msg.clone())
            }
        };

        let body = Json(json!({
            "error": error_message,
            "status": status.as_u16()
        }));

        (status, body).into_response()
    }
}