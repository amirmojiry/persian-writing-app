# Data model

## Local/cloud entities

### profiles
- id UUID
- owner_user_id nullable UUID
- display_name string
- name_fa nullable string (encrypt at rest in cloud when feasible)
- name_original_input nullable string
- preferred_ui_locale
- preferred_writing_language
- privacy_mode boolean
- created_at, updated_at, deleted_at

### writing_sessions
- id UUID
- profile_id UUID
- device_id UUID
- status: draft|active|completed|abandoned
- writing_text
- writing_text_hash
- ui_locale
- writing_language
- input_adapter
- app_version
- settings_snapshot JSON
- started_at, completed_at
- total_active_ms
- consent_snapshot JSON
- schema_version integer

### letter_attempts
- id UUID
- session_id UUID
- lesson_index integer
- logical_character
- contextual_form
- presentation_text
- started_at, ended_at
- active_ms
- timed_out boolean
- retry_index integer
- undo_count, clear_count
- metrics JSON

### strokes
- id UUID
- letter_attempt_id UUID
- sequence integer
- points compressed JSON/binary
- point_count
- path_length_normalized
- bbox JSON
- source

### app_events
- id UUID
- session_id nullable UUID
- profile_id nullable UUID
- event_name
- occurred_at
- payload JSON
- privacy_class: essential|learning|diagnostic

### settings
- scope_type: application|admin|user|profile|device
- scope_id nullable UUID
- key
- value JSON
- locked boolean

### sync_outbox
- id UUID
- aggregate_type
- aggregate_id
- operation
- payload JSON
- idempotency_key
- state: pending|sending|sent|failed|blocked_privacy
- attempts
- next_attempt_at
- last_error

### otp_challenges (server only)
- id UUID
- normalized_email
- code_hash
- expires_at
- attempts
- consumed_at
- request_ip_hash
- created_at

### admin_audit_logs (server only)
- id UUID
- actor_user_id
- action
- target_type, target_id
- metadata JSON
- occurred_at

## Event names
- wizard_check_viewed
- wizard_check_completed
- name_entry_started
- transliteration_candidate_selected
- lesson_started
- stroke_started
- stroke_completed
- lesson_undone
- lesson_cleared
- lesson_timed_out
- lesson_completed
- session_completed
- export_created
- share_requested
- sync_consent_changed
- camera_calibration_completed

Do not put raw stroke arrays into general analytics events; keep them in the stroke store.
