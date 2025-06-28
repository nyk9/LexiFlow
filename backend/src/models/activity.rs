use chrono::{DateTime, NaiveDate, Utc};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

use crate::database::schema::learning_activities;

#[derive(Queryable, Identifiable, Serialize, Debug, Clone)]
#[diesel(table_name = learning_activities)]
pub struct LearningActivity {
    pub id: Uuid,
    pub activity_type: String,
    pub date: NaiveDate,
    pub count: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Insertable, Deserialize, Validate, Debug)]
#[diesel(table_name = learning_activities)]
pub struct CreateActivity {
    #[validate(length(min = 1, max = 50, message = "Activity type must be between 1 and 50 characters"))]
    pub activity_type: String,
    
    #[validate(range(min = 1, message = "Count must be at least 1"))]
    pub count: i32,
}

#[derive(Serialize, Debug)]
pub struct Statistics {
    pub total_words: i64,
    pub words_by_category: std::collections::HashMap<String, i64>,
    pub daily_activities: Vec<LearningActivity>,
    pub learning_streak: i32,
}