use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
};
use chrono::{Duration, Utc};
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use std::collections::HashMap;
use validator::Validate;

use crate::{
    database::schema::{words, learning_activities},
    errors::AppError,
    models::{LearningActivity, CreateActivity, Statistics},
    AppState,
};

pub async fn get_statistics(
    State(pool): State<AppState>,
) -> Result<Json<Statistics>, AppError> {
    let mut conn = pool.get().await?;

    // Get total words count
    let total_words = words::table
        .count()
        .get_result::<i64>(&mut conn)
        .await?;

    // Get words by category
    let words_by_category_result: Vec<(String, i64)> = words::table
        .group_by(words::category)
        .select((words::category, diesel::dsl::count(words::id)))
        .load::<(String, i64)>(&mut conn)
        .await?;

    let words_by_category: HashMap<String, i64> = words_by_category_result
        .into_iter()
        .collect();

    // Get recent activities (last 30 days)
    let thirty_days_ago = (Utc::now() - Duration::days(30)).naive_utc().date();
    let daily_activities = learning_activities::table
        .filter(learning_activities::date.ge(thirty_days_ago))
        .order(learning_activities::date.desc())
        .load::<LearningActivity>(&mut conn)
        .await?;

    // Calculate learning streak
    let learning_streak = calculate_learning_streak(&daily_activities);

    let statistics = Statistics {
        total_words,
        words_by_category,
        daily_activities,
        learning_streak,
    };

    Ok(Json(statistics))
}

pub async fn record_activity(
    State(pool): State<AppState>,
    Json(payload): Json<CreateActivity>,
) -> Result<(StatusCode, Json<LearningActivity>), AppError> {
    payload.validate()?;
    
    let mut conn = pool.get().await?;

    let activity = diesel::insert_into(learning_activities::table)
        .values(&payload)
        .get_result::<LearningActivity>(&mut conn)
        .await?;

    Ok((StatusCode::CREATED, Json(activity)))
}

fn calculate_learning_streak(activities: &[LearningActivity]) -> i32 {
    if activities.is_empty() {
        return 0;
    }

    let mut streak = 0;
    let today = Utc::now().naive_utc().date();
    let mut current_date = today;

    // Group activities by date
    let mut activities_by_date: HashMap<chrono::NaiveDate, i32> = HashMap::new();
    for activity in activities {
        *activities_by_date.entry(activity.date).or_insert(0) += activity.count;
    }

    // Check consecutive days going backwards from today
    loop {
        if activities_by_date.contains_key(&current_date) {
            streak += 1;
            current_date = current_date - Duration::days(1);
        } else if current_date == today {
            // If today has no activity, check yesterday
            current_date = current_date - Duration::days(1);
        } else {
            // Break the streak
            break;
        }
    }

    streak
}