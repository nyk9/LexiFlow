use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
};
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde::Deserialize;
use std::collections::HashMap;
use uuid::Uuid;
use validator::Validate;

use crate::{
    database::schema::{words, categories},
    errors::AppError,
    models::{Word, CreateWord, UpdateWord, Category, WordsResponse},
    AppState,
};

#[derive(Deserialize)]
pub struct WordQuery {
    page: Option<i32>,
    per_page: Option<i32>,
    search: Option<String>,
    category: Option<String>,
}

pub async fn get_words(
    State(pool): State<AppState>,
    Query(params): Query<WordQuery>,
) -> Result<Json<WordsResponse>, AppError> {
    let mut conn = pool.get().await?;
    
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * per_page;

    let mut query = words::table.into_boxed();

    if let Some(search) = params.search {
        let search_pattern = format!("%{}%", search);
        query = query.filter(
            words::word.ilike(&search_pattern)
                .or(words::meaning.ilike(&search_pattern))
                .or(words::translation.ilike(&search_pattern))
        );
    }

    if let Some(category) = params.category {
        query = query.filter(words::category.eq(category));
    }

    let total_query = query.clone();
    let words_query = query
        .order(words::created_at.desc())
        .limit(per_page as i64)
        .offset(offset as i64);

    let (words_result, total_result) = tokio::try_join!(
        words_query.load::<Word>(&mut conn),
        total_query.count().get_result::<i64>(&mut conn)
    )?;

    Ok(Json(WordsResponse {
        words: words_result,
        total: total_result,
        page,
        per_page,
    }))
}

pub async fn get_word(
    State(pool): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Word>, AppError> {
    let mut conn = pool.get().await?;

    let word = words::table
        .filter(words::id.eq(id))
        .first::<Word>(&mut conn)
        .await?;

    Ok(Json(word))
}

pub async fn create_word(
    State(pool): State<AppState>,
    Json(payload): Json<CreateWord>,
) -> Result<(StatusCode, Json<Word>), AppError> {
    payload.validate()?;
    
    let mut conn = pool.get().await?;

    let word = diesel::insert_into(words::table)
        .values(&payload)
        .get_result::<Word>(&mut conn)
        .await?;

    Ok((StatusCode::CREATED, Json(word)))
}

pub async fn update_word(
    State(pool): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateWord>,
) -> Result<Json<Word>, AppError> {
    payload.validate()?;
    
    let mut conn = pool.get().await?;

    let word = diesel::update(words::table.filter(words::id.eq(id)))
        .set(&payload)
        .get_result::<Word>(&mut conn)
        .await?;

    Ok(Json(word))
}

pub async fn delete_word(
    State(pool): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let mut conn = pool.get().await?;

    let deleted_rows = diesel::delete(words::table.filter(words::id.eq(id)))
        .execute(&mut conn)
        .await?;

    if deleted_rows == 0 {
        return Err(AppError::NotFound("Word not found".to_string()));
    }

    Ok(StatusCode::NO_CONTENT)
}

pub async fn get_categories(
    State(pool): State<AppState>,
) -> Result<Json<Vec<Category>>, AppError> {
    let mut conn = pool.get().await?;

    let categories_result = categories::table
        .order(categories::name.asc())
        .load::<Category>(&mut conn)
        .await?;

    Ok(Json(categories_result))
}