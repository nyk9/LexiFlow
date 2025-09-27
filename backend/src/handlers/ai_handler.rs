use serde::{Deserialize, Serialize};
use shuttle_axum::axum::{
    extract::{Extension, Json, State},
    http::StatusCode,
    response::IntoResponse,
};

use crate::auth_middleware::AuthUser;
use crate::models::AppState;

// Request DTOs for AI endpoints
#[derive(Debug, Deserialize)]
pub struct ConversationAnalysisRequest {
    pub conversation_text: String,
    pub user_level: Option<String>, // B2, etc.
}

#[derive(Debug, Deserialize)]
pub struct VocabularyHelpRequest {
    pub context: String,
    pub question: String,
}

#[derive(Debug, Deserialize)]
pub struct WordSuggestionRequest {
    pub user_input: String,
    pub conversation_context: Option<String>,
}

// Response DTOs
#[derive(Debug, Serialize, Deserialize)]
pub struct WordSuggestion {
    pub word: String,
    pub meaning: String,
    pub part_of_speech: String,
    pub example: String,
    pub difficulty_level: String,
    pub relevance_reason: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VocabularyHelpResponse {
    pub explanation: String,
    pub examples: Vec<String>,
    pub usage_tips: String,
    pub suggested_word: Option<WordSuggestion>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConversationAnalysisResponse {
    pub suggestions: Vec<WordSuggestion>,
    pub conversation_summary: String,
    pub learning_points: Vec<String>,
}

// Internal Gemini API structs
#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<GeminiContent>,
}

#[derive(Serialize)]
struct GeminiContent {
    parts: Vec<GeminiPart>,
}

#[derive(Serialize)]
struct GeminiPart {
    text: String,
}

#[derive(Deserialize)]
struct GeminiResponse {
    candidates: Vec<GeminiCandidate>,
}

#[derive(Deserialize)]
struct GeminiCandidate {
    content: GeminiResponseContent,
}

#[derive(Deserialize)]
struct GeminiResponseContent {
    parts: Vec<GeminiResponsePart>,
}

#[derive(Deserialize)]
struct GeminiResponsePart {
    text: String,
}

// Helper function to call Gemini API
async fn call_gemini_api(api_key: &str, prompt: &str) -> Result<String, (StatusCode, String)> {
    let client = reqwest::Client::new();
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={}",
        api_key
    );

    let request = GeminiRequest {
        contents: vec![GeminiContent {
            parts: vec![GeminiPart {
                text: prompt.to_string(),
            }],
        }],
    };

    let response = client.post(&url).json(&request).send().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Request failed: {}", e),
        )
    })?;

    if !response.status().is_success() {
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Gemini API error: {}", response.status()),
        ));
    }

    let gemini_response: GeminiResponse = response.json().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("JSON parse error: {}", e),
        )
    })?;

    let raw_text = gemini_response
        .candidates
        .first()
        .and_then(|c| c.content.parts.first())
        .map(|p| p.text.clone())
        .ok_or((
            StatusCode::INTERNAL_SERVER_ERROR,
            "No response from Gemini".to_string(),
        ))?;

    // Strip markdown code blocks if present
    let cleaned_text = if raw_text.starts_with("```json") && raw_text.ends_with("```") {
        // Remove ```json at the start and ``` at the end
        raw_text
            .strip_prefix("```json")
            .and_then(|s| s.strip_suffix("```"))
            .unwrap_or(&raw_text)
            .trim()
            .to_string()
    } else if raw_text.starts_with("```") && raw_text.ends_with("```") {
        // Remove ``` at the start and end (without json specifier)
        raw_text
            .strip_prefix("```")
            .and_then(|s| s.strip_suffix("```"))
            .unwrap_or(&raw_text)
            .trim()
            .to_string()
    } else {
        raw_text
    };

    Ok(cleaned_text)
}

// POST /api/ai/conversation-analysis - 対話後の語彙提案
pub async fn analyze_conversation_handler(
    State(app_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(req): Json<ConversationAnalysisRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let prompt = format!(
        r#"
You are an AI tutor for English learners at B2 level. Analyze this conversation and suggest 3-5 vocabulary words that would help the user improve their English.

Conversation:
{}

Please provide a JSON response with the following structure:
{{
  "suggestions": [
    {{
      "word": "vocabulary_word",
      "meaning": "clear definition",
      "part_of_speech": "noun/verb/adjective/etc",
      "example": "example sentence using the word",
      "difficulty_level": "B2/C1",
      "relevance_reason": "why this word is relevant to the conversation"
    }}
  ],
  "conversation_summary": "brief summary of the conversation topic",
  "learning_points": ["key learning point 1", "key learning point 2"]
}}

Focus on words that:
1. Are appropriate for B2-C1 level
2. Would have been useful in this conversation
3. Fill vocabulary gaps shown by the user
4. Are practical and commonly used
"#,
        req.conversation_text
    );

    let gemini_response = call_gemini_api(&app_state.gemini_api_key, &prompt).await?;

    // Parse JSON response from Gemini
    let analysis: ConversationAnalysisResponse =
        serde_json::from_str(&gemini_response).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to parse AI response: {}", e),
            )
        })?;

    Ok((StatusCode::OK, Json(analysis)))
}

// POST /api/ai/vocabulary-help - 対話中の語彙ヘルプ
pub async fn vocabulary_help_handler(
    State(app_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(req): Json<VocabularyHelpRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let prompt = format!(
        r#"
You are an English vocabulary tutor. The user is having a conversation and has asked for help with vocabulary.

Context: {}
User's question: {}

Please provide a helpful response in JSON format:
{{
  "explanation": "clear explanation answering the user's question",
  "examples": ["example 1", "example 2", "example 3"],
  "usage_tips": "practical tips for using this vocabulary",
  "suggested_word": {{
    "word": "suggested_word",
    "meaning": "clear definition",
    "part_of_speech": "noun/verb/adjective/etc",
    "example": "example sentence",
    "difficulty_level": "B2/C1",
    "relevance_reason": "why this word is helpful"
  }}
}}

If the user asked about a specific word, explain it thoroughly. If they're looking for better ways to express something, suggest appropriate alternatives.
"#,
        req.context, req.question
    );

    let gemini_response = call_gemini_api(&app_state.gemini_api_key, &prompt).await?;

    let help_response: VocabularyHelpResponse =
        serde_json::from_str(&gemini_response).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to parse AI response: {}", e),
            )
        })?;

    Ok((StatusCode::OK, Json(help_response)))
}

// POST /api/ai/word-suggestions - 単語提案
pub async fn word_suggestions_handler(
    State(app_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(req): Json<WordSuggestionRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let prompt = format!(
        r#"
Based on the user's input and conversation context, suggest vocabulary words that would help them express themselves better.

User input: {}
Context: {}

Provide 3-5 word suggestions in JSON format:
{{
  "suggestions": [
    {{
      "word": "vocabulary_word",
      "meaning": "clear definition",
      "part_of_speech": "noun/verb/adjective/etc",
      "example": "example sentence using the word",
      "difficulty_level": "B2/C1",
      "relevance_reason": "why this word would help the user"
    }}
  ]
}}

Focus on words that would help the user express their ideas more precisely or naturally.
"#,
        req.user_input,
        req.conversation_context
            .unwrap_or_else(|| "No additional context".to_string())
    );

    let gemini_response = call_gemini_api(&app_state.gemini_api_key, &prompt).await?;

    // Extract just the suggestions array from the response
    let full_response: serde_json::Value = serde_json::from_str(&gemini_response).map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to parse AI response: {}", e),
        )
    })?;

    let suggestions = full_response.get("suggestions")
        .ok_or((
            StatusCode::INTERNAL_SERVER_ERROR,
            "No suggestions in AI response".to_string(),
        ))?
        .clone();

    Ok((StatusCode::OK, Json(suggestions)))
}

// Error helper
fn internal_error<E: std::fmt::Display>(err: E) -> (StatusCode, String) {
    (StatusCode::INTERNAL_SERVER_ERROR, err.to_string())
}
