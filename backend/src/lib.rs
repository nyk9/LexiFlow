use std::sync::Arc;

pub mod config;
pub mod database;
pub mod errors;
pub mod handlers;
pub mod middleware;
pub mod models;
pub mod services;
pub mod utils;

pub type AppState = Arc<database::connection::DbPool>;