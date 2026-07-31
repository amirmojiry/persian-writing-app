import type { Stroke, WritingSession } from './types';

export interface SvgCompositionOptions {
  readonly cellWidth?: number;
  readonly cellHeight?: number;
  readonly margin?: number;
  readonly strokeWidth?: number;
}

export function createCompositionSvg(
  session: WritingSession,
  options: SvgCompositionOptions = {}
): string {
  const cellWidth = options.cellWidth ?? 220;
  const cellHeight = options.cellHeight ?? 220;
  const margin = options.margin ?? 36;
  const strokeWidth = options.strokeWidth ?? 10;
  const width = Math.max(1, session.graphemes.length) * cellWidth + margin * 2;
  const height = cellHeight + 118 + margin * 2;
  const attemptsByIndex = new Map(session.attempts.map((attempt) => [attempt.index, attempt]));
  const paths = session.graphemes.flatMap((_, logicalIndex) => {
    const attempt = attemptsByIndex.get(logicalIndex);
    if (attempt === undefined) {
      return [];
    }
    const visualIndex = session.graphemes.length - 1 - logicalIndex;
    const offsetX = margin + visualIndex * cellWidth;
    const offsetY = margin;
    return attempt.strokes.map((stroke) =>
      `<path d="${strokeToPath(stroke, offsetX, offsetY, cellWidth, cellHeight)}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`
    );
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(session.logicalName)}">`,
    `<rect width="${width}" height="${height}" rx="28" fill="white" />`,
    `<g color="#312e81">${paths.join('')}</g>`,
    `<text x="${width / 2}" y="${height - 42}" text-anchor="middle" direction="rtl" unicode-bidi="plaintext" font-size="52" font-family="Vazirmatn, Tahoma, sans-serif" fill="#312e81">${escapeXml(session.logicalName)}</text>`,
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
