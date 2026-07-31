<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import {
  applicationLessonSettings,
  type LessonSettings,
  type Stroke,
  type StrokePoint,
  type Unsubscribe
} from '@persian-writing/core';
import { PointerInputAdapter } from '@/adapters/input/PointerInputAdapter';

interface GuideSegment {
  readonly id: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly baseline: boolean;
}

const props = withDefaults(defineProps<{
  letter: string;
  initialStrokes: readonly Stroke[];
  lockedStrokes?: readonly Stroke[];
  settings?: LessonSettings;
  disabled?: boolean;
  cumulative?: boolean;
  totalGraphemes?: number;
}>(), {
  lockedStrokes: () => [],
  settings: () => applicationLessonSettings,
  disabled: false,
  cumulative: false,
  totalGraphemes: 1
});
const emit = defineEmits<{ 'update:strokes': [strokes: readonly Stroke[]] }>();

const surface = ref<HTMLElement | null>(null);
const strokes = shallowRef<Stroke[]>(cloneStrokes(props.initialStrokes));
const activePoints = shallowRef<StrokePoint[]>([]);
const adapter = new PointerInputAdapter();
const unsubscribers: Unsubscribe[] = [];

const visibleCurrentStrokes = computed<readonly Stroke[]>(() => {
  if (activePoints.value.length === 0) {
    return strokes.value;
  }
  return [...strokes.value, { id: 'active-stroke', points: activePoints.value }];
});

const baselineY = computed(() => Math.round(props.settings.baselinePosition * 600));
const guideSegments = computed<readonly GuideSegment[]>(() => createGuideSegments(
  props.settings.guidelineStyle,
  baselineY.value
));
const sampleFontStack = computed(() => fontStackFor(props.settings.sampleFont));
const referenceFontSize = computed(() => {
  if (!props.cumulative) {
    return undefined;
  }
  const total = Math.max(1, props.totalGraphemes);
  const viewportSize = Math.max(10, Math.min(24, 70 / total));
  const maximumSize = Math.max(7, Math.min(15, 52 / total));
  return `clamp(4rem, ${viewportSize}vw, ${maximumSize}rem)`;
});

watch(
  () => [props.letter, props.initialStrokes] as const,
  () => {
    strokes.value = cloneStrokes(props.initialStrokes);
    activePoints.value = [];
  },
  { deep: true }
);

watch(() => props.disabled, (disabled) => {
  if (disabled) {
    activePoints.value = [];
  }
});

onMounted(async () => {
  unsubscribers.push(adapter.onStrokeState((state) => {
    if (props.disabled) {
      activePoints.value = [];
      return;
    }
    if (state === 'down') {
      activePoints.value = [];
      return;
    }
    if (state === 'up' && activePoints.value.length > 0) {
      const committedStroke: Stroke = {
        id: createStrokeId(),
        points: clonePoints(activePoints.value)
      };
      strokes.value = [...strokes.value, committedStroke];
      activePoints.value = [];
      emit('update:strokes', cloneStrokes(strokes.value));
    }
  }));
  unsubscribers.push(adapter.onPoint((point) => {
    if (!props.disabled) {
      activePoints.value = [...activePoints.value, { ...point }];
    }
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

function clonePoints(input: readonly StrokePoint[]): StrokePoint[] {
  return input.map((point) => ({ ...point }));
}

function cloneStrokes(input: readonly Stroke[]): Stroke[] {
  return input.map((stroke) => ({
    id: stroke.id,
    points: clonePoints(stroke.points)
  }));
}

function pathFor(stroke: Stroke): string {
  return stroke.points.map((point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${command} ${Math.round(point.x * 1000)} ${Math.round(point.y * 600)}`;
  }).join(' ');
}

function createGuideSegments(style: LessonSettings['guidelineStyle'], baseline: number): readonly GuideSegment[] {
  if (style === 'none') {
    return [];
  }

  const baselineSegment: GuideSegment = {
    id: 'baseline',
    x1: 40,
    y1: baseline,
    x2: 960,
    y2: baseline,
    baseline: true
  };

  if (style === 'baseline') {
    return [baselineSegment];
  }

  if (style === 'three-line') {
    const middle = Math.max(90, baseline - 145);
    const top = Math.max(35, baseline - 290);
    return [
      { id: 'top', x1: 40, y1: top, x2: 960, y2: top, baseline: false },
      { id: 'middle', x1: 40, y1: middle, x2: 960, y2: middle, baseline: false },
      baselineSegment
    ];
  }

  const grid: GuideSegment[] = [];
  for (let x = 100; x < 1000; x += 100) {
    grid.push({ id: `vertical-${x}`, x1: x, y1: 30, x2: x, y2: 570, baseline: false });
  }
  for (let y = 100; y < 600; y += 100) {
    grid.push({ id: `horizontal-${y}`, x1: 40, y1: y, x2: 960, y2: y, baseline: false });
  }
  grid.push(baselineSegment);
  return grid;
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
    :class="{ 'is-disabled': props.disabled, 'is-cumulative': props.cumulative }"
    :data-practice-mode="props.settings.practiceMode"
    :data-writing-layout="props.cumulative ? 'cumulative-name' : 'legacy-letter-cells'"
    :aria-disabled="props.disabled"
    role="application"
    :aria-label="`Writing canvas for ${letter}`"
  >
    <div
      v-if="props.settings.practiceMode === 'trace'"
      class="canvas-reference"
      :class="{ 'cumulative-reference': props.cumulative }"
      data-testid="trace-reference"
      :style="{ fontFamily: sampleFontStack, fontSize: referenceFontSize }"
      dir="rtl"
      lang="fa"
      aria-hidden="true"
    >
      {{ letter }}
    </div>
    <svg
      class="stroke-layer"
      data-testid="guideline-layer"
      :data-guide-style="props.settings.guidelineStyle"
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line
        v-for="segment in guideSegments"
        :key="segment.id"
        :x1="segment.x1"
        :y1="segment.y1"
        :x2="segment.x2"
        :y2="segment.y2"
        class="guide-line"
        :class="{ baseline: segment.baseline }"
        :style="{
          strokeOpacity: props.settings.guidelineOpacity,
          strokeWidth: props.settings.guidelineThickness
        }"
        vector-effect="non-scaling-stroke"
      />
      <path
        v-for="stroke in props.lockedStrokes"
        :key="`locked-${stroke.id}`"
        :d="pathFor(stroke)"
        class="child-stroke completed-child-stroke"
        data-testid="completed-stroke"
      />
      <path
        v-for="stroke in visibleCurrentStrokes"
        :key="stroke.id"
        :d="pathFor(stroke)"
        class="child-stroke current-child-stroke"
      />
    </svg>
    <div v-if="props.disabled" class="canvas-disabled-overlay" aria-hidden="true">⏳</div>
  </div>
</template>
