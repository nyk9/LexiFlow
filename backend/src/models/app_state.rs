use sqlx::PgPool;

/// Application state that holds all shared resources
#[derive(Clone)]
pub struct AppState {
    /// Database connection pool
    pub pool: PgPool,
    /// JWT secret for authentication
    pub auth_secret: String,
    /// GitHub OAuth client ID
    pub github_client_id: String,
    /// GitHub OAuth client secret
    pub github_client_secret: String,
    /// Google OAuth client ID
    pub google_client_id: String,
    /// Google OAuth client secret
    pub google_client_secret: String,
}

impl AppState {
    pub fn new(
        pool: PgPool,
        auth_secret: String,
        github_client_id: String,
        github_client_secret: String,
        google_client_id: String,
        google_client_secret: String,
    ) -> Self {
        Self {
            pool,
            auth_secret,
            github_client_id,
            github_client_secret,
            google_client_id,
            google_client_secret,
        }
    }
}