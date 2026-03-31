use axum::{
    extract::{Path, State},
    Extension, Json,
};
use serde_json::{json, Value};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    config::Config,
    errors::AppResult,
    middleware::auth::Claims,
};

pub async fn get_stats(
    State((pool, _config)): State<(PgPool, Config)>,
    Extension(_claims): Extension<Claims>,
) -> AppResult<Json<Value>> {
    let total_attendees = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM attendees")
        .fetch_one(&pool)
        .await?;

    let total_checkins = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM attendances")
        .fetch_one(&pool)
        .await?;

    let total_sessions = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM sessions")
        .fetch_one(&pool)
        .await?;

    let active_sessions = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM sessions WHERE is_active = true")
        .fetch_one(&pool)
        .await?;

    let never_attended = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM attendees a WHERE NOT EXISTS (
            SELECT 1 FROM attendances att WHERE att.attendee_id = a.id
         )"
    )
    .fetch_one(&pool)
    .await?;

    let sessions_with_stats = sqlx::query!(
        "SELECT s.id, s.title, s.capacity, s.is_active, s.start_time, s.location,
                COUNT(att.id)::INTEGER as checkin_count
         FROM sessions s
         LEFT JOIN attendances att ON att.session_id = s.id
         GROUP BY s.id
         ORDER BY s.start_time ASC"
    )
    .fetch_all(&pool)
    .await?;

    let sessions_data: Vec<Value> = sessions_with_stats
        .iter()
        .map(|s| {
            let checkin_count = s.checkin_count.unwrap_or(0);
            json!({
                "id": s.id,
                "title": s.title,
                "capacity": s.capacity,
                "checkin_count": checkin_count,
                "is_active": s.is_active,
                "start_time": s.start_time,
                "location": s.location,
                "fill_percentage": if s.capacity > 0 { (checkin_count as f64 / s.capacity as f64 * 100.0) as i32 } else { 0 }
            })
        })
        .collect();

    let recent_checkins = sqlx::query!(
        "SELECT a.full_name, a.course_or_profession, att.checked_in_at, s.title as session_title
         FROM attendances att
         JOIN attendees a ON att.attendee_id = a.id
         JOIN sessions s ON att.session_id = s.id
         ORDER BY att.checked_in_at DESC
         LIMIT 10"
    )
    .fetch_all(&pool)
    .await?;

    let recent_data: Vec<Value> = recent_checkins
        .iter()
        .map(|r| json!({
            "full_name": r.full_name,
            "course_or_profession": r.course_or_profession,
            "checked_in_at": r.checked_in_at,
            "session_title": r.session_title
        }))
        .collect();

    Ok(Json(json!({
        "success": true,
        "data": {
            "total_attendees": total_attendees,
            "total_checkins": total_checkins,
            "total_sessions": total_sessions,
            "active_sessions": active_sessions,
            "never_attended": never_attended,
            "sessions": sessions_data,
            "recent_checkins": recent_data
        },
        "message": "Stats retrieved successfully"
    })))
}

/// GET /cabinet/sessions/:id/checkins — list check-ins for a specific session
pub async fn get_session_checkins(
    State((pool, _config)): State<(PgPool, Config)>,
    Extension(_claims): Extension<Claims>,
    Path(session_id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let checkins = sqlx::query!(
        "SELECT a.id as attendee_id, a.full_name, a.email, a.course_or_profession,
                att.checked_in_at
         FROM attendances att
         JOIN attendees a ON att.attendee_id = a.id
         WHERE att.session_id = $1
         ORDER BY att.checked_in_at ASC",
        session_id
    )
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|r| json!({
        "attendee_id": r.attendee_id,
        "full_name": r.full_name,
        "email": r.email,
        "course_or_profession": r.course_or_profession,
        "checked_in_at": r.checked_in_at
    }))
    .collect::<Vec<_>>();

    Ok(Json(json!({
        "success": true,
        "data": checkins,
        "message": "Session check-ins retrieved"
    })))
}

/// GET /cabinet/never-attended — attendees who registered but never checked in
pub async fn get_never_attended(
    State((pool, _config)): State<(PgPool, Config)>,
    Extension(_claims): Extension<Claims>,
) -> AppResult<Json<Value>> {
    let attendees = sqlx::query!(
        "SELECT id, full_name, email, course_or_profession, created_at
         FROM attendees
         WHERE NOT EXISTS (
             SELECT 1 FROM attendances att WHERE att.attendee_id = attendees.id
         )
         ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|r| json!({
        "id": r.id,
        "full_name": r.full_name,
        "email": r.email,
        "course_or_profession": r.course_or_profession,
        "created_at": r.created_at
    }))
    .collect::<Vec<_>>();

    Ok(Json(json!({
        "success": true,
        "data": attendees,
        "message": "Never-attended attendees retrieved"
    })))
}

