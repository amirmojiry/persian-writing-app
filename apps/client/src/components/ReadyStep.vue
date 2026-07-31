<script setup lang="ts">
import AudioButton from './AudioButton.vue';
import { useMessages } from '@/composables/useMessages';

const emit = defineEmits<{ start: [] }>();
const { message } = useMessages();
</script>

<template>
  <section class="step-card ready-step" data-testid="ready-step">
    <AudioButton cue="ready" />
    <div class="ready-orbit" aria-hidden="true"><span>✏️</span></div>
    <h1>{{ message.readyTitle }}</h1>
    <p class="step-copy">{{ message.readyBody }}</p>
    <button type="button" class="primary-button jumbo" data-testid="start-practice" @click="emit('start')">
      {{ message.readyStart }}
    </button>
  </section>
</template>
