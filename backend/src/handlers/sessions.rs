use axum::{
    extract::{Path, State},
    Json,
};
use serde_json::{json, Value};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    config::Config,
    errors::{AppError, AppResult},
    models::session::{CreateSessionRequest, Session, UpdateSessionRequest},
};

fn generate_qr_token() -> String {
    use rand::distributions::Alphanumeric;
    use rand::Rng;
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(32)
        .map(char::from)
        .collect()
}

pub async fn list_sessions(
    State((pool, _config)): State<(PgPool, Config)>,
) -> AppResult<Json<Value>> {
    let sessions = sqlx::query_as::<_, Session>(
        "SELECT * FROM sessions WHERE is_active = true ORDER BY start_time ASC"
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(json!({
        "success": true,
        "data": sessions,
        "message": "Sessions retrieved successfully"
    })))
}

pub async fn get_session(
    State((pool, _config)): State<(PgPool, Config)>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let session = sqlx::query_as::<_, Session>(
        "SELECT * FROM sessions WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Session not found".to_string()))?;

    Ok(Json(json!({
        "success": true,
        "data": session,
        "message": "Session retrieved successfully"
    })))
}

pub async fn get_session_by_token(
    State((pool, _config)): State<(PgPool, Config)>,
    Path(token): Path<String>,
) -> AppResult<Json<Value>> {
    let session = sqlx::query_as::<_, Session>(
        "SELECT * FROM sessions WHERE qr_token = $1 AND is_active = true"
    )
    .bind(&token)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Session not found or inactive".to_string()))?;

    Ok(Json(json!({
        "success": true,
        "data": session,
        "message": "Session retrieved successfully"
    })))
}

pub async fn create_session(
    State((pool, _config)): State<(PgPool, Config)>,
    Json(payload): Json<CreateSessionRequest>,
) -> AppResult<Json<Value>> {
    if payload.capacity <= 0 {
        return Err(AppError::BadRequest("Capacity must be greater than 0".to_string()));
    }

    let qr_token = generate_qr_token();

    let session = sqlx::query_as::<_, Session>(
        "INSERT INTO sessions (id, title, description, speaker, location, start_time, end_time, capacity, registration_count, qr_token, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, true, NOW(), NOW())
         RETURNING *"
    )
    .bind(Uuid::new_v4())
    .bind(&payload.title)
    .bind(&payload.description)
    .bind(&payload.speaker)
    .bind(&payload.location)
    .bind(payload.start_time)
    .bind(payload.end_time)
    .bind(payload.capacity)
    .bind(&qr_token)
    .fetch_one(&pool)
    .await?;

    Ok(Json(json!({
        "success": true,
        "data": session,
        "message": "Session created successfully"
    })))
}

pub async fn update_session(
    State((pool, _config)): State<(PgPool, Config)>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateSessionRequest>,
) -> AppResult<Json<Value>> {
    let existing = sqlx::query_as::<_, Session>("SELECT * FROM sessions WHERE id = $1")
        .bind(id)
        .fetch_optional(&pool)
        .await?
        .ok_or_else(|| AppError::NotFound("Session not found".to_string()))?;

    let title = payload.title.unwrap_or(existing.title);
    let description = payload.description.or(existing.description);
    let speaker = payload.speaker.or(existing.speaker);
    let location = payload.location.or(existing.location);
    let start_time = payload.start_time.unwrap_or(existing.start_time);
    let end_time = payload.end_time.unwrap_or(existing.end_time);
    let capacity = payload.capacity.unwrap_or(existing.capacity);
    let is_active = payload.is_active.unwrap_or(existing.is_active);

    let session = sqlx::query_as::<_, Session>(
        "UPDATE sessions SET title=$2, description=$3, speaker=$4, location=$5, start_time=$6, end_time=$7, capacity=$8, is_active=$9, updated_at=NOW() WHERE id=$1 RETURNING *"
    )
    .bind(id)
    .bind(&title)
    .bind(&description)
    .bind(&speaker)
    .bind(&location)
    .bind(start_time)
    .bind(end_time)
    .bind(capacity)
    .bind(is_active)
    .fetch_one(&pool)
    .await?;

    Ok(Json(json!({
        "success": true,
        "data": session,
        "message": "Session updated successfully"
    })))
}

pub async fn delete_session(
    State((pool, _config)): State<(PgPool, Config)>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let result = sqlx::query("DELETE FROM sessions WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Session not found".to_string()));
    }

    Ok(Json(json!({
        "success": true,
        "data": null,
        "message": "Session deleted successfully"
    })))
}

pub async fn get_session_qrcode(
    State((pool, config)): State<(PgPool, Config)>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let session = sqlx::query_as::<_, Session>("SELECT * FROM sessions WHERE id = $1")
        .bind(id)
        .fetch_optional(&pool)
        .await?
        .ok_or_else(|| AppError::NotFound("Session not found".to_string()))?;

    let frontend_url = config.frontend_url.trim_end_matches('/');
    let qr_url = format!("{}/checkin?session={}", frontend_url, session.qr_token);

    Ok(Json(json!({
        "success": true,
        "data": {
            "qr_url": qr_url,
            "qr_token": session.qr_token,
            "session": session
        },
        "message": "QR code data retrieved successfully"
    })))
}

pub async fn list_all_sessions(
    State((pool, _config)): State<(PgPool, Config)>,
) -> AppResult<Json<Value>> {
    let sessions = sqlx::query_as::<_, Session>(
        "SELECT * FROM sessions ORDER BY start_time ASC"
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(json!({
        "success": true,
        "data": sessions,
        "message": "All sessions retrieved successfully"
    })))
}
