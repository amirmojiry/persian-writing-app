import { createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import {
  completeCurrentLetter,
  createWritingSession,
  resolveLessonSettings,
  startPractice,
  type Stroke
} from '@persian-writing/core';
import PracticeStep from '../src/components/PracticeStep.vue';

const alefStroke: readonly Stroke[] = [{
  id: 'alef-stroke',
  points: [
    { x: 0.82, y: 0.2, t: 0, source: 'touch' },
    { x: 0.82, y: 0.7, t: 100, source: 'touch' }
  ]
}];

const mimDraft: readonly Stroke[] = [{
  id: 'mim-draft',
  points: [
    { x: 0.66, y: 0.5, t: 0, source: 'touch' },
    { x: 0.58, y: 0.62, t: 100, source: 'touch' }
  ]
}];

describe('cumulative Persian name writing', () => {
  it('shows the written prefix and keeps it locked while the next letter is edited', async () => {
    const ready = createWritingSession({
      id: 'session-amir',
      profileId: 'profile-amir',
      logicalName: 'امیر',
      now: '2026-07-31T20:00:00.000Z'
    });
    const secondStep = completeCurrentLetter(
      startPractice(ready, ready.createdAt),
      alefStroke,
      ready.createdAt
    );
    const sessionWithDraft = { ...secondStep, draftStrokes: mimDraft };

    const wrapper = mount(PracticeStep, {
      props: {
        session: sessionWithDraft,
        settings: resolveLessonSettings({
          userOverrides: { practiceMode: 'trace', timedMode: false }
        })
      },
      global: { plugins: [createPinia()] }
    });

    expect(wrapper.get('[data-testid="practice-prefix"]').attributes('data-prefix')).toBe('ام');
    expect(wrapper.findAll('[data-testid="completed-stroke"]')).toHaveLength(1);
    expect(wrapper.findAll('.current-child-stroke')).toHaveLength(1);

    await wrapper.get('[data-testid="clear-letter"]').trigger('click');

    expect(wrapper.findAll('[data-testid="completed-stroke"]')).toHaveLength(1);
    expect(wrapper.findAll('.current-child-stroke')).toHaveLength(0);
    expect(wrapper.emitted('save')?.at(-1)).toEqual([[]]);
  });
});
