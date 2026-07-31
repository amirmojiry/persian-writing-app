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
    expect(applicationLessonSettings.timedMode).toBe(false);
    expect(applicationLessonSettings.timeLimitSeconds).toBe(30);
  });

  it('applies user overrides over administrator and application defaults', () => {
    const settings = resolveLessonSettings({
      applicationDefaults: { guidelineStyle: 'baseline', timeLimitSeconds: 20 },
      administratorDefaults: { guidelineStyle: 'grid', sampleFont: 'system-sans', timedMode: true },
      userOverrides: { guidelineStyle: 'none', sampleFont: 'system-serif', timedMode: false }
    });

    expect(settings.guidelineStyle).toBe('none');
    expect(settings.sampleFont).toBe('system-serif');
    expect(settings.timedMode).toBe(false);
    expect(settings.timeLimitSeconds).toBe(20);
  });

  it('keeps an administrator default when that setting is locked', () => {
    const settings = resolveLessonSettings({
      administratorDefaults: { practiceMode: 'reference', guidelineThickness: 6, timedMode: true },
      lockedByAdministrator: ['practiceMode', 'timedMode'],
      userOverrides: { practiceMode: 'trace', guidelineThickness: 2, timedMode: false }
    });

    expect(settings.practiceMode).toBe('reference');
    expect(settings.guidelineThickness).toBe(2);
    expect(settings.timedMode).toBe(true);
  });

  it('rejects unknown values and clamps numeric settings', () => {
    const sanitized = sanitizeLessonSettings({
      practiceMode: 'unknown',
      guidelineStyle: 'grid',
      guidelineOpacity: 9,
      guidelineThickness: -2,
      baselinePosition: 0.1,
      sampleFont: 'unknown',
      timedMode: true,
      timeLimitSeconds: 999
    });

    expect(sanitized).toEqual({
      guidelineStyle: 'grid',
      guidelineOpacity: 1,
      guidelineThickness: 1,
      baselinePosition: 0.45,
      timedMode: true,
      timeLimitSeconds: 300
    });
  });
});
