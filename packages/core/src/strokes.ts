import type { StrokePoint, StrokeSource } from './types';

export interface RawPointerSample {
  readonly clientX: number;
  readonly clientY: number;
  readonly elapsedMs: number;
  readonly source: StrokeSource;
  readonly pressure?: number;
  readonly tiltX?: number;
  readonly tiltY?: number;
}

export interface SurfaceBounds {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export function normalizePointerSample(sample: RawPointerSample, bounds: SurfaceBounds): StrokePoint {
  if (bounds.width <= 0 || bounds.height <= 0) {
    throw new Error('Writing surface dimensions must be positive.');
  }

  const point: StrokePoint = {
    x: clamp((sample.clientX - bounds.left) / bounds.width),
    y: clamp((sample.clientY - bounds.top) / bounds.height),
    t: Math.max(0, sample.elapsedMs),
    source: sample.source
  };

  return {
    ...point,
    ...(sample.pressure === undefined ? {} : { pressure: clamp(sample.pressure) }),
    ...(sample.tiltX === undefined ? {} : { tiltX: sample.tiltX }),
    ...(sample.tiltY === undefined ? {} : { tiltY: sample.tiltY })
  };
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}
