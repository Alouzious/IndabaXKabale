use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Attendee {
    pub id: Uuid,
    pub full_name: String,
    pub email: String,
    pub phone: Option<String>,
    pub course_or_profession: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAttendeeRequest {
    pub full_name: String,
    pub email: String,
    pub phone: Option<String>,
    pub course_or_profession: String,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Attendance {
    pub id: Uuid,
    pub attendee_id: Uuid,
    pub session_id: Uuid,
    pub checked_in_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CheckInRequest {
    pub attendee_id: Uuid,
    pub session_id: Uuid,
}
