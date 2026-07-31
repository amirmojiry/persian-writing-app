export const PERSIAN_ALPHABET = [
  'ا', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش',
  'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی'
] as const;

export type PersianLetter = typeof PERSIAN_ALPHABET[number];
export type PersianContextualFormName = 'isolated' | 'initial' | 'medial' | 'final';

export interface PersianContextualForms {
  readonly isolated: string;
  readonly initial: string | null;
  readonly medial: string | null;
  readonly final: string;
}

export interface PersianPracticeUnit {
  readonly practiceIndex: number;
  readonly logicalIndex: number;
  readonly grapheme: string;
  readonly form: PersianContextualFormName;
  readonly display: string;
  readonly joinsPrevious: boolean;
  readonly joinsNext: boolean;
}

interface JoiningCapabilities {
  readonly canJoinPrevious: boolean;
  readonly canJoinNext: boolean;
}

const TATWEEL = 'ـ';
const ZERO_WIDTH_NON_JOINER = '\u200C';
const ZERO_WIDTH_JOINER = '\u200D';
const NON_JOINING_TO_NEXT = new Set<string>(['ا', 'آ', 'أ', 'إ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'و', 'ؤ']);
const EXTRA_JOINING_LETTERS = new Set<string>(['آ', 'أ', 'إ', 'ؤ', 'ئ']);
const PERSIAN_LETTER_SET = new Set<string>(PERSIAN_ALPHABET);

export const persianContextualForms: Readonly<Record<PersianLetter, PersianContextualForms>> =
  Object.freeze(Object.fromEntries(PERSIAN_ALPHABET.map((letter) => [
    letter,
    createForms(letter, !NON_JOINING_TO_NEXT.has(letter))
  ])) as Record<PersianLetter, PersianContextualForms>);

export function canonicalizePersianText(input: string): string {
  return input
    .normalize('NFC')
    .replace(/[يى]/gu, 'ی')
    .replace(/ك/gu, 'ک');
}

export function getPersianContextualForm(grapheme: string): PersianContextualForms | null {
  const canonical = canonicalizePersianText(grapheme);
  const base = baseLetterOf(canonical);
  if (base === null) {
    return null;
  }

  if (PERSIAN_LETTER_SET.has(base)) {
    return canonical === base
      ? persianContextualForms[base as PersianLetter]
      : createForms(canonical, !NON_JOINING_TO_NEXT.has(base));
  }

  if (EXTRA_JOINING_LETTERS.has(base)) {
    return createForms(canonical, !NON_JOINING_TO_NEXT.has(base));
  }

  return null;
}

export function createPersianPracticeUnits(input: string): readonly PersianPracticeUnit[] {
  const segments = segmentPersianText(canonicalizePersianText(input));
  const units: PersianPracticeUnit[] = [];

  for (let logicalIndex = 0; logicalIndex < segments.length; logicalIndex += 1) {
    const grapheme = segments[logicalIndex];
    if (grapheme === undefined || isBoundary(grapheme)) {
      continue;
    }

    const current = joiningCapabilitiesFor(grapheme);
    const previous = logicalIndex > 0 ? joiningCapabilitiesFor(segments[logicalIndex - 1] ?? '') : null;
    const next = logicalIndex < segments.length - 1
      ? joiningCapabilitiesFor(segments[logicalIndex + 1] ?? '')
      : null;
    const joinsPrevious = current !== null
      && previous !== null
      && previous.canJoinNext
      && current.canJoinPrevious;
    const joinsNext = current !== null
      && next !== null
      && current.canJoinNext
      && next.canJoinPrevious;
    const form = contextualFormName(joinsPrevious, joinsNext);

    units.push({
      practiceIndex: units.length,
      logicalIndex,
      grapheme,
      form,
      display: contextualDisplay(grapheme, form),
      joinsPrevious,
      joinsNext
    });
  }

  return units;
}

export function segmentPersianText(input: string): readonly string[] {
  const normalized = canonicalizePersianText(input);
  return typeof Intl.Segmenter === 'function'
    ? Array.from(new Intl.Segmenter('fa', { granularity: 'grapheme' }).segment(normalized), ({ segment }) => segment)
    : Array.from(normalized);
}

function createForms(grapheme: string, canJoinNext: boolean): PersianContextualForms {
  return Object.freeze({
    isolated: grapheme,
    initial: canJoinNext ? `${grapheme}${TATWEEL}` : null,
    medial: canJoinNext ? `${TATWEEL}${grapheme}${TATWEEL}` : null,
    final: `${TATWEEL}${grapheme}`
  });
}

function contextualDisplay(grapheme: string, form: PersianContextualFormName): string {
  const forms = getPersianContextualForm(grapheme);
  if (forms === null) {
    return grapheme;
  }

  return forms[form] ?? forms.isolated;
}

function contextualFormName(joinsPrevious: boolean, joinsNext: boolean): PersianContextualFormName {
  if (joinsPrevious && joinsNext) {
    return 'medial';
  }
  if (joinsPrevious) {
    return 'final';
  }
  if (joinsNext) {
    return 'initial';
  }
  return 'isolated';
}

function joiningCapabilitiesFor(grapheme: string): JoiningCapabilities | null {
  if (isBoundary(grapheme)) {
    return null;
  }

  const base = baseLetterOf(canonicalizePersianText(grapheme));
  if (base === null || (!PERSIAN_LETTER_SET.has(base) && !EXTRA_JOINING_LETTERS.has(base))) {
    return null;
  }

  return {
    canJoinPrevious: true,
    canJoinNext: !NON_JOINING_TO_NEXT.has(base)
  };
}

function baseLetterOf(grapheme: string): string | null {
  const withoutMarks = grapheme.replace(/\p{M}/gu, '');
  return Array.from(withoutMarks)[0] ?? null;
}

function isBoundary(grapheme: string): boolean {
  return /^\s+$/u.test(grapheme)
    || grapheme === ZERO_WIDTH_NON_JOINER
    || grapheme === ZERO_WIDTH_JOINER;
}
