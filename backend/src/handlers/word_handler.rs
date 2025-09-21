use serde::Deserialize;
use shuttle_axum::axum::{
    extract::{Extension, Json, Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use uuid::Uuid;

use crate::auth_middleware::AuthUser;
use crate::models::word::Word;
use crate::models::AppState;

// Request/Response DTOs
#[derive(Debug, Deserialize)]
pub struct CreateWordRequest {
    pub word: String,
    pub meaning: String,
    pub translation: Option<String>,
    pub part_of_speech: Vec<String>,
    pub phonetic: Option<String>,
    pub example: Option<String>,
    pub category: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateWordRequest {
    pub word: Option<String>,
    pub meaning: Option<String>,
    pub translation: Option<String>,
    pub part_of_speech: Option<Vec<String>>,
    pub phonetic: Option<String>,
    pub example: Option<String>,
    pub category: Option<String>,
}

// GET /api/words - ユーザーの単語一覧取得
pub async fn get_words_handler(
    State(app_state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let words = sqlx::query_as::<_, Word>(
        "SELECT id, word, meaning, translation, part_of_speech, phonetic, example, category, user_id, created_at, updated_at
         FROM words WHERE user_id = $1 ORDER BY created_at DESC"
    )
    .bind(auth_user.user_id)
    .fetch_all(&app_state.pool)
    .await
    .map_err(internal_error)?;

    Ok((StatusCode::OK, Json(words)))
}

// GET /api/words/:id - 特定の単語詳細取得
pub async fn get_word_handler(
    State(app_state): State<AppState>,
    Path(id): Path<String>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let word = sqlx::query_as::<_, Word>(
        "SELECT id, word, meaning, translation, part_of_speech, phonetic, example, category, user_id, created_at, updated_at
         FROM words WHERE id = $1 AND user_id = $2"
    )
    .bind(&id)
    .bind(auth_user.user_id)
    .fetch_optional(&app_state.pool)
    .await
    .map_err(internal_error)?;

    match word {
        Some(word) => Ok((StatusCode::OK, Json(word))),
        None => Err((StatusCode::NOT_FOUND, "Word not found".to_string())),
    }
}

// POST /api/words - 新規単語作成
pub async fn create_word_handler(
    State(app_state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateWordRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // cuidの代わりにuuidを使用（文字列として）
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now();

    let word = sqlx::query_as::<_, Word>(
        "INSERT INTO words (id, word, meaning, translation, part_of_speech, phonetic, example, category, user_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, word, meaning, translation, part_of_speech, phonetic, example, category, user_id, created_at, updated_at"
    )
    .bind(&id)
    .bind(&payload.word)
    .bind(&payload.meaning)
    .bind(&payload.translation)
    .bind(serde_json::to_value(&payload.part_of_speech).unwrap())
    .bind(&payload.phonetic)
    .bind(&payload.example)
    .bind(&payload.category)
    .bind(auth_user.user_id)
    .bind(now)
    .bind(now)
    .fetch_one(&app_state.pool)
    .await
    .map_err(internal_error)?;

    Ok((StatusCode::CREATED, Json(word)))
}

// PUT /api/words/:id - 単語更新
pub async fn update_word_handler(
    State(app_state): State<AppState>,
    Path(id): Path<String>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<UpdateWordRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let now = chrono::Utc::now();

    // 動的にSQLを構築（更新されたフィールドのみ）
    let mut set_clauses = Vec::new();
    let mut bind_count = 2; // $1はid用

    if payload.word.is_some() {
        set_clauses.push(format!("word = ${}", bind_count));
        bind_count += 1;
    }
    if payload.meaning.is_some() {
        set_clauses.push(format!("meaning = ${}", bind_count));
        bind_count += 1;
    }
    if payload.translation.is_some() {
        set_clauses.push(format!("translation = ${}", bind_count));
        bind_count += 1;
    }
    if payload.part_of_speech.is_some() {
        set_clauses.push(format!("part_of_speech = ${}", bind_count));
        bind_count += 1;
    }
    if payload.phonetic.is_some() {
        set_clauses.push(format!("phonetic = ${}", bind_count));
        bind_count += 1;
    }
    if payload.example.is_some() {
        set_clauses.push(format!("example = ${}", bind_count));
        bind_count += 1;
    }
    if payload.category.is_some() {
        set_clauses.push(format!("category = ${}", bind_count));
        bind_count += 1;
    }

    if set_clauses.is_empty() {
        return Err((StatusCode::BAD_REQUEST, "No fields to update".to_string()));
    }

    set_clauses.push(format!("updated_at = ${}", bind_count));

    let sql = format!(
        "UPDATE words SET {} WHERE id = $1 AND user_id = $2
         RETURNING id, word, meaning, translation, part_of_speech, phonetic, example, category, user_id, created_at, updated_at",
        set_clauses.join(", ")
    );

    let mut query = sqlx::query_as::<_, Word>(&sql)
        .bind(&id)
        .bind(auth_user.user_id);

    if let Some(word) = payload.word {
        query = query.bind(word);
    }
    if let Some(meaning) = payload.meaning {
        query = query.bind(meaning);
    }
    if let Some(translation) = payload.translation {
        query = query.bind(translation);
    }
    if let Some(part_of_speech) = payload.part_of_speech {
        query = query.bind(serde_json::to_value(part_of_speech).unwrap());
    }
    if let Some(phonetic) = payload.phonetic {
        query = query.bind(phonetic);
    }
    if let Some(example) = payload.example {
        query = query.bind(example);
    }
    if let Some(category) = payload.category {
        query = query.bind(category);
    }

    query = query.bind(now);

    let word = query
        .fetch_optional(&app_state.pool)
        .await
        .map_err(internal_error)?;

    match word {
        Some(word) => Ok((StatusCode::OK, Json(word))),
        None => Err((StatusCode::NOT_FOUND, "Word not found".to_string())),
    }
}

// DELETE /api/words/:id - 単語削除
pub async fn delete_word_handler(
    State(app_state): State<AppState>,
    Path(id): Path<String>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let result = sqlx::query("DELETE FROM words WHERE id = $1 AND user_id = $2")
        .bind(&id)
        .bind(auth_user.user_id)
        .execute(&app_state.pool)
        .await
        .map_err(internal_error)?;

    if result.rows_affected() == 0 {
        Err((StatusCode::NOT_FOUND, "Word not found".to_string()))
    } else {
        Ok((StatusCode::NO_CONTENT, ""))
    }
}

// 内部エラーを統一的に扱うためのヘルパー関数
fn internal_error<E>(err: E) -> (StatusCode, String)
where
    E: std::error::Error,
{
    (StatusCode::INTERNAL_SERVER_ERROR, err.to_string())
}
