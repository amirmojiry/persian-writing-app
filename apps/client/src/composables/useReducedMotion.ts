import { onBeforeUnmount, onMounted, ref } from 'vue';

export function useReducedMotion() {
  const reducedMotion = ref(false);
  let mediaQuery: MediaQueryList | null = null;

  function update(event?: MediaQueryListEvent): void {
    reducedMotion.value = event?.matches ?? mediaQuery?.matches ?? false;
  }

  onMounted(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    update();
    mediaQuery.addEventListener?.('change', update);
  });

  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener?.('change', update);
  });

  return reducedMotion;
}
