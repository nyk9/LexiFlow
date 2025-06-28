use chrono::{DateTime, Utc};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

use crate::database::schema::{words, categories};

#[derive(Queryable, Identifiable, Serialize, Debug, Clone)]
#[diesel(table_name = words)]
pub struct Word {
    pub id: Uuid,
    pub word: String,
    pub meaning: String,
    pub translation: String,
    pub category: String,
    pub part_of_speech: String,
    pub example: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Insertable, Deserialize, Validate, Debug)]
#[diesel(table_name = words)]
pub struct CreateWord {
    #[validate(length(min = 1, max = 255, message = "Word must be between 1 and 255 characters"))]
    pub word: String,
    
    #[validate(length(min = 1, max = 1000, message = "Meaning must be between 1 and 1000 characters"))]
    pub meaning: String,
    
    #[validate(length(min = 1, max = 1000, message = "Translation must be between 1 and 1000 characters"))]
    pub translation: String,
    
    #[validate(length(min = 1, max = 100, message = "Category must be between 1 and 100 characters"))]
    pub category: String,
    
    #[validate(length(min = 1, max = 50, message = "Part of speech must be between 1 and 50 characters"))]
    pub part_of_speech: String,
    
    #[validate(length(max = 2000, message = "Example must not exceed 2000 characters"))]
    pub example: Option<String>,
}

#[derive(AsChangeset, Deserialize, Validate, Debug)]
#[diesel(table_name = words)]
pub struct UpdateWord {
    #[validate(length(min = 1, max = 255, message = "Word must be between 1 and 255 characters"))]
    pub word: Option<String>,
    
    #[validate(length(min = 1, max = 1000, message = "Meaning must be between 1 and 1000 characters"))]
    pub meaning: Option<String>,
    
    #[validate(length(min = 1, max = 1000, message = "Translation must be between 1 and 1000 characters"))]
    pub translation: Option<String>,
    
    #[validate(length(min = 1, max = 100, message = "Category must be between 1 and 100 characters"))]
    pub category: Option<String>,
    
    #[validate(length(min = 1, max = 50, message = "Part of speech must be between 1 and 50 characters"))]
    pub part_of_speech: Option<String>,
    
    #[validate(length(max = 2000, message = "Example must not exceed 2000 characters"))]
    pub example: Option<String>,
}

#[derive(Queryable, Identifiable, Serialize, Debug)]
#[diesel(table_name = categories)]
pub struct Category {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize, Debug)]
pub struct WordsResponse {
    pub words: Vec<Word>,
    pub total: i64,
    pub page: i32,
    pub per_page: i32,
}