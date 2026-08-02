<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import DesktopModeButton from '@/components/DesktopModeButton.vue';
import LocaleSwitcher from '@/components/LocaleSwitcher.vue';
import NameEntryStep from '@/components/NameEntryStep.vue';
import PracticeStep from '@/components/PracticeStep.vue';
import PrivacySyncPanel from '@/components/PrivacySyncPanel.vue';
import ReadyStep from '@/components/ReadyStep.vue';
import ResultStep from '@/components/ResultStep.vue';
import WizardStep from '@/components/WizardStep.vue';
import { useMessages } from '@/composables/useMessages';
import { flushSync } from '@/services/syncService';
import { useWritingStore } from '@/stores/writing';

const store = useWritingStore();
const { message, direction } = useMessages();
const online = ref(typeof navigator === 'undefined' ? true : navigator.onLine);
const previousName = computed(() => store.profiles[0]?.persianName ?? '');

async function updateNetworkState(): Promise<void> {
  online.value = navigator.onLine;
  if (online.value) await flushSync();
}

onMounted(async () => {
  window.addEventListener('online', updateNetworkState);
  window.addEventListener('offline', updateNetworkState);
  await store.initialize();
  if (online.value) await flushSync();
});

onBeforeUnmount(() => {
  window.removeEventListener('online', updateNetworkState);
  window.removeEventListener('offline', updateNetworkState);
});
</script>

<template>
  <main class="app-shell" :dir="direction">
    <header class="app-header">
      <div class="brand-lockup">
        <span class="brand-mark" aria-hidden="true">ن</span>
        <div>
          <strong>{{ message.appName }}</strong>
          <small :class="{ offline: !online }">● {{ message.offlineReady }}</small>
        </div>
      </div>
      <div class="header-actions">
        <PrivacySyncPanel :locale="store.locale" />
        <DesktopModeButton />
        <LocaleSwitcher />
      </div>
    </header>

    <div v-if="store.resumed" class="resume-banner" role="status">
      {{ message.resumeNotice }}
    </div>

    <div v-if="!store.initialized" class="loading-state">{{ message.loading }}</div>
    <div v-else-if="store.errorMessage" class="error-state" role="alert">{{ store.errorMessage }}</div>
    <WizardStep v-else-if="store.screen === 'wizard'" @success="store.passWizard" />
    <NameEntryStep
      v-else-if="store.screen === 'name'"
      :initial-name="previousName"
      @submit="store.submitName"
    />
    <ReadyStep
      v-else-if="store.screen === 'ready'"
      :settings="store.lessonSettings"
      @settings-change="store.updateLessonSettings"
      @start="store.beginPractice"
    />
    <PracticeStep
      v-else-if="store.screen === 'practice' && store.session"
      :session="store.session"
      :settings="store.lessonSettings"
      @save="store.saveDraft"
      @next="store.completeLetter"
    />
    <ResultStep
      v-else-if="store.screen === 'result' && store.session"
      :session="store.session"
      @restart="store.startAgain"
    />
  </main>
</template>
