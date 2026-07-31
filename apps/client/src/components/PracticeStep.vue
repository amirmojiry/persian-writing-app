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
const strokes = shallowRef<Stroke[]>(cloneStrokes(props.session.draftStrokes));
const showDrawHint = ref(false);
const practiceUnits = computed(() => createPersianPracticeUnits(props.session.logicalName));
const currentUnit = computed(() => practiceUnits.value[props.session.currentIndex]);
const currentLetter = computed(() => currentUnit.value?.display ?? props.session.graphemes[props.session.currentIndex] ?? '');
const currentForm = computed(() => currentUnit.value?.form ?? 'isolated');
const sampleFontStack = computed(() => fontStackFor(props.settings.sampleFont));

watch(
  () => props.session.currentIndex,
  () => {
    strokes.value = cloneStrokes(props.session.draftStrokes);
    showDrawHint.value = false;
  }
);

function updateStrokes(value: readonly Stroke[]): void {
  const snapshot = cloneStrokes(value);
  strokes.value = snapshot;
  showDrawHint.value = false;
  emit('save', cloneStrokes(snapshot));
}

function next(): void {
  if (strokes.value.length === 0) {
    showDrawHint.value = true;
    return;
  }
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
    <p class="unlimited-time">∞ {{ message.unlimitedTime }}</p>
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
        :initial-strokes="session.draftStrokes"
        :settings="props.settings"
        @update:strokes="updateStrokes"
      />
    </div>
    <p v-if="showDrawHint" class="validation-message" role="alert">{{ message.drawFirst }}</p>
    <button type="button" class="primary-button" data-testid="next-letter" @click="next">
      {{ message.next }}
    </button>
  </section>
</template>
