# نام‌نویس فارسی

یک برنامه آفلاین و کودک‌پسند برای تمرین نوشتن نام فارسی است. کودک نام خود را با صفحه‌کلید فارسی وارد می‌کند، حروف را با ماوس، قلم یا لمس می‌نویسد و در پایان می‌تواند نتیجه را بازپخش، چاپ یا به‌صورت SVG، PNG و PDF ذخیره کند.

## وضعیت فعلی

- نسخه فعلی: `0.6.0`
- Milestone 0: زیرساخت monorepo، Vue 3، TypeScript، Tauri 2 و Laravel اختیاری
- Milestone 1: جریان کامل آفلاین کودک، Pointer Events، IndexedDB و بازیابی جلسه
- Milestone 2: شکل‌های متنی وابسته به موقعیت حروف فارسی و تنظیمات تمرین
- Milestone 3: تمرین زمان‌دار، undo/clear/retry، بازپخش و خروجی SVG/PNG/PDF
- Milestone 4: SQLite بومی دسکتاپ، مهاجرت داده‌های قبلی، ذخیره و چاپ بومی، kiosk و workflow ساخت installer

Milestone 4 تکمیل و روی شاخه `main` ادغام شده است. مرحله بعد هنوز در برنامه پیاده‌سازی تعریف نشده و باید پیش از توسعه مشخص شود.

## نسخه وب

نسخه وب از این نشانی در دسترس است:

`https://amirmojiry.github.io/persian-writing-app/`

نسخه تولیدی فایل‌های لازم را در Service Worker precache می‌کند و پس از اولین بارگذاری موفق، جریان اصلی کودک بدون شبکه نیز اجرا می‌شود. داده‌ها در نسخه وب داخل IndexedDB باقی می‌مانند.

## اجرای محلی

پیش‌نیازها:

- Node.js 20.19 یا جدیدتر
- pnpm 10.14

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

بررسی کامل شامل آزمون‌های Milestoneهای 0 تا 4، قواعد پیوستگی فارسی، repository contract، Vue، TypeScript، lint و سناریوهای Playwright است.

## نسخه دسکتاپ

پوسته Tauri 2 همان client آفلاین را اجرا می‌کند:

```bash
pnpm dev:desktop
```

بررسی Rust و SQLite:

```bash
pnpm check:desktop
```

ساخت bundle دسکتاپ:

```bash
pnpm build:desktop
```

در محیط Tauri:

- داده‌های profile و session در SQLite محلی ذخیره می‌شوند.
- داده‌های قبلی IndexedDB یک‌بار به SQLite منتقل می‌شوند.
- ذخیره فایل از native Save dialog استفاده می‌کند.
- چاپ PDF و بازکردن فایل از adapterهای بومی سیستم‌عامل استفاده می‌کنند.
- kiosk/fullscreen از دکمه رابط کاربری، `Ctrl+Shift+K` یا پارامتر `?kiosk=1` قابل فعال‌سازی است.
- کلید `Escape` از kiosk خارج می‌شود.

## انتشار دسکتاپ

workflow فایل `.github/workflows/desktop.yml` موارد زیر را انجام می‌دهد:

- روی pull requestها: build وب، `cargo fmt`، `cargo check` و `cargo test`
- روی اجرای دستی یا tagهای `desktop-v*`: ساخت bundle برای Windows، macOS و Linux

ساخت installer تنظیم شده است، اما انتشار عمومیِ امضاشده هنوز به certificateها، notarization و secrets مربوط به هر پلتفرم نیاز دارد. updater خودکار نیز تا زمان آماده‌شدن کلید امضای Tauri عمداً فعال نشده است. جزئیات در `docs/DESKTOP_RELEASES.md` آمده است.

## حریم خصوصی و معماری

- تمام جریان کودک بدون Laravel، حساب کاربری یا شبکه کار می‌کند.
- داده‌ها به‌صورت پیش‌فرض فقط روی دستگاه ذخیره می‌شوند.
- متن نام به‌صورت Unicode منطقی NFC ذخیره می‌شود، نه Arabic Presentation Forms.
- Vue و domain هیچ import مستقیمی از Tauri ندارند.
- ویژگی‌های runtime پشت port و adapter قرار دارند.
- mouse، pen و touch از یک Pointer Events adapter مشترک استفاده می‌کنند.
- همگام‌سازی حساب، OTP، پنل مدیریت و ورودی دوربین هنوز خارج از محدوده نسخه `0.6.0` هستند.
