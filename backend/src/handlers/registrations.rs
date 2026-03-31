use axum::{
    extract::{Path, State},
    Json,
};
use chrono::Utc;
use serde_json::{json, Value};
use sqlx::PgPool;
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
    let session = sqlx::query!(
        "SELECT id, capacity, registration_count, is_active FROM sessions WHERE id = $1",
        payload.session_id
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Session not found".to_string()))?;

    if !session.is_active {
        return Err(AppError::BadRequest("This session is no longer accepting registrations".to_string()));
    }

    if session.registration_count >= session.capacity {
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

    let session = sqlx::query!(
        "SELECT title, start_time, end_time, location FROM sessions WHERE id = $1",
        registration.session_id
    )
    .fetch_optional(&pool)
    .await?;

    Ok(Json(json!({
        "success": true,
        "data": {
            "registration": registration,
            "session": session.map(|s| json!({
                "title": s.title,
                "start_time": s.start_time,
                "end_time": s.end_time,
                "location": s.location
            }))
        },
        "message": "Registration verified"
    })))
}
