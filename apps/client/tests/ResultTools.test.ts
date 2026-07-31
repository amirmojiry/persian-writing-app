import { createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import {
  completeCurrentLetter,
  createWritingSession,
  startPractice,
  type Stroke,
  type WritingSession
} from '@persian-writing/core';
import { BrowserResultExporter } from '../src/adapters/export/BrowserResultExporter';
import ResultStep from '../src/components/ResultStep.vue';

const stroke: Stroke = {
  id: 'result-stroke',
  points: [
    { x: 0.1, y: 0.2, t: 0, source: 'pen' },
    { x: 0.8, y: 0.7, t: 600, source: 'pen' }
  ]
};

function completedSession(): WritingSession {
  return completeCurrentLetter(
    startPractice(createWritingSession({
      id: 'session-result',
      profileId: 'profile-result',
      logicalName: 'لیا',
      now: '2026-07-31T18:00:00.000Z'
    }), '2026-07-31T18:00:01.000Z'),
    [stroke],
    '2026-07-31T18:00:02.000Z'
  ) as WritingSession;
}

describe('result tools', () => {
  it('opens vector replay from the result screen', async () => {
    const session = {
      ...completedSession(),
      stage: 'result' as const,
      status: 'completed' as const,
      currentIndex: 2,
      attempts: [0, 1, 2].map((index) => ({
        index,
        grapheme: ['ل', 'ی', 'ا'][index] ?? '',
        strokes: [{ ...stroke, id: `stroke-${index}` }],
        completedAt: `2026-07-31T18:00:0${index + 2}.000Z`
      }))
    };
    const wrapper = mount(ResultStep, {
      props: { session },
      global: { plugins: [createPinia()] }
    });

    await wrapper.get('[data-testid="replay-result"]').trigger('click');
    expect(wrapper.find('[data-testid="stroke-replay"]').exists()).toBe(true);
    wrapper.unmount();
  });

  it('creates stable NFC-safe file names for every export format', () => {
    const exporter = new BrowserResultExporter();
    const session = completedSession();

    expect(exporter.fileName(session, 'svg')).toBe('لیا-writing.svg');
    expect(exporter.fileName({ ...session, logicalName: 'علی / رضا' }, 'pdf')).toBe('علی-رضا-writing.pdf');
  });
});
