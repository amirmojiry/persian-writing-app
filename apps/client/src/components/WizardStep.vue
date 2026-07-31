<script setup lang="ts">
import AudioButton from './AudioButton.vue';
import { useMessages } from '@/composables/useMessages';

const emit = defineEmits<{ success: [] }>();
const { message } = useMessages();
</script>

<template>
  <section class="step-card wizard-step" data-testid="wizard-step">
    <AudioButton cue="wizardPrompt" />
    <div class="step-icon" aria-hidden="true">✨</div>
    <p class="eyebrow">{{ message.wizardTitle }}</p>
    <h1>{{ message.wizardQuestion }}</h1>
    <p class="step-copy">{{ message.wizardHint }}</p>
    <button
      type="button"
      class="wizard-check"
      data-testid="wizard-check"
      @click="emit('success')"
    >
      <span class="wizard-star" aria-hidden="true">★</span>
      <span>{{ message.wizardQuestion }}</span>
    </button>
  </section>
</template>
