use crate::auth_middleware::AuthUser;
use crate::models::conversation::*;
use crate::models::AppState;
use axum::{
    extract::{Extension, Path, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;
use serde_json::json;
use uuid::Uuid;

// POST /api/conversation/session - Create new conversation session
pub async fn create_session_handler(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<CreateSessionResponse>, (StatusCode, String)> {
    let user_id = auth_user.user_id;
    let session_id = Uuid::new_v4();
    let now = Utc::now();

    let result = sqlx::query!(
        r#"
        INSERT INTO conversation_sessions (id, user_id, started_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        "#,
        session_id,
        user_id,
        now,
        now,
        now
    )
    .execute(&state.pool)
    .await;

    match result {
        Ok(_) => Ok(Json(CreateSessionResponse {
            session_id,
            started_at: now,
        })),
        Err(e) => {
            eprintln!("Database error creating session: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to create conversation session".to_string(),
            ))
        }
    }
}

// GET /api/conversation/sessions - Get user's conversation sessions
pub async fn get_sessions_handler(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<SessionWithDetails>>, (StatusCode, String)> {
    let user_id = auth_user.user_id;

    // Get all sessions for user
    let sessions = sqlx::query_as!(
        ConversationSession,
        r#"
        SELECT id, user_id, started_at, ended_at, duration_minutes, created_at, updated_at
        FROM conversation_sessions
        WHERE user_id = $1
        ORDER BY started_at DESC
        LIMIT 20
        "#,
        user_id
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error fetching sessions: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to fetch sessions".to_string(),
        )
    })?;

    // For each session, fetch related data
    let mut sessions_with_details = Vec::new();

    for session in sessions {
        let topics = sqlx::query_as!(
            ConversationTopic,
            r#"
            SELECT id, session_id, topic, order_sequence, complexity_level, created_at
            FROM conversation_topics
            WHERE session_id = $1
            ORDER BY order_sequence
            "#,
            session.id
        )
        .fetch_all(&state.pool)
        .await
        .unwrap_or_default();

        let linguistic_analysis = sqlx::query_as!(
            LinguisticAnalysis,
            r#"
            SELECT id, session_id, avg_sentence_length, vocabulary_level, grammar_complexity, created_at
            FROM linguistic_analysis
            WHERE session_id = $1
            "#,
            session.id
        )
        .fetch_optional(&state.pool)
        .await
        .unwrap_or(None);

        let skills_assessment = sqlx::query_as!(
            SkillsAssessment,
            r#"
            SELECT id, session_id, grammar_accuracy_score, vocabulary_appropriateness_score,
                   sentence_complexity_score, flow_smoothness_score, response_timing_avg,
                   natural_phrase_usage_score, created_at
            FROM skills_assessments
            WHERE session_id = $1
            "#,
            session.id
        )
        .fetch_optional(&state.pool)
        .await
        .unwrap_or(None);

        let vocabulary_suggestions = sqlx::query_as!(
            VocabularySuggestion,
            r#"
            SELECT id, session_id, suggested_word, user_word_used, conversation_context,
                   suggestion_reason, status, created_at
            FROM vocabulary_suggestions
            WHERE session_id = $1 AND status = 'pending'
            "#,
            session.id
        )
        .fetch_all(&state.pool)
        .await
        .unwrap_or_default();

        sessions_with_details.push(SessionWithDetails {
            session,
            topics,
            linguistic_analysis,
            skills_assessment,
            vocabulary_suggestions,
        });
    }

    Ok(Json(sessions_with_details))
}

// PUT /api/conversation/session/:id/end - End a conversation session
pub async fn end_session_handler(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(session_id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let user_id = auth_user.user_id;

    // Verify session belongs to user
    let session = sqlx::query_as!(
        ConversationSession,
        r#"
        SELECT id, user_id, started_at, ended_at, duration_minutes, created_at, updated_at
        FROM conversation_sessions
        WHERE id = $1 AND user_id = $2
        "#,
        session_id,
        user_id
    )
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Database error".to_string(),
        )
    })?;

    let session = session.ok_or((StatusCode::NOT_FOUND, "Session not found".to_string()))?;

    let now = Utc::now();
    let duration = (now - session.started_at).num_minutes() as i32;

    sqlx::query!(
        r#"
        UPDATE conversation_sessions
        SET ended_at = $1, duration_minutes = $2, updated_at = $3
        WHERE id = $4
        "#,
        now,
        duration,
        now,
        session_id
    )
    .execute(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to end session".to_string(),
        )
    })?;

    Ok(Json(json!({
        "session_id": session_id,
        "ended_at": now,
        "duration_minutes": duration
    })))
}

// POST /api/conversation/chat - Send message and get AI response
pub async fn chat_handler(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(req): Json<ChatRequest>,
) -> Result<Json<ChatResponse>, (StatusCode, String)> {
    let user_id = auth_user.user_id;

    // Verify session belongs to user
    let _session = sqlx::query!(
        r#"
        SELECT id FROM conversation_sessions
        WHERE id = $1 AND user_id = $2
        "#,
        req.session_id,
        user_id
    )
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Database error".to_string(),
        )
    })?
    .ok_or((StatusCode::NOT_FOUND, "Session not found".to_string()))?;

    // Build conversation history
    let conversation_history = req
        .messages
        .iter()
        .map(|msg| {
            let role = if msg.role == "user" { "User" } else { "AI" };
            format!("{}: {}", role, msg.content)
        })
        .collect::<Vec<_>>()
        .join("\n");

    let system_prompt = format!(
        r#"You are an English conversation partner helping a Japanese learner practice English at a B2 proficiency level.

Guidelines:
- Engage in natural, free-form conversation
- Use B2-level vocabulary and grammar
- Be encouraging and supportive
- Keep responses conversational (2-4 sentences usually)
- If the user asks about vocabulary or grammar, switch to tutor mode and provide detailed explanations
- Adapt your topics to the user's interests
- Ask follow-up questions to keep the conversation flowing

Conversation History:
{}

User's latest message: {}

Respond naturally in English:"#,
        conversation_history, req.user_message
    );

    // Call Gemini API
    let client = reqwest::Client::new();
    let response = client
        .post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent")
        .header("Content-Type", "application/json")
        .query(&[("key", &state.gemini_api_key)])
        .json(&json!({
            "contents": [{
                "parts": [{
                    "text": system_prompt
                }]
            }]
        }))
        .send()
        .await
        .map_err(|e| {
            eprintln!("Gemini API error: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to call AI API".to_string(),
            )
        })?;

    let response_data: serde_json::Value = response.json().await.map_err(|e| {
        eprintln!("Failed to parse Gemini response: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to parse AI response".to_string(),
        )
    })?;

    let ai_response = response_data["candidates"][0]["content"]["parts"][0]["text"]
        .as_str()
        .unwrap_or("Sorry, I couldn't generate a response.")
        .to_string();

    Ok(Json(ChatResponse {
        response: ai_response,
        session_id: req.session_id,
    }))
}
