<script setup lang="ts">
import type {
  GuidelineStyle,
  LessonSettings,
  PracticeMode,
  SampleFont
} from '@persian-writing/core';
import { useMessages } from '@/composables/useMessages';

const props = defineProps<{ settings: LessonSettings }>();
const emit = defineEmits<{ change: [patch: Partial<LessonSettings>] }>();
const { message } = useMessages();

function setPracticeMode(practiceMode: PracticeMode): void {
  emit('change', { practiceMode });
}

function setGuidelineStyle(event: Event): void {
  emit('change', { guidelineStyle: (event.target as HTMLSelectElement).value as GuidelineStyle });
}

function setGuidelineOpacity(event: Event): void {
  emit('change', { guidelineOpacity: Number((event.target as HTMLInputElement).value) / 100 });
}

function setGuidelineThickness(event: Event): void {
  emit('change', { guidelineThickness: Number((event.target as HTMLInputElement).value) });
}

function setBaselinePosition(event: Event): void {
  emit('change', { baselinePosition: Number((event.target as HTMLInputElement).value) / 100 });
}

function setSampleFont(event: Event): void {
  emit('change', { sampleFont: (event.target as HTMLSelectElement).value as SampleFont });
}
</script>

<template>
  <section class="practice-settings" data-testid="practice-settings">
    <div class="settings-heading">
      <div>
        <h2>{{ message.settingsTitle }}</h2>
        <p>{{ message.settingsHint }}</p>
      </div>
      <span aria-hidden="true">⚙️</span>
    </div>

    <fieldset class="mode-fieldset">
      <legend>{{ message.practiceModeLabel }}</legend>
      <div class="mode-options">
        <button
          type="button"
          class="mode-option"
          data-testid="mode-trace"
          :class="{ active: props.settings.practiceMode === 'trace' }"
          :aria-pressed="props.settings.practiceMode === 'trace'"
          @click="setPracticeMode('trace')"
        >
          <strong>{{ message.traceMode }}</strong>
          <small>{{ message.traceModeHint }}</small>
        </button>
        <button
          type="button"
          class="mode-option"
          data-testid="mode-reference"
          :class="{ active: props.settings.practiceMode === 'reference' }"
          :aria-pressed="props.settings.practiceMode === 'reference'"
          @click="setPracticeMode('reference')"
        >
          <strong>{{ message.referenceMode }}</strong>
          <small>{{ message.referenceModeHint }}</small>
        </button>
      </div>
    </fieldset>

    <div class="settings-grid">
      <label class="setting-control">
        <span>{{ message.guidelineStyleLabel }}</span>
        <select
          data-testid="guideline-style"
          :value="props.settings.guidelineStyle"
          @change="setGuidelineStyle"
        >
          <option value="three-line">{{ message.guidelineThreeLine }}</option>
          <option value="baseline">{{ message.guidelineBaseline }}</option>
          <option value="grid">{{ message.guidelineGrid }}</option>
          <option value="none">{{ message.guidelineNone }}</option>
        </select>
      </label>

      <label class="setting-control">
        <span>{{ message.sampleFontLabel }}</span>
        <select data-testid="sample-font" :value="props.settings.sampleFont" @change="setSampleFont">
          <option value="persian-sans">{{ message.fontPersianSans }}</option>
          <option value="system-sans">{{ message.fontSystemSans }}</option>
          <option value="system-serif">{{ message.fontSystemSerif }}</option>
        </select>
      </label>

      <label class="setting-control range-control">
        <span>{{ message.guidelineOpacityLabel }}: {{ Math.round(props.settings.guidelineOpacity * 100) }}٪</span>
        <input
          data-testid="guideline-opacity"
          type="range"
          min="8"
          max="100"
          step="1"
          :value="Math.round(props.settings.guidelineOpacity * 100)"
          @input="setGuidelineOpacity"
        />
      </label>

      <label class="setting-control range-control">
        <span>{{ message.guidelineThicknessLabel }}: {{ props.settings.guidelineThickness }}</span>
        <input
          data-testid="guideline-thickness"
          type="range"
          min="1"
          max="10"
          step="1"
          :value="props.settings.guidelineThickness"
          @input="setGuidelineThickness"
        />
      </label>

      <label class="setting-control range-control settings-wide">
        <span>{{ message.baselinePositionLabel }}: {{ Math.round(props.settings.baselinePosition * 100) }}٪</span>
        <input
          data-testid="baseline-position"
          type="range"
          min="45"
          max="88"
          step="1"
          :value="Math.round(props.settings.baselinePosition * 100)"
          @input="setBaselinePosition"
        />
      </label>
    </div>
  </section>
</template>
