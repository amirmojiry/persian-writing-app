<script setup lang="ts">
import { computed, ref } from 'vue';
import type { UiLocale } from '@persian-writing/core';
import { AdminApiClient } from '@/adapters/admin/AdminApiClient';
import { adminMessages } from '@/i18n/adminMessages';
import {
  hasLocalAdminPin,
  readLocalAdminSettings,
  saveLocalAdminSettings,
  setLocalAdminPin,
  verifyLocalAdminPin
} from '@/services/localAdminService';
import { tokenStore } from '@/services/syncService';
import { useWritingStore } from '@/stores/writing';

const props = defineProps<{ readonly locale: UiLocale }>();
const store = useWritingStore();
const api = new AdminApiClient();
const text = computed(() => adminMessages[props.locale]);
const pin = ref('');
const unlocked = ref(false);
const configured = ref(hasLocalAdminPin());
const status = ref('');
const busy = ref(false);
const settings = ref(readLocalAdminSettings());
const timedMode = ref(settings.value.defaults.timedMode ?? false);
const timeLimitSeconds = ref(settings.value.defaults.timeLimitSeconds ?? 30);
const lockTimedMode = ref(settings.value.locked.includes('timedMode'));
const cloudSessions = ref<readonly Readonly<Record<string, unknown>>[]>([]);
const endpointUrl = ref('');
const forwardingEnabled = ref(false);

async function unlock(): Promise<void> {
  busy.value = true;
  try {
    if (!configured.value) {
      await setLocalAdminPin(pin.value);
      configured.value = true;
      unlocked.value = true;
    } else {
      unlocked.value = await verifyLocalAdminPin(pin.value);
    }
    status.value = unlocked.value ? text.value.statusReady : text.value.statusDenied;
    pin.value = '';
  } catch {
    status.value = text.value.statusFailed;
  } finally {
    busy.value = false;
  }
}

function saveSettings(): void {
  const next = {
    defaults: {
      timedMode: timedMode.value,
      timeLimitSeconds: timeLimitSeconds.value
    },
    locked: lockTimedMode.value ? ['timedMode'] as const : []
  };
  saveLocalAdminSettings(next);
  settings.value = next;
  store.reloadLessonSettings();
  status.value = text.value.statusSaved;
}

async function loadSessions(): Promise<void> {
  const token = tokenStore.get();
  if (token === null) {
    status.value = text.value.statusDenied;
    return;
  }
  busy.value = true;
  try {
    const response = await api.listSessions(token, '?perPage=50');
    cloudSessions.value = response.data;
    status.value = text.value.statusReady;
  } catch {
    status.value = text.value.statusFailed;
  } finally {
    busy.value = false;
  }
}

async function createExport(format: 'csv' | 'json'): Promise<void> {
  const token = tokenStore.get();
  if (token === null) {
    status.value = text.value.statusDenied;
    return;
  }
  busy.value = true;
  try {
    const response = await api.createExport(token, format, {});
    status.value = `${response.export.status}: ${response.export.id}`;
  } catch {
    status.value = text.value.statusFailed;
  } finally {
    busy.value = false;
  }
}

async function saveForwarding(): Promise<void> {
  const token = tokenStore.get();
  if (token === null || !endpointUrl.value.startsWith('https://')) {
    status.value = text.value.statusDenied;
    return;
  }
  busy.value = true;
  try {
    await api.saveForwarding(token, {
      name: 'Primary forwarding endpoint',
      endpointUrl: endpointUrl.value,
      enabled: forwardingEnabled.value,
      aggregateTypes: ['profile', 'session', 'event'],
      maxAttempts: 5,
      backoffSeconds: 30
    });
    status.value = text.value.statusSaved;
  } catch {
    status.value = text.value.statusFailed;
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <details class="admin-panel">
    <summary>{{ text.title }}</summary>
    <div v-if="!unlocked" class="admin-unlock">
      <input
        v-model.trim="pin"
        type="password"
        inputmode="numeric"
        autocomplete="off"
        :placeholder="configured ? text.enterPin : text.setupPin"
      >
      <button type="button" :disabled="busy || pin.length < 6" @click="unlock">{{ text.unlock }}</button>
    </div>

    <template v-else>
      <section>
        <h3>{{ text.settings }}</h3>
        <label><input v-model="timedMode" type="checkbox"> {{ text.timedMode }}</label>
        <label>{{ text.timeLimit }} <input v-model.number="timeLimitSeconds" type="number" min="5" max="300"></label>
        <label><input v-model="lockTimedMode" type="checkbox"> {{ text.lockTimedMode }}</label>
        <button type="button" @click="saveSettings">{{ text.save }}</button>
      </section>

      <section>
        <h3>{{ text.cloud }}</h3>
        <button type="button" :disabled="busy" @click="loadSessions">{{ text.loadSessions }}</button>
        <button type="button" :disabled="busy" @click="createExport('csv')">{{ text.exportCsv }}</button>
        <button type="button" :disabled="busy" @click="createExport('json')">{{ text.exportJson }}</button>
        <ol v-if="cloudSessions.length > 0">
          <li v-for="session in cloudSessions" :key="String(session.id)">
            {{ session.aggregate_id }} — {{ String((session.payload as Record<string, unknown>).status ?? '') }}
          </li>
        </ol>
      </section>

      <section>
        <h3>{{ text.forwarding }}</h3>
        <input v-model.trim="endpointUrl" type="url" :placeholder="text.endpoint">
        <label><input v-model="forwardingEnabled" type="checkbox"> {{ text.enabled }}</label>
        <button type="button" :disabled="busy" @click="saveForwarding">{{ text.save }}</button>
      </section>

      <button type="button" @click="unlocked = false">{{ text.lock }}</button>
    </template>
    <small role="status">{{ status }}</small>
  </details>
</template>
