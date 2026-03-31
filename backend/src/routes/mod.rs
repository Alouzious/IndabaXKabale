use axum::{
    middleware,
    routing::{delete, get, post, put},
    Router,
};
use sqlx::PgPool;

use crate::{
    config::Config,
    handlers::{admin, auth, cabinet, registrations, sessions},
    middleware::auth::{auth_middleware, require_super_admin},
};

pub fn create_router(pool: PgPool, config: Config) -> Router {
    let state = (pool, config.clone());

    // Public routes
    let public_routes = Router::new()
        .route("/sessions", get(sessions::list_sessions))
        .route("/sessions/:id", get(sessions::get_session))
        .route("/sessions/token/:token", get(sessions::get_session_by_token))
        .route("/registrations", post(registrations::create_registration))
        .route("/verify/:registration_id", get(registrations::verify_registration))
        .route("/auth/login", post(auth::login))
        .route("/auth/setup", post(auth::create_super_admin))
        .with_state(state.clone());

    // Cabinet routes (cabinet or super_admin)
    let cabinet_routes = Router::new()
        .route("/cabinet/stats", get(cabinet::get_stats))
        .route("/cabinet/sessions", get(sessions::list_all_sessions))
        .route("/cabinet/sessions", post(sessions::create_session))
        .route("/cabinet/sessions/:id/qrcode", get(sessions::get_session_qrcode))
        .route_layer(middleware::from_fn_with_state(config.clone(), auth_middleware))
        .with_state(state.clone());

    // Admin routes (super_admin only)
    let admin_routes = Router::new()
        .route("/admin/attendees", get(admin::list_attendees))
        .route("/admin/attendees/export", get(admin::export_csv))
        .route("/admin/sessions/:id", put(sessions::update_session))
        .route("/admin/sessions/:id", delete(sessions::delete_session))
        .route("/admin/users", get(admin::list_cabinet_users))
        .route("/admin/users", post(admin::create_cabinet_user))
        .route("/admin/users/:id/deactivate", post(admin::deactivate_user))
        .route("/admin/analytics", get(admin::get_analytics))
        .route_layer(middleware::from_fn(require_super_admin))
        .route_layer(middleware::from_fn_with_state(config.clone(), auth_middleware))
        .with_state(state);

    Router::new()
        .nest("/api/v1", public_routes)
        .nest("/api/v1", cabinet_routes)
        .nest("/api/v1", admin_routes)
        .route("/health", get(health_check))
}

async fn health_check() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({ "status": "ok", "service": "IndabaX Kabale API" }))
}
