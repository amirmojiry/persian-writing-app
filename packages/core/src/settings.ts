export type PracticeMode = 'trace' | 'reference';
export type GuidelineStyle = 'baseline' | 'three-line' | 'grid' | 'none';
export type SampleFont = 'persian-sans' | 'system-sans' | 'system-serif';

export interface LessonSettings {
  readonly practiceMode: PracticeMode;
  readonly guidelineStyle: GuidelineStyle;
  readonly guidelineOpacity: number;
  readonly guidelineThickness: number;
  readonly baselinePosition: number;
  readonly sampleFont: SampleFont;
}

export interface ResolveLessonSettingsInput {
  readonly applicationDefaults?: Partial<LessonSettings>;
  readonly administratorDefaults?: Partial<LessonSettings>;
  readonly lockedByAdministrator?: readonly (keyof LessonSettings)[];
  readonly userOverrides?: Partial<LessonSettings>;
}

export const applicationLessonSettings: LessonSettings = Object.freeze({
  practiceMode: 'trace',
  guidelineStyle: 'three-line',
  guidelineOpacity: 0.28,
  guidelineThickness: 3,
  baselinePosition: 0.72,
  sampleFont: 'persian-sans'
});

const PRACTICE_MODES = new Set<PracticeMode>(['trace', 'reference']);
const GUIDELINE_STYLES = new Set<GuidelineStyle>(['baseline', 'three-line', 'grid', 'none']);
const SAMPLE_FONTS = new Set<SampleFont>(['persian-sans', 'system-sans', 'system-serif']);

export function resolveLessonSettings(input: ResolveLessonSettingsInput = {}): LessonSettings {
  const application = sanitizeLessonSettings(input.applicationDefaults);
  const administrator = sanitizeLessonSettings(input.administratorDefaults);
  const user = sanitizeLessonSettings(input.userOverrides);
  const locked = new Set(input.lockedByAdministrator ?? []);

  function valueFor<K extends keyof LessonSettings>(key: K): LessonSettings[K] {
    const applicationValue = application[key] ?? applicationLessonSettings[key];
    const administratorValue = administrator[key];
    if (locked.has(key) && administratorValue !== undefined) {
      return administratorValue as LessonSettings[K];
    }
    return (user[key] ?? administratorValue ?? applicationValue) as LessonSettings[K];
  }

  return Object.freeze({
    practiceMode: valueFor('practiceMode'),
    guidelineStyle: valueFor('guidelineStyle'),
    guidelineOpacity: valueFor('guidelineOpacity'),
    guidelineThickness: valueFor('guidelineThickness'),
    baselinePosition: valueFor('baselinePosition'),
    sampleFont: valueFor('sampleFont')
  });
}

export function sanitizeLessonSettings(input: unknown): Partial<LessonSettings> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return {};
  }

  const source = input as Record<string, unknown>;
  const result: Partial<LessonSettings> = {};

  if (typeof source.practiceMode === 'string' && PRACTICE_MODES.has(source.practiceMode as PracticeMode)) {
    result.practiceMode = source.practiceMode as PracticeMode;
  }
  if (typeof source.guidelineStyle === 'string' && GUIDELINE_STYLES.has(source.guidelineStyle as GuidelineStyle)) {
    result.guidelineStyle = source.guidelineStyle as GuidelineStyle;
  }
  if (typeof source.guidelineOpacity === 'number' && Number.isFinite(source.guidelineOpacity)) {
    result.guidelineOpacity = clamp(source.guidelineOpacity, 0.08, 1);
  }
  if (typeof source.guidelineThickness === 'number' && Number.isFinite(source.guidelineThickness)) {
    result.guidelineThickness = clamp(source.guidelineThickness, 1, 10);
  }
  if (typeof source.baselinePosition === 'number' && Number.isFinite(source.baselinePosition)) {
    result.baselinePosition = clamp(source.baselinePosition, 0.45, 0.88);
  }
  if (typeof source.sampleFont === 'string' && SAMPLE_FONTS.has(source.sampleFont as SampleFont)) {
    result.sampleFont = source.sampleFont as SampleFont;
  }

  return result;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
