use chrono::{Duration, Utc};
use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use shuttle_axum::axum::{
    extract::{Extension, State},
    http::StatusCode,
    response::Json,
};
use uuid::Uuid;

use crate::auth_middleware::auth::Claims;
use crate::models::user::{CreateUserRequest, User, UserResponse};
use crate::models::AppState;

#[derive(Debug, Deserialize)]
pub struct OAuthCallbackRequest {
    pub code: String,
    pub redirect_uri: String,
}

#[derive(Debug, Serialize)]
pub struct OAuthResponse {
    pub user: UserResponse,
    pub access_token: String,
    pub expires_in: i64,
}

#[derive(Debug, Deserialize)]
struct GitHubTokenResponse {
    access_token: String,
    token_type: String,
}

#[derive(Debug, Deserialize)]
struct GitHubUser {
    id: u64,
    login: String,
    email: Option<String>,
    name: Option<String>,
    avatar_url: Option<String>,
}

#[derive(Debug, Deserialize)]
struct GitHubEmail {
    email: String,
    primary: bool,
    verified: bool,
}

#[derive(Debug, Deserialize)]
struct GoogleTokenResponse {
    access_token: String,
    expires_in: i64,
    token_type: String,
    id_token: Option<String>,
}

#[derive(Debug, Deserialize)]
struct GoogleUser {
    id: String,
    email: String,
    name: Option<String>,
    picture: Option<String>,
    verified_email: bool,
}

fn generate_jwt(user_id: Uuid, jwt_secret: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::days(30))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: Some(user_id.to_string()),
        id: Some(user_id.to_string()),
        iat: Utc::now().timestamp() as usize,
        exp: expiration,
    };

    encode(
        &Header::new(Algorithm::HS256),
        &claims,
        &EncodingKey::from_secret(jwt_secret.as_ref()),
    )
}

async fn exchange_github_code(
    code: &str,
    redirect_uri: &str,
    client_id: &str,
    client_secret: &str,
) -> Result<GitHubUser, Box<dyn std::error::Error>> {
    // Clean the code by removing any trailing slash
    let clean_code = code.trim_end_matches('/');
    println!("Exchanging GitHub OAuth code...");

    let client = reqwest::Client::new();

    // Exchange code for access token
    let token_response = client
        .post("https://github.com/login/oauth/access_token")
        .header("Accept", "application/json")
        .form(&[
            ("client_id", client_id),
            ("client_secret", client_secret),
            ("code", clean_code),
            ("redirect_uri", redirect_uri),
        ])
        .send()
        .await?
        .json::<GitHubTokenResponse>()
        .await?;

    // Get user info with email
    let user = client
        .get("https://api.github.com/user")
        .header(
            "Authorization",
            format!("Bearer {}", token_response.access_token),
        )
        .header("User-Agent", "LexiFlow")
        .send()
        .await?
        .json::<GitHubUser>()
        .await?;

    // If user doesn't have public email, try to get primary email
    let user_with_email = if user.email.is_none() {
        let emails: Vec<GitHubEmail> = client
            .get("https://api.github.com/user/emails")
            .header(
                "Authorization",
                format!("Bearer {}", token_response.access_token),
            )
            .header("User-Agent", "LexiFlow")
            .send()
            .await?
            .json()
            .await?;

        let primary_email = emails
            .into_iter()
            .find(|email| email.primary)
            .map(|email| email.email);

        GitHubUser {
            id: user.id,
            login: user.login,
            email: primary_email,
            name: user.name,
            avatar_url: user.avatar_url,
        }
    } else {
        user
    };

    Ok(user_with_email)
}

async fn exchange_google_code(
    code: &str,
    redirect_uri: &str,
    client_id: &str,
    client_secret: &str,
) -> Result<GoogleUser, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();

    // Exchange code for access token
    let token_response = client
        .post("https://oauth2.googleapis.com/token")
        .form(&[
            ("client_id", client_id),
            ("client_secret", client_secret),
            ("code", code),
            ("grant_type", "authorization_code"),
            ("redirect_uri", redirect_uri),
        ])
        .send()
        .await?
        .json::<GoogleTokenResponse>()
        .await?;

    // Get user info
    let user = client
        .get("https://www.googleapis.com/oauth2/v2/userinfo")
        .header(
            "Authorization",
            format!("Bearer {}", token_response.access_token),
        )
        .send()
        .await?
        .json::<GoogleUser>()
        .await?;

    Ok(user)
}

pub async fn github_oauth_callback(
    State(app_state): State<AppState>,
    Json(payload): Json<OAuthCallbackRequest>,
) -> Result<Json<OAuthResponse>, StatusCode> {
    println!("GitHub OAuth callback received: {:?}", payload);

    let github_user = match exchange_github_code(
        &payload.code,
        &payload.redirect_uri,
        &app_state.github_client_id,
        &app_state.github_client_secret,
    )
    .await
    {
        Ok(user) => {
            println!("Successfully retrieved GitHub user: {:?}", user);
            user
        }
        Err(e) => {
            println!("Error exchanging GitHub code: {:?}", e);
            return Err(StatusCode::BAD_REQUEST);
        }
    };

    let email = match github_user.email {
        Some(email) => {
            println!("GitHub user email: {}", email);
            email
        }
        None => {
            println!("GitHub user has no email");
            return Err(StatusCode::BAD_REQUEST);
        }
    };

    let provider_id = github_user.id.to_string();
    println!("GitHub provider_id: {}", provider_id);

    // Check if user exists
    let user = match User::find_by_provider(&app_state.pool, "github", &provider_id).await {
        Ok(Some(user)) => {
            println!("Found existing user: {:?}", user.id);
            // Update last login
            User::update_last_login(&app_state.pool, user.id)
                .await
                .map_err(|e| {
                    println!("Error updating last login: {:?}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            user
        }
        Ok(None) => {
            println!("Creating new user");
            // Create new user
            let create_req = CreateUserRequest {
                email: email.clone(),
                name: github_user.name.clone(),
                image: github_user.avatar_url.clone(),
                provider: "github".to_string(),
                provider_id: provider_id.clone(),
            };
            println!("Create user request: {:?}", create_req);

            User::create(&app_state.pool, create_req)
                .await
                .map_err(|e| {
                    println!("Error creating user: {:?}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?
        }
        Err(e) => {
            println!("Database error: {:?}", e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    let token = generate_jwt(user.id, &app_state.auth_secret).map_err(|e| {
        println!("Error generating JWT: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    println!(
        "Successfully created OAuth response for user: {:?}",
        user.id
    );

    Ok(Json(OAuthResponse {
        user: user.into(),
        access_token: token,
        expires_in: 30 * 24 * 60 * 60, // 30 days in seconds
    }))
}

pub async fn google_oauth_callback(
    State(app_state): State<AppState>,
    Json(payload): Json<OAuthCallbackRequest>,
) -> Result<Json<OAuthResponse>, StatusCode> {
    let google_user = exchange_google_code(
        &payload.code,
        &payload.redirect_uri,
        &app_state.google_client_id,
        &app_state.google_client_secret,
    )
    .await
    .map_err(|_| StatusCode::BAD_REQUEST)?;

    let provider_id = google_user.id;
    let email = google_user.email;

    // Check if user exists
    let user = match User::find_by_provider(&app_state.pool, "google", &provider_id).await {
        Ok(Some(user)) => {
            // Update last login
            User::update_last_login(&app_state.pool, user.id)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            user
        }
        Ok(None) => {
            // Create new user
            let create_req = CreateUserRequest {
                email,
                name: google_user.name,
                image: google_user.picture,
                provider: "google".to_string(),
                provider_id,
            };

            User::create(&app_state.pool, create_req)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        }
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    };

    let token = generate_jwt(user.id, &app_state.auth_secret)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(OAuthResponse {
        user: user.into(),
        access_token: token,
        expires_in: 30 * 24 * 60 * 60, // 30 days in seconds
    }))
}

#[axum::debug_handler]
pub async fn get_current_user(
    Extension(user): Extension<crate::auth_middleware::auth::AuthUser>,
    State(app_state): State<AppState>,
) -> Result<Json<UserResponse>, StatusCode> {
    let user = User::find_by_id(&app_state.pool, user.user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(user.into()))
}
