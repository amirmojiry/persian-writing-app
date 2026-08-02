import type { UiLocale } from '@persian-writing/core';

export interface AdminMessages {
  readonly title: string;
  readonly setupPin: string;
  readonly enterPin: string;
  readonly unlock: string;
  readonly lock: string;
  readonly save: string;
  readonly settings: string;
  readonly timedMode: string;
  readonly timeLimit: string;
  readonly lockTimedMode: string;
  readonly cloud: string;
  readonly loadSessions: string;
  readonly exportCsv: string;
  readonly exportJson: string;
  readonly forwarding: string;
  readonly endpoint: string;
  readonly enabled: string;
  readonly statusReady: string;
  readonly statusSaved: string;
  readonly statusDenied: string;
  readonly statusFailed: string;
}

export const adminMessages: Record<UiLocale, AdminMessages> = {
  fa: {
    title: 'مدیریت', setupPin: 'ایجاد PIN مدیر (۶ تا ۱۲ رقم)', enterPin: 'PIN مدیر',
    unlock: 'ورود به مدیریت', lock: 'خروج از مدیریت', save: 'ذخیره', settings: 'تنظیمات دستگاه',
    timedMode: 'تمرین زمان‌دار پیش‌فرض', timeLimit: 'زمان پیش‌فرض (ثانیه)',
    lockTimedMode: 'جلوگیری از تغییر حالت زمان‌دار توسط کاربر', cloud: 'مدیریت ابری',
    loadSessions: 'بارگذاری نشست‌ها', exportCsv: 'خروجی CSV', exportJson: 'خروجی JSON',
    forwarding: 'ارسال به سرویس خارجی', endpoint: 'نشانی HTTPS سرویس', enabled: 'فعال',
    statusReady: 'حالت مدیریت باز است.', statusSaved: 'تنظیمات ذخیره شد.',
    statusDenied: 'PIN نادرست است.', statusFailed: 'عملیات مدیریت انجام نشد.'
  },
  en: {
    title: 'Administration', setupPin: 'Create administrator PIN (6–12 digits)', enterPin: 'Administrator PIN',
    unlock: 'Unlock administration', lock: 'Lock administration', save: 'Save', settings: 'Device defaults',
    timedMode: 'Default timed practice', timeLimit: 'Default time limit (seconds)',
    lockTimedMode: 'Prevent users from changing timed mode', cloud: 'Cloud administration',
    loadSessions: 'Load sessions', exportCsv: 'Export CSV', exportJson: 'Export JSON',
    forwarding: 'External forwarding', endpoint: 'HTTPS endpoint', enabled: 'Enabled',
    statusReady: 'Administration is unlocked.', statusSaved: 'Settings saved.',
    statusDenied: 'The PIN is incorrect.', statusFailed: 'Administration operation failed.'
  },
  fi: {
    title: 'Hallinta', setupPin: 'Luo ylläpitäjän PIN (6–12 numeroa)', enterPin: 'Ylläpitäjän PIN',
    unlock: 'Avaa hallinta', lock: 'Lukitse hallinta', save: 'Tallenna', settings: 'Laitteen oletukset',
    timedMode: 'Ajastettu harjoittelu oletuksena', timeLimit: 'Oletusaika sekunteina',
    lockTimedMode: 'Estä ajastuksen muuttaminen', cloud: 'Pilvihallinta',
    loadSessions: 'Lataa harjoitukset', exportCsv: 'Vie CSV', exportJson: 'Vie JSON',
    forwarding: 'Ulkoinen välitys', endpoint: 'HTTPS-osoite', enabled: 'Käytössä',
    statusReady: 'Hallinta on avattu.', statusSaved: 'Asetukset tallennettiin.',
    statusDenied: 'PIN on väärä.', statusFailed: 'Hallintatoiminto epäonnistui.'
  }
};
