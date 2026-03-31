use axum::{extract::State, Json};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
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
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: UserResponse,
}

pub async fn login(
    State((pool, config)): State<(PgPool, Config)>,
    Json(payload): Json<LoginRequest>,
) -> AppResult<Json<Value>> {
    let user = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE email = $1 AND is_active = true"
    )
    .bind(&payload.email)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::Unauthorized("Invalid email or password".to_string()))?;

    let valid = verify(&payload.password, &user.password_hash)
        .map_err(|_| AppError::Internal(anyhow::anyhow!("bcrypt error")))?;

    if !valid {
        return Err(AppError::Unauthorized("Invalid email or password".to_string()));
    }

    let now = Utc::now();
    let exp = (now + Duration::hours(config.jwt_expiry_hours as i64)).timestamp() as usize;
    let claims = Claims {
        sub: user.id.to_string(),
        email: user.email.clone(),
        role: user.role.clone(),
        exp,
        iat: now.timestamp() as usize,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.jwt_secret.as_bytes()),
    )
    .map_err(|e| AppError::Internal(anyhow::anyhow!("JWT encode error: {}", e)))?;

    Ok(Json(json!({
        "success": true,
        "data": {
            "token": token,
            "user": UserResponse::from(user)
        },
        "message": "Login successful"
    })))
}

pub async fn create_super_admin(
    State((pool, config)): State<(PgPool, Config)>,
    Json(payload): Json<CreateUserRequest>,
) -> AppResult<Json<Value>> {
    // Check if any super_admin exists
    let existing_admin = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM users WHERE role = 'super_admin'"
    )
    .fetch_one(&pool)
    .await?;

    if existing_admin > 0 {
        return Err(AppError::Forbidden("Super admin already exists. Use admin panel to create users.".to_string()));
    }

    let password_hash = hash(&payload.password, DEFAULT_COST)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("bcrypt error: {}", e)))?;

    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (id, email, password_hash, name, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'super_admin', true, NOW(), NOW())
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
            AppError::Conflict("Email already exists".to_string())
        } else {
            AppError::Database(e)
        }
    })?;

    Ok(Json(json!({
        "success": true,
        "data": UserResponse::from(user),
        "message": "Super admin created successfully"
    })))
}
