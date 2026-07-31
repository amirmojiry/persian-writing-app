<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Stroke, WritingSession } from '@persian-writing/core';
import AudioButton from './AudioButton.vue';
import WritingCanvas from './WritingCanvas.vue';
import { useMessages } from '@/composables/useMessages';

const props = defineProps<{ session: WritingSession }>();
const emit = defineEmits<{
  save: [strokes: readonly Stroke[]];
  next: [strokes: readonly Stroke[]];
}>();
const { message } = useMessages();
const strokes = ref<readonly Stroke[]>(structuredClone(props.session.draftStrokes));
const showDrawHint = ref(false);
const currentLetter = computed(() => props.session.graphemes[props.session.currentIndex] ?? '');

watch(
  () => props.session.currentIndex,
  () => {
    strokes.value = structuredClone(props.session.draftStrokes);
    showDrawHint.value = false;
  }
);

function updateStrokes(value: readonly Stroke[]): void {
  strokes.value = value;
  showDrawHint.value = false;
  emit('save', value);
}

function next(): void {
  if (strokes.value.length === 0) {
    showDrawHint.value = true;
    return;
  }
  emit('next', strokes.value);
}
</script>

<template>
  <section class="step-card practice-step" data-testid="practice-step">
    <AudioButton cue="nextLetter" />
    <div class="practice-heading">
      <div>
        <p class="eyebrow">{{ message.practiceTitle }}</p>
        <h1>{{ message.practiceLetter }} {{ session.currentIndex + 1 }} / {{ session.graphemes.length }}</h1>
      </div>
      <div class="letter-bubble" dir="rtl" lang="fa">{{ currentLetter }}</div>
    </div>
    <p class="unlimited-time">∞ {{ message.unlimitedTime }}</p>
    <WritingCanvas
      :key="session.currentIndex"
      :letter="currentLetter"
      :initial-strokes="session.draftStrokes"
      @update:strokes="updateStrokes"
    />
    <p v-if="showDrawHint" class="validation-message" role="alert">{{ message.drawFirst }}</p>
    <button type="button" class="primary-button" data-testid="next-letter" @click="next">
      {{ message.next }}
    </button>
  </section>
</template>
