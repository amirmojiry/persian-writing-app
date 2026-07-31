# نام‌نویس فارسی

یک برنامه آفلاین و کودک‌پسند برای نمایش نقش حروف فارسی در نام‌ها. برنامه متن را به یونیکد منطقی نگه می‌دارد و مشخص می‌کند هر حرف در حالت جدا، آغازین، میانی یا پایانی قرار دارد.

## نسخه وب

GitHub Pages پس از اولین اجرای موفق workflow در این آدرس منتشر می‌شود:

`https://amirmojiry.github.io/persian-writing-app/`

نسخه وب یک PWA است. فایل Vue هنگام build به‌صورت محلی داخل خروجی قرار می‌گیرد؛ بنابراین پس از اولین بارگذاری، برنامه می‌تواند بدون شبکه اجرا شود.

## اجرای محلی

پیش‌نیاز: Node.js 20 یا جدیدتر.

```bash
npm run dev
```

این دستور نسخه ثابت و pin‌شده Vue را دریافت می‌کند و سرور توسعه را روی پورت `1420` اجرا می‌کند.

## بررسی کیفیت

پیش‌نیاز typecheck: TypeScript 5.9 یا جدیدتر روی سیستم.

```bash
npm run check
```

این دستور strict type checking، تست‌های رفتار حروف فارسی و build نسخه وب را اجرا می‌کند.

## نسخه دسکتاپ

پروژه با Tauri 2 بسته‌بندی می‌شود. برای اجرای محلی، پیش‌نیازهای Tauri و CLI آن را نصب کنید، سپس:

```bash
npm run tauri -- dev
```

برای ساخت روی سیستم فعلی:

```bash
npm run tauri -- build
```

GitHub Actions فایل‌های نصب Windows، macOS و Linux را با هر نسخه جدید در بخش GitHub Releases منتشر می‌کند. جزئیات در [`docs/RELEASING.md`](docs/RELEASING.md) آمده است.

## معماری

- Vue 3 به‌صورت self-hosted و static SPA
- JavaScript با strict TypeScript checking از طریق `checkJs`
- Tauri 2 برای بسته دسکتاپ
- Service Worker و Web App Manifest برای PWA آفلاین
- منطق فارسی مستقل از Vue و Tauri در `src/domain`
- پردازش کاملاً محلی؛ هیچ نامی به سرور ارسال نمی‌شود
