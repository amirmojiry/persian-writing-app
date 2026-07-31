mod database;
mod export_files;

use database::Database;
use serde_json::Value;
use tauri::{Manager, State};

#[tauri::command]
fn save_profile(database: State<'_, Database>, profile: Value) -> Result<(), String> {
    database.save_profile(&profile)
}

#[tauri::command]
fn list_profiles(database: State<'_, Database>) -> Result<Vec<Value>, String> {
    database.list_profiles()
}

#[tauri::command]
fn save_session(database: State<'_, Database>, session: Value) -> Result<(), String> {
    database.save_session(&session)
}

#[tauri::command]
fn find_session(database: State<'_, Database>, id: String) -> Result<Option<Value>, String> {
    database.find_session(&id)
}

#[tauri::command]
fn find_active_session(database: State<'_, Database>) -> Result<Option<Value>, String> {
    database.find_active_session()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let database_path = app
                .path()
                .app_data_dir()
                .map_err(|error| std::io::Error::new(std::io::ErrorKind::Other, error.to_string()))?
                .join("writing-sessions.sqlite3");
            let database = Database::new(database_path)
                .map_err(|error| std::io::Error::new(std::io::ErrorKind::Other, error))?;
            app.manage(database);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            save_profile,
            list_profiles,
            save_session,
            find_session,
            find_active_session,
            export_files::write_export_file,
            export_files::cache_export_file,
            export_files::print_export
        ])
        .run(tauri::generate_context!())
        .expect("error while running the desktop application");
}
