use sqlx::PgPool;
use anyhow::Result;

pub async fn create_pool(database_url: &str) -> Result<PgPool> {
    let pool = sqlx::PgPool::connect(database_url).await?;
    Ok(pool)
}
