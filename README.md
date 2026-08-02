# نام‌نویس فارسی

یک برنامه آفلاین و کودک‌پسند برای تمرین نوشتن نام فارسی است. کودک نام خود را با صفحه‌کلید فارسی وارد می‌کند، حروف را با ماوس، قلم یا لمس می‌نویسد و در پایان می‌تواند نتیجه را بازپخش، چاپ یا به‌صورت SVG، PNG و PDF ذخیره کند.

## وضعیت فعلی

- نسخه فعلی: `0.8.0`
- Milestone 0: زیرساخت monorepo، Vue 3، TypeScript، Tauri 2 و Laravel اختیاری
- Milestone 1: جریان کامل آفلاین کودک، Pointer Events، IndexedDB و بازیابی جلسه
- Milestone 2: شکل‌های متنی وابسته به موقعیت حروف فارسی و تنظیمات تمرین
- Milestone 3: تمرین زمان‌دار، ابزارهای ویرایش، بازپخش و خروجی SVG/PNG/PDF
- Milestone 4: SQLite بومی دسکتاپ، مهاجرت داده‌ها، ذخیره و چاپ بومی، kiosk و ساخت installer
- Milestone 5: ورود با OTP، Sanctum، رضایت حریم خصوصی، outbox و sync idempotent
- Milestone 6: مدیریت محلی با PIN، مدیریت ابری، فیلتر نشست‌ها، export صف‌شده، forwarding و audit log

Milestone 6 روی شاخه توسعه پیاده‌سازی شده و پس از عبور کامل CI وارد `main` می‌شود. جریان کودک همچنان بدون حساب، API، مدیر یا شبکه کار می‌کند.

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

بررسی کامل شامل verifierهای Milestoneهای 0 تا 6، قواعد پیوستگی فارسی، repository contractها، Vue، TypeScript، lint، آزمون‌های مدیریت و سناریوهای Playwright است.

## مدیریت محلی

کنترل «مدیریت» به‌صورت آشکار در header قرار دارد و route مخفی وجود ندارد. در اولین استفاده، بزرگسال یک PIN شش تا دوازده‌رقمی تعیین می‌کند. فقط مشتق salted و محاسبه‌شده با PBKDF2 ذخیره می‌شود، نه خود PIN.

مدیر محلی می‌تواند:

- پیش‌فرض‌های تمرین را تعیین کند.
- گزینه‌های آموزشی منتخب را قفل کند.
- بدون نیاز به Laravel یا شبکه از تنظیمات دستگاه استفاده کند.

انتخاب‌های حریم خصوصی و رضایت sync جزو تنظیمات قابل قفل نیستند.

## مدیریت ابری

مدیریت ابری فقط برای کاربری فعال است که در سرور `is_admin` باشد. حتی وجود ability مدیریتی در token بدون نقش سروری کافی نیست.

قابلیت‌ها:

- فیلتر و مشاهده جزئیات نشست‌های همگام‌شده
- درخواست خروجی CSV یا JSON به‌صورت asynchronous
- تنظیم endpoint خارجی با secret رمزگذاری‌شده
- مشاهده failure و retryهای forwarding
- audit log برای مشاهده داده، export و تغییرات forwarding

برای پردازش export و forwarding در محیط API باید queue worker اجرا شود:

```bash
cd apps/api
php artisan queue:work
```

## نسخه دسکتاپ

پوسته Tauri 2 همان client آفلاین را اجرا می‌کند:

```bash
pnpm dev:desktop
pnpm check:desktop
pnpm build:desktop
```

در محیط Tauri:

- profile و session در SQLite محلی ذخیره می‌شوند.
- داده‌های قبلی IndexedDB یک‌بار به SQLite منتقل می‌شوند.
- ذخیره فایل، چاپ PDF و بازکردن فایل از adapterهای بومی استفاده می‌کنند.
- kiosk/fullscreen از رابط کاربری، `Ctrl+Shift+K` یا `?kiosk=1` فعال می‌شود.
- کلید `Escape` از kiosk خارج می‌شود.

## انتشار دسکتاپ

workflow فایل `.github/workflows/desktop.yml` روی pull requestها build وب و بررسی‌های Rust را اجرا می‌کند و روی اجرای دستی یا tagهای `desktop-v*` bundleهای Windows، macOS و Linux را می‌سازد. انتشار عمومی امضاشده هنوز به certificateها، notarization و secrets هر پلتفرم نیاز دارد. updater نیز تا آماده‌شدن کلید امضای Tauri عمداً غیرفعال است.

## حریم خصوصی و معماری

- تمام جریان کودک بدون Laravel، حساب کاربری، مدیریت یا شبکه کار می‌کند.
- داده‌ها به‌صورت پیش‌فرض فقط روی دستگاه ذخیره می‌شوند.
- forwarding هر آیتم را دوباره بر اساس consent snapshot بررسی می‌کند.
- رویدادهای یادگیری بدون رضایت `learningAnalytics` ارسال نمی‌شوند.
- متن نام به‌صورت Unicode منطقی NFC ذخیره می‌شود، نه Arabic Presentation Forms.
- Vue و domain هیچ import مستقیمی از Tauri ندارند.
- ویژگی‌های runtime پشت port و adapter قرار دارند.
- mouse، pen و touch از یک Pointer Events adapter مشترک استفاده می‌کنند.
- ورودی دوربین/light-wand و بسته‌های نوشتاری لاتین هنوز خارج از محدوده نسخه `0.8.0` هستند.
