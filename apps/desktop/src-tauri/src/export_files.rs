use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::{AppHandle, Manager};

const MAX_EXPORT_BYTES: usize = 50 * 1024 * 1024;
const ALLOWED_EXTENSIONS: &[&str] = &["svg", "png", "pdf"];

#[tauri::command]
pub fn write_export_file(path: String, bytes: Vec<u8>) -> Result<String, String> {
    let destination = PathBuf::from(path);
    validate_export_path(&destination, bytes.len())?;
    fs::write(&destination, bytes).map_err(error_string)?;
    Ok(destination.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn cache_export_file(
    app: AppHandle,
    file_name: String,
    bytes: Vec<u8>,
) -> Result<String, String> {
    let safe_name = validate_file_name(&file_name)?;
    if bytes.len() > MAX_EXPORT_BYTES {
        return Err("Export file is larger than the allowed limit.".to_string());
    }
    let directory = app.path().app_cache_dir().map_err(error_string)?.join("exports");
    fs::create_dir_all(&directory).map_err(error_string)?;
    let destination = directory.join(safe_name);
    validate_export_path(&destination, bytes.len())?;
    fs::write(&destination, bytes).map_err(error_string)?;
    Ok(destination.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn print_export(path: String) -> Result<(), String> {
    let source = PathBuf::from(path);
    validate_print_path(&source)?;

    #[cfg(target_os = "windows")]
    let status = Command::new("powershell.exe")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            "Start-Process",
            "-FilePath",
            &source.to_string_lossy(),
            "-Verb",
            "Print",
        ])
        .status()
        .map_err(error_string)?;

    #[cfg(any(target_os = "macos", target_os = "linux"))]
    let status = Command::new("lp")
        .arg(&source)
        .status()
        .map_err(|error| format!("The operating system print command is unavailable: {error}"))?;

    if status.success() {
        Ok(())
    } else {
        Err(format!("The operating system print command exited with {status}."))
    }
}

fn validate_export_path(path: &Path, byte_length: usize) -> Result<(), String> {
    if byte_length == 0 {
        return Err("Export file is empty.".to_string());
    }
    if byte_length > MAX_EXPORT_BYTES {
        return Err("Export file is larger than the allowed limit.".to_string());
    }
    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .map(str::to_ascii_lowercase)
        .ok_or_else(|| "Export file requires an extension.".to_string())?;
    if !ALLOWED_EXTENSIONS.contains(&extension.as_str()) {
        return Err("Unsupported export file extension.".to_string());
    }
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            return Err("The selected export directory does not exist.".to_string());
        }
    }
    Ok(())
}

fn validate_print_path(path: &Path) -> Result<(), String> {
    if !path.is_file() {
        return Err("The PDF selected for printing does not exist.".to_string());
    }
    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or_default();
    if !extension.eq_ignore_ascii_case("pdf") {
        return Err("Only generated PDF files can be sent to the native printer.".to_string());
    }
    Ok(())
}

fn validate_file_name(file_name: &str) -> Result<&str, String> {
    let path = Path::new(file_name);
    if file_name.is_empty()
        || path.file_name().and_then(|value| value.to_str()) != Some(file_name)
        || file_name.contains(['/', '\\'])
    {
        return Err("Export file name is invalid.".to_string());
    }
    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .map(str::to_ascii_lowercase)
        .ok_or_else(|| "Export file requires an extension.".to_string())?;
    if !ALLOWED_EXTENSIONS.contains(&extension.as_str()) {
        return Err("Unsupported export file extension.".to_string());
    }
    Ok(file_name)
}

fn error_string(error: impl std::fmt::Display) -> String {
    error.to_string()
}

#[cfg(test)]
mod tests {
    use super::{validate_export_path, validate_file_name, MAX_EXPORT_BYTES};
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn accepts_supported_simple_file_names() {
        assert_eq!(validate_file_name("امیر-writing.pdf"), Ok("امیر-writing.pdf"));
        assert!(validate_file_name("../secret.pdf").is_err());
        assert!(validate_file_name("result.exe").is_err());
    }

    #[test]
    fn rejects_empty_and_oversized_exports() {
        let directory = tempdir().expect("temporary directory");
        let path = directory.path().join("result.png");
        assert!(validate_export_path(&path, 0).is_err());
        assert!(validate_export_path(&path, MAX_EXPORT_BYTES + 1).is_err());
    }

    #[test]
    fn writes_only_to_existing_selected_directories() {
        let directory = tempdir().expect("temporary directory");
        let path = directory.path().join("result.svg");
        assert!(validate_export_path(&path, 10).is_ok());
        fs::remove_dir_all(directory.path()).expect("remove directory");
        assert!(validate_export_path(&path, 10).is_err());
    }
}
