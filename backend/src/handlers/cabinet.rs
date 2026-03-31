use axum::{
    extract::{Path, State},
    Extension, Json,
};
use serde_json::{json, Value};
use sqlx::{PgPool, Row};
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

    let sessions_with_stats = sqlx::query(
        "SELECT s.id, s.title, s.capacity, s.is_active, s.start_time, s.location,
                COUNT(att.id)::INTEGER as checkin_count
         FROM sessions s
         LEFT JOIN attendances att ON att.session_id = s.id
         GROUP BY s.id
         ORDER BY s.start_time ASC"
    )
    .fetch_all(&pool)
    .await?;

    let mut sessions_data: Vec<Value> = Vec::with_capacity(sessions_with_stats.len());
    for s in sessions_with_stats {
        let id: Uuid = s.try_get("id")?;
        let title: String = s.try_get("title")?;
        let capacity: i32 = s.try_get("capacity")?;
        let is_active: bool = s.try_get("is_active")?;
        let start_time: chrono::DateTime<chrono::Utc> = s.try_get("start_time")?;
        let location: Option<String> = s.try_get("location")?;
        let checkin_count: i32 = s.try_get("checkin_count")?;
        let fill_percentage = if capacity > 0 {
            (checkin_count as f64 / capacity as f64 * 100.0) as i32
        } else {
            0
        };

        sessions_data.push(json!({
            "id": id,
            "title": title,
            "capacity": capacity,
            "checkin_count": checkin_count,
            "is_active": is_active,
            "start_time": start_time,
            "location": location,
            "fill_percentage": fill_percentage
        }));
    }

    let recent_checkins = sqlx::query(
        "SELECT a.full_name, a.course_or_profession, att.checked_in_at, s.title as session_title
         FROM attendances att
         JOIN attendees a ON att.attendee_id = a.id
         JOIN sessions s ON att.session_id = s.id
         ORDER BY att.checked_in_at DESC
         LIMIT 10"
    )
    .fetch_all(&pool)
    .await?;

    let mut recent_data: Vec<Value> = Vec::with_capacity(recent_checkins.len());
    for r in recent_checkins {
        let full_name: String = r.try_get("full_name")?;
        let course_or_profession: String = r.try_get("course_or_profession")?;
        let checked_in_at: chrono::DateTime<chrono::Utc> = r.try_get("checked_in_at")?;
        let session_title: String = r.try_get("session_title")?;
        recent_data.push(json!({
            "full_name": full_name,
            "course_or_profession": course_or_profession,
            "checked_in_at": checked_in_at,
            "session_title": session_title
        }));
    }

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
    let checkin_rows = sqlx::query(
        "SELECT a.id as attendee_id, a.full_name, a.email, a.course_or_profession,
                att.checked_in_at
         FROM attendances att
         JOIN attendees a ON att.attendee_id = a.id
         WHERE att.session_id = $1
         ORDER BY att.checked_in_at ASC",
    )
    .bind(session_id)
    .fetch_all(&pool)
    .await?;

    let mut checkins = Vec::with_capacity(checkin_rows.len());
    for r in checkin_rows {
        let attendee_id: Uuid = r.try_get("attendee_id")?;
        let full_name: String = r.try_get("full_name")?;
        let email: String = r.try_get("email")?;
        let course_or_profession: String = r.try_get("course_or_profession")?;
        let checked_in_at: chrono::DateTime<chrono::Utc> = r.try_get("checked_in_at")?;
        checkins.push(json!({
            "attendee_id": attendee_id,
            "full_name": full_name,
            "email": email,
            "course_or_profession": course_or_profession,
            "checked_in_at": checked_in_at
        }));
    }

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
    let attendee_rows = sqlx::query(
        "SELECT id, full_name, email, course_or_profession, created_at
         FROM attendees
         WHERE NOT EXISTS (
             SELECT 1 FROM attendances att WHERE att.attendee_id = attendees.id
         )
         ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await?;

    let mut attendees = Vec::with_capacity(attendee_rows.len());
    for r in attendee_rows {
        let id: Uuid = r.try_get("id")?;
        let full_name: String = r.try_get("full_name")?;
        let email: String = r.try_get("email")?;
        let course_or_profession: String = r.try_get("course_or_profession")?;
        let created_at: chrono::DateTime<chrono::Utc> = r.try_get("created_at")?;
        attendees.push(json!({
            "id": id,
            "full_name": full_name,
            "email": email,
            "course_or_profession": course_or_profession,
            "created_at": created_at
        }));
    }

    Ok(Json(json!({
        "success": true,
        "data": attendees,
        "message": "Never-attended attendees retrieved"
    })))
}

