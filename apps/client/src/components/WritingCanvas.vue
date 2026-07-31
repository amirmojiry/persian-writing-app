<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Stroke, StrokePoint, Unsubscribe } from '@persian-writing/core';
import { PointerInputAdapter } from '@/adapters/input/PointerInputAdapter';

const props = defineProps<{
  letter: string;
  initialStrokes: readonly Stroke[];
}>();
const emit = defineEmits<{ 'update:strokes': [strokes: readonly Stroke[]] }>();

const surface = ref<HTMLElement | null>(null);
const strokes = ref<Stroke[]>(structuredClone(props.initialStrokes));
const activePoints = ref<StrokePoint[]>([]);
const adapter = new PointerInputAdapter();
const unsubscribers: Unsubscribe[] = [];

const visibleStrokes = computed<readonly Stroke[]>(() => {
  if (activePoints.value.length === 0) {
    return strokes.value;
  }
  return [...strokes.value, { id: 'active-stroke', points: activePoints.value }];
});

watch(
  () => [props.letter, props.initialStrokes] as const,
  () => {
    strokes.value = structuredClone(props.initialStrokes);
    activePoints.value = [];
  },
  { deep: true }
);

onMounted(async () => {
  unsubscribers.push(adapter.onStrokeState((state) => {
    if (state === 'down') {
      activePoints.value = [];
      return;
    }
    if (state === 'up' && activePoints.value.length > 0) {
      strokes.value = [
        ...strokes.value,
        { id: createStrokeId(), points: structuredClone(activePoints.value) }
      ];
      activePoints.value = [];
      emit('update:strokes', structuredClone(strokes.value));
    }
  }));
  unsubscribers.push(adapter.onPoint((point) => {
    activePoints.value = [...activePoints.value, point];
  }));
  if (surface.value !== null) {
    await adapter.start(surface.value);
  }
});

onBeforeUnmount(async () => {
  for (const unsubscribe of unsubscribers) {
    unsubscribe();
  }
  await adapter.stop();
});

function pathFor(stroke: Stroke): string {
  return stroke.points.map((point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${command} ${Math.round(point.x * 1000)} ${Math.round(point.y * 600)}`;
  }).join(' ');
}

function createStrokeId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `stroke-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
</script>

<template>
  <div
    ref="surface"
    class="writing-surface"
    data-testid="writing-surface"
    role="application"
    :aria-label="`Writing canvas for ${letter}`"
  >
    <div class="canvas-reference" aria-hidden="true">{{ letter }}</div>
    <svg class="stroke-layer" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
      <line x1="40" y1="430" x2="960" y2="430" class="guide-line" />
      <path
        v-for="stroke in visibleStrokes"
        :key="stroke.id"
        :d="pathFor(stroke)"
        class="child-stroke"
      />
    </svg>
  </div>
</template>
