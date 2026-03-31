use axum::{
    extract::{Request, State},
    http::header::AUTHORIZATION,
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};

use crate::{config::Config, errors::AppError, models::user::UserRole};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String, // user id
    pub email: String,
    pub role: UserRole,
    pub exp: usize,
    pub iat: usize,
}

pub async fn auth_middleware(
    State(config): State<Config>,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = request
        .headers()
        .get(AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or_else(|| AppError::Unauthorized("Missing or invalid Authorization header".to_string()))?;

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(config.jwt_secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| AppError::Unauthorized("Invalid or expired token".to_string()))?;

    request.extensions_mut().insert(token_data.claims);
    Ok(next.run(request).await)
}

pub async fn require_super_admin(
    request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let claims = request
        .extensions()
        .get::<Claims>()
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;

    if claims.role != UserRole::SuperAdmin {
        return Err(AppError::Forbidden("Super admin access required".to_string()));
    }

    Ok(next.run(request).await)
}
