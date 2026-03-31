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
    models::user::{CreateUserRequest, User, UserResponse, UserRole},
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

    let registrations = if let Some(session_id) = params.session_id {
        sqlx::query!(
            "SELECT r.*, s.title as session_title FROM registrations r
             JOIN sessions s ON r.session_id = s.id
             WHERE r.session_id = $1
             ORDER BY r.created_at DESC LIMIT $2 OFFSET $3",
            session_id, per_page, offset
        )
        .fetch_all(&pool)
        .await?
        .into_iter()
        .map(|r| json!({
            "id": r.id,
            "registration_id": r.registration_id,
            "session_id": r.session_id,
            "full_name": r.full_name,
            "email": r.email,
            "phone": r.phone,
            "course_or_profession": r.course_or_profession,
            "created_at": r.created_at,
            "session_title": r.session_title
        }))
        .collect::<Vec<_>>()
    } else if let Some(search) = &params.search {
        let pattern = format!("%{}%", search);
        sqlx::query!(
            "SELECT r.*, s.title as session_title FROM registrations r
             JOIN sessions s ON r.session_id = s.id
             WHERE r.full_name ILIKE $1 OR r.email ILIKE $1 OR r.course_or_profession ILIKE $1
             ORDER BY r.created_at DESC LIMIT $2 OFFSET $3",
            pattern, per_page, offset
        )
        .fetch_all(&pool)
        .await?
        .into_iter()
        .map(|r| json!({
            "id": r.id,
            "registration_id": r.registration_id,
            "session_id": r.session_id,
            "full_name": r.full_name,
            "email": r.email,
            "phone": r.phone,
            "course_or_profession": r.course_or_profession,
            "created_at": r.created_at,
            "session_title": r.session_title
        }))
        .collect::<Vec<_>>()
    } else {
        sqlx::query!(
            "SELECT r.*, s.title as session_title FROM registrations r
             JOIN sessions s ON r.session_id = s.id
             ORDER BY r.created_at DESC LIMIT $1 OFFSET $2",
            per_page, offset
        )
        .fetch_all(&pool)
        .await?
        .into_iter()
        .map(|r| json!({
            "id": r.id,
            "registration_id": r.registration_id,
            "session_id": r.session_id,
            "full_name": r.full_name,
            "email": r.email,
            "phone": r.phone,
            "course_or_profession": r.course_or_profession,
            "created_at": r.created_at,
            "session_title": r.session_title
        }))
        .collect::<Vec<_>>()
    };

    let total = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM registrations")
        .fetch_one(&pool)
        .await?;

    Ok(Json(json!({
        "success": true,
        "data": {
            "registrations": registrations,
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
    use axum::response::IntoResponse;
    use axum::http::header;

    let rows = if let Some(session_id) = params.session_id {
        sqlx::query!(
            "SELECT r.registration_id, r.full_name, r.email, r.phone, r.course_or_profession, r.created_at, s.title as session_title
             FROM registrations r JOIN sessions s ON r.session_id = s.id
             WHERE r.session_id = $1 ORDER BY r.created_at DESC",
            session_id
        )
        .fetch_all(&pool)
        .await?
        .into_iter()
        .map(|r| (r.registration_id, r.full_name, r.email, r.phone, r.course_or_profession, r.created_at.to_string(), r.session_title))
        .collect::<Vec<_>>()
    } else {
        sqlx::query!(
            "SELECT r.registration_id, r.full_name, r.email, r.phone, r.course_or_profession, r.created_at, s.title as session_title
             FROM registrations r JOIN sessions s ON r.session_id = s.id
             ORDER BY r.created_at DESC"
        )
        .fetch_all(&pool)
        .await?
        .into_iter()
        .map(|r| (r.registration_id, r.full_name, r.email, r.phone, r.course_or_profession, r.created_at.to_string(), r.session_title))
        .collect::<Vec<_>>()
    };

    let mut csv_content = "Registration ID,Full Name,Email,Phone,Course/Profession,Session,Registered At\n".to_string();
    for (reg_id, name, email, phone, course, created_at, session_title) in &rows {
        csv_content.push_str(&format!(
            "{},{},{},{},{},{},{}\n",
            reg_id,
            name.replace(',', ";"),
            email,
            phone.as_deref().unwrap_or(""),
            course.replace(',', ";"),
            session_title.replace(',', ";"),
            created_at
        ));
    }

    Ok((
        [(header::CONTENT_TYPE, "text/csv"), (header::CONTENT_DISPOSITION, "attachment; filename=\"attendees.csv\"")],
        csv_content,
    ).into_response())
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
    let result = sqlx::query("UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 AND role = 'cabinet'")
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
    // Registrations per day (last 14 days)
    let daily_registrations = sqlx::query!(
        "SELECT DATE(created_at) as date, COUNT(*) as count
         FROM registrations
         WHERE created_at >= NOW() - INTERVAL '14 days'
         GROUP BY DATE(created_at)
         ORDER BY date ASC"
    )
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|r| json!({ "date": r.date, "count": r.count }))
    .collect::<Vec<_>>();

    // Sessions popularity
    let session_popularity = sqlx::query!(
        "SELECT s.title, s.registration_count, s.capacity
         FROM sessions s ORDER BY s.registration_count DESC"
    )
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|r| json!({ "title": r.title, "registrations": r.registration_count, "capacity": r.capacity }))
    .collect::<Vec<_>>();

    // Top professions
    let professions = sqlx::query!(
        "SELECT course_or_profession, COUNT(*) as count FROM registrations
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
            "daily_registrations": daily_registrations,
            "session_popularity": session_popularity,
            "top_professions": professions
        },
        "message": "Analytics data retrieved"
    })))
}
