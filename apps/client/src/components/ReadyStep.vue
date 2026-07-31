<script setup lang="ts">
import type { LessonSettings } from '@persian-writing/core';
import AudioButton from './AudioButton.vue';
import PracticeSettingsPanel from './PracticeSettingsPanel.vue';
import { useMessages } from '@/composables/useMessages';

const props = defineProps<{ settings: LessonSettings }>();
const emit = defineEmits<{
  start: [];
  'settings-change': [patch: Partial<LessonSettings>];
}>();
const { message } = useMessages();
</script>

<template>
  <section class="step-card ready-step" data-testid="ready-step">
    <AudioButton cue="ready" />
    <div class="ready-orbit" aria-hidden="true"><span>✏️</span></div>
    <h1>{{ message.readyTitle }}</h1>
    <p class="step-copy">{{ message.readyBody }}</p>
    <PracticeSettingsPanel
      :settings="props.settings"
      @change="emit('settings-change', $event)"
    />
    <button type="button" class="primary-button jumbo" data-testid="start-practice" @click="emit('start')">
      {{ message.readyStart }}
    </button>
  </section>
</template>
