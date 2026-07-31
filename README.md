# Persian Name Writing App

Offline-first application for teaching children to write their own Persian name.

## Repository

- `apps/client`: Vue 3 + TypeScript + Vite static SPA.
- `apps/desktop`: Tauri 2 shell loading the same client.
- `apps/api`: optional Laravel JSON API.
- `packages/*`: framework-independent domain and shared packages.

## Requirements

- Node.js 20.19+
- pnpm 10
- PHP 8.3+ and Composer 2 for the optional API
- Rust stable and Tauri prerequisites for desktop development

## JavaScript setup

```bash
corepack enable
pnpm install
pnpm check
pnpm build
pnpm test:e2e
```

Start the web client:

```bash
pnpm dev
```

Start the desktop shell after installing Rust/Tauri prerequisites:

```bash
pnpm dev:desktop
```

## Laravel API setup

```bash
cd apps/api
composer install
cp .env.example .env
php artisan key:generate
php artisan test
php artisan serve
```

Health endpoint: `GET /api/health`.

The offline child activity must never require the Laravel service.
