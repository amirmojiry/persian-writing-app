import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useWritingStore } from '../src/stores/writing';

describe('writing store lesson settings', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('persists validated settings and restores them in a new store', () => {
    const store = useWritingStore();
    store.updateLessonSettings({
      practiceMode: 'reference',
      guidelineStyle: 'grid',
      guidelineOpacity: 0.64,
      guidelineThickness: 7,
      baselinePosition: 0.8,
      sampleFont: 'system-serif',
      timedMode: true,
      timeLimitSeconds: 45
    });

    setActivePinia(createPinia());
    const restored = useWritingStore();

    expect(restored.lessonSettings).toMatchObject({
      practiceMode: 'reference',
      guidelineStyle: 'grid',
      guidelineOpacity: 0.64,
      guidelineThickness: 7,
      baselinePosition: 0.8,
      sampleFont: 'system-serif',
      timedMode: true,
      timeLimitSeconds: 45
    });
  });

  it('falls back to safe defaults when saved JSON is invalid', () => {
    localStorage.setItem('persian-writing-lesson-settings-v1', '{invalid');
    setActivePinia(createPinia());
    const store = useWritingStore();

    expect(store.lessonSettings.practiceMode).toBe('trace');
    expect(store.lessonSettings.guidelineStyle).toBe('three-line');
    expect(store.lessonSettings.timedMode).toBe(false);
    expect(localStorage.getItem('persian-writing-lesson-settings-v1')).toBeNull();
  });
});
