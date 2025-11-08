use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

// Conversation Session Model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ConversationSession {
    pub id: Uuid,
    pub user_id: Uuid,
    pub started_at: DateTime<Utc>,
    pub ended_at: Option<DateTime<Utc>>,
    pub duration_minutes: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// Conversation Topic Model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ConversationTopic {
    pub id: Uuid,
    pub session_id: Uuid,
    pub topic: String,
    pub order_sequence: i32,
    pub complexity_level: Option<String>,
    pub created_at: DateTime<Utc>,
}

// Linguistic Analysis Model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct LinguisticAnalysis {
    pub id: Uuid,
    pub session_id: Uuid,
    pub avg_sentence_length: Option<f64>,
    pub vocabulary_level: Option<String>,
    pub grammar_complexity: Option<String>,
    pub created_at: DateTime<Utc>,
}

// Skills Assessment Model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct SkillsAssessment {
    pub id: Uuid,
    pub session_id: Uuid,
    pub grammar_accuracy_score: Option<i32>,
    pub vocabulary_appropriateness_score: Option<i32>,
    pub sentence_complexity_score: Option<i32>,
    pub flow_smoothness_score: Option<i32>,
    pub response_timing_avg: Option<f64>,
    pub natural_phrase_usage_score: Option<i32>,
    pub created_at: DateTime<Utc>,
}

// Vocabulary Suggestion Model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct VocabularySuggestion {
    pub id: Uuid,
    pub session_id: Uuid,
    pub suggested_word: String,
    pub user_word_used: Option<String>,
    pub conversation_context: Option<String>,
    pub suggestion_reason: Option<String>,
    pub status: String, // pending, accepted, dismissed
    pub created_at: DateTime<Utc>,
}

// Request/Response DTOs for API

#[derive(Debug, Deserialize)]
pub struct CreateSessionRequest {
    // Empty - user_id comes from auth
}

#[derive(Debug, Serialize)]
pub struct CreateSessionResponse {
    pub session_id: Uuid,
    pub started_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct ChatRequest {
    pub session_id: Uuid,
    pub messages: Vec<ChatMessage>,
    pub user_message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String, // "user" or "assistant"
    pub content: String,
}

#[derive(Debug, Serialize)]
pub struct ChatResponse {
    pub response: String,
    pub session_id: Uuid,
}

#[derive(Debug, Deserialize)]
pub struct AnalyzeConversationRequest {
    pub session_id: Uuid,
    pub messages: Vec<ChatMessage>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VocabularySuggestionDetail {
    pub word: String,
    pub part_of_speech: String,
    pub phonetic: String,
    pub meaning: String,
    pub translation: String,
    pub example: String,
    pub category: String,
    pub conversation_context: String,
    pub reason: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SkillsAssessmentScores {
    pub grammar_accuracy: i32,
    pub vocabulary_appropriateness: i32,
    pub sentence_complexity: i32,
    pub flow_smoothness: i32,
    pub natural_phrase_usage: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LinguisticAnalysisData {
    pub avg_sentence_length: f64,
    pub vocabulary_level: String,
    pub grammar_complexity: String,
}

#[derive(Debug, Serialize)]
pub struct AnalyzeConversationResponse {
    pub suggestions: Vec<VocabularySuggestionDetail>,
    pub topics: Vec<String>,
    pub skills_assessment: SkillsAssessmentScores,
    pub linguistic_analysis: LinguisticAnalysisData,
    pub overall_feedback: String,
}

#[derive(Debug, Serialize)]
pub struct SessionWithDetails {
    pub session: ConversationSession,
    pub topics: Vec<ConversationTopic>,
    pub linguistic_analysis: Option<LinguisticAnalysis>,
    pub skills_assessment: Option<SkillsAssessment>,
    pub vocabulary_suggestions: Vec<VocabularySuggestion>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateSuggestionStatusRequest {
    pub suggestion_id: Uuid,
    pub status: String, // "accepted" or "dismissed"
}
