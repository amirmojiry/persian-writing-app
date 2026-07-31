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
  readonly settingsTitle: string;
  readonly settingsHint: string;
  readonly practiceModeLabel: string;
  readonly traceMode: string;
  readonly traceModeHint: string;
  readonly referenceMode: string;
  readonly referenceModeHint: string;
  readonly timedModeLabel: string;
  readonly timedModeHint: string;
  readonly timeLimitLabel: string;
  readonly seconds: string;
  readonly guidelineStyleLabel: string;
  readonly guidelineNone: string;
  readonly guidelineBaseline: string;
  readonly guidelineThreeLine: string;
  readonly guidelineGrid: string;
  readonly guidelineOpacityLabel: string;
  readonly guidelineThicknessLabel: string;
  readonly baselinePositionLabel: string;
  readonly sampleFontLabel: string;
  readonly fontPersianSans: string;
  readonly fontSystemSans: string;
  readonly fontSystemSerif: string;
  readonly practiceTitle: string;
  readonly practiceLetter: string;
  readonly unlimitedTime: string;
  readonly next: string;
  readonly drawFirst: string;
  readonly undo: string;
  readonly clear: string;
  readonly retry: string;
  readonly timeUpTitle: string;
  readonly timeUpBody: string;
  readonly tryAgain: string;
  readonly resultTitle: string;
  readonly resultBody: string;
  readonly replay: string;
  readonly print: string;
  readonly share: string;
  readonly preparing: string;
  readonly downloadStarted: string;
  readonly shareSuccess: string;
  readonly shareFallback: string;
  readonly exportFailed: string;
  readonly startAgain: string;
  readonly resumeNotice: string;
  readonly loading: string;
  readonly audioLabel: string;
  readonly timerWarningCue: string;
  readonly timeUpCue: string;
  readonly undoCue: string;
  readonly clearCue: string;
  readonly retryCue: string;
  readonly replayCue: string;
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
    settingsTitle: 'تنظیم تمرین',
    settingsHint: 'بزرگسال می‌تواند شکل راهنما را پیش از شروع انتخاب کند.',
    practiceModeLabel: 'نوع تمرین',
    traceMode: 'ردگیری روی الگو',
    traceModeHint: 'حرف کم‌رنگ داخل بوم نمایش داده می‌شود.',
    referenceMode: 'نمونه کنار بوم',
    referenceModeHint: 'حرف نمونه جدا از فضای نوشتن دیده می‌شود.',
    timedModeLabel: 'تمرین زمان‌دار',
    timedModeHint: 'برای هر حرف یک شمارش معکوس آرام نمایش داده می‌شود.',
    timeLimitLabel: 'زمان هر حرف',
    seconds: 'ثانیه',
    guidelineStyleLabel: 'نوع خطوط راهنما',
    guidelineNone: 'بدون خط',
    guidelineBaseline: 'فقط خط پایه',
    guidelineThreeLine: 'سه خط نوشتاری',
    guidelineGrid: 'شبکه',
    guidelineOpacityLabel: 'شفافیت خطوط',
    guidelineThicknessLabel: 'ضخامت خطوط',
    baselinePositionLabel: 'جای خط پایه',
    sampleFontLabel: 'فونت نمونه',
    fontPersianSans: 'فارسی خوانا',
    fontSystemSans: 'ساده دستگاه',
    fontSystemSerif: 'سنتی دستگاه',
    practiceTitle: 'این حرف را بنویس',
    practiceLetter: 'حرف',
    unlimitedTime: 'هرچقدر لازم داری وقت داری.',
    next: 'حرف بعدی',
    drawFirst: 'اول یک خط بکش.',
    undo: 'برگردان',
    clear: 'پاک کن',
    retry: 'از نو',
    timeUpTitle: 'زمان این حرف تمام شد',
    timeUpBody: 'اشکالی ندارد؛ دوباره و با آرامش امتحان کن.',
    tryAgain: 'دوباره تلاش کن',
    resultTitle: 'اسمت را نوشتی!',
    resultBody: 'این نوشته‌ی خود توست.',
    replay: 'بازپخش نوشتن',
    print: 'چاپ',
    share: 'اشتراک‌گذاری',
    preparing: 'در حال آماده‌سازی…',
    downloadStarted: 'فایل آماده و دانلود شد.',
    shareSuccess: 'پنجره اشتراک‌گذاری باز شد.',
    shareFallback: 'اشتراک‌گذاری پشتیبانی نشد؛ تصویر دانلود شد.',
    exportFailed: 'ساخت فایل ممکن نشد. دوباره تلاش کن.',
    startAgain: 'دوباره بنویس',
    resumeNotice: 'تمرین قبلی‌ات از همان‌جا ادامه پیدا کرد.',
    loading: 'در حال آماده‌سازی…',
    audioLabel: 'پخش راهنمای صوتی',
    timerWarningCue: 'پنج ثانیه مانده. آرام ادامه بده.',
    timeUpCue: 'زمان تمام شد. اشکالی ندارد، دوباره تلاش کن.',
    undoCue: 'آخرین خط برگشت.',
    clearCue: 'صفحه پاک شد.',
    retryCue: 'دوباره شروع می‌کنیم.',
    replayCue: 'حالا ببین چطور اسمت را نوشتی.'
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
    settingsTitle: 'Practice setup',
    settingsHint: 'An adult can choose the writing guide before the activity starts.',
    practiceModeLabel: 'Practice mode',
    traceMode: 'Trace the sample',
    traceModeHint: 'A faint letter appears inside the writing canvas.',
    referenceMode: 'Sample beside canvas',
    referenceModeHint: 'The model letter stays outside the writing area.',
    timedModeLabel: 'Timed practice',
    timedModeHint: 'Show a gentle countdown for each letter.',
    timeLimitLabel: 'Time per letter',
    seconds: 'seconds',
    guidelineStyleLabel: 'Guideline style',
    guidelineNone: 'No guidelines',
    guidelineBaseline: 'Baseline only',
    guidelineThreeLine: 'Three writing lines',
    guidelineGrid: 'Grid',
    guidelineOpacityLabel: 'Guideline opacity',
    guidelineThicknessLabel: 'Guideline thickness',
    baselinePositionLabel: 'Baseline position',
    sampleFontLabel: 'Sample font',
    fontPersianSans: 'Readable Persian',
    fontSystemSans: 'Device sans serif',
    fontSystemSerif: 'Device serif',
    practiceTitle: 'Write this letter',
    practiceLetter: 'Letter',
    unlimitedTime: 'Take all the time you need.',
    next: 'Next letter',
    drawFirst: 'Draw one stroke first.',
    undo: 'Undo',
    clear: 'Clear',
    retry: 'Restart',
    timeUpTitle: 'Time is up for this letter',
    timeUpBody: 'That is okay. Try again calmly.',
    tryAgain: 'Try again',
    resultTitle: 'You wrote your name!',
    resultBody: 'This is your own handwriting.',
    replay: 'Replay writing',
    print: 'Print',
    share: 'Share',
    preparing: 'Preparing…',
    downloadStarted: 'Your file is ready and downloading.',
    shareSuccess: 'The share sheet opened.',
    shareFallback: 'Sharing is unavailable, so the image was downloaded.',
    exportFailed: 'The file could not be created. Please try again.',
    startAgain: 'Write again',
    resumeNotice: 'Your previous activity resumed where you left it.',
    loading: 'Getting ready…',
    audioLabel: 'Play audio guidance',
    timerWarningCue: 'Five seconds left. Keep going calmly.',
    timeUpCue: 'Time is up. That is okay, try again.',
    undoCue: 'The last stroke was removed.',
    clearCue: 'The writing area is clear.',
    retryCue: 'Let’s start this letter again.',
    replayCue: 'Now watch how you wrote your name.'
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
    settingsTitle: 'Harjoituksen asetukset',
    settingsHint: 'Aikuinen voi valita kirjoitusohjeen ennen harjoituksen alkua.',
    practiceModeLabel: 'Harjoitustapa',
    traceMode: 'Jäljitä mallia',
    traceModeHint: 'Himmeä kirjain näkyy kirjoitusalueella.',
    referenceMode: 'Malli alueen vieressä',
    referenceModeHint: 'Mallikirjain näkyy erillään kirjoitusalueesta.',
    timedModeLabel: 'Ajastettu harjoitus',
    timedModeHint: 'Näytä rauhallinen lähtölaskenta jokaiselle kirjaimelle.',
    timeLimitLabel: 'Aika kirjainta kohti',
    seconds: 'sekuntia',
    guidelineStyleLabel: 'Apulinjojen tyyli',
    guidelineNone: 'Ei apulinjoja',
    guidelineBaseline: 'Vain peruslinja',
    guidelineThreeLine: 'Kolme kirjoituslinjaa',
    guidelineGrid: 'Ruudukko',
    guidelineOpacityLabel: 'Apulinjojen läpinäkyvyys',
    guidelineThicknessLabel: 'Apulinjojen paksuus',
    baselinePositionLabel: 'Peruslinjan sijainti',
    sampleFontLabel: 'Mallin fontti',
    fontPersianSans: 'Selkeä persialainen',
    fontSystemSans: 'Laitteen päätteetön',
    fontSystemSerif: 'Laitteen päätteellinen',
    practiceTitle: 'Kirjoita tämä kirjain',
    practiceLetter: 'Kirjain',
    unlimitedTime: 'Saat käyttää niin paljon aikaa kuin tarvitset.',
    next: 'Seuraava kirjain',
    drawFirst: 'Piirrä ensin yksi viiva.',
    undo: 'Kumoa',
    clear: 'Tyhjennä',
    retry: 'Aloita alusta',
    timeUpTitle: 'Tämän kirjaimen aika loppui',
    timeUpBody: 'Ei haittaa. Yritä rauhassa uudelleen.',
    tryAgain: 'Yritä uudelleen',
    resultTitle: 'Kirjoitit nimesi!',
    resultBody: 'Tämä on oma käsialasi.',
    replay: 'Toista kirjoitus',
    print: 'Tulosta',
    share: 'Jaa',
    preparing: 'Valmistellaan…',
    downloadStarted: 'Tiedosto on valmis ja latautuu.',
    shareSuccess: 'Jakaminen avautui.',
    shareFallback: 'Jakaminen ei ole käytettävissä, joten kuva ladattiin.',
    exportFailed: 'Tiedostoa ei voitu luoda. Yritä uudelleen.',
    startAgain: 'Kirjoita uudelleen',
    resumeNotice: 'Edellinen harjoitus jatkui siitä, mihin jäit.',
    loading: 'Valmistellaan…',
    audioLabel: 'Toista ääniohje',
    timerWarningCue: 'Viisi sekuntia jäljellä. Jatka rauhassa.',
    timeUpCue: 'Aika loppui. Ei haittaa, yritä uudelleen.',
    undoCue: 'Viimeinen viiva poistettiin.',
    clearCue: 'Kirjoitusalue tyhjennettiin.',
    retryCue: 'Aloitetaan tämä kirjain uudelleen.',
    replayCue: 'Katso nyt, miten kirjoitit nimesi.'
  }
};

export function localeDirection(locale: UiLocale): 'rtl' | 'ltr' {
  return locale === 'fa' ? 'rtl' : 'ltr';
}
