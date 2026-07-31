import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import NameEntryStep from '../src/components/NameEntryStep.vue';

function findButton(wrapper: ReturnType<typeof mount>, label: string) {
  const button = wrapper.findAll('button').find((candidate) => candidate.text().trim() === label);
  if (button === undefined) throw new Error(`Button ${label} was not found.`);
  return button;
}

describe('Persian on-screen keyboard', () => {
  it('enters a logical Unicode name and submits it', async () => {
    const wrapper = mount(NameEntryStep, { global: { plugins: [createPinia()] } });
    await findButton(wrapper, 'ل').trigger('click');
    await findButton(wrapper, 'ی').trigger('click');
    await findButton(wrapper, 'ا').trigger('click');
    await wrapper.get('[data-testid="confirm-name"]').trigger('click');
    expect(wrapper.get<HTMLInputElement>('[data-testid="name-input"]').element.value).toBe('لیا');
    expect(wrapper.emitted('submit')?.[0]).toEqual(['لیا']);
  });
});
