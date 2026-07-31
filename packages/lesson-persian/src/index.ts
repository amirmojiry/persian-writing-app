export * from './contextualForms';

export interface PersianLessonPackMetadata {
  readonly id: 'persian-name-mvp';
  readonly writingDirection: 'rtl';
}

export const persianLessonPackMetadata: PersianLessonPackMetadata = {
  id: 'persian-name-mvp',
  writingDirection: 'rtl'
};

export const persianKeyboardRows = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'چ'],
  ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک', 'گ'],
  ['ظ', 'ط', 'ز', 'ر', 'ذ', 'د', 'پ', 'و', 'ژ']
] as const;
