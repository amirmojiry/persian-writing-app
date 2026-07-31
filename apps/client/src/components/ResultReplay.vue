<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { createReplayPlan, type ReplaySegment, type WritingSession } from '@persian-writing/core';
import { useReducedMotion } from '@/composables/useReducedMotion';

const props = defineProps<{
  session: WritingSession;
  active: boolean;
}>();
const emit = defineEmits<{ finished: [] }>();
const reducedMotion = useReducedMotion();
const plan = computed(() => createReplayPlan(props.session));
const elapsedMs = ref(0);
let frameId: number | null = null;
let startedAt = 0;

function stop(): void {
  if (frameId !== null && typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(frameId);
  }
  frameId = null;
}

function tick(now: number): void {
  elapsedMs.value = Math.min(plan.value.totalDurationMs, now - startedAt);
  if (elapsedMs.value >= plan.value.totalDurationMs) {
    frameId = null;
    emit('finished');
    return;
  }
  frameId = requestAnimationFrame(tick);
}

function start(): void {
  stop();
  if (!props.active) {
    elapsedMs.value = 0;
    return;
  }
  if (reducedMotion.value || typeof requestAnimationFrame !== 'function') {
    elapsedMs.value = plan.value.totalDurationMs;
    emit('finished');
    return;
  }
  elapsedMs.value = 0;
  startedAt = performance.now();
  frameId = requestAnimationFrame(tick);
}

function segmentProgress(segment: ReplaySegment): number {
  return Math.max(0, Math.min(1, (elapsedMs.value - segment.startsAtMs) / segment.durationMs));
}

watch(
  () => [props.active, props.session.id, reducedMotion.value] as const,
  start
);

onMounted(start);
onBeforeUnmount(stop);
</script>

<template>
  <div class="replay-preview" data-testid="stroke-replay" :data-reduced-motion="reducedMotion">
    <svg :viewBox="`0 0 ${plan.width} ${plan.height}`" role="img" :aria-label="session.logicalName">
      <rect :width="plan.width" :height="plan.height" rx="28" fill="white" />
      <g color="#312e81">
        <path
          v-for="segment in plan.segments"
          :key="segment.id"
          :d="segment.path"
          pathLength="1"
          fill="none"
          stroke="currentColor"
          stroke-width="10"
          stroke-linecap="round"
          stroke-linejoin="round"
          :style="{
            strokeDasharray: 1,
            strokeDashoffset: 1 - segmentProgress(segment)
          }"
        />
      </g>
      <text
        :x="plan.width / 2"
        :y="plan.height - 42"
        text-anchor="middle"
        direction="rtl"
        unicode-bidi="plaintext"
        font-size="52"
        font-family="Vazirmatn, Tahoma, sans-serif"
        fill="#312e81"
      >{{ session.logicalName }}</text>
    </svg>
  </div>
</template>
