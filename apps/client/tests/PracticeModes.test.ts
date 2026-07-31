import { createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import {
  createWritingSession,
  resolveLessonSettings,
  startPractice
} from '@persian-writing/core';
import PracticeStep from '../src/components/PracticeStep.vue';

function createSession() {
  return startPractice(createWritingSession({
    id: 'session-settings',
    profileId: 'profile-settings',
    logicalName: 'لیا',
    now: '2026-07-31T18:00:00.000Z'
  }), '2026-07-31T18:01:00.000Z');
}

describe('practice presentation modes', () => {
  it('shows a cumulative trace reference inside the canvas', () => {
    const wrapper = mount(PracticeStep, {
      props: {
        session: createSession(),
        settings: resolveLessonSettings({
          userOverrides: { practiceMode: 'trace', guidelineStyle: 'three-line' }
        })
      },
      global: { plugins: [createPinia()] }
    });

    expect(wrapper.find('[data-testid="trace-reference"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="reference-sample"]').exists()).toBe(false);
    expect(wrapper.get('[data-testid="practice-prefix"]').attributes('data-prefix')).toBe('ل');
    expect(wrapper.get('[data-testid="writing-surface"]').attributes('data-writing-layout')).toBe('cumulative-name');
    expect(wrapper.get('[data-testid="guideline-layer"]').attributes('data-guide-style')).toBe('three-line');
    expect(wrapper.findAll('.guide-line')).toHaveLength(3);
  });

  it('keeps the cumulative model outside a blank grid canvas in reference mode', () => {
    const wrapper = mount(PracticeStep, {
      props: {
        session: createSession(),
        settings: resolveLessonSettings({
          userOverrides: {
            practiceMode: 'reference',
            guidelineStyle: 'grid',
            sampleFont: 'system-serif'
          }
        })
      },
      global: { plugins: [createPinia()] }
    });

    expect(wrapper.get('[data-testid="reference-sample"]').attributes('data-prefix')).toBe('ل');
    expect(wrapper.find('[data-testid="trace-reference"]').exists()).toBe(false);
    expect(wrapper.get('[data-testid="writing-surface"]').attributes('data-practice-mode')).toBe('reference');
    expect(wrapper.findAll('.guide-line').length).toBeGreaterThan(10);
  });
});
