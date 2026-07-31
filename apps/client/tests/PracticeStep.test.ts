import { createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';
import { describe, expect, it } from 'vitest';
import { createWritingSession, startPractice } from '@persian-writing/core';
import PracticeStep from '../src/components/PracticeStep.vue';

describe('PracticeStep reactive session boundary', () => {
  it('renders the writing surface when the session comes from reactive Pinia state', () => {
    const ready = createWritingSession({
      id: 'session-1',
      profileId: 'profile-1',
      logicalName: 'لیا',
      now: '2026-07-31T09:00:00.000Z'
    });
    const session = reactive(startPractice(ready, '2026-07-31T09:01:00.000Z'));

    const wrapper = mount(PracticeStep, {
      props: { session },
      global: { plugins: [createPinia()] }
    });

    expect(wrapper.find('[data-testid="writing-surface"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('حرف 1 / 3');
  });
});
