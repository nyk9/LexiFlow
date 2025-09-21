use tauri::Manager;

#[tauri::command]
async fn open_oauth_url(url: String) -> Result<(), String> {
    tauri_plugin_shell::open(&url, None::<&str>).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Register deep link handler for OAuth callbacks
            let handle = app.handle().clone();
            tauri_plugin_deep_link::register("lexiflow", move |request| {
                if let Some(url) = request.url().strip_prefix("lexiflow://oauth/callback") {
                    // Extract query parameters
                    if let Ok(parsed_url) = url::Url::parse(&format!("http://localhost{}", url)) {
                        let query_pairs: std::collections::HashMap<String, String> = 
                            parsed_url.query_pairs().into_owned().collect();
                        
                        if let (Some(code), Some(state)) = (query_pairs.get("code"), query_pairs.get("state")) {
                            // Emit an event to the frontend with the OAuth callback data
                            let _ = handle.emit("oauth-callback", serde_json::json!({
                                "code": code,
                                "state": state
                            }));
                        }
                    }
                }
            })?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![open_oauth_url])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
