import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue';

interface StoredTimer {
  readonly deadline: number;
  readonly durationSeconds: number;
}

export interface PracticeTimerOptions {
  readonly enabled: Ref<boolean>;
  readonly durationSeconds: Ref<number>;
  readonly scopeKey: Ref<string>;
  readonly onWarning?: () => void;
  readonly onExpire?: () => void;
}

export function usePracticeTimer(options: PracticeTimerOptions) {
  const remainingMs = ref(0);
  const expired = ref(false);
  const deadline = ref<number | null>(null);
  let intervalId: number | null = null;
  let warnedDeadline: number | null = null;
  let expiredDeadline: number | null = null;

  const remainingSeconds = computed(() => Math.max(0, Math.ceil(remainingMs.value / 1000)));
  const progress = computed(() => {
    if (!options.enabled.value) {
      return 1;
    }
    const total = Math.max(1, options.durationSeconds.value * 1000);
    return Math.max(0, Math.min(1, remainingMs.value / total));
  });

  function storageKey(): string {
    return `persian-writing-timer-v1:${options.scopeKey.value}`;
  }

  function readStored(): StoredTimer | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const raw = localStorage.getItem(storageKey());
    if (raw === null) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<StoredTimer>;
      return typeof parsed.deadline === 'number'
        && Number.isFinite(parsed.deadline)
        && parsed.durationSeconds === options.durationSeconds.value
        ? { deadline: parsed.deadline, durationSeconds: parsed.durationSeconds }
        : null;
    } catch {
      return null;
    }
  }

  function persist(nextDeadline: number): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey(), JSON.stringify({
        deadline: nextDeadline,
        durationSeconds: options.durationSeconds.value
      } satisfies StoredTimer));
    }
  }

  function removeStored(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(storageKey());
    }
  }

  function stopInterval(): void {
    if (intervalId !== null && typeof window !== 'undefined') {
      window.clearInterval(intervalId);
    }
    intervalId = null;
  }

  function update(): void {
    if (!options.enabled.value || deadline.value === null) {
      remainingMs.value = 0;
      expired.value = false;
      return;
    }

    remainingMs.value = Math.max(0, deadline.value - Date.now());
    expired.value = remainingMs.value <= 0;

    if (remainingMs.value > 0 && remainingMs.value <= 5000 && warnedDeadline !== deadline.value) {
      warnedDeadline = deadline.value;
      options.onWarning?.();
    }
    if (expired.value && expiredDeadline !== deadline.value) {
      expiredDeadline = deadline.value;
      stopInterval();
      options.onExpire?.();
    }
  }

  function startOrResume(): void {
    stopInterval();
    warnedDeadline = null;
    expiredDeadline = null;

    if (!options.enabled.value) {
      deadline.value = null;
      remainingMs.value = 0;
      expired.value = false;
      return;
    }

    const stored = readStored();
    deadline.value = stored?.deadline ?? Date.now() + options.durationSeconds.value * 1000;
    if (stored === null) {
      persist(deadline.value);
    }
    update();
    if (!expired.value && typeof window !== 'undefined') {
      intervalId = window.setInterval(update, 250);
    }
  }

  function reset(): void {
    if (!options.enabled.value) {
      return;
    }
    deadline.value = Date.now() + options.durationSeconds.value * 1000;
    warnedDeadline = null;
    expiredDeadline = null;
    persist(deadline.value);
    update();
    stopInterval();
    if (typeof window !== 'undefined') {
      intervalId = window.setInterval(update, 250);
    }
  }

  function complete(): void {
    stopInterval();
    removeStored();
  }

  watch(
    [options.enabled, options.durationSeconds, options.scopeKey],
    startOrResume,
    { immediate: true }
  );

  onBeforeUnmount(stopInterval);

  return {
    remainingMs,
    remainingSeconds,
    progress,
    expired,
    reset,
    complete
  };
}
