import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { InMemorySessionRepository, type AudioCuePort } from '@persian-writing/core';
import App from '../src/App.vue';
import router from '../src/router';
import { configureWritingServices } from '../src/stores/writing';

const silentAudio: AudioCuePort = { async play() {}, async stop() {} };

describe('application shell', () => {
  it('opens the localized wizard flow', async () => {
    configureWritingServices({ repository: new InMemorySessionRepository(), audioCue: silentAudio });
    await router.push('/');
    await router.isReady();
    const wrapper = mount(App, { global: { plugins: [createPinia(), router] } });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(wrapper.text()).toContain('نام‌نویس فارسی');
    expect(wrapper.text()).toContain('آیا تو یک جادوگر هستی؟');
  });
});
