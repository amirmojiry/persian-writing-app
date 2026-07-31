<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { createCompositionSvg, type WritingSession } from '@persian-writing/core';
import AudioButton from './AudioButton.vue';
import ResultReplay from './ResultReplay.vue';
import { BrowserResultExporter } from '@/adapters/export/BrowserResultExporter';
import { useMessages } from '@/composables/useMessages';
import { useWritingStore } from '@/stores/writing';

const props = defineProps<{ session: WritingSession }>();
const emit = defineEmits<{ restart: [] }>();
const { message } = useMessages();
const store = useWritingStore();
const exporter = new BrowserResultExporter();
const replayVisible = ref(false);
const busyAction = ref<string | null>(null);
const actionStatus = ref('');
const compositionUrl = computed(() => {
  const svg = createCompositionSvg(props.session);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
});

function printResult(): void {
  window.print();
}

async function replay(): Promise<void> {
  replayVisible.value = false;
  await nextTick();
  replayVisible.value = true;
  void store.playCue('replay');
}

function downloadSvg(): void {
  exporter.downloadSvg(props.session);
  actionStatus.value = message.downloadStarted;
}

async function runExport(action: 'png' | 'pdf' | 'share'): Promise<void> {
  busyAction.value = action;
  actionStatus.value = '';
  try {
    if (action === 'png') {
      await exporter.downloadPng(props.session);
      actionStatus.value = message.downloadStarted;
    } else if (action === 'pdf') {
      await exporter.downloadPdf(props.session);
      actionStatus.value = message.downloadStarted;
    } else {
      const outcome = await exporter.share(props.session);
      actionStatus.value = outcome === 'shared' ? message.shareSuccess : message.shareFallback;
    }
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      actionStatus.value = '';
    } else {
      actionStatus.value = message.exportFailed;
    }
  } finally {
    busyAction.value = null;
  }
}
</script>

<template>
  <section class="step-card result-step" data-testid="result-step">
    <AudioButton cue="complete" />
    <div class="celebration" aria-hidden="true">🎉</div>
    <h1>{{ message.resultTitle }}</h1>
    <p class="step-copy">{{ message.resultBody }}</p>
    <div class="composition-preview" data-testid="composition-svg">
      <ResultReplay v-if="replayVisible" :session="session" :active="true" />
      <img v-else :src="compositionUrl" :alt="session.logicalName" style="display:block;width:100%;height:auto" />
    </div>

    <div class="result-actions primary-result-actions">
      <button type="button" class="primary-button" data-testid="replay-result" @click="replay">
        ▶ {{ message.replay }}
      </button>
      <button type="button" class="secondary-button" data-testid="print-result" @click="printResult">
        {{ message.print }}
      </button>
    </div>

    <div class="export-actions" aria-label="Export result">
      <button type="button" class="export-button" data-testid="download-svg" @click="downloadSvg">
        SVG
      </button>
      <button type="button" class="export-button" data-testid="download-png" :disabled="busyAction !== null" @click="runExport('png')">
        {{ busyAction === 'png' ? message.preparing : 'PNG' }}
      </button>
      <button type="button" class="export-button" data-testid="download-pdf" :disabled="busyAction !== null" @click="runExport('pdf')">
        {{ busyAction === 'pdf' ? message.preparing : 'PDF' }}
      </button>
      <button type="button" class="export-button share-button" data-testid="share-result" :disabled="busyAction !== null" @click="runExport('share')">
        {{ busyAction === 'share' ? message.preparing : message.share }}
      </button>
    </div>
    <p v-if="actionStatus" class="export-status" role="status">{{ actionStatus }}</p>

    <button type="button" class="secondary-button restart-button" data-testid="start-again" @click="emit('restart')">
      {{ message.startAgain }}
    </button>
  </section>
</template>
