use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Registration {
    pub id: Uuid,
    pub registration_id: String,
    pub session_id: Uuid,
    pub full_name: String,
    pub email: String,
    pub phone: Option<String>,
    pub course_or_profession: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateRegistrationRequest {
    pub session_id: Uuid,
    pub full_name: String,
    pub email: String,
    pub phone: Option<String>,
    pub course_or_profession: String,
}
