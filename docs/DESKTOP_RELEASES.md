# Desktop persistence and release operations

## Runtime architecture

The web build remains a static Vue SPA and continues to use IndexedDB. When the same client detects the Tauri runtime it dynamically loads the desktop adapters:

- `TauriSqliteSessionRepository` calls Rust commands backed by `rusqlite`.
- `TauriResultDeliveryAdapter` uses the native save dialog, writes the selected file through a validated Rust command, sends generated PDFs to the operating-system print command, and opens a cached file with the default desktop application as the portable share fallback.
- `TauriWindowModeAdapter` controls fullscreen, decorations and always-on-top state for kiosk use.

No Tauri package is imported by `packages/core` or generic Vue components. Runtime-specific imports stay under `apps/client/src/adapters`.

## SQLite

The database is created in the Tauri application data directory as `writing-sessions.sqlite3`. Schema initialization is idempotent and currently stores canonical JSON snapshots in two indexed tables:

- `profiles(id, updated_at, payload)`
- `writing_sessions(id, status, updated_at, payload)`

This keeps the desktop adapter compatible with the existing repository contract while allowing future normalized tables and reversible migrations. Names remain logical NFC Unicode and vector stroke data never leaves the device in Milestone 4.

Run the Rust contract suite locally:

```bash
pnpm install
pnpm check:desktop
```

## Kiosk mode

Kiosk mode can be toggled from the desktop-only header button or with `Ctrl+Shift+K`. `Escape` exits kiosk mode. Starting the app with `?kiosk=1` enables it immediately. The preference is stored locally on that device.

Kiosk mode enables fullscreen and always-on-top and removes window decorations. Exiting restores normal decorations and window behavior.

## Installer workflow

`.github/workflows/desktop.yml` has two paths:

1. Pull requests and changes to desktop/runtime files run the web build plus `cargo fmt`, `cargo check` and `cargo test` on Ubuntu.
2. Manual runs or tags matching `desktop-v*` build platform bundles with `tauri-apps/tauri-action` on Windows, macOS and Linux and attach them to a GitHub release.

The workflow can produce unsigned development installers without repository secrets. Public distribution should not be labeled signed until the platform credentials below have been configured and a release artifact has been verified on a clean machine.

## Code signing prerequisites

### macOS

Configure an Apple Developer ID Application certificate and notarization credentials in GitHub Actions. Recommended secret names:

- `APPLE_CERTIFICATE`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`
- `APPLE_PASSWORD`
- `APPLE_TEAM_ID`

Verify both the `.app` signature and notarized `.dmg` before publishing.

### Windows

Choose a trusted Authenticode certificate provider. Configure Tauri's Windows signing settings or a controlled `signCommand`, store the certificate/private-key material only in encrypted GitHub secrets, and timestamp every signature. Verify the MSI/NSIS signature on a clean Windows runner before publishing.

### Linux

Publish checksums for AppImage/deb artifacts. Package signing depends on the selected distribution channel and should be added when that channel is selected.

## Update strategy

The intended production update channel is GitHub Releases:

1. Generate a dedicated Tauri updater signing key offline.
2. Commit only the public key in `tauri.conf.json`.
3. Store `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` in GitHub Actions secrets.
4. Enable `bundle.createUpdaterArtifacts` and the updater plugin.
5. Configure the endpoint as `https://github.com/amirmojiry/persian-writing-app/releases/latest/download/latest.json`.
6. Release through the platform matrix so `tauri-action` generates signed update artifacts and `latest.json`.
7. Roll out update checking in a later UI change only after signatures and rollback behavior have been tested.

Version 0.6.0 deliberately documents but does not enable automatic updates because no updater public key or private signing secret is available yet. This avoids shipping an updater configuration that cannot verify releases.

## Release checklist

- `pnpm check` succeeds.
- `pnpm check:desktop` succeeds.
- Web/PWA flow still completes offline.
- SQLite resumes an interrupted desktop session.
- Save, print fallback and open/share fallback work on each target OS.
- Kiosk mode can always be exited with `Escape` or `Ctrl+Shift+K`.
- Installer signatures and checksums are verified independently.
- Release notes state whether artifacts are signed, notarized and updater-compatible.
