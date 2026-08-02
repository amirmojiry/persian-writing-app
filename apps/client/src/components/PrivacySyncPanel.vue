<script setup lang="ts">
import { computed, ref } from 'vue';
import type { UiLocale } from '@persian-writing/core';
import { AuthApiClient } from '@/adapters/auth/AuthApiClient';
import { syncMessages } from '@/i18n/syncMessages';
import {
  deviceId,
  flushSync,
  readConsent,
  setAccountSyncConsent,
  tokenStore
} from '@/services/syncService';

const props = defineProps<{ readonly locale: UiLocale }>();
const api = new AuthApiClient();
const enabled = ref(readConsent().accountSync);
const email = ref('');
const code = ref('');
const signedInEmail = ref<string | null>(null);
const status = ref('');
const busy = ref(false);
const text = computed(() => syncMessages[props.locale]);

async function toggleConsent(): Promise<void> {
  busy.value = true;
  try {
    await setAccountSyncConsent(enabled.value);
    status.value = enabled.value ? text.value.pending : text.value.localOnly;
    if (enabled.value && tokenStore.get() !== null) {
      await flushSync();
      status.value = text.value.synced;
    }
  } catch {
    status.value = text.value.failed;
  } finally {
    busy.value = false;
  }
}

async function requestCode(): Promise<void> {
  if (email.value.trim() === '') return;
  busy.value = true;
  try {
    await api.requestOtp(email.value, deviceId());
    status.value = text.value.sendCode;
  } catch {
    status.value = text.value.failed;
  } finally {
    busy.value = false;
  }
}

async function signIn(): Promise<void> {
  busy.value = true;
  try {
    const session = await api.verifyOtp({
      email: email.value,
      code: code.value,
      deviceId: deviceId(),
      deviceName: 'Persian Writing App'
    });
    tokenStore.set(session.token);
    signedInEmail.value = session.user.email;
    status.value = enabled.value ? text.value.synced : text.value.localOnly;
    if (enabled.value) await flushSync();
  } catch {
    status.value = text.value.failed;
  } finally {
    busy.value = false;
  }
}

async function signOut(): Promise<void> {
  const token = tokenStore.get();
  if (token !== null) await api.logout(token);
  tokenStore.clear();
  signedInEmail.value = null;
  status.value = text.value.localOnly;
}
</script>

<template>
  <details class="privacy-sync-panel">
    <summary>{{ text.title }}</summary>
    <p>{{ enabled ? text.pending : text.localOnly }}</p>
    <label>
      <input v-model="enabled" type="checkbox" :disabled="busy" @change="toggleConsent">
      {{ text.enable }}
    </label>
    <template v-if="enabled && signedInEmail === null">
      <div class="sync-auth-row">
        <input v-model.trim="email" type="email" autocomplete="email" :placeholder="text.email">
        <button type="button" :disabled="busy || !email" @click="requestCode">{{ text.sendCode }}</button>
      </div>
      <div class="sync-auth-row">
        <input v-model.trim="code" inputmode="numeric" maxlength="4" :placeholder="text.code">
        <button type="button" :disabled="busy || code.length !== 4" @click="signIn">{{ text.signIn }}</button>
      </div>
    </template>
    <div v-else-if="signedInEmail !== null">
      <span>{{ text.signedIn }} {{ signedInEmail }}</span>
      <button type="button" @click="signOut">{{ text.signOut }}</button>
    </div>
    <small role="status">{{ status }}</small>
  </details>
</template>
