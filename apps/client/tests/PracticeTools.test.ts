import { createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createWritingSession,
  resolveLessonSettings,
  startPractice,
  type Stroke
} from '@persian-writing/core';
import PracticeStep from '../src/components/PracticeStep.vue';

const strokes: readonly Stroke[] = [
  {
    id: 'one',
    points: [
      { x: 0.1, y: 0.1, t: 0, source: 'mouse' },
      { x: 0.2, y: 0.2, t: 100, source: 'mouse' }
    ]
  },
  {
    id: 'two',
    points: [
      { x: 0.3, y: 0.3, t: 0, source: 'mouse' },
      { x: 0.4, y: 0.4, t: 100, source: 'mouse' }
    ]
  }
];

function createSession() {
  return {
    ...startPractice(createWritingSession({
      id: 'session-tools',
      profileId: 'profile-tools',
      logicalName: 'لی',
      now: '2026-07-31T18:00:00.000Z'
    }), '2026-07-31T18:01:00.000Z'),
    draftStrokes: strokes
  };
}

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});

describe('practice tools', () => {
  it('undoes the last stroke and clears the current letter without changing prior attempts', async () => {
    const wrapper = mount(PracticeStep, {
      props: { session: createSession(), settings: resolveLessonSettings() },
      global: { plugins: [createPinia()] }
    });

    await wrapper.get('[data-testid="undo-stroke"]').trigger('click');
    expect(wrapper.emitted('save')?.at(-1)?.[0]).toHaveLength(1);

    await wrapper.get('[data-testid="clear-letter"]').trigger('click');
    expect(wrapper.emitted('save')?.at(-1)?.[0]).toEqual([]);
  });

  it('expires a timed letter and retry starts a fresh countdown with an empty canvas', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-31T18:00:00.000Z'));
    const wrapper = mount(PracticeStep, {
      props: {
        session: createSession(),
        settings: resolveLessonSettings({ userOverrides: { timedMode: true, timeLimitSeconds: 5 } })
      },
      global: { plugins: [createPinia()] }
    });

    expect(wrapper.get('[data-testid="timer-seconds"]').text()).toBe('5');
    await vi.advanceTimersByTimeAsync(5_100);
    await nextTick();

    expect(wrapper.find('[data-testid="time-up"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="writing-surface"]').attributes('aria-disabled')).toBe('true');

    await wrapper.get('[data-testid="retry-letter"]').trigger('click');
    await nextTick();

    expect(wrapper.find('[data-testid="time-up"]').exists()).toBe(false);
    expect(wrapper.get('[data-testid="timer-seconds"]').text()).toBe('5');
    expect(wrapper.emitted('save')?.at(-1)?.[0]).toEqual([]);
  });
});
