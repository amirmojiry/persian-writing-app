<script setup lang="ts">
import { computed } from 'vue';
import { createCompositionSvg, type WritingSession } from '@persian-writing/core';
import AudioButton from './AudioButton.vue';
import { useMessages } from '@/composables/useMessages';

const props = defineProps<{ session: WritingSession }>();
const emit = defineEmits<{ restart: [] }>();
const { message } = useMessages();
const svg = computed(() => createCompositionSvg(props.session));

function printResult(): void {
  window.print();
}
</script>

<template>
  <section class="step-card result-step" data-testid="result-step">
    <AudioButton cue="complete" />
    <div class="celebration" aria-hidden="true">🎉</div>
    <h1>{{ message.resultTitle }}</h1>
    <p class="step-copy">{{ message.resultBody }}</p>
    <div class="composition-preview" data-testid="composition-svg" v-html="svg" />
    <div class="result-actions">
      <button type="button" class="primary-button" data-testid="print-result" @click="printResult">
        {{ message.print }}
      </button>
      <button type="button" class="secondary-button" data-testid="start-again" @click="emit('restart')">
        {{ message.startAgain }}
      </button>
    </div>
  </section>
</template>
