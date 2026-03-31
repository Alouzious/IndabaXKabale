use axum::{
    extract::{Path, State},
    Json,
};
use serde_json::{json, Value};
use sqlx::{PgPool, Row};
use uuid::Uuid;

use crate::{
    config::Config,
    errors::{AppError, AppResult},
    models::registration::{CreateRegistrationRequest, Registration},
};

fn generate_registration_id() -> String {
    use rand::distributions::Alphanumeric;
    use rand::Rng;
    let suffix: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(8)
        .map(char::from)
        .collect::<String>()
        .to_uppercase();
    format!("IXK-{}", suffix)
}

pub async fn create_registration(
    State((pool, _config)): State<(PgPool, Config)>,
    Json(payload): Json<CreateRegistrationRequest>,
) -> AppResult<Json<Value>> {
    if payload.full_name.trim().is_empty() {
        return Err(AppError::BadRequest("Full name is required".to_string()));
    }
    if payload.email.trim().is_empty() || !payload.email.contains('@') {
        return Err(AppError::BadRequest("Valid email is required".to_string()));
    }

    // Check session exists and is active
    let session = sqlx::query(
        "SELECT id, capacity, registration_count, is_active FROM sessions WHERE id = $1",
    )
    .bind(payload.session_id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Session not found".to_string()))?;

    let session_is_active: bool = session.try_get("is_active")?;
    let session_registration_count: i32 = session.try_get("registration_count")?;
    let session_capacity: i32 = session.try_get("capacity")?;

    if !session_is_active {
        return Err(AppError::BadRequest("This session is no longer accepting registrations".to_string()));
    }

    if session_registration_count >= session_capacity {
        return Err(AppError::Conflict("Session is at full capacity".to_string()));
    }

    // Check duplicate registration
    let existing = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM registrations WHERE email = $1 AND session_id = $2"
    )
    .bind(&payload.email)
    .bind(payload.session_id)
    .fetch_one(&pool)
    .await?;

    if existing > 0 {
        return Err(AppError::Conflict("You are already registered for this session".to_string()));
    }

    let registration_id = generate_registration_id();

    let registration = sqlx::query_as::<_, Registration>(
        "INSERT INTO registrations (id, registration_id, session_id, full_name, email, phone, course_or_profession, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *"
    )
    .bind(Uuid::new_v4())
    .bind(&registration_id)
    .bind(payload.session_id)
    .bind(&payload.full_name)
    .bind(&payload.email)
    .bind(&payload.phone)
    .bind(&payload.course_or_profession)
    .fetch_one(&pool)
    .await?;

    // Increment registration count
    sqlx::query("UPDATE sessions SET registration_count = registration_count + 1, updated_at = NOW() WHERE id = $1")
        .bind(payload.session_id)
        .execute(&pool)
        .await?;

    Ok(Json(json!({
        "success": true,
        "data": registration,
        "message": "Registration successful"
    })))
}

pub async fn verify_registration(
    State((pool, _config)): State<(PgPool, Config)>,
    Path(registration_id): Path<String>,
) -> AppResult<Json<Value>> {
    let registration = sqlx::query_as::<_, Registration>(
        "SELECT r.* FROM registrations r WHERE r.registration_id = $1"
    )
    .bind(&registration_id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Registration not found".to_string()))?;

    let session = sqlx::query(
        "SELECT title, start_time, end_time, location FROM sessions WHERE id = $1",
    )
    .bind(registration.session_id)
    .fetch_optional(&pool)
    .await?;

    Ok(Json(json!({
        "success": true,
        "data": {
            "registration": registration,
            "session": session.map(|s| {
                let title = s.try_get::<String, _>("title").ok();
                let start_time = s.try_get::<chrono::DateTime<chrono::Utc>, _>("start_time").ok();
                let end_time = s.try_get::<chrono::DateTime<chrono::Utc>, _>("end_time").ok();
                let location = s.try_get::<Option<String>, _>("location").ok();
                json!({
                    "title": title,
                    "start_time": start_time,
                    "end_time": end_time,
                    "location": location
                })
            })
        },
        "message": "Registration verified"
    })))
}
