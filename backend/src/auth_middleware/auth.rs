use crate::models::AppState;
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use shuttle_axum::axum::{
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::Response,
};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Option<String>, // subject (user ID)
    pub id: Option<String>,  // Auth.js user ID
    pub iat: usize,          // issued at
    pub exp: usize,          // expiration
}

#[derive(Clone)]
pub struct AuthUser {
    pub user_id: Uuid,
}

// Auth.js JWT検証ミドルウェア
pub async fn auth_middleware(
    State(app_state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // Authorization ヘッダーからトークンを抽出
    let auth_header = request
        .headers()
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .and_then(|value| {
            if value.starts_with("Bearer ") {
                Some(&value[7..])
            } else {
                None
            }
        })
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // AppStateからJWT_SECRETを取得
    let jwt_secret = &app_state.auth_secret;

    // JWTトークンを検証
    let token_data = decode::<Claims>(
        auth_header,
        &DecodingKey::from_secret(jwt_secret.as_ref()),
        &Validation::new(Algorithm::HS256),
    )
    .map_err(|_| StatusCode::UNAUTHORIZED)?;

    // user_id を抽出（Auth.jsでは`id`フィールドを使用）
    let user_id_str = token_data
        .claims
        .id
        .or(token_data.claims.sub)
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let user_id = Uuid::parse_str(&user_id_str).map_err(|_| StatusCode::UNAUTHORIZED)?;

    // ユーザー情報をリクエストエクステンションに追加
    request.extensions_mut().insert(AuthUser { user_id });

    Ok(next.run(request).await)
}
