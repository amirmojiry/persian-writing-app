import { describe, expect, it } from 'vitest';
import {
  applicationLessonSettings,
  resolveLessonSettings,
  sanitizeLessonSettings
} from '../src';

describe('lesson settings', () => {
  it('provides child-friendly application defaults', () => {
    expect(resolveLessonSettings()).toEqual(applicationLessonSettings);
    expect(applicationLessonSettings.practiceMode).toBe('trace');
    expect(applicationLessonSettings.guidelineStyle).toBe('three-line');
  });

  it('applies user overrides over administrator and application defaults', () => {
    const settings = resolveLessonSettings({
      applicationDefaults: { guidelineStyle: 'baseline' },
      administratorDefaults: { guidelineStyle: 'grid', sampleFont: 'system-sans' },
      userOverrides: { guidelineStyle: 'none', sampleFont: 'system-serif' }
    });

    expect(settings.guidelineStyle).toBe('none');
    expect(settings.sampleFont).toBe('system-serif');
  });

  it('keeps an administrator default when that setting is locked', () => {
    const settings = resolveLessonSettings({
      administratorDefaults: { practiceMode: 'reference', guidelineThickness: 6 },
      lockedByAdministrator: ['practiceMode'],
      userOverrides: { practiceMode: 'trace', guidelineThickness: 2 }
    });

    expect(settings.practiceMode).toBe('reference');
    expect(settings.guidelineThickness).toBe(2);
  });

  it('rejects unknown values and clamps numeric settings', () => {
    const sanitized = sanitizeLessonSettings({
      practiceMode: 'unknown',
      guidelineStyle: 'grid',
      guidelineOpacity: 9,
      guidelineThickness: -2,
      baselinePosition: 0.1,
      sampleFont: 'unknown'
    });

    expect(sanitized).toEqual({
      guidelineStyle: 'grid',
      guidelineOpacity: 1,
      guidelineThickness: 1,
      baselinePosition: 0.45
    });
  });
});
