use axum::{
    extract::{Path, State},
    Extension, Json,
};
use serde_json::{json, Value};
use sqlx::PgPool;

use crate::{
    config::Config,
    errors::AppResult,
    middleware::auth::Claims,
};

pub async fn get_stats(
    State((pool, _config)): State<(PgPool, Config)>,
    Extension(_claims): Extension<Claims>,
) -> AppResult<Json<Value>> {
    let total_registrations = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM registrations")
        .fetch_one(&pool)
        .await?;

    let total_sessions = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM sessions")
        .fetch_one(&pool)
        .await?;

    let active_sessions = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM sessions WHERE is_active = true")
        .fetch_one(&pool)
        .await?;

    let sessions_with_stats = sqlx::query!(
        "SELECT id, title, capacity, registration_count, is_active, start_time, location
         FROM sessions ORDER BY start_time ASC"
    )
    .fetch_all(&pool)
    .await?;

    let sessions_data: Vec<Value> = sessions_with_stats
        .iter()
        .map(|s| json!({
            "id": s.id,
            "title": s.title,
            "capacity": s.capacity,
            "registration_count": s.registration_count,
            "is_active": s.is_active,
            "start_time": s.start_time,
            "location": s.location,
            "fill_percentage": if s.capacity > 0 { (s.registration_count as f64 / s.capacity as f64 * 100.0) as i32 } else { 0 }
        }))
        .collect();

    let recent_registrations = sqlx::query!(
        "SELECT r.registration_id, r.full_name, r.course_or_profession, r.created_at, s.title as session_title
         FROM registrations r
         JOIN sessions s ON r.session_id = s.id
         ORDER BY r.created_at DESC
         LIMIT 10"
    )
    .fetch_all(&pool)
    .await?;

    let recent_data: Vec<Value> = recent_registrations
        .iter()
        .map(|r| json!({
            "registration_id": r.registration_id,
            "full_name": r.full_name,
            "course_or_profession": r.course_or_profession,
            "created_at": r.created_at,
            "session_title": r.session_title
        }))
        .collect();

    Ok(Json(json!({
        "success": true,
        "data": {
            "total_registrations": total_registrations,
            "total_sessions": total_sessions,
            "active_sessions": active_sessions,
            "sessions": sessions_data,
            "recent_registrations": recent_data
        },
        "message": "Stats retrieved successfully"
    })))
}
