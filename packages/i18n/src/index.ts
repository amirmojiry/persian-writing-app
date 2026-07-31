export type UiLocale = 'fa' | 'en' | 'fi';

export interface MessageCatalog {
  readonly appName: string;
  readonly offlineReady: string;
  readonly localeLabel: string;
  readonly wizardTitle: string;
  readonly wizardQuestion: string;
  readonly wizardHint: string;
  readonly wizardSuccess: string;
  readonly nameTitle: string;
  readonly namePrompt: string;
  readonly namePlaceholder: string;
  readonly nameContinue: string;
  readonly keyboardBackspace: string;
  readonly keyboardSpace: string;
  readonly readyTitle: string;
  readonly readyBody: string;
  readonly readyStart: string;
  readonly practiceTitle: string;
  readonly practiceLetter: string;
  readonly unlimitedTime: string;
  readonly next: string;
  readonly drawFirst: string;
  readonly resultTitle: string;
  readonly resultBody: string;
  readonly print: string;
  readonly startAgain: string;
  readonly resumeNotice: string;
  readonly loading: string;
  readonly audioLabel: string;
}

export const messages: Record<UiLocale, MessageCatalog> = {
  fa: {
    appName: 'نام‌نویس فارسی',
    offlineReady: 'آماده برای استفاده آفلاین',
    localeLabel: 'زبان رابط',
    wizardTitle: 'دروازه جادویی',
    wizardQuestion: 'آیا تو یک جادوگر هستی؟',
    wizardHint: 'روی ستاره جادویی بزن تا وارد شوی.',
    wizardSuccess: 'آفرین جادوگر کوچولو!',
    nameTitle: 'اسمت را بنویس',
    namePrompt: 'با صفحه‌کلید فارسی، نام درستت را وارد کن.',
    namePlaceholder: 'مثلاً لیا',
    nameContinue: 'درست است، ادامه بده',
    keyboardBackspace: 'پاک کردن',
    keyboardSpace: 'فاصله',
    readyTitle: 'آماده‌ای؟',
    readyBody: 'حالا هر حرف اسمت را با انگشت، قلم یا ماوس می‌نویسیم.',
    readyStart: 'شروع کنیم',
    practiceTitle: 'این حرف را بنویس',
    practiceLetter: 'حرف',
    unlimitedTime: 'هرچقدر لازم داری وقت داری.',
    next: 'حرف بعدی',
    drawFirst: 'اول یک خط بکش.',
    resultTitle: 'اسمت را نوشتی!',
    resultBody: 'این نوشته‌ی خود توست.',
    print: 'چاپ',
    startAgain: 'دوباره بنویس',
    resumeNotice: 'تمرین قبلی‌ات از همان‌جا ادامه پیدا کرد.',
    loading: 'در حال آماده‌سازی…',
    audioLabel: 'پخش راهنمای صوتی'
  },
  en: {
    appName: 'Persian Name Writer',
    offlineReady: 'Ready for offline use',
    localeLabel: 'Interface language',
    wizardTitle: 'Magic gate',
    wizardQuestion: 'Are you a wizard?',
    wizardHint: 'Tap the magic star to enter.',
    wizardSuccess: 'Great job, little wizard!',
    nameTitle: 'Write your name',
    namePrompt: 'Use the Persian keyboard to enter the correct spelling.',
    namePlaceholder: 'For example, Lia',
    nameContinue: 'That is right, continue',
    keyboardBackspace: 'Backspace',
    keyboardSpace: 'Space',
    readyTitle: 'Ready?',
    readyBody: 'Now we will write every letter with a finger, pen, or mouse.',
    readyStart: 'Let’s start',
    practiceTitle: 'Write this letter',
    practiceLetter: 'Letter',
    unlimitedTime: 'Take all the time you need.',
    next: 'Next letter',
    drawFirst: 'Draw one stroke first.',
    resultTitle: 'You wrote your name!',
    resultBody: 'This is your own handwriting.',
    print: 'Print',
    startAgain: 'Write again',
    resumeNotice: 'Your previous activity resumed where you left it.',
    loading: 'Getting ready…',
    audioLabel: 'Play audio guidance'
  },
  fi: {
    appName: 'Persialaisen nimen kirjoittaja',
    offlineReady: 'Valmis offline-käyttöön',
    localeLabel: 'Käyttöliittymän kieli',
    wizardTitle: 'Taikaportti',
    wizardQuestion: 'Oletko velho?',
    wizardHint: 'Napauta taikatähteä päästäksesi sisään.',
    wizardSuccess: 'Hienoa, pieni velho!',
    nameTitle: 'Kirjoita nimesi',
    namePrompt: 'Kirjoita oikea nimi persialaisella näppäimistöllä.',
    namePlaceholder: 'Esimerkiksi Lia',
    nameContinue: 'Oikein, jatka',
    keyboardBackspace: 'Poista',
    keyboardSpace: 'Välilyönti',
    readyTitle: 'Valmis?',
    readyBody: 'Kirjoitetaan jokainen kirjain sormella, kynällä tai hiirellä.',
    readyStart: 'Aloitetaan',
    practiceTitle: 'Kirjoita tämä kirjain',
    practiceLetter: 'Kirjain',
    unlimitedTime: 'Saat käyttää niin paljon aikaa kuin tarvitset.',
    next: 'Seuraava kirjain',
    drawFirst: 'Piirrä ensin yksi viiva.',
    resultTitle: 'Kirjoitit nimesi!',
    resultBody: 'Tämä on oma käsialasi.',
    print: 'Tulosta',
    startAgain: 'Kirjoita uudelleen',
    resumeNotice: 'Edellinen harjoitus jatkui siitä, mihin jäit.',
    loading: 'Valmistellaan…',
    audioLabel: 'Toista ääniohje'
  }
};

export function localeDirection(locale: UiLocale): 'rtl' | 'ltr' {
  return locale === 'fa' ? 'rtl' : 'ltr';
}
