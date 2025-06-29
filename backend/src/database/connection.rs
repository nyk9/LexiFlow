use diesel_async::{
    pooled_connection::{deadpool::Pool, AsyncDieselConnectionManager},
    AsyncPgConnection,
};
use std::env;

pub type DbPool = Pool<AsyncPgConnection>;
pub type DbConnection = diesel_async::pooled_connection::deadpool::Object<AsyncPgConnection>;

pub async fn create_pool(database_url: &str) -> Result<DbPool, Box<dyn std::error::Error + Send + Sync>> {
    let config = AsyncDieselConnectionManager::<AsyncPgConnection>::new(database_url);
    let pool = Pool::builder(config).build()?;

    Ok(pool)
}

pub async fn create_pool_from_env() -> Result<DbPool, Box<dyn std::error::Error + Send + Sync>> {
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://postgres:password@localhost/lexiflow".to_string());
    
    create_pool(&database_url).await
}