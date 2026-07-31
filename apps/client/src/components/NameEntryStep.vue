<script setup lang="ts">
import { computed, ref } from 'vue';
import { persianKeyboardRows } from '@persian-writing/lesson-persian';
import AudioButton from './AudioButton.vue';
import { useMessages } from '@/composables/useMessages';

const props = withDefaults(defineProps<{ initialName?: string }>(), { initialName: '' });
const emit = defineEmits<{ submit: [name: string] }>();
const { message } = useMessages();
const name = ref(props.initialName);
const canContinue = computed(() => name.value.normalize('NFC').trim().length > 0);

function append(value: string): void {
  if (Array.from(name.value).length < 32) {
    name.value += value;
  }
}

function backspace(): void {
  const segments = typeof Intl.Segmenter === 'function'
    ? Array.from(new Intl.Segmenter('fa', { granularity: 'grapheme' }).segment(name.value), ({ segment }) => segment)
    : Array.from(name.value);
  segments.pop();
  name.value = segments.join('');
}

function submit(): void {
  if (canContinue.value) {
    emit('submit', name.value);
  }
}
</script>

<template>
  <section class="step-card name-step" data-testid="name-step">
    <AudioButton cue="ready" />
    <p class="eyebrow">{{ message.nameTitle }}</p>
    <h1>{{ message.namePrompt }}</h1>
    <input
      v-model="name"
      class="name-input"
      data-testid="name-input"
      dir="rtl"
      lang="fa"
      maxlength="32"
      autocomplete="off"
      :placeholder="message.namePlaceholder"
      @keydown.enter="submit"
    />
    <div class="persian-keyboard" data-testid="persian-keyboard" dir="rtl">
      <div v-for="(row, rowIndex) in persianKeyboardRows" :key="rowIndex" class="keyboard-row">
        <button
          v-for="letter in row"
          :key="letter"
          type="button"
          class="key-button"
          @click="append(letter)"
        >
          {{ letter }}
        </button>
      </div>
      <div class="keyboard-row keyboard-actions">
        <button type="button" class="key-button wide" @click="backspace">⌫ {{ message.keyboardBackspace }}</button>
        <button type="button" class="key-button wide" @click="append(' ')">{{ message.keyboardSpace }}</button>
      </div>
    </div>
    <button
      type="button"
      class="primary-button"
      data-testid="confirm-name"
      :disabled="!canContinue"
      @click="submit"
    >
      {{ message.nameContinue }}
    </button>
  </section>
</template>
