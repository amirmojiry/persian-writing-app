<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { WindowModePort } from '@persian-writing/core';
import { createWindowModePort } from '@/adapters/window/createWindowModePort';
import { useWritingStore } from '@/stores/writing';

const KIOSK_STORAGE_KEY = 'persian-writing-kiosk-v1';
const store = useWritingStore();
const port = ref<WindowModePort | null>(null);
const available = ref(false);
const kiosk = ref(false);
const busy = ref(false);
const labels = {
  fa: { enter: 'حالت تمام‌صفحه', exit: 'خروج از تمام‌صفحه' },
  en: { enter: 'Enter kiosk mode', exit: 'Exit kiosk mode' },
  fi: { enter: 'Avaa kioskitila', exit: 'Poistu kioskitilasta' }
} as const;
const label = computed(() => labels[store.locale][kiosk.value ? 'exit' : 'enter']);

onMounted(async () => {
  port.value = await createWindowModePort();
  available.value = port.value.available;
  if (!available.value) {
    return;
  }

  const requestedByUrl = new URLSearchParams(window.location.search).get('kiosk') === '1';
  const requestedByDevice = localStorage.getItem(KIOSK_STORAGE_KEY) === '1';
  kiosk.value = await port.value.isKiosk();
  if ((requestedByUrl || requestedByDevice) && !kiosk.value) {
    await setKiosk(true);
  }
  window.addEventListener('keydown', handleShortcut);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleShortcut);
});

async function toggle(): Promise<void> {
  await setKiosk(!kiosk.value);
}

async function setKiosk(enabled: boolean): Promise<void> {
  if (port.value === null || busy.value) {
    return;
  }
  busy.value = true;
  try {
    await port.value.setKiosk(enabled);
    kiosk.value = enabled;
    localStorage.setItem(KIOSK_STORAGE_KEY, enabled ? '1' : '0');
  } finally {
    busy.value = false;
  }
}

function handleShortcut(event: KeyboardEvent): void {
  if (event.key === 'Escape' && kiosk.value) {
    event.preventDefault();
    void setKiosk(false);
    return;
  }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    void toggle();
  }
}
</script>

<template>
  <button
    v-if="available"
    type="button"
    class="desktop-mode-button"
    data-testid="desktop-kiosk-toggle"
    :aria-pressed="kiosk"
    :title="label"
    :disabled="busy"
    @click="toggle"
  >
    <span aria-hidden="true">{{ kiosk ? '⤢' : '⛶' }}</span>
    <span class="desktop-mode-label">{{ label }}</span>
  </button>
</template>
