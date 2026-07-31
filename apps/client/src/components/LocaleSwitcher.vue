<script setup lang="ts">
import type { UiLocale } from '@persian-writing/core';
import { useWritingStore } from '@/stores/writing';

const store = useWritingStore();
const locales: ReadonlyArray<{ readonly id: UiLocale; readonly label: string }> = [
  { id: 'fa', label: 'فا' },
  { id: 'en', label: 'EN' },
  { id: 'fi', label: 'FI' }
];
</script>

<template>
  <div class="locale-switcher" role="group" aria-label="Interface language">
    <button
      v-for="locale in locales"
      :key="locale.id"
      type="button"
      class="locale-button"
      :class="{ active: store.locale === locale.id }"
      :aria-pressed="store.locale === locale.id"
      @click="store.setLocale(locale.id)"
    >
      {{ locale.label }}
    </button>
  </div>
</template>
