import { computed } from 'vue';
import { localeDirection, messages } from '@persian-writing/i18n';
import { useWritingStore } from '@/stores/writing';

export function useMessages() {
  const store = useWritingStore();
  return {
    message: computed(() => messages[store.locale]),
    direction: computed(() => localeDirection(store.locale))
  };
}
