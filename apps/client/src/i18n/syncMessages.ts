import type { UiLocale } from '@persian-writing/core';

export interface SyncMessages {
  readonly title: string;
  readonly localOnly: string;
  readonly enable: string;
  readonly email: string;
  readonly sendCode: string;
  readonly code: string;
  readonly signIn: string;
  readonly signOut: string;
  readonly signedIn: string;
  readonly pending: string;
  readonly synced: string;
  readonly failed: string;
}

export const syncMessages: Record<UiLocale, SyncMessages> = {
  fa: {
    title: 'حریم خصوصی و همگام‌سازی', localOnly: 'داده‌ها فقط روی این دستگاه می‌مانند.',
    enable: 'همگام‌سازی حساب را فعال کن', email: 'ایمیل بزرگسال', sendCode: 'ارسال کد',
    code: 'کد چهاررقمی', signIn: 'ورود', signOut: 'خروج', signedIn: 'وارد شده با',
    pending: 'برای همگام‌سازی ابتدا وارد شوید.', synced: 'داده‌های مجاز همگام شدند.', failed: 'همگام‌سازی انجام نشد.'
  },
  en: {
    title: 'Privacy and sync', localOnly: 'Data stays on this device only.',
    enable: 'Enable account synchronization', email: 'Adult email', sendCode: 'Send code',
    code: 'Four-digit code', signIn: 'Sign in', signOut: 'Sign out', signedIn: 'Signed in as',
    pending: 'Sign in before synchronizing.', synced: 'Eligible data synchronized.', failed: 'Synchronization failed.'
  },
  fi: {
    title: 'Tietosuoja ja synkronointi', localOnly: 'Tiedot säilyvät vain tällä laitteella.',
    enable: 'Ota tilin synkronointi käyttöön', email: 'Aikuisen sähköposti', sendCode: 'Lähetä koodi',
    code: 'Neljä numeroa', signIn: 'Kirjaudu', signOut: 'Kirjaudu ulos', signedIn: 'Kirjautunut:',
    pending: 'Kirjaudu ennen synkronointia.', synced: 'Sallitut tiedot synkronoitiin.', failed: 'Synkronointi epäonnistui.'
  }
};
