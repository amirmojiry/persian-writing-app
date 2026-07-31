import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import App from '../src/App.vue';
import router from '../src/router';

describe('application shell', () => {
  it('renders the Persian smoke page', async () => {
    await router.push('/');
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router]
      }
    });

    expect(wrapper.text()).toContain('نام‌نویس فارسی');
    expect(wrapper.text()).toContain('زیرساخت برنامه آماده است');
  });
});
