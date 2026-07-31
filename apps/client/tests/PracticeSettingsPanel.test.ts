import { createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { resolveLessonSettings } from '@persian-writing/core';
import PracticeSettingsPanel from '../src/components/PracticeSettingsPanel.vue';

describe('PracticeSettingsPanel', () => {
  it('emits typed setting patches from adult setup controls', async () => {
    const wrapper = mount(PracticeSettingsPanel, {
      props: { settings: resolveLessonSettings() },
      global: { plugins: [createPinia()] }
    });

    await wrapper.get('[data-testid="mode-reference"]').trigger('click');
    await wrapper.get('[data-testid="timed-mode"]').setValue(true);
    await wrapper.setProps({
      settings: resolveLessonSettings({ userOverrides: { timedMode: true, timeLimitSeconds: 30 } })
    });
    await wrapper.get('[data-testid="time-limit"]').setValue('45');
    await wrapper.get('[data-testid="guideline-style"]').setValue('grid');
    await wrapper.get('[data-testid="sample-font"]').setValue('system-serif');
    await wrapper.get('[data-testid="guideline-opacity"]').setValue('65');

    const changes = wrapper.emitted('change') ?? [];
    expect(changes).toContainEqual([{ practiceMode: 'reference' }]);
    expect(changes).toContainEqual([{ timedMode: true }]);
    expect(changes).toContainEqual([{ timeLimitSeconds: 45 }]);
    expect(changes).toContainEqual([{ guidelineStyle: 'grid' }]);
    expect(changes).toContainEqual([{ sampleFont: 'system-serif' }]);
    expect(changes).toContainEqual([{ guidelineOpacity: 0.65 }]);
  });
});
