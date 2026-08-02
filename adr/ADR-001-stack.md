# ADR-001: Static Vue SPA + Tauri shell + optional Laravel API

Status: Accepted

## Context
The application must launch like a desktop program without asking the user to install or start PHP/web-server infrastructure, while the same product must also be deployable on a domain. The developer knows Laravel, Vue, Inertia and Tailwind.

## Decision
Use a Vue 3 TypeScript SPA built by Vite as the shared client. Package it with Tauri 2 for desktop. Deploy the same static build as a PWA/web app. Use Laravel only as an optional remote JSON API for authentication, synchronization, administration and email/export jobs.

## Consequences
- Inertia is not used because it couples page delivery to a running Laravel server.
- Core/offline features cannot depend on the API.
- Runtime-specific capabilities use ports/adapters.
- Vue/Tailwind/Laravel/Pest expertise remains directly useful.
- Rust is limited to Tauri configuration/commands and plugins unless a native feature requires more.
