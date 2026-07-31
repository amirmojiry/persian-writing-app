<script setup lang="ts">
import type { AudioCue } from '@persian-writing/core';
import { useMessages } from '@/composables/useMessages';
import { useWritingStore } from '@/stores/writing';

const props = defineProps<{ cue: AudioCue }>();
const store = useWritingStore();
const { message } = useMessages();
</script>

<template>
  <button
    type="button"
    class="audio-button"
    :aria-label="message.audioLabel"
    :title="message.audioLabel"
    @click="store.playCue(props.cue)"
  >
    <span aria-hidden="true">🔊</span>
  </button>
</template>
