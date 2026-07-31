import { getCompositionMetrics, strokeToPath, type SvgCompositionOptions } from './composition';
import type { WritingSession } from './types';

export interface ReplaySegment {
  readonly id: string;
  readonly path: string;
  readonly startsAtMs: number;
  readonly durationMs: number;
}

export interface ReplayPlan {
  readonly width: number;
  readonly height: number;
  readonly totalDurationMs: number;
  readonly segments: readonly ReplaySegment[];
}

export interface ReplayOptions extends SvgCompositionOptions {
  readonly gapMs?: number;
  readonly minimumStrokeMs?: number;
  readonly maximumStrokeMs?: number;
}

export function createReplayPlan(
  session: WritingSession,
  options: ReplayOptions = {}
): ReplayPlan {
  const metrics = getCompositionMetrics(session.graphemes.length, options);
  const gapMs = options.gapMs ?? 120;
  const minimumStrokeMs = options.minimumStrokeMs ?? 180;
  const maximumStrokeMs = options.maximumStrokeMs ?? 1800;
  let cursor = 0;
  const segments: ReplaySegment[] = [];

  for (const attempt of [...session.attempts].sort((left, right) => left.index - right.index)) {
    const visualIndex = session.graphemes.length - 1 - attempt.index;
    const offsetX = metrics.margin + visualIndex * metrics.cellWidth;

    for (const stroke of attempt.strokes) {
      const firstTime = stroke.points[0]?.t ?? 0;
      const lastTime = stroke.points.at(-1)?.t ?? firstTime;
      const recordedDuration = Math.max(0, lastTime - firstTime);
      const durationMs = Math.min(
        maximumStrokeMs,
        Math.max(minimumStrokeMs, recordedDuration || stroke.points.length * 24)
      );

      segments.push(Object.freeze({
        id: `${attempt.index}-${stroke.id}`,
        path: strokeToPath(stroke, offsetX, metrics.margin, metrics.cellWidth, metrics.cellHeight),
        startsAtMs: cursor,
        durationMs
      }));
      cursor += durationMs + gapMs;
    }
  }

  return Object.freeze({
    width: metrics.width,
    height: metrics.height,
    totalDurationMs: Math.max(0, cursor - (segments.length > 0 ? gapMs : 0)),
    segments: Object.freeze(segments)
  });
}
