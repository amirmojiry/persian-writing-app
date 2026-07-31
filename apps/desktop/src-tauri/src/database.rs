use rusqlite::{params, Connection, OptionalExtension};
use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Clone, Debug)]
pub struct Database {
    path: PathBuf,
}

impl Database {
    pub fn new(path: impl Into<PathBuf>) -> Result<Self, String> {
        let database = Self { path: path.into() };
        database.initialize()?;
        Ok(database)
    }

    pub fn save_profile(&self, profile: &Value) -> Result<(), String> {
        let id = string_field(profile, "id")?;
        let updated_at = string_field(profile, "updatedAt")?;
        let payload = serde_json::to_string(profile).map_err(error_string)?;
        let connection = self.connection()?;
        connection
            .execute(
                "INSERT INTO profiles (id, updated_at, payload) VALUES (?1, ?2, ?3)\n                 ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at, payload = excluded.payload",
                params![id, updated_at, payload],
            )
            .map_err(error_string)?;
        Ok(())
    }

    pub fn list_profiles(&self) -> Result<Vec<Value>, String> {
        let connection = self.connection()?;
        let mut statement = connection
            .prepare("SELECT payload FROM profiles ORDER BY updated_at DESC")
            .map_err(error_string)?;
        let rows = statement
            .query_map([], |row| row.get::<_, String>(0))
            .map_err(error_string)?;
        rows.map(|row| parse_payload(&row.map_err(error_string)?))
            .collect()
    }

    pub fn save_session(&self, session: &Value) -> Result<(), String> {
        let id = string_field(session, "id")?;
        let status = string_field(session, "status")?;
        let updated_at = string_field(session, "updatedAt")?;
        let payload = serde_json::to_string(session).map_err(error_string)?;
        let connection = self.connection()?;
        connection
            .execute(
                "INSERT INTO writing_sessions (id, status, updated_at, payload) VALUES (?1, ?2, ?3, ?4)\n                 ON CONFLICT(id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at, payload = excluded.payload",
                params![id, status, updated_at, payload],
            )
            .map_err(error_string)?;
        Ok(())
    }

    pub fn find_session(&self, id: &str) -> Result<Option<Value>, String> {
        let connection = self.connection()?;
        let payload = connection
            .query_row(
                "SELECT payload FROM writing_sessions WHERE id = ?1",
                params![id],
                |row| row.get::<_, String>(0),
            )
            .optional()
            .map_err(error_string)?;
        payload.map(|value| parse_payload(&value)).transpose()
    }

    pub fn find_active_session(&self) -> Result<Option<Value>, String> {
        let connection = self.connection()?;
        let payload = connection
            .query_row(
                "SELECT payload FROM writing_sessions WHERE status = 'active' ORDER BY updated_at DESC LIMIT 1",
                [],
                |row| row.get::<_, String>(0),
            )
            .optional()
            .map_err(error_string)?;
        payload.map(|value| parse_payload(&value)).transpose()
    }

    fn initialize(&self) -> Result<(), String> {
        if let Some(parent) = self.path.parent() {
            fs::create_dir_all(parent).map_err(error_string)?;
        }
        let connection = self.connection()?;
        connection
            .execute_batch(
                "PRAGMA journal_mode = WAL;\n                 PRAGMA foreign_keys = ON;\n                 CREATE TABLE IF NOT EXISTS profiles (\n                   id TEXT PRIMARY KEY NOT NULL,\n                   updated_at TEXT NOT NULL,\n                   payload TEXT NOT NULL\n                 );\n                 CREATE TABLE IF NOT EXISTS writing_sessions (\n                   id TEXT PRIMARY KEY NOT NULL,\n                   status TEXT NOT NULL,\n                   updated_at TEXT NOT NULL,\n                   payload TEXT NOT NULL\n                 );\n                 CREATE INDEX IF NOT EXISTS writing_sessions_status_updated\n                   ON writing_sessions(status, updated_at DESC);",
            )
            .map_err(error_string)?;
        Ok(())
    }

    fn connection(&self) -> Result<Connection, String> {
        Connection::open(&self.path).map_err(error_string)
    }

    pub fn path(&self) -> &Path {
        &self.path
    }
}

fn string_field(value: &Value, field: &str) -> Result<String, String> {
    value
        .get(field)
        .and_then(Value::as_str)
        .filter(|candidate| !candidate.is_empty())
        .map(ToOwned::to_owned)
        .ok_or_else(|| format!("Missing required JSON field: {field}"))
}

fn parse_payload(payload: &str) -> Result<Value, String> {
    serde_json::from_str(payload).map_err(error_string)
}

fn error_string(error: impl std::fmt::Display) -> String {
    error.to_string()
}

#[cfg(test)]
mod tests {
    use super::Database;
    use serde_json::json;
    use tempfile::tempdir;

    fn database() -> Database {
        let directory = tempdir().expect("temporary directory");
        let path = directory.path().join("repository.sqlite3");
        let database = Database::new(path).expect("database should initialize");
        std::mem::forget(directory);
        database
    }

    #[test]
    fn profile_contract_saves_updates_and_lists_newest_first() {
        let database = database();
        database
            .save_profile(&json!({
                "id": "profile-a",
                "displayName": "امیر",
                "persianName": "امیر",
                "uiLocale": "fa",
                "createdAt": "2026-07-31T18:00:00.000Z",
                "updatedAt": "2026-07-31T18:00:00.000Z"
            }))
            .expect("first profile");
        database
            .save_profile(&json!({
                "id": "profile-b",
                "displayName": "لیا",
                "persianName": "لیا",
                "uiLocale": "fa",
                "createdAt": "2026-07-31T18:01:00.000Z",
                "updatedAt": "2026-07-31T18:02:00.000Z"
            }))
            .expect("second profile");

        let profiles = database.list_profiles().expect("profiles");
        assert_eq!(profiles.len(), 2);
        assert_eq!(profiles[0]["id"], "profile-b");
    }

    #[test]
    fn session_contract_finds_by_id_and_latest_active_session() {
        let database = database();
        let active = json!({
            "id": "session-active",
            "profileId": "profile-a",
            "logicalName": "امیر",
            "graphemes": ["ا", "م", "ی", "ر"],
            "layout": "cumulative-name",
            "stage": "practice",
            "status": "active",
            "currentIndex": 1,
            "attempts": [],
            "draftStrokes": [],
            "createdAt": "2026-07-31T18:00:00.000Z",
            "updatedAt": "2026-07-31T18:04:00.000Z"
        });
        let completed = json!({
            "id": "session-completed",
            "profileId": "profile-a",
            "logicalName": "لیا",
            "graphemes": ["ل", "ی", "ا"],
            "layout": "cumulative-name",
            "stage": "result",
            "status": "completed",
            "currentIndex": 2,
            "attempts": [],
            "draftStrokes": [],
            "createdAt": "2026-07-31T17:00:00.000Z",
            "updatedAt": "2026-07-31T18:05:00.000Z"
        });
        database.save_session(&active).expect("active session");
        database
            .save_session(&completed)
            .expect("completed session");

        assert_eq!(
            database
                .find_session("session-completed")
                .expect("find session")
                .expect("session exists")["status"],
            "completed"
        );
        assert_eq!(
            database
                .find_active_session()
                .expect("find active")
                .expect("active exists")["id"],
            "session-active"
        );
    }

    #[test]
    fn invalid_payloads_are_rejected_before_sql_write() {
        let database = database();
        let error = database
            .save_session(&json!({ "id": "missing-status" }))
            .expect_err("invalid payload should fail");
        assert!(error.contains("status") || error.contains("updatedAt"));
    }
}
