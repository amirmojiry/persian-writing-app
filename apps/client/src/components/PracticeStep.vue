<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import {
  applicationLessonSettings,
  type LessonSettings,
  type Stroke,
  type WritingSession
} from '@persian-writing/core';
import { createPersianPracticeUnits } from '@persian-writing/lesson-persian';
import AudioButton from './AudioButton.vue';
import WritingCanvas from './WritingCanvas.vue';
import { useMessages } from '@/composables/useMessages';
import { usePracticeTimer } from '@/composables/usePracticeTimer';
import { useWritingStore } from '@/stores/writing';

const props = withDefaults(defineProps<{
  session: WritingSession;
  settings?: LessonSettings;
}>(), {
  settings: () => applicationLessonSettings
});
const emit = defineEmits<{
  save: [strokes: readonly Stroke[]];
  next: [strokes: readonly Stroke[]];
}>();
const { message } = useMessages();
const store = useWritingStore();
const strokes = shallowRef<Stroke[]>(cloneStrokes(props.session.draftStrokes));
const showDrawHint = ref(false);
const practiceUnits = computed(() => createPersianPracticeUnits(props.session.logicalName));
const currentUnit = computed(() => practiceUnits.value[props.session.currentIndex]);
const currentLetter = computed(() => currentUnit.value?.display ?? props.session.graphemes[props.session.currentIndex] ?? '');
const currentForm = computed(() => currentUnit.value?.form ?? 'isolated');
const sampleFontStack = computed(() => fontStackFor(props.settings.sampleFont));
const timedMode = computed(() => props.settings.timedMode);
const timeLimitSeconds = computed(() => props.settings.timeLimitSeconds);
const timerScope = computed(() => `${props.session.id}:${props.session.currentIndex}`);
const timer = usePracticeTimer({
  enabled: timedMode,
  durationSeconds: timeLimitSeconds,
  scopeKey: timerScope,
  onWarning: () => void store.playCue('timerWarning'),
  onExpire: () => void store.playCue('timeUp')
});

watch(
  () => props.session.currentIndex,
  () => {
    strokes.value = cloneStrokes(props.session.draftStrokes);
    showDrawHint.value = false;
  }
);

function replaceStrokes(value: readonly Stroke[]): void {
  const snapshot = cloneStrokes(value);
  strokes.value = snapshot;
  showDrawHint.value = false;
  emit('save', cloneStrokes(snapshot));
}

function updateStrokes(value: readonly Stroke[]): void {
  if (!timer.expired.value) {
    replaceStrokes(value);
  }
}

function undo(): void {
  if (strokes.value.length === 0 || timer.expired.value) {
    return;
  }
  replaceStrokes(strokes.value.slice(0, -1));
  void store.playCue('undo');
}

function clear(): void {
  if (strokes.value.length === 0 || timer.expired.value) {
    return;
  }
  replaceStrokes([]);
  void store.playCue('clear');
}

function retry(): void {
  replaceStrokes([]);
  timer.reset();
  void store.playCue('retry');
}

function next(): void {
  if (timer.expired.value) {
    return;
  }
  if (strokes.value.length === 0) {
    showDrawHint.value = true;
    return;
  }
  timer.complete();
  emit('next', cloneStrokes(strokes.value));
}

function cloneStrokes(input: readonly Stroke[]): Stroke[] {
  return input.map((stroke) => ({
    id: stroke.id,
    points: stroke.points.map((point) => ({ ...point }))
  }));
}

function fontStackFor(font: LessonSettings['sampleFont']): string {
  if (font === 'system-serif') {
    return 'Noto Naskh Arabic, Geeza Pro, Times New Roman, serif';
  }
  if (font === 'system-sans') {
    return 'Tahoma, Arial, sans-serif';
  }
  return 'Vazirmatn, Tahoma, Arial, sans-serif';
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
      <div
        class="letter-bubble"
        data-testid="contextual-letter"
        :data-form="currentForm"
        :style="{ fontFamily: sampleFontStack }"
        dir="rtl"
        lang="fa"
      >
        {{ currentLetter }}
      </div>
    </div>

    <div v-if="props.settings.timedMode" class="timer-panel" data-testid="timer-panel">
      <div class="timer-readout" :class="{ warning: timer.remainingSeconds.value <= 5, expired: timer.expired.value }">
        <span aria-hidden="true">⏱️</span>
        <strong data-testid="timer-seconds">{{ timer.remainingSeconds.value }}</strong>
        <span>{{ message.seconds }}</span>
      </div>
      <div class="timer-track" role="progressbar" :aria-valuenow="Math.round(timer.progress.value * 100)" aria-valuemin="0" aria-valuemax="100">
        <span :style="{ transform: `scaleX(${timer.progress.value})` }"></span>
      </div>
    </div>
    <p v-else class="unlimited-time">∞ {{ message.unlimitedTime }}</p>

    <div class="practice-workspace" :data-mode="props.settings.practiceMode">
      <aside
        v-if="props.settings.practiceMode === 'reference'"
        class="reference-sample"
        data-testid="reference-sample"
        :style="{ fontFamily: sampleFontStack }"
        dir="rtl"
        lang="fa"
        aria-hidden="true"
      >
        {{ currentLetter }}
      </aside>
      <WritingCanvas
        :key="session.currentIndex"
        :letter="currentLetter"
        :initial-strokes="strokes"
        :settings="props.settings"
        :disabled="timer.expired.value"
        @update:strokes="updateStrokes"
      />
    </div>

    <div class="writing-tools" aria-label="Writing tools">
      <button type="button" class="tool-button" data-testid="undo-stroke" :disabled="strokes.length === 0 || timer.expired.value" @click="undo">
        ↶ {{ message.undo }}
      </button>
      <button type="button" class="tool-button" data-testid="clear-letter" :disabled="strokes.length === 0 || timer.expired.value" @click="clear">
        ✕ {{ message.clear }}
      </button>
      <button type="button" class="tool-button" data-testid="retry-letter" @click="retry">
        ↻ {{ message.retry }}
      </button>
    </div>

    <div v-if="timer.expired.value" class="time-up-card" data-testid="time-up" role="alert">
      <strong>{{ message.timeUpTitle }}</strong>
      <span>{{ message.timeUpBody }}</span>
      <button type="button" class="secondary-button compact" @click="retry">{{ message.tryAgain }}</button>
    </div>
    <p v-if="showDrawHint" class="validation-message" role="alert">{{ message.drawFirst }}</p>
    <button type="button" class="primary-button" data-testid="next-letter" :disabled="timer.expired.value" @click="next">
      {{ message.next }}
    </button>
  </section>
</template>
