use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Word {
    pub id: String,                                     // 単語識別ID
    pub word: String,                                   // 英単語
    pub meaning: String,                                // 意味・定義
    pub translation: Option<String>,                    // 日本語翻訳
    pub part_of_speech: sqlx::types::Json<Vec<String>>, // 品詞 (JSON配列)
    pub phonetic: Option<String>,                       // 発音記号
    pub example: Option<String>,                        // 例文
    pub category: Option<String>,                       // カテゴリ
    pub user_id: Uuid,                                  // ユーザーID (外部キー)
    pub created_at: DateTime<Utc>,                      // 作成日時
    pub updated_at: DateTime<Utc>,                      // 更新日時
}
