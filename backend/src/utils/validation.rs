use validator::ValidationErrors;

pub fn format_validation_errors(errors: &ValidationErrors) -> String {
    let error_messages: Vec<String> = errors
        .field_errors()
        .iter()
        .map(|(field, errors)| {
            format!("{}: {}", field, errors[0].message.as_ref().unwrap_or(&"Invalid value".into()))
        })
        .collect();
    
    error_messages.join(", ")
}