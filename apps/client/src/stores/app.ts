import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    locale: 'fa' as 'fa' | 'en' | 'fi'
  })
});
