use axum::{
    extract::{Query, State},
    Json,
};
use serde::Deserialize;
use serde_json::{json, Value};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    config::Config,
    errors::{AppError, AppResult},
    models::attendee::{Attendee, Attendance, CheckInRequest, CreateAttendeeRequest},
};

#[derive(Deserialize)]
pub struct SearchQuery {
    pub q: Option<String>,
}

/// POST /attendees — register a new attendee profile (idempotent on email)
pub async fn register_attendee(
    State((pool, _config)): State<(PgPool, Config)>,
    Json(payload): Json<CreateAttendeeRequest>,
) -> AppResult<Json<Value>> {
    if payload.full_name.trim().is_empty() {
        return Err(AppError::BadRequest("Full name is required".to_string()));
    }
    if payload.email.trim().is_empty() || !payload.email.contains('@') {
        return Err(AppError::BadRequest("Valid email is required".to_string()));
    }
    if payload.course_or_profession.trim().is_empty() {
        return Err(AppError::BadRequest("Course or profession is required".to_string()));
    }

    // Check if already registered by email
    let existing = sqlx::query_as::<_, Attendee>(
        "SELECT * FROM attendees WHERE email = $1"
    )
    .bind(payload.email.trim().to_lowercase())
    .fetch_optional(&pool)
    .await?;

    if let Some(attendee) = existing {
        return Ok(Json(json!({
            "success": true,
            "data": attendee,
            "already_registered": true,
            "message": "You are already registered. Proceed to check in at a session."
        })));
    }

    let attendee = sqlx::query_as::<_, Attendee>(
        "INSERT INTO attendees (id, full_name, email, phone, course_or_profession, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *"
    )
    .bind(Uuid::new_v4())
    .bind(payload.full_name.trim())
    .bind(payload.email.trim().to_lowercase())
    .bind(payload.phone.as_deref().map(str::trim))
    .bind(payload.course_or_profession.trim())
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        if e.to_string().contains("unique") {
            AppError::Conflict("Email is already registered".to_string())
        } else {
            AppError::Database(e)
        }
    })?;

    Ok(Json(json!({
        "success": true,
        "data": attendee,
        "already_registered": false,
        "message": "Registration successful! You can now check in at any session."
    })))
}

/// GET /attendees/search?q=name — live search by name for check-in
pub async fn search_attendees(
    State((pool, _config)): State<(PgPool, Config)>,
    Query(params): Query<SearchQuery>,
) -> AppResult<Json<Value>> {
    let query = params.q.unwrap_or_default();
    if query.trim().len() < 2 {
        return Ok(Json(json!({
            "success": true,
            "data": [],
            "message": "Type at least 2 characters to search"
        })));
    }

    let pattern = format!("%{}%", query.trim());
    let attendees = sqlx::query_as::<_, Attendee>(
        "SELECT * FROM attendees WHERE full_name ILIKE $1 ORDER BY full_name ASC LIMIT 20"
    )
    .bind(&pattern)
    .fetch_all(&pool)
    .await?;

    Ok(Json(json!({
        "success": true,
        "data": attendees,
        "message": "Search results"
    })))
}

/// POST /checkin — mark an attendee as checked in for a session
pub async fn check_in(
    State((pool, _config)): State<(PgPool, Config)>,
    Json(payload): Json<CheckInRequest>,
) -> AppResult<Json<Value>> {
    // Verify attendee exists
    let attendee = sqlx::query_as::<_, Attendee>(
        "SELECT * FROM attendees WHERE id = $1"
    )
    .bind(payload.attendee_id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Attendee not found".to_string()))?;

    // Verify session exists and is active
    let session = sqlx::query!(
        "SELECT id, title, is_active FROM sessions WHERE id = $1",
        payload.session_id
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Session not found".to_string()))?;

    if !session.is_active {
        return Err(AppError::BadRequest(
            "This session is not currently active".to_string(),
        ));
    }

    // Insert attendance; if already checked in, return graceful message
    let result = sqlx::query_as::<_, Attendance>(
        "INSERT INTO attendances (id, attendee_id, session_id, checked_in_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (attendee_id, session_id) DO NOTHING
         RETURNING *"
    )
    .bind(Uuid::new_v4())
    .bind(payload.attendee_id)
    .bind(payload.session_id)
    .fetch_optional(&pool)
    .await?;

    if let Some(attendance) = result {
        Ok(Json(json!({
            "success": true,
            "data": {
                "attendance": attendance,
                "attendee": attendee,
                "session_title": session.title
            },
            "already_checked_in": false,
            "message": "Checked in successfully!"
        })))
    } else {
        // Already checked in
        let existing = sqlx::query_as::<_, Attendance>(
            "SELECT * FROM attendances WHERE attendee_id = $1 AND session_id = $2"
        )
        .bind(payload.attendee_id)
        .bind(payload.session_id)
        .fetch_one(&pool)
        .await?;

        Ok(Json(json!({
            "success": true,
            "data": {
                "attendance": existing,
                "attendee": attendee,
                "session_title": session.title
            },
            "already_checked_in": true,
            "message": "Already checked in!"
        })))
    }
}
