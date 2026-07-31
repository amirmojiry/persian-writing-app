# نام‌نویس فارسی

یک برنامه آفلاین و کودک‌پسند برای تمرین نوشتن نام فارسی. کودک از یک ورودی جادویی وارد می‌شود، نام خود را با صفحه‌کلید فارسی ثبت می‌کند، هر حرف را با ماوس، قلم یا لمس می‌نویسد و در پایان ترکیب SVG قابل چاپ را می‌بیند.

## وضعیت

- نسخه فعلی: `0.2.0`
- Milestone 0: زیرساخت monorepo، Vue، Tauri و Laravel
- Milestone 1: جریان کامل آفلاین کودک، Pointer Events، IndexedDB و چاپ SVG
- مرحله بعد: قواعد پیوستگی و شکل‌های متنی فارسی

## نسخه وب

پس از موفقیت workflow مربوط به Pages:

`https://amirmojiry.github.io/persian-writing-app/`

نسخه تولیدی فایل‌های لازم را در Service Worker precache می‌کند و پس از اولین بارگذاری موفق بدون شبکه نیز اجرا می‌شود.

## اجرای محلی

پیش‌نیاز: Node.js 20.19 یا جدیدتر و pnpm 10.14.

```bash
pnpm install
pnpm dev
```

## بررسی کیفیت

```bash
pnpm check
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

بررسی‌های Milestone 1 شامل state machine، نرمال‌سازی stroke، composition SVG، repository contract، کیبورد فارسی، Pointer adapter و سناریوی resume در IndexedDB است.

## نسخه دسکتاپ

پوسته Tauri 2 همان client آفلاین را اجرا می‌کند:

```bash
pnpm dev:desktop
```

ساخت installerهای رسمی و persistence مبتنی بر SQLite در Milestone 4 تکمیل می‌شود. تا آن زمان، desktop build از IndexedDB داخل WebView استفاده می‌کند.

## حریم خصوصی و معماری

- تمام جریان کودک بدون Laravel و حساب کاربری کار می‌کند.
- داده‌ها به‌صورت پیش‌فرض فقط در دستگاه ذخیره می‌شوند.
- متن نام به‌صورت Unicode منطقی NFC ذخیره می‌شود، نه Arabic Presentation Forms.
- Vue و domain هیچ import مستقیمی از Tauri ندارند.
- mouse، pen و touch از یک Pointer Events adapter استفاده می‌کنند.
