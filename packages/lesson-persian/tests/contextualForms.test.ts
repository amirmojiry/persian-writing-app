import { describe, expect, it } from 'vitest';
import {
  canonicalizePersianText,
  createPersianPracticeUnits,
  getPersianContextualForm
} from '../src';

describe('Persian contextual joining', () => {
  it.each([
    ['بابا', ['initial', 'final', 'initial', 'final'], ['بـ', 'ـا', 'بـ', 'ـا']],
    ['کتاب', ['initial', 'medial', 'final', 'isolated'], ['کـ', 'ـتـ', 'ـا', 'ب']],
    ['ایران', ['isolated', 'initial', 'final', 'isolated', 'isolated'], ['ا', 'یـ', 'ـر', 'ا', 'ن']],
    ['لیا', ['initial', 'medial', 'final'], ['لـ', 'ـیـ', 'ـا']]
  ] as const)('classifies %s from its logical neighbors', (name, expectedForms, expectedDisplays) => {
    const units = createPersianPracticeUnits(name);
    expect(units.map(({ form }) => form)).toEqual(expectedForms);
    expect(units.map(({ display }) => display)).toEqual(expectedDisplays);
    expect(units.map(({ grapheme }) => grapheme).join('')).toBe(name);
  });

  it('breaks joining at spaces and zero-width non-joiners', () => {
    expect(createPersianPracticeUnits('به نام').map(({ display }) => display)).toEqual([
      'بـ', 'ـه', 'نـ', 'ـا', 'م'
    ]);
    expect(createPersianPracticeUnits('می\u200Cروم').map(({ display }) => display)).toEqual([
      'مـ', 'ـی', 'ر', 'و', 'م'
    ]);
  });

  it('canonicalizes common Arabic keyboard variants without presentation forms', () => {
    const normalized = canonicalizePersianText('علي كيان');
    expect(normalized).toBe('علی کیان');
    expect(normalized).not.toMatch(/[\uFB50-\uFDFF\uFE70-\uFEFF]/u);
  });

  it('exposes the requested form table', () => {
    expect(getPersianContextualForm('ب')).toEqual({
      isolated: 'ب',
      initial: 'بـ',
      medial: 'ـبـ',
      final: 'ـب'
    });
    expect(getPersianContextualForm('ا')).toEqual({
      isolated: 'ا',
      initial: null,
      medial: null,
      final: 'ـا'
    });
  });
});
