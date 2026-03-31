use axum::{
    extract::{Path, Query, State},
    Extension, Json,
};
use bcrypt::{hash, DEFAULT_COST};
use serde::Deserialize;
use serde_json::{json, Value};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    config::Config,
    errors::{AppError, AppResult},
    middleware::auth::Claims,
    models::user::{CreateUserRequest, User, UserResponse},
};

#[derive(Deserialize)]
pub struct AttendeeQuery {
    pub session_id: Option<Uuid>,
    pub search: Option<String>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

pub async fn list_attendees(
    State((pool, _config)): State<(PgPool, Config)>,
    Extension(_claims): Extension<Claims>,
    Query(params): Query<AttendeeQuery>,
) -> AppResult<Json<Value>> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(50).min(100);
    let offset = (page - 1) * per_page;

    // List attendee profiles (not per-session)
    let attendees = if let Some(ref search) = params.search {
        let pattern = format!("%{}%", search);
        sqlx::query!(
            "SELECT a.id, a.full_name, a.email, a.phone, a.course_or_profession, a.created_at,
                    COUNT(att.id)::INTEGER as total_checkins
             FROM attendees a
             LEFT JOIN attendances att ON att.attendee_id = a.id
             WHERE a.full_name ILIKE $1 OR a.email ILIKE $1 OR a.course_or_profession ILIKE $1
             GROUP BY a.id
             ORDER BY a.created_at DESC LIMIT $2 OFFSET $3",
            pattern, per_page, offset
        )
        .fetch_all(&pool)
        .await?
        .into_iter()
        .map(|r| json!({
            "id": r.id,
            "full_name": r.full_name,
            "email": r.email,
            "phone": r.phone,
            "course_or_profession": r.course_or_profession,
            "created_at": r.created_at,
            "total_checkins": r.total_checkins.unwrap_or(0)
        }))
        .collect::<Vec<_>>()
    } else {
        sqlx::query!(
            "SELECT a.id, a.full_name, a.email, a.phone, a.course_or_profession, a.created_at,
                    COUNT(att.id)::INTEGER as total_checkins
             FROM attendees a
             LEFT JOIN attendances att ON att.attendee_id = a.id
             GROUP BY a.id
             ORDER BY a.created_at DESC LIMIT $1 OFFSET $2",
            per_page, offset
        )
        .fetch_all(&pool)
        .await?
        .into_iter()
        .map(|r| json!({
            "id": r.id,
            "full_name": r.full_name,
            "email": r.email,
            "phone": r.phone,
            "course_or_profession": r.course_or_profession,
            "created_at": r.created_at,
            "total_checkins": r.total_checkins.unwrap_or(0)
        }))
        .collect::<Vec<_>>()
    };

    let total = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM attendees")
        .fetch_one(&pool)
        .await?;

    Ok(Json(json!({
        "success": true,
        "data": {
            "attendees": attendees,
            "total": total,
            "page": page,
            "per_page": per_page
        },
        "message": "Attendees retrieved successfully"
    })))
}

pub async fn export_csv(
    State((pool, _config)): State<(PgPool, Config)>,
    Extension(_claims): Extension<Claims>,
    Query(params): Query<AttendeeQuery>,
) -> AppResult<axum::response::Response> {
    use axum::http::header;
    use axum::response::IntoResponse;

    // Export check-ins; if session_id provided, filter to that session
    let rows = if let Some(session_id) = params.session_id {
        sqlx::query!(
            "SELECT a.full_name, a.email, a.phone, a.course_or_profession,
                    att.checked_in_at, s.title as session_title
             FROM attendances att
             JOIN attendees a ON att.attendee_id = a.id
             JOIN sessions s ON att.session_id = s.id
             WHERE att.session_id = $1
             ORDER BY att.checked_in_at ASC",
            session_id
        )
        .fetch_all(&pool)
        .await?
        .into_iter()
        .map(|r| (r.full_name, r.email, r.phone, r.course_or_profession, r.checked_in_at.to_string(), r.session_title))
        .collect::<Vec<_>>()
    } else {
        sqlx::query!(
            "SELECT a.full_name, a.email, a.phone, a.course_or_profession,
                    att.checked_in_at, s.title as session_title
             FROM attendances att
             JOIN attendees a ON att.attendee_id = a.id
             JOIN sessions s ON att.session_id = s.id
             ORDER BY att.checked_in_at ASC"
        )
        .fetch_all(&pool)
        .await?
        .into_iter()
        .map(|r| (r.full_name, r.email, r.phone, r.course_or_profession, r.checked_in_at.to_string(), r.session_title))
        .collect::<Vec<_>>()
    };

    let mut csv_content = "Full Name,Email,Phone,Course/Profession,Session,Checked In At\n".to_string();
    for (name, email, phone, course, checked_in_at, session_title) in &rows {
        csv_content.push_str(&format!(
            "{},{},{},{},{},{}\n",
            name.replace(',', ";"),
            email,
            phone.as_deref().unwrap_or(""),
            course.replace(',', ";"),
            session_title.replace(',', ";"),
            checked_in_at
        ));
    }

    Ok((
        [
            (header::CONTENT_TYPE, "text/csv"),
            (header::CONTENT_DISPOSITION, "attachment; filename=\"checkins.csv\""),
        ],
        csv_content,
    )
        .into_response())
}

pub async fn list_cabinet_users(
    State((pool, _config)): State<(PgPool, Config)>,
    Extension(_claims): Extension<Claims>,
) -> AppResult<Json<Value>> {
    let users = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE role = 'cabinet' ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(UserResponse::from)
    .collect::<Vec<_>>();

    Ok(Json(json!({
        "success": true,
        "data": users,
        "message": "Cabinet users retrieved successfully"
    })))
}

pub async fn create_cabinet_user(
    State((pool, _config)): State<(PgPool, Config)>,
    Extension(_claims): Extension<Claims>,
    Json(payload): Json<CreateUserRequest>,
) -> AppResult<Json<Value>> {
    let password_hash = hash(&payload.password, DEFAULT_COST)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("bcrypt error: {}", e)))?;

    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (id, email, password_hash, name, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'cabinet', true, NOW(), NOW())
         RETURNING *"
    )
    .bind(Uuid::new_v4())
    .bind(&payload.email)
    .bind(&password_hash)
    .bind(&payload.name)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        if e.to_string().contains("unique") {
            AppError::Conflict("Email already in use".to_string())
        } else {
            AppError::Database(e)
        }
    })?;

    Ok(Json(json!({
        "success": true,
        "data": UserResponse::from(user),
        "message": "Cabinet user created successfully"
    })))
}

pub async fn deactivate_user(
    State((pool, _config)): State<(PgPool, Config)>,
    Extension(_claims): Extension<Claims>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let result = sqlx::query(
        "UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 AND role = 'cabinet'"
    )
    .bind(id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Cabinet user not found".to_string()));
    }

    Ok(Json(json!({
        "success": true,
        "data": null,
        "message": "User deactivated successfully"
    })))
}

pub async fn get_analytics(
    State((pool, _config)): State<(PgPool, Config)>,
    Extension(_claims): Extension<Claims>,
) -> AppResult<Json<Value>> {
    // Check-ins per day (last 14 days)
    let daily_checkins = sqlx::query!(
        "SELECT DATE(checked_in_at) as date, COUNT(*) as count
         FROM attendances
         WHERE checked_in_at >= NOW() - INTERVAL '14 days'
         GROUP BY DATE(checked_in_at)
         ORDER BY date ASC"
    )
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|r| json!({ "date": r.date, "count": r.count }))
    .collect::<Vec<_>>();

    // Sessions popularity (by check-in count)
    let session_popularity = sqlx::query!(
        "SELECT s.title, COUNT(att.id)::INTEGER as checkin_count, s.capacity
         FROM sessions s
         LEFT JOIN attendances att ON att.session_id = s.id
         GROUP BY s.id
         ORDER BY checkin_count DESC"
    )
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|r| json!({ "title": r.title, "checkins": r.checkin_count.unwrap_or(0), "capacity": r.capacity }))
    .collect::<Vec<_>>();

    // Top professions (from attendees table)
    let professions = sqlx::query!(
        "SELECT course_or_profession, COUNT(*) as count FROM attendees
         GROUP BY course_or_profession ORDER BY count DESC LIMIT 10"
    )
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|r| json!({ "name": r.course_or_profession, "count": r.count }))
    .collect::<Vec<_>>();

    Ok(Json(json!({
        "success": true,
        "data": {
            "daily_checkins": daily_checkins,
            "session_popularity": session_popularity,
            "top_professions": professions
        },
        "message": "Analytics data retrieved"
    })))
}


