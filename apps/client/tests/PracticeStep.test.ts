import { createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';
import { describe, expect, it } from 'vitest';
import { createWritingSession, startPractice } from '@persian-writing/core';
import PracticeStep from '../src/components/PracticeStep.vue';

describe('PracticeStep contextual Persian rendering', () => {
  it('renders the initial form when the first letter joins the next letter', () => {
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
    expect(wrapper.get('[data-testid="contextual-letter"]').text()).toBe('لـ');
    expect(wrapper.get('[data-testid="contextual-letter"]').attributes('data-form')).toBe('initial');
  });

  it('renders medial and final forms from the real neighbors in the name', async () => {
    const ready = createWritingSession({
      id: 'session-2',
      profileId: 'profile-1',
      logicalName: 'کتاب',
      now: '2026-07-31T09:00:00.000Z'
    });
    const session = reactive({
      ...startPractice(ready, '2026-07-31T09:01:00.000Z'),
      currentIndex: 1
    });
    const wrapper = mount(PracticeStep, {
      props: { session },
      global: { plugins: [createPinia()] }
    });

    expect(wrapper.get('[data-testid="contextual-letter"]').text()).toBe('ـتـ');
    expect(wrapper.get('[data-testid="contextual-letter"]').attributes('data-form')).toBe('medial');

    session.currentIndex = 2;
    await wrapper.vm.$nextTick();
    expect(wrapper.get('[data-testid="contextual-letter"]').text()).toBe('ـا');
    expect(wrapper.get('[data-testid="contextual-letter"]').attributes('data-form')).toBe('final');
  });
});
