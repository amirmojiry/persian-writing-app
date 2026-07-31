import type { Stroke, WritingSession } from './types';

export interface SvgCompositionOptions {
  readonly cellWidth?: number;
  readonly cellHeight?: number;
  readonly margin?: number;
  readonly strokeWidth?: number;
}

export interface CompositionMetrics {
  readonly cellWidth: number;
  readonly cellHeight: number;
  readonly margin: number;
  readonly strokeWidth: number;
  readonly width: number;
  readonly height: number;
}

export function getCompositionMetrics(
  graphemeCount: number,
  options: SvgCompositionOptions = {}
): CompositionMetrics {
  const cellWidth = options.cellWidth ?? 220;
  const cellHeight = options.cellHeight ?? 220;
  const margin = options.margin ?? 36;
  const strokeWidth = options.strokeWidth ?? 10;

  return Object.freeze({
    cellWidth,
    cellHeight,
    margin,
    strokeWidth,
    width: Math.max(1, graphemeCount) * cellWidth + margin * 2,
    height: cellHeight + 118 + margin * 2
  });
}

export function createCompositionSvg(
  session: WritingSession,
  options: SvgCompositionOptions = {}
): string {
  const metrics = getCompositionMetrics(session.graphemes.length, options);
  const attemptsByIndex = new Map(session.attempts.map((attempt) => [attempt.index, attempt]));
  const paths = session.graphemes.flatMap((_, logicalIndex) => {
    const attempt = attemptsByIndex.get(logicalIndex);
    if (attempt === undefined) {
      return [];
    }
    const visualIndex = session.graphemes.length - 1 - logicalIndex;
    const offsetX = metrics.margin + visualIndex * metrics.cellWidth;
    const offsetY = metrics.margin;
    return attempt.strokes.map((stroke) =>
      `<path d="${strokeToPath(stroke, offsetX, offsetY, metrics.cellWidth, metrics.cellHeight)}" fill="none" stroke="currentColor" stroke-width="${metrics.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`
    );
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${metrics.width} ${metrics.height}" width="${metrics.width}" height="${metrics.height}" role="img" aria-label="${escapeXml(session.logicalName)}">`,
    `<rect width="${metrics.width}" height="${metrics.height}" rx="28" fill="white" />`,
    `<g color="#312e81">${paths.join('')}</g>`,
    `<text x="${metrics.width / 2}" y="${metrics.height - 42}" text-anchor="middle" direction="rtl" unicode-bidi="plaintext" font-size="52" font-family="Vazirmatn, Tahoma, sans-serif" fill="#312e81">${escapeXml(session.logicalName)}</text>`,
    '</svg>'
  ].join('');
}

export function strokeToPath(
  stroke: Stroke,
  offsetX: number,
  offsetY: number,
  width: number,
  height: number
): string {
  return stroke.points.map((point, index) => {
    const command = index === 0 ? 'M' : 'L';
    const x = round(offsetX + point.x * width);
    const y = round(offsetY + point.y * height);
    return `${command} ${x} ${y}`;
  }).join(' ');
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
